import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto & { utm_c?: string }) {
    const { businessId, email, utm_c, firstName, lastName, phone } = createLeadDto;

    // Verificar se o business existe (se businessId foi fornecido)
    if (businessId) {
      const business = await this.prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        throw new NotFoundException(
          `Business com ID ${businessId} não encontrado`,
        );
      }
    }

    // Verificar se já existe um lead com o mesmo email (se email foi fornecido)
    if (email) {
      const existingLead = await this.prisma.lead.findFirst({
        where: { email },
      });

      if (existingLead) {
        throw new ConflictException('Já existe um lead com este email');
      }
    }

    let campaign: any | null = null;

    if (utm_c) {
      campaign = await this.prisma.campaign.findFirst({
        where: { title: atob(utm_c) },
      });
      let campaignTitle = utm_c;
      try {
        // tentar decodificar base64; se falhar, usar valor original
        campaignTitle = Buffer.from(utm_c, 'base64').toString('utf-8');
      } catch {}
      if (campaign) {
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: { clicksToDate: { increment: 1 } },
        });
      }
    }

    // Criar o lead
    const lead = await this.prisma.lead.create({
      data: {
        leadStatus: 'novo',
        email: createLeadDto.email,
        phone: createLeadDto.phone,
        firstName: createLeadDto.firstName,
        lastName: createLeadDto.lastName,
        campaignId: campaign ? campaign.id.toString() : null,
      },
      include: {
        business: true,
      },
    });

    return {
      ...lead,
      message: 'Lead criado com sucesso',
    };
  }

  async findAll() {
    const leads = await this.prisma.lead.findMany({
      include: {
        business: {
          select: {
            id: true,
            title: true,
            status: true,
            closingValue: true,
          },
        },
      },
      orderBy: [{ entryDate: 'desc' }, { id: 'desc' }],
    });

    return {
      data: leads,
      count: leads.length,
      message: 'Leads recuperados com sucesso',
    };
  }

  async findOne(id: number) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            status: true,
            closingValue: true,
            stageId: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead com ID ${id} não encontrado`);
    }

    return {
      ...lead,
      message: 'Lead encontrado com sucesso',
    };
  }

  async update(id: number, updateLeadDto: UpdateLeadDto) {
    const { businessId, email, cpfCnpj } = updateLeadDto;

    // Verificar se o lead existe
    const existingLead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw new NotFoundException(`Lead com ID ${id} não encontrado`);
    }

    // Verificar se o business existe (se businessId foi fornecido)
    if (businessId) {
      const business = await this.prisma.business.findUnique({
        where: { id: businessId },
      });

      if (!business) {
        throw new NotFoundException(
          `Business com ID ${businessId} não encontrado`,
        );
      }
    }

    // Verificar se já existe outro lead com o mesmo email (se email foi alterado)
    if (email && email !== existingLead.email) {
      const duplicateLead = await this.prisma.lead.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (duplicateLead) {
        throw new ConflictException('Já existe outro lead com este email');
      }
    }

    // Verificar se já existe outro lead com o mesmo CPF/CNPJ (se cpfCnpj foi alterado)
    if (cpfCnpj && cpfCnpj !== existingLead.cpfCnpj) {
      const duplicateLead = await this.prisma.lead.findFirst({
        where: {
          cpfCnpj,
          id: { not: id },
        },
      });

      if (duplicateLead) {
        throw new ConflictException('Já existe outro lead com este CPF/CNPJ');
      }
    }

    // Atualizar o lead
    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        business: {
          select: {
            id: true,
            title: true,
            status: true,
            closingValue: true,
          },
        },
      },
    });

    return {
      ...updatedLead,
      message: 'Lead atualizado com sucesso',
    };
  }

  async remove(id: number) {
    // Verificar se o lead existe
    const existingLead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw new NotFoundException(`Lead com ID ${id} não encontrado`);
    }

    // Deletar o lead
    await this.prisma.lead.delete({
      where: { id },
    });

    return {
      message: 'Lead removido com sucesso',
    };
  }

  async findByBusiness(businessId: number) {
    // Verificar se o business existe
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException(
        `Business com ID ${businessId} não encontrado`,
      );
    }

    const leads = await this.prisma.lead.findMany({
      where: { businessId },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            status: true,
            closingValue: true,
          },
        },
      },
      orderBy: [{ entryDate: 'desc' }, { id: 'desc' }],
    });

    return {
      data: leads,
      count: leads.length,
      businessId,
      message: `Leads do business ${businessId} recuperados com sucesso`,
    };
  }

  async findByStatus(leadStatus: string) {
    const leads = await this.prisma.lead.findMany({
      where: { leadStatus },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            status: true,
            closingValue: true,
          },
        },
      },
      orderBy: [{ entryDate: 'desc' }, { id: 'desc' }],
    });

    return {
      data: leads,
      count: leads.length,
      leadStatus,
      message: `Leads com status ${leadStatus} recuperados com sucesso`,
    };
  }

  async findByEmail(email: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { email },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            status: true,
            closingValue: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(`Lead com email ${email} não encontrado`);
    }

    return {
      ...lead,
      message: 'Lead encontrado com sucesso',
    };
  }

  async findByCpfCnpj(cpfCnpj: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { cpfCnpj },
      include: {
        business: {
          select: {
            id: true,
            title: true,
            status: true,
            closingValue: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException(
        `Lead com CPF/CNPJ ${cpfCnpj} não encontrado`,
      );
    }

    return {
      ...lead,
      message: 'Lead encontrado com sucesso',
    };
  }

  async getStatistics() {
    const totalLeads = await this.prisma.lead.count();

    const leadsByStatus = await this.prisma.lead.groupBy({
      by: ['leadStatus'],
      _count: { leadStatus: true },
      where: { leadStatus: { not: null } },
    });

    const leadsByPersonType = await this.prisma.lead.groupBy({
      by: ['personType'],
      _count: { personType: true },
      where: { personType: { not: null } },
    });

    const leadsByBusiness = await this.prisma.lead.groupBy({
      by: ['businessId'],
      _count: { businessId: true },
      where: { businessId: { not: null } },
    });

    const totalTicket = await this.prisma.lead.aggregate({
      _sum: { estimatedAverageTicket: true },
      where: { estimatedAverageTicket: { not: null } },
    });

    const recentLeads = await this.prisma.lead.count({
      where: {
        entryDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // últimos 30 dias
        },
      },
    });

    return {
      totalLeads,
      leadsByStatus: leadsByStatus.map((item) => ({
        leadStatus: item.leadStatus,
        count: item._count.leadStatus,
      })),
      leadsByPersonType: leadsByPersonType.map((item) => ({
        personType: item.personType,
        count: item._count.personType,
      })),
      leadsByBusiness: leadsByBusiness.map((item) => ({
        businessId: item.businessId,
        count: item._count.businessId,
      })),
      totalTicket: totalTicket._sum.estimatedAverageTicket || 0,
      recentLeads,
      message: 'Estatísticas recuperadas com sucesso',
    };
  }
}
