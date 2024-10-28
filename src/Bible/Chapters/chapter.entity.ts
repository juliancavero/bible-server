import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BibleVersions } from '../types';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  book: string;

  @Column()
  chapter: number;

  @Column({ type: 'longtext' })
  text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: BibleVersions.nvi })
  version: string;
}
