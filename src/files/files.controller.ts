import { Controller, Get, Post, Delete, UseGuards, UploadedFiles, UseInterceptors, Req, Param } from '@nestjs/common';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024),
        files: 20,
      },
    }),
  )
  async uploadMany(@UploadedFiles() files: Express.Multer.File[], @Req() req: any) {
    const userId = req.user?.id;
    return this.filesService.uploadMany(files, userId);
  }

  @Get()
  async findAll() {
    return this.filesService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.filesService.softDelete(id, userId);
  }
}


