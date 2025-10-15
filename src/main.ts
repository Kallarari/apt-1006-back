import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurações para Cloud Run
  app.enableCors();
  
  // Teste de conexão com banco de dados
  const prismaService = app.get(PrismaService);
  try {
    await prismaService.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  
  const port = process.env.PORT || 8080;
  const host = '0.0.0.0'; // Importante para Cloud Run
  
  await app.listen(port, host);
  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`📊 Health check available at: http://${host}:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
