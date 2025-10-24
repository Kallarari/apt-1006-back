import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { PrismaService } from '../prisma/prisma.service';

type UploadedItem = {
  id: string;
  publicUrl: string;
  documentType: string | null;
  createdAt: Date;
};

@Injectable()
export class FilesService {
  private storage: Storage;
  private bucketName: string;

  constructor(private config: ConfigService, private prisma: PrismaService) {
    const projectId = process.env.GCP_PROJECT as string;
    this.bucketName = process.env.BUCKET_NAME as string;

    if (!this.bucketName) {
      throw new Error('GCS_BUCKET must be defined');
    }

    this.storage = new Storage();
  }

  private validateFile(file: Express.Multer.File) {
    const maxSizeBytes = Number(this.config.get<string>('MAX_FILE_SIZE_BYTES') || 10 * 1024 * 1024);
    const allowed = (this.config.get<string>('ALLOWED_MIME') || 'image/*,application/pdf').split(',').map((v) => v.trim());

    if (file.size > maxSizeBytes) {
      throw new BadRequestException('Arquivo excede o tamanho máximo permitido');
    }

    const isAllowed = allowed.some((pattern) => {
      if (pattern.endsWith('/*')) {
        return file.mimetype.startsWith(pattern.replace('/*', '/'));
      }
      return file.mimetype === pattern;
    });

    if (!isAllowed) {
      throw new BadRequestException('Tipo de arquivo não permitido');
    }
  }

  private toResponse(file: {
    id: bigint;
    publicUrl: string;
    documentType: string | null;
    createdAt: Date;
    deletedAt: Date | null;
    uploadedBy: bigint;
    deletedBy: bigint | null;
  }) {
    return {
      id: file.id.toString(),
      publicUrl: file.publicUrl,
      documentType: file.documentType,
      createdAt: file.createdAt,
      deletedAt: file.deletedAt,
      uploadedBy: file.uploadedBy?.toString(),
      deletedBy: file.deletedBy ? file.deletedBy.toString() : null,
    };
  }

  async uploadMany(files: Express.Multer.File[], uploadedBy: number) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const bucket = this.storage.bucket(this.bucketName);

    const results: UploadedItem[] = [];
    for (const file of files) {
      this.validateFile(file);
      const timestamp = Date.now();
      const safeOriginal = (file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
      const gcsPath = `uploads/${uploadedBy}/${timestamp}-${safeOriginal}`;
      const blob = bucket.file(gcsPath);

      await new Promise<void>((resolve, reject) => {
        const stream = blob.createWriteStream({
          resumable: false,
          contentType: file.mimetype,
          metadata: { cacheControl: 'public, max-age=31536000' },
        });
        stream.on('error', reject);
        stream.on('finish', resolve);
        stream.end(file.buffer);
      });

      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${encodeURI(gcsPath)}`;

      const created = await this.prisma.file.create({
        data: {
          publicUrl,
          documentType: file.mimetype,
          uploadedBy: BigInt(uploadedBy),
        },
      });

      const serialized = this.toResponse(created as any);
      results.push({
        id: serialized.id,
        publicUrl: serialized.publicUrl,
        documentType: serialized.documentType,
        createdAt: serialized.createdAt,
      });
    }

    return results;
  }

  async findAll() {
    const items = await this.prisma.file.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((f) => this.toResponse(f as any));
  }

  async softDelete(id: string, deletedBy: number) {
    const fileId = BigInt(id);
    const existing = await this.prisma.file.findUnique({ where: { id: fileId } });
    if (!existing) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    await this.prisma.file.update({
      where: { id: fileId },
      data: { deletedAt: new Date(), deletedBy: BigInt(deletedBy) },
    });

    return { success: true };
  }
}


