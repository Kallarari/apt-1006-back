import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDealStageDto } from './dto/create-deal-stage.dto';
import { UpdateDealStageDto } from './dto/update-deal-stage.dto';

@Injectable()
export class DealStagesService {
  constructor(private prisma: PrismaService) {}

  async create(createDealStageDto: CreateDealStageDto) {
    const { name, position = 0 } = createDealStageDto;

    // Verificar se já existe um estágio com o mesmo nome
    const existingStage = await this.prisma.dealStage.findFirst({
      where: { name },
    });

    if (existingStage) {
      throw new ConflictException('Já existe um estágio com este nome');
    }

    // Criar o estágio
    const dealStage = await this.prisma.dealStage.create({
      data: {
        name,
        position,
      },
    });

    return {
      ...dealStage,
      message: 'Estágio criado com sucesso',
    };
  }

  async findAll() {
    const dealStages = await this.prisma.dealStage.findMany({
      orderBy: [
        { position: 'asc' },
        { id: 'asc' },
      ],
    });

    return {
      data: dealStages,
      count: dealStages.length,
      message: 'Estágios recuperados com sucesso',
    };
  }

  async findOne(id: number) {
    const dealStage = await this.prisma.dealStage.findUnique({
      where: { id },
    });

    if (!dealStage) {
      throw new NotFoundException(`Estágio com ID ${id} não encontrado`);
    }

    return {
      ...dealStage,
      message: 'Estágio encontrado com sucesso',
    };
  }

  async update(id: number, updateDealStageDto: UpdateDealStageDto) {
    const { name, position } = updateDealStageDto;

    // Verificar se o estágio existe
    const existingStage = await this.prisma.dealStage.findUnique({
      where: { id },
    });

    if (!existingStage) {
      throw new NotFoundException(`Estágio com ID ${id} não encontrado`);
    }

    // Se está alterando o nome, verificar se não existe outro com o mesmo nome
    if (name && name !== existingStage.name) {
      const duplicateStage = await this.prisma.dealStage.findFirst({
        where: {
          name,
          id: { not: id },
        },
      });

    }

    // Atualizar o estágio
    const updatedStage = await this.prisma.dealStage.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(position !== undefined && { position }),
      },
    });

    return {
      ...updatedStage,
      message: 'Estágio atualizado com sucesso',
    };
  }

  async remove(id: number) {
    // Verificar se o estágio existe
    const existingStage = await this.prisma.dealStage.findUnique({
      where: { id },
    });

    if (!existingStage) {
      throw new NotFoundException(`Estágio com ID ${id} não encontrado`);
    }

    // Deletar o estágio
    await this.prisma.dealStage.delete({
      where: { id },
    });

    return {
      message: 'Estágio removido com sucesso',
    };
  }

  async reorderStages(stageIds: number[]) {
    // Atualizar posições baseado na ordem do array
    const updatePromises = stageIds.map((stageId, index) =>
      this.prisma.dealStage.update({
        where: { id: stageId },
        data: { position: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    // Retornar estágios reordenados
    const reorderedStages = await this.prisma.dealStage.findMany({
      orderBy: { position: 'asc' },
    });

    return {
      data: reorderedStages,
      message: 'Estágios reordenados com sucesso',
    };
  }
}





