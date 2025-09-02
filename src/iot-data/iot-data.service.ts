import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IotData } from './iot-data.entity';

@Injectable()
export class IotDataService {
  constructor(
    @InjectRepository(IotData)
    private readonly iotDataRepository: Repository<IotData>,
  ) {}

  async create(data: Partial<IotData>): Promise<IotData> {
    const newData = this.iotDataRepository.create(data);
    return this.iotDataRepository.save(newData);
  }

  async findAll(limit: number = 100): Promise<IotData[]> {
    return this.iotDataRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}