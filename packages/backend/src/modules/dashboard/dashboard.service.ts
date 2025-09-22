import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(currentUser: any) {
    const isOperador = currentUser.roles.includes('operator');
    
    // Filtro baseado no tipo de usuário
    const whereClause = isOperador 
      ? { operatorId: currentUser.userId }
      : {};

    // Data de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Data de ontem
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Data de 7 dias atrás
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Total de conversas
    const totalConversations = await this.prisma.conversation.count({
      where: whereClause,
    });

    // Conversas de hoje
    const conversationsToday = await this.prisma.conversation.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Conversas de ontem
    const conversationsYesterday = await this.prisma.conversation.count({
      where: {
        ...whereClause,
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // Mensagens de hoje
    const messagesToday = await this.prisma.message.count({
      where: {
        conversation: whereClause,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Mensagens de ontem
    const messagesYesterday = await this.prisma.message.count({
      where: {
        conversation: whereClause,
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // Calcular tempo médio de resposta
    const averageResponseTime = await this.calculateAverageResponseTime(whereClause);

    // Calcular tendências
    const conversationsTrend = this.calculateTrend(conversationsToday, conversationsYesterday);
    const messagesTrend = this.calculateTrend(messagesToday, messagesYesterday);

    return {
      totalConversations,
      messagesToday,
      averageResponseTime,
      conversationsTrend,
      messagesTrend,
      responseTimeTrend: 0, // Implementar se necessário
    };
  }

  async getTimeSeries(period: string, currentUser: any) {
    const isOperador = currentUser.roles.includes('operator');
    const whereClause = isOperador 
      ? { operatorId: currentUser.userId }
      : {};

    let daysToSubtract = 30;
    if (period === '7d') {
      daysToSubtract = 7;
    } else if (period === '90d') {
      daysToSubtract = 90;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const timeSeriesData: Array<{date: string, conversations: number, messages: number}> = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      // Contar conversas do dia
      const conversations = await this.prisma.conversation.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      // Contar mensagens do dia
      const messages = await this.prisma.message.count({
        where: {
          conversation: whereClause,
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      timeSeriesData.push({
        date: d.toISOString().split('T')[0],
        conversations,
        messages,
      });
    }

    return timeSeriesData;
  }

  async getConversations(currentUser: any) {
    const isOperador = currentUser.roles.includes('operator');
    const whereClause = isOperador 
      ? { operatorId: currentUser.userId }
      : {};

    const conversations = await this.prisma.conversation.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        operator: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limitar para performance
    });

    return conversations.map(conversation => {
      const [name, phone] = conversation.externalParticipantIdentifier.split(';');
      const formattedPhone = phone ? `+55 (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}` : '';
      
      return {
        id: conversation.id,
        client: name,
        phone: formattedPhone,
        lastMessage: conversation.messages[0]?.content || 'Nenhuma mensagem',
        lastMessageTime: conversation.messages[0]?.createdAt || conversation.createdAt,
        operator: conversation.operator?.name || 'Não atribuído',
        messageCount: conversation._count.messages,
        status: conversation.messages[0] ? 'active' : 'inactive',
        createdAt: conversation.createdAt,
      };
    });
  }

  private async calculateAverageResponseTime(whereClause: any): Promise<number> {
    // Buscar conversas com mensagens
    const conversations = await this.prisma.conversation.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    let totalResponseTime = 0;
    let responseCount = 0;

    for (const conversation of conversations) {
      const messages = conversation.messages;
      
      for (let i = 0; i < messages.length - 1; i++) {
        const currentMessage = messages[i];
        const nextMessage = messages[i + 1];
        
        // Se a mensagem atual é do cliente e a próxima é do operador
        if (currentMessage.source === 'EXTERNAL' && nextMessage.source === 'OPERATOR') {
          const responseTime = nextMessage.createdAt.getTime() - currentMessage.createdAt.getTime();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    }

    if (responseCount === 0) return 0;
    
    // Retornar em minutos
    return Math.round((totalResponseTime / responseCount) / (1000 * 60) * 10) / 10;
  }

  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }
}
