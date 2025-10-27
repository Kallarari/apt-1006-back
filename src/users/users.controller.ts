import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InternalOnlyGuard } from '../auth/guards/internal-only.guard';
import { UsersService } from './users.service';
import { CreateInternalUserDto } from './dto/create-internal-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return {
      message: 'Perfil do usuário',
      user: req.user,
    };
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtected() {
    return {
      message: 'Esta é uma rota protegida',
      timestamp: new Date().toISOString(),
    };
  }

  // Criação de usuários internos - único método permitido
  @Post('internal')
  @UseGuards(JwtAuthGuard, InternalOnlyGuard)
  @HttpCode(HttpStatus.CREATED)
  async createInternal(@Body() dto: CreateInternalUserDto, @Request() req: any) {
    return this.usersService.createInternal({ ...dto, createdById: req.user?.id });
  }

  // Listar usuários internos (sem senha e sem user_interest_id)
  @Get('internal')
  @UseGuards(JwtAuthGuard, InternalOnlyGuard)
  @HttpCode(HttpStatus.OK)
  async listInternal() {
    return this.usersService.findAllInternal();
  }

  // Desativar usuário (soft delete): is_active=false, deleted_by=caller, bloqueia login e listagem
  @Delete(':id')
  @UseGuards(JwtAuthGuard, InternalOnlyGuard)
  @HttpCode(HttpStatus.OK)
  async deactivate(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.usersService.deactivateUser({ userId: id, deletedById: req.user?.id });
  }
}

