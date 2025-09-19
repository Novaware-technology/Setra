import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local')) // Ativa a nossa LocalStrategy
  @Post('login')
  async login(@Request() req: any) {
    // Se chegou aqui, o usuário já foi validado pela LocalStrategy
    // O objeto 'req.user' é o que retornamos no método 'validate' da strategy
    return this.authService.login(req.user);
  }
}