import { Module } from '@nestjs/common';
import { IotProducerService } from './iot-producer.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  providers: [IotProducerService],
  exports: [IotProducerService],
})
export class IotProducerModule {}