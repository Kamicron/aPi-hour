import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('hours_declaration')
export class HoursDeclaration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.hoursDeclarations, { eager: true })
  user: User;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'float' })
  workedHours: number;

  @Column({ type: 'float' })
  pauseHours: number;

  @Column({ type: 'float' })
  contractualHours: number;

  @Column({ type: 'float' })
  extraHours: number;
}
