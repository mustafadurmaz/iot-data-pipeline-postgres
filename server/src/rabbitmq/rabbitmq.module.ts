import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { IotDataModule } from '../iot-data/iot-data.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [IotDataModule, EventEmitterModule.forRoot()],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}