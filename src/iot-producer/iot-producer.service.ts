import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class IotProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IotProducerService.name);
  private intervalId: NodeJS.Timeout;

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  onModuleInit() {
    // Her 1 saniyede bir sahte IoT verisi üretip RabbitMQ'ya gönder
    this.intervalId = setInterval(() => this.generateAndSendIotData(), 1000);
    this.logger.log('IoT Producer started.');
  }

  onModuleDestroy() {
    clearInterval(this.intervalId);
    this.logger.log('IoT Producer stopped.');
  }

  private generateAndSendIotData() {
    const sensorId = `sensor-${Math.floor(Math.random() * 5) + 1}`; // 5 farklı sensör
    const temperature = parseFloat((Math.random() * 30 + 15).toFixed(2)); // 15-45 arası sıcaklık
    const humidity = parseFloat((Math.random() * 50 + 30).toFixed(2));    // 30-80 arası nem
    const pressure = parseFloat((Math.random() * 200 + 900).toFixed(2));  // 900-1100 arası basınç (hPa)

    const iotData = {
      sensorId,
      temperature,
      humidity,
      pressure,
      timestamp: new Date().toISOString(),
    };

    this.rabbitMQService.sendMessage(iotData);
  }
}