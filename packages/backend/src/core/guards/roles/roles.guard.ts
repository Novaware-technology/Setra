import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../core/decorators/roles/roles.decorator';
import { PrismaService } from '../../../shared/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService, // Injetamos o Prisma para buscar os perfis
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Pega os perfis necessários da rota (ex: ['admin'])
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se a rota não exige nenhum perfil, permite o acesso
    if (!requiredRoles) {
      return true;
    }

    // 2. Pega os dados do usuário que o JwtAuthGuard já validou e anexou à requisição
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false; // Não deveria acontecer se o JwtAuthGuard rodar antes
    }

    // 3. Busca os perfis REAIS do usuário no banco de dados
    const userWithRoles = await this.prisma.profile.findUnique({
      where: { id: user.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const userRoles = userWithRoles?.userRoles.map((ur) => ur.role.name) ?? [];

    // 4. Compara os perfis do usuário com os perfis exigidos pela rota
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}