import { ConflictException, Injectable } from '@nestjs/common';
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
}


