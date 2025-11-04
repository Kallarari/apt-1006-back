import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BusinessService } from './business.service';
import { FilesService } from '../files/files.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ChangeStageDto } from './dto/change-stage.dto';
import { CreateBusinessFileDto } from './dto/create-business-file.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InternalOnlyGuard } from '../auth/guards/internal-only.guard';

@Controller('business')
@UseGuards(JwtAuthGuard, InternalOnlyGuard) 
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.businessService.findAll();
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  getStatistics() {
    return this.businessService.getStatistics();
  }

  @Get('by-stage/:stageId')
  @HttpCode(HttpStatus.OK)
  findByStage(@Param('stageId') stageId: string) {
    return this.businessService.findByStage(stageId);
  }

  @Get('by-status/:status')
  @HttpCode(HttpStatus.OK)
  findByStatus(@Param('status') status: string) {
    return this.businessService.findByStatus(status);
  }

  @Get('by-responsible/:responsible')
  @HttpCode(HttpStatus.OK)
  findByResponsible(@Param('responsible') responsible: string) {
    return this.businessService.findByResponsible(responsible);
  }

  @Get(':id/history')
  @HttpCode(HttpStatus.OK)
  findHistory(@Param('id', ParseIntPipe) id: number) {
    return this.businessService.getHistory(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.businessService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
  @Req() req: any,
  ) {
    return this.businessService.update(id, updateBusinessDto, req.user?.id);
  }

  @Patch(':id/change-stage')
  @HttpCode(HttpStatus.OK)
  changeStage(
    @Param('id', ParseIntPipe) id: number,
    @Body() changeStageDto: ChangeStageDto,
  @Req() req: any,
  ) {
    return this.businessService.changeStage(id, changeStageDto, req.user?.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.businessService.remove(id);
  }

  @Post(':id/files')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE_BYTES || 10 * 1024 * 1024),
      },
    }),
  )
  async associateFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const uploadBy = req.user?.id;
    if (!uploadBy) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    // 1. Fazer upload para GCP usando FilesService
    const uploadedFiles = await this.filesService.uploadMany([file], uploadBy);
    const uploadedFile = uploadedFiles[0];

    // 2. Criar DTO com os dados do arquivo enviado
    const createBusinessFileDto: CreateBusinessFileDto = {
      filename: file.originalname || uploadedFile.id,
      fileType: file.mimetype,
      publicUrl: uploadedFile.publicUrl,
    };

    // 3. Associar arquivo ao business
    return this.businessService.associateFile(id, createBusinessFileDto, uploadBy);
  }

  @Delete(':id/files/:fileId')
  @HttpCode(HttpStatus.OK)
  removeFile(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileId', ParseIntPipe) fileId: number,
  ) {
    return this.businessService.removeFile(id, fileId);
  }
}





