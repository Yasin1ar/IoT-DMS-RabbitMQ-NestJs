/**
 * AppModule serves as the root module initializing the core configurations and integrations.
 *
 * It imports:
 * - ConfigModule for loading environment and application settings.
 * - MongooseModule with an asynchronous factory to connect to MongoDB using credentials from ConfigService.
 * - RabbitMQModule for messaging capabilities.
 * - SignalsModule for managing signal-based operations.
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from './rabbitmq/rabbitmq.consumer.module';
import { SignalsModule } from './signals/signals.module';
import { ProducerModule } from './producer/rabbitmq.producer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USER')}:${configService.get('MONGO_PASSWORD')}@localhost:27017`,
        dbName: configService.get<string>('MONGO_DATABASE', 'signals'),
      }),
      inject: [ConfigService],
    }),
    RabbitMQModule,
    SignalsModule,
    ProducerModule
  ],
})
export class AppModule {}
