import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Saint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day: number;

  @Column()
  month: number;

  @Column()
  name: string;

  @Column({ default: '' })
  image: string;

  @Column({ type: 'longtext' })
  text: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: false })
  isMain: boolean;
}
