import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurações para Cloud Run
  app.enableCors();
  
  const port = process.env.PORT || 8080;
  const host = '0.0.0.0'; // Importante para Cloud Run
  
  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
