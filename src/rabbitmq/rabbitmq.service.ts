import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IotDataService } from "../iot-data/iot-data.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import * as amqp from "amqplib";

interface IRabbitConnection {
  createChannel(): Promise<amqp.Channel>;
  close(): Promise<void>;
  on(event: "close" | "error", listener: (err?: any) => void): void;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection?: IRabbitConnection;
  private channel?: amqp.Channel;
  private queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly iotDataService: IotDataService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.queueName = this.configService.get("rabbitmq.queueName") || "defaultQueueName";
  }

  async onModuleInit() {
    await this.connect();
    if (this.channel) {
      await this.consumeMessages();
    }
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    const rabbitmqUrl = this.configService.get<string>("rabbitmq.url");
    console.log("Connecting to RabbitMQ at:", rabbitmqUrl);
   
    
    
    
    
    if (!rabbitmqUrl) throw new Error("RabbitMQ URL not configured");

    try {
      // Promise API için tip güvenli cast
      this.connection = (await amqp.connect(rabbitmqUrl)) as unknown as IRabbitConnection;
      this.channel = await this.connection.createChannel();

       console.log("connection:", this.connection);
    console.log("channel:", this.channel);
    console.log("queueName:", this.queueName);

      await this.channel.assertQueue(this.queueName, { durable: true });

      this.logger.log(`Connected to RabbitMQ queue: ${this.queueName}`);

      this.connection.on("close", () => {
        this.logger.warn("RabbitMQ connection closed. Reconnecting...");
        setTimeout(() => this.connect(), 5000);
      });

      this.connection.on("error", (err: any) => this.logger.error(err.message));
    } catch (error: any) {
      this.logger.error("Failed to connect to RabbitMQ: " + error.message);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async sendMessage(message: unknown) {
    if (!this.channel) {
      this.logger.warn("RabbitMQ channel not available. Message not sent.");
      return;
    }

    this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    this.logger.debug(`Sent message: ${JSON.stringify(message)}`);
  }

  private async consumeMessages() {
    if (!this.channel) return;

    await this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        const savedData = await this.iotDataService.create(content);
        this.eventEmitter.emit("new.iot.data", savedData);
        this.channel?.ack(msg);
      } catch (error: any) {
        this.logger.error("Error processing message: " + error.message);
        this.channel?.nack(msg, false, true);
      }
    });

    this.logger.log(`Started consuming messages from queue: ${this.queueName}`);
  }

  private async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      this.logger.log("RabbitMQ connection closed");
    } catch (err: any) {
      this.logger.error("Error closing RabbitMQ: " + err.message);
    }
  }

  /** RabbitMQ bağlantısı hazır mı diye kontrol */
  isConnected(): boolean {
    return !!this.connection && !!this.channel;
  }
}
