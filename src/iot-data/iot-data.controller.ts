import { Controller, Get, Sse, MessageEvent, Req } from '@nestjs/common';
import { IotDataService } from './iot-data.service';
import { Observable, interval, map, filter } from 'rxjs';
import type { Request } from 'express';
import { OnEvent } from '@nestjs/event-emitter';
import { IotData } from './iot-data.entity';

@Controller('iot-data')
export class IotDataController {
  private clients: { req: Request; subscriber: (data: IotData) => void }[] = [];

  constructor(private readonly iotDataService: IotDataService) {}

  @Get('latest')
  async getLatestData() {
    return this.iotDataService.findAll(100); // Son 100 kaydı döndür
  }

  @Sse('stream')
  sse(@Req() req: Request): Observable<MessageEvent> {
    const client = {
      req,
      subscriber: (data: IotData) => {}, // Bu fonksiyon aşağıda ayarlanacak
    };
    this.clients.push(client);

    req.on('close', () => {
      this.clients = this.clients.filter(c => c.req !== req);
      console.log('Client disconnected from SSE');
    });

    console.log('New client connected to SSE');

    // Her yeni gelen IoT verisi için bu olayı dinle
    return new Observable<MessageEvent>(observer => {
      client.subscriber = (data: IotData) => {
        observer.next({ data: JSON.stringify(data) });
      };
    });
  }

  @OnEvent('new.iot.data')
  handleNewIotData(data: IotData) {
    // Yeni IoT verisi geldiğinde tüm bağlı istemcilere gönder
    this.clients.forEach(client => {
      if (client.subscriber) {
        client.subscriber(data);
      }
    });
  }
}