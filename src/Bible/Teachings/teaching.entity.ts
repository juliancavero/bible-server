import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Teaching {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  book: string;

  @Column()
  chapter: number;

  @Column()
  day: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column({ default: '' })
  image: string;

  @Column({ type: 'longtext' })
  text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
