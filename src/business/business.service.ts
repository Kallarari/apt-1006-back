import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ChangeStageDto } from './dto/change-stage.dto';
import { CreateBusinessFileDto } from './dto/create-business-file.dto';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(createBusinessDto: CreateBusinessDto) {
    const business = await this.prisma.business.create({
      data: createBusinessDto,
    });

    return {
      ...business,
      message: 'Negócio criado com sucesso',
    };
  }

  async findAll() {
    const businesses = await this.prisma.business.findMany({
      orderBy: [
        { createdDate: 'desc' },
        { id: 'desc' },
      ],
    });

    return {
      data: businesses,
      count: businesses.length,
      message: 'Negócios recuperados com sucesso',
    };
  }

  async findOne(id: number) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: {
        businessFiles: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            filename: true,
            fileType: true,
            publicUrl: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            uploadBy: true,
            uploader: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException(`Negócio com ID ${id} não encontrado`);
    }

    return {
      ...business,
      message: 'Negócio encontrado com sucesso',
    };
  }

  async update(id: number, updateBusinessDto: UpdateBusinessDto, changedBy?: number) {
    // Verificar se o negócio existe
    const existingBusiness = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!existingBusiness) {
      throw new NotFoundException(`Negócio com ID ${id} não encontrado`);
    }

    // Calcular diffs campo a campo
    const diffs: { field: string; oldValue: any; newValue: any }[] = [];
    for (const key of Object.keys(updateBusinessDto) as (keyof UpdateBusinessDto)[]) {
      const newValue = (updateBusinessDto as any)[key];
      const oldValue = (existingBusiness as any)[key];
      if (newValue !== undefined && newValue !== oldValue) {
        diffs.push({ field: String(key), oldValue, newValue });
      }
    }

    // Atualizar o negócio
    const updatedBusiness = await this.prisma.business.update({
      where: { id },
      data: updateBusinessDto,
    });

    // Persistir histórico para cada campo alterado
    if (diffs.length > 0) {
      await this.prisma.businessHistory.createMany({
        data: diffs.map((d) => ({
          businessId: id,
          field: d.field,
          oldValue: d.oldValue as any,
          newValue: d.newValue as any,
          changedBy: changedBy ?? null,
        })),
      });
    }

    return {
      ...updatedBusiness,
      message: 'Negócio atualizado com sucesso',
    };
  }

  async remove(id: number) {
    // Verificar se o negócio existe
    const existingBusiness = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!existingBusiness) {
      throw new NotFoundException(`Negócio com ID ${id} não encontrado`);
    }

    // Deletar o negócio
    await this.prisma.business.delete({
      where: { id },
    });

    return {
      message: 'Negócio removido com sucesso',
    };
  }

  async changeStage(id: number, changeStageDto: ChangeStageDto, changedBy?: number) {
    const { stageId } = changeStageDto;

    // Verificar se o negócio existe
    const existingBusiness = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!existingBusiness) {
      throw new NotFoundException(`Negócio com ID ${id} não encontrado`);
    }

    // Atualizar apenas o stage_id
    const updatedBusiness = await this.prisma.business.update({
      where: { id },
      data: { stageId },
    });

    // Histórico da mudança de stage
    await this.prisma.businessHistory.create({
      data: {
        businessId: id,
        field: 'stageId',
        oldValue: existingBusiness.stageId as any,
        newValue: stageId as any,
        changedBy: changedBy ?? null,
      },
    });

    return {
      ...updatedBusiness,
      message: 'Estágio do negócio atualizado com sucesso',
    };
  }

  async findByStage(stageId: string) {
    const businesses = await this.prisma.business.findMany({
      where: { stageId },
      orderBy: [
        { createdDate: 'desc' },
        { id: 'desc' },
      ],
    });

    return {
      data: businesses,
      count: businesses.length,
      stageId,
      message: `Negócios do estágio ${stageId} recuperados com sucesso`,
    };
  }

  async findByStatus(status: string) {
    const businesses = await this.prisma.business.findMany({
      where: { status },
      orderBy: [
        { createdDate: 'desc' },
        { id: 'desc' },
      ],
    });

    return {
      data: businesses,
      count: businesses.length,
      status,
      message: `Negócios com status ${status} recuperados com sucesso`,
    };
  }

  async findByResponsible(responsible: string) {
    const businesses = await this.prisma.business.findMany({
      where: {
        OR: [
          { commissionResponsible: responsible },
          { saleResponsible: responsible },
        ],
      },
      orderBy: [
        { createdDate: 'desc' },
        { id: 'desc' },
      ],
    });

    return {
      data: businesses,
      count: businesses.length,
      responsible,
      message: `Negócios do responsável ${responsible} recuperados com sucesso`,
    };
  }

  async getStatistics() {
    const totalBusinesses = await this.prisma.business.count();
    
    const businessesByStage = await this.prisma.business.groupBy({
      by: ['stageId'],
      _count: { stageId: true },
      where: { stageId: { not: null } },
    });

    const businessesByStatus = await this.prisma.business.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { status: { not: null } },
    });

    const totalValue = await this.prisma.business.aggregate({
      _sum: { closingValue: true },
      where: { closingValue: { not: null } },
    });

    const totalMargin = await this.prisma.business.aggregate({
      _sum: { estimatedMargin: true },
      where: { estimatedMargin: { not: null } },
    });

    return {
      totalBusinesses,
      businessesByStage: businessesByStage.map(item => ({
        stageId: item.stageId,
        count: item._count.stageId,
      })),
      businessesByStatus: businessesByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      totalValue: totalValue._sum.closingValue || 0,
      totalMargin: totalMargin._sum.estimatedMargin || 0,
      message: 'Estatísticas recuperadas com sucesso',
    };
  }

  async getHistory(businessId: number) {
    // verificar existência do business (garante 404 coerente)
    const exists = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!exists) {
      throw new NotFoundException(`Negócio com ID ${businessId} não encontrado`);
    }

    const history = await this.prisma.businessHistory.findMany({
      where: { businessId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    // buscar nomes dos usuários envolvidos
    const userIds = Array.from(new Set(history.map(h => h.changedBy).filter(Boolean))) as number[];
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const idToUser = new Map(users.map(u => [u.id, u]));

    return {
      data: history.map(h => ({
        id: h.id,
        businessId: h.businessId,
        field: h.field,
        oldValue: h.oldValue,
        newValue: h.newValue,
        changedBy: h.changedBy,
        changedByName: h.changedBy ? idToUser.get(h.changedBy)?.name ?? null : null,
        changedByEmail: h.changedBy ? idToUser.get(h.changedBy)?.email ?? null : null,
        createdAt: h.createdAt,
      })),
      count: history.length,
      message: 'Histórico recuperado com sucesso',
    };
  }

  async associateFile(businessId: number, createBusinessFileDto: CreateBusinessFileDto, uploadBy: number) {
    // Verificar se o negócio existe
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException(`Negócio com ID ${businessId} não encontrado`);
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: uploadBy },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${uploadBy} não encontrado`);
    }

    // Criar associação do arquivo com o negócio
    const businessFile = await this.prisma.businessFile.create({
      data: {
        businessId,
        uploadBy,
        filename: createBusinessFileDto.filename,
        fileType: createBusinessFileDto.fileType,
        publicUrl: createBusinessFileDto.publicUrl,
        isActive: true,
      },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      ...businessFile,
      message: 'Arquivo associado ao negócio com sucesso',
    };
  }

  async removeFile(businessId: number, fileId: number) {
    // Verificar se o arquivo existe e pertence ao negócio
    const businessFile = await this.prisma.businessFile.findFirst({
      where: {
        id: fileId,
        businessId: businessId,
        isActive: true,
      },
    });

    if (!businessFile) {
      throw new NotFoundException(
        `Arquivo com ID ${fileId} não encontrado ou não pertence ao negócio ${businessId}`,
      );
    }

    // Soft delete: marcar como inativo
    await this.prisma.businessFile.update({
      where: { id: fileId },
      data: { isActive: false },
    });

    return {
      message: 'Arquivo removido do negócio com sucesso',
    };
  }
}





