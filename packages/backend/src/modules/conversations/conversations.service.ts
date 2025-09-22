import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista as conversas.
   * - Operador: vê apenas as suas.
   * - Admin/Support: veem todas.
   */
  async findAll(currentUser: any) {
    const isOperador = currentUser.roles.includes('operador');

    return this.prisma.conversation.findMany({
      where: isOperador
        ? { operatorId: currentUser.userId } // Filtra pelo ID do operador
        : {}, // Sem filtro para admin/support
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca as mensagens de uma conversa específica.
   * - Operador: só pode ver mensagens de suas próprias conversas.
   * - Admin/Support: podem ver qualquer uma.
   */
  async findMessages(conversationId: string, currentUser: any) {
    const isOperador = currentUser.roles.includes('operador');

    // 1. Busca a conversa para garantir que ela existe
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    // 2. Se for operador, verifica se ele tem permissão
    if (isOperador && conversation.operatorId !== currentUser.userId) {
      throw new ForbiddenException(
        'Você não tem permissão para ver esta conversa.',
      );
    }

    // 3. Se passou nas verificações, busca todas as mensagens
    return this.prisma.message.findMany({
      where: { conversationId: conversationId },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        operatorSender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}