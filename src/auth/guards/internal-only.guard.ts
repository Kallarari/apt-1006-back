import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class InternalOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { userType?: string } | undefined;
    if (!user) return false;
    const normalized = (user.userType || '').toLowerCase();
    if (normalized === 'externo' || normalized === 'external') {
      throw new ForbiddenException('Acesso restrito a usuários internos');
    }
    return true;
  }
}

