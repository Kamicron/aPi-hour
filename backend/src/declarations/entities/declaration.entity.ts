import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('declarations') // Nom de la table dans la base de données
export class Declaration {
  @PrimaryGeneratedColumn('uuid') // Génère automatiquement un UUID pour l'identifiant
  id: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'float' })
  workedHours: number;

  @Column({ type: 'float' })
  pauseHours: number;

  @Column({ type: 'float' })
  contractualHours: number;

  @Column({ type: 'float' })
  extraHours: number;

  @ManyToOne(() => User, (user) => user.declarations)
  user: User;
}
