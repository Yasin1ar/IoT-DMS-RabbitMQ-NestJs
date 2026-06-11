import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RabbitMQModule } from './rabbitmq/rabbitmq.consumer.module';
import { SignalsModule } from './signals/signals.module';
import { ProducerModule } from './producer/rabbitmq.producer.module';
import { CommonModule } from './common/common.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*', '/signals*'],
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USER')}:${configService.get('MONGO_PASSWORD')}@${configService.get('UNDER_DEV') === 'true'
          ? 'localhost'
          : 'mongodb'}:27017`,
        dbName: configService.get('MONGO_DATABASE'),
      }),
      inject: [ConfigService],
    }),
    RabbitMQModule,
    SignalsModule,
    ProducerModule,
    CommonModule,
    RealtimeModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }
