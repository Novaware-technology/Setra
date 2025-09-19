import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Este método é chamado automaticamente quando o módulo é inicializado
  async onModuleInit() {
    // Aqui nós nos conectamos explicitamente ao banco de dados
    await this.$connect();
  }
}