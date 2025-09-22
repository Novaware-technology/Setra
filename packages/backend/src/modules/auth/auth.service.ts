import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.profile.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Buscamos os perfis do usuário no momento do login
    const userWithRoles = await this.prisma.profile.findUnique({
      where: { id: user.id },
      include: { userRoles: { include: { role: true } } },
    });
    const roles = userWithRoles?.userRoles.map((ur) => ur.role.name) ?? [];

    // Adicionamos os perfis ao payload do token
    const payload = { sub: user.id, email: user.email, roles: roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}