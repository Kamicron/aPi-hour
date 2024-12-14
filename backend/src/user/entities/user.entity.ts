import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
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
}
