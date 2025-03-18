/**
 * Initializes the Nest application, configures API documentation using DocumentBuilder and SwaggerModule,
 * and starts the server on port 3000.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = 3000;
  
  const config = new DocumentBuilder()
    .setTitle('IoT X-ray Data API')
    .setDescription('API for processing x-ray signals from IoT devices')
    .setVersion('1.0')
    .addTag('signals')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(PORT);
}
bootstrap();
