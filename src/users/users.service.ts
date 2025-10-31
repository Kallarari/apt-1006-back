import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createInternal(params: { email: string; password: string; name?: string; createdById: number }) {
    const { email, password, name, createdById } = params;
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new ConflictException('Usuário já existe com este email');
    }
    const hashed = await bcrypt.hash(password, 10);
    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO "users" ("email", "password", "name", "user_type", "created_by")
      VALUES (${email}, ${hashed}, ${name ?? null}, ${'interno'}, ${createdById ?? null})
      RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType";
    `;
    return rows[0];
  }

  async findAllInternal() {
    const users = await this.prisma.$queryRaw<any[]>`
      SELECT u."id", u."email", u."name", u."is_active" as "isActive", u."created_at" as "createdAt", u."user_type" as "userType",
             c."name" as "createdByName"
      FROM "users" u
      LEFT JOIN "users" c ON c."id" = u."created_by"
      WHERE u."user_type" IN ('internal','interno')
        AND u."is_active" = true
      ORDER BY u."created_at" DESC;
    `;
    return users;
  }

  async deactivateUser(params: { userId: number; deletedById: number }) {
    const { userId, deletedById } = params;
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE "users"
      SET "is_active" = false,
          "deleted_by" = ${deletedById},
          "deleted_at" = NOW()
      WHERE "id" = ${userId}
      RETURNING "id", "email", "is_active" as "isActive";
    `;
    return rows[0] || { id: userId, isActive: false };
  }

  async updateUser(params: {
    userId: number;
    requesterId: number;
    name?: string;
    email?: string;
    password?: string;
  }) {
    const { userId, requesterId, name, email, password } = params;

    // Verificar se o usuário que está fazendo a requisição é o mesmo que será editado
    if (userId !== requesterId) {
      throw new ForbiddenException('Você só pode editar seus próprios dados');
    }

    // Verificar se o usuário existe
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, isActive: true },
    });

    if (!existing) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!existing.isActive) {
      throw new ForbiddenException('Não é possível editar usuário inativo');
    }

    // Verificar se o email já está em uso (se for alterado)
    if (email && email !== existing.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (emailExists) {
        throw new ConflictException('Este email já está em uso');
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (email !== undefined) {
      updateData.email = email;
    }
    if (password !== undefined) {
      // Fazer hash da senha (igual ao processo de criação de usuário)
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Se não há nada para atualizar
    if (Object.keys(updateData).length === 0) {
      throw new ConflictException('Nenhum dado fornecido para atualização');
    }

    // Construir query SQL usando template literal do Prisma
    let query: any;
    
    if (updateData.password && updateData.email && updateData.name) {
      query = this.prisma.$queryRaw<any[]>`
        UPDATE "users"
        SET "name" = ${updateData.name}, "email" = ${updateData.email}, "password" = ${updateData.password}
        WHERE "id" = ${userId}
        RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType"
      `;
    } else if (updateData.password && updateData.email) {
      query = this.prisma.$queryRaw<any[]>`
        UPDATE "users"
        SET "email" = ${updateData.email}, "password" = ${updateData.password}
        WHERE "id" = ${userId}
        RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType"
      `;
    } else if (updateData.password && updateData.name) {
      query = this.prisma.$queryRaw<any[]>`
        UPDATE "users"
        SET "name" = ${updateData.name}, "password" = ${updateData.password}
        WHERE "id" = ${userId}
        RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType"
      `;
    } else if (updateData.email && updateData.name) {
      query = this.prisma.$queryRaw<any[]>`
        UPDATE "users"
        SET "name" = ${updateData.name}, "email" = ${updateData.email}
        WHERE "id" = ${userId}
        RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType"
      `;
    } else if (updateData.password) {
      query = this.prisma.$queryRaw<any[]>`
        UPDATE "users"
        SET "password" = ${updateData.password}
        WHERE "id" = ${userId}
        RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType"
      `;
    } else if (updateData.email) {
      query = this.prisma.$queryRaw<any[]>`
        UPDATE "users"
        SET "email" = ${updateData.email}
        WHERE "id" = ${userId}
        RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType"
      `;
    } else if (updateData.name) {
      query = this.prisma.$queryRaw<any[]>`
        UPDATE "users"
        SET "name" = ${updateData.name}
        WHERE "id" = ${userId}
        RETURNING "id", "email", "name", "is_active" as "isActive", "created_at" as "createdAt", "user_type" as "userType"
      `;
    }

    const updated = await query;
    return updated[0] || existing;
  }
}


