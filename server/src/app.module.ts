import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from '@nestjs/event-emitter';

import configuration from "./config/configuration";
import { IotData } from "./iot-data/iot-data.entity";
import { IotDataModule } from "./iot-data/iot-data.module";
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { IotProducerModule } from './iot-producer/iot-producer.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get("database"),
        entities: [IotData],
      }),
      inject: [ConfigService],
    }),
    IotDataModule,
    EventEmitterModule.forRoot(),
    RabbitMQModule,
    IotProducerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
