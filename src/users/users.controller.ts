import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
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
}

