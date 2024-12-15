import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TimeEntry } from '../../time-entries/entities/time-entry.entity';

@Entity('pauses')
export class Pause {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.pauses)
  timeEntry: TimeEntry;

  @Column({ type: 'timestamp' })
  pauseStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  pauseEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
