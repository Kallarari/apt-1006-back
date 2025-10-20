import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCampaignDto) {
    const existsWithTitle = await this.prisma.campaign.findFirst({ where: { title: dto.title } });
    if (existsWithTitle) {
      throw new BadRequestException(`Já existe uma campanha com o título "${dto.title}"`);
    }
    const campaign = await this.prisma.campaign.create({ data: {...dto, startDate:dto.startDate? new Date(dto.startDate):null} });
    return { ...campaign, message: 'Campanha criada com sucesso' };
  }

  async findAll(filter: { status?: string; channel?: string }) {
    const campaigns = await this.prisma.campaign.findMany({
      where: {
        status: filter.status || undefined,
        channel: filter.channel || undefined,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return { data: campaigns, count: campaigns.length, message: 'Campanhas recuperadas com sucesso' };
  }

  async findOne(id: number) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }
    return { ...campaign, message: 'Campanha encontrada com sucesso' };
  }

  async update(id: number, dto: UpdateCampaignDto) {
    const exists = await this.prisma.campaign.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }
    const updated = await this.prisma.campaign.update({ where: { id }, data: dto });
    return { ...updated, message: 'Campanha atualizada com sucesso' };
  }

  async remove(id: number) {
    const exists = await this.prisma.campaign.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Campanha com ID ${id} não encontrada`);
    }
    await this.prisma.campaign.delete({ where: { id } });
    return { message: 'Campanha removida com sucesso' };
  }

  async registerClick(title: string) {
    const exists = await this.prisma.campaign.findFirst({ where: { title: title } });
    if (!exists) {
      throw new NotFoundException(`Campanha com título ${title} não encontrada`);
    }
    const updated = await this.prisma.campaign.update({
      where: { id: exists.id },
      data: { clicksToDate: { increment: 1 } },
    });
    return { ...updated, message: 'Clique registrado com sucesso' };
  }
}



