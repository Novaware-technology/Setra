import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../core/decorators/current-user/current-user.decorator';

@Controller('conversations')
@UseGuards(AuthGuard('jwt')) // Todas as rotas aqui exigem um token válido
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.conversationsService.findAll(user);
  }

  @Get(':id/messages') // Rota corrigida conforme sua solicitação
  findMessages(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conversationsService.findMessages(id, user);
  }
}