import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor(@Inject('DATABASE_URL') private databaseUrl: string) {
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      // Configurações para evitar prepared statements
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  private async connectWithRetry() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
      console.log(`🔗 Connected to: ${this.databaseUrl.split('@')[1]}`);
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`🔄 Retrying connection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await this.connectWithRetry();
      } else {
        throw error;
      }
    }
  }

  async reconnect() {
    try {
      await this.$disconnect();
      await this.$connect();
      console.log('🔄 Database reconnected');
      return true;
    } catch (error) {
      console.error('❌ Reconnection failed:', error.message);
      return false;
    }
  }
}
