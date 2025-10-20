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
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard) // Todos os endpoints protegidos por JWT
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.leadsService.findAll();
  }

  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  getStatistics() {
    return this.leadsService.getStatistics();
  }

  @Get('by-business/:businessId')
  @HttpCode(HttpStatus.OK)
  findByBusiness(@Param('businessId', ParseIntPipe) businessId: number) {
    return this.leadsService.findByBusiness(businessId);
  }

  @Get('by-status/:leadStatus')
  @HttpCode(HttpStatus.OK)
  findByStatus(@Param('leadStatus') leadStatus: string) {
    return this.leadsService.findByStatus(leadStatus);
  }

  @Get('by-email/:email')
  @HttpCode(HttpStatus.OK)
  findByEmail(@Param('email') email: string) {
    return this.leadsService.findByEmail(email);
  }

  @Get('by-cpf-cnpj/:cpfCnpj')
  @HttpCode(HttpStatus.OK)
  findByCpfCnpj(@Param('cpfCnpj') cpfCnpj: string) {
    return this.leadsService.findByCpfCnpj(cpfCnpj);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.remove(id);
  }
}





