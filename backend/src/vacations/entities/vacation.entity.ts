import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('vacations')
export class Vacation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.vacations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'public_holiday', 'sick_leave'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected' | 'public_holiday' | 'sick_leave';

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
