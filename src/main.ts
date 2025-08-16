import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from './common/logger.service';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProd ? ['error'] : ['log', 'error', 'warn', 'debug'],
  });
  const PORT = 3000;

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('IoT X-ray Data API')
    .setDescription('API for processing x-ray signals from IoT devices')
    .setVersion('1.0')
    .addTag('signals')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const appLogger = app.get(AppLogger);
  appLogger.debug(`App starts on port ${PORT}`);
  await app.listen(PORT);
}
bootstrap();
