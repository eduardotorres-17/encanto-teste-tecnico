import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa as validações globais para os DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos adicionais não mapeados no DTO
      forbidNonWhitelisted: true, // Retorna erro se enviarem campos extras
    }),
  );

  await app.listen(3000);
}
bootstrap();
