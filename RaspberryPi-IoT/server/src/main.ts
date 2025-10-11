import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS 활성화
  const corsOrigin =
    configService.get('CORS_ORIGIN') || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
