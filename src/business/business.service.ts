import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { ChangeStageDto } from './dto/change-stage.dto';

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
    });

    if (!business) {
      throw new NotFoundException(`Negócio com ID ${id} não encontrado`);
    }

    return {
      ...business,
      message: 'Negócio encontrado com sucesso',
    };
  }

  async update(id: number, updateBusinessDto: UpdateBusinessDto) {
    // Verificar se o negócio existe
    const existingBusiness = await this.prisma.business.findUnique({
      where: { id },
    });

    if (!existingBusiness) {
      throw new NotFoundException(`Negócio com ID ${id} não encontrado`);
    }

    // Atualizar o negócio
    const updatedBusiness = await this.prisma.business.update({
      where: { id },
      data: updateBusinessDto,
    });

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

  async changeStage(id: number, changeStageDto: ChangeStageDto) {
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
}





