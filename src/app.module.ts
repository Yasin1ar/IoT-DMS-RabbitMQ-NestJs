import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from './rabbitmq/rabbitmq.consumer.module';
import { SignalsModule } from './signals/signals.module';
import { ProducerModule } from './producer/rabbitmq.producer.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USER')}:${configService.get('MONGO_PASSWORD')}@mongodb:27017`,
        dbName: configService.get('MONGO_DATABASE'),
      }),
      inject: [ConfigService],
    }),
    RabbitMQModule,
    SignalsModule,
    ProducerModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
