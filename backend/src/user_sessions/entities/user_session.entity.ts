import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TimeEntry } from '../../time-entries/entities/time-entry.entity';
import { Pause } from '../../pauses/entities/pause.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sessions, { eager: true })
  user: User;

  @ManyToOne(() => TimeEntry, { eager: true, nullable: true })
  timeEntry: TimeEntry;

  @ManyToOne(() => Pause, { nullable: true })
  pause: Pause;

  @Column({
    type: 'enum',
    enum: ['started', 'paused', 'null'],
    default: 'null',
  })
  status: 'started' | 'paused' | 'null';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
