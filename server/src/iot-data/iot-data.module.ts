import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotData } from './iot-data.entity';
import { IotDataService } from './iot-data.service';
import { IotDataController } from './iot-data.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IotData])],
  providers: [IotDataService],
  controllers: [IotDataController],
  exports: [IotDataService], // Diğer modüllerin IotDataService'i kullanabilmesi için
})
export class IotDataModule {}