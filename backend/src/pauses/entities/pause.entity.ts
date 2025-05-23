import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { TimeEntry } from '../../time-entries/entities/time-entry.entity';

@Entity('pauses')
export class Pause {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TimeEntry, (timeEntry) => timeEntry.pauses, {
    onDelete: 'CASCADE',
  })
  timeEntry: TimeEntry;

  @Column({ type: 'timestamp' })
  pauseStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  pauseEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date; // Soft delete column
}
