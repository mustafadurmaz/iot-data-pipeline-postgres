import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";
import { IotDataService } from "../iot-data/iot-data.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly iotDataService: IotDataService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.queueName =
      this.configService.get<string>("rabbitmq.queueName") ||
      "defaultQueueName";
  }

  async onModuleInit() {
    await this.connect();
    await this.consumeMessages();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    try {
      const rabbitmqUrl = this.configService.get("rabbitmq.url");
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      this.logger.log(
        `Connected to RabbitMQ and asserted queue: ${this.queueName}`
      );
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ:", error.message);
      // Hata durumunda yeniden bağlanma stratejisi eklenebilir
      setTimeout(() => this.connect(), 5000); // 5 saniye sonra tekrar dene
    }
  }

  private async consumeMessages() {
    this.channel.consume(this.queueName, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          this.logger.debug(`Received message: ${JSON.stringify(content)}`);

          // Veritabanına kaydet
          const savedData = await this.iotDataService.create(content);
          this.logger.debug(`Saved to DB: ${JSON.stringify(savedData)}`);

          // Frontend'e SSE ile göndermek için olay yayınla
          this.eventEmitter.emit("new.iot.data", savedData);

          this.channel.ack(msg);
        } catch (error) {
          this.logger.error("Error processing message:", error.message);
          this.channel.nack(msg); // Mesajı tekrar kuyruğa koy veya dead-letter queue'ya gönder
        }
      }
    });
    this.logger.log(`Started consuming messages from queue: ${this.queueName}`);
  }

  async sendMessage(message: any) {
    if (!this.channel) {
      this.logger.warn("RabbitMQ channel not available. Message not sent.");
      return;
    }
    this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    this.logger.debug(
      `Sent message to queue: ${this.queueName}, Content: ${JSON.stringify(message)}`
    );
  }

  private async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.logger.log("RabbitMQ connection closed.");
  }
}
