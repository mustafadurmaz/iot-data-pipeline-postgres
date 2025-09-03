import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('iot_data')
export class IotData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  sensorId: string;

  @Column({ type: 'float' })
  temperature: number;

  @Column({ type: 'float' })
  humidity: number;

  @Column({ type: 'float', nullable: true })
  pressure: number; 

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}