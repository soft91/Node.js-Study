import e from 'express';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn() // Auto-incrementing primary key
  id?: number;

  @Column({ unique: true }) // Unique email column
  email: string;

  @Column()
  password: string;

  @Column()
  username: string;

  @Column({ default: true })
  createdDt: Date = new Date();
}
