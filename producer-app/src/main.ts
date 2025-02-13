/**
 * Bootstraps the application by creating a Nest app instance with the AppModule and starts the HTTP server on port 3001.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}
bootstrap();
