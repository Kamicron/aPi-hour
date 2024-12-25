import { Declaration } from 'src/declarations/entities/declaration.entity';
import { TimeEntry } from 'src/time-entries/entities/time-entry.entity';
import { UserSession } from 'src/user_sessions/entities/user_session.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('users') // Nom de la table dans la base de données
export class User {
  @PrimaryGeneratedColumn('uuid') // Utilisation de UUID
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Ne pas inclure dans les sélections par défaut
  password: string;

  @Column({ default: 'user' }) // Valeurs possibles : 'user', 'admin'
  role: 'user' | 'admin';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn() // Géré automatiquement pour le soft delete
  deletedAt: Date | null;

  @OneToMany(() => TimeEntry, (timeEntry) => timeEntry.user)
  timeEntries: TimeEntry[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @Column({ type: 'float', nullable: true })
  weeklyHoursGoal?: number;

  @Column({ type: 'int', nullable: true })
  workingDaysPerWeek?: number;

  @OneToMany(() => Declaration, (declaration) => declaration.user)
  declarations: Declaration[];
}
