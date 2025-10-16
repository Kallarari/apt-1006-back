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
} from '@nestjs/common';
import { DealStagesService } from './deal-stages.service';
import { CreateDealStageDto } from './dto/create-deal-stage.dto';
import { UpdateDealStageDto } from './dto/update-deal-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('deal-stages')
@UseGuards(JwtAuthGuard) // Todos os endpoints protegidos por JWT
export class DealStagesController {
  constructor(private readonly dealStagesService: DealStagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDealStageDto: CreateDealStageDto) {
    return this.dealStagesService.create(createDealStageDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.dealStagesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealStagesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDealStageDto: UpdateDealStageDto,
  ) {
    return this.dealStagesService.update(id, updateDealStageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealStagesService.remove(id);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  reorderStages(@Body() body: { stageIds: number[] }) {
    return this.dealStagesService.reorderStages(body.stageIds);
  }
}


