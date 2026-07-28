import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true }) // O e-mail não pode se repetir no banco
  email: string;

  @Column()
  passwordHash: string; // Guardaremos o hash da senha, nunca a senha em texto puro

  @Column({ default: 'client' }) // Papéis possíveis: 'admin', 'support', 'client'
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
