import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { email, password, name } = createUserDto;

    // Verificar se o usuário já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Usuário já existe com este email');
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userType: 'external',
      } as any,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        userType: true,
        userInterestId: true,
      } as any,
    });

    // Gerar token JWT
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
      message: 'Usuário criado com sucesso',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = (await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        password: true,
        userType: true,
        userInterestId: true,
      } as any,
    })) as any;

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar token JWT
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        createdAt: user.createdAt,
        userType: user.userType,
        userInterestId: user.userInterestId,
      },
      token,
      message: 'Login realizado com sucesso',
    };
  }

  async validateUser(payload: any) {
    const user = (await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        userType: true,
        userInterestId: true,
      } as any,
    })) as any;

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  async findOrCreateOAuthUser(params: {
    provider: 'google';
    providerId: string;
    email: string;
    name?: string;
  }) {
    const { email, name } = params;

    if (!email) {
      throw new UnauthorizedException('Não foi possível obter o email do Google');
    }

    const existing = (await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        userType: true,
        userInterestId: true,
      } as any,
    })) as any;

    if (existing) {
      if (!existing.isActive) {
        throw new UnauthorizedException('Usuário inativo');
      }
      const normalized = (existing.userType || '').toLowerCase();
      if (normalized !== 'external' && normalized !== 'externo') {
        throw new UnauthorizedException('Login com Google permitido apenas para usuários externos');
      }
      return existing;
    }

    const randomPassword = await bcrypt.hash(`oauth:${Date.now()}:${Math.random()}`, 10);
    const created = await this.prisma.user.create({
      data: {
        email,
        password: randomPassword,
        name,
        userType: 'external',
      } as any,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        createdAt: true,
        userType: true,
        userInterestId: true,
      } as any,
    });

    return created;
  }

  async oauthLoginFinalize(user: { id: number; email: string; name?: string }) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    return { user, token, message: 'Login com Google realizado com sucesso' };
  }
}

