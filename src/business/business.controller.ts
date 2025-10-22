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
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ChangeStageDto } from './dto/change-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('business')
@UseGuards(JwtAuthGuard) // Todos os endpoints protegidos por JWT
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.businessService.findOne(id);
  }

  @Get(':id/history')
  @HttpCode(HttpStatus.OK)
  findHistory(@Param('id', ParseIntPipe) id: number) {
    return this.businessService.getHistory(id);
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
}





