import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  video: string;

  @Column({ nullable: true })
  url: string;

  @Column({ default: false })
  publishStatus: boolean;

  @Column({ default: false })
  isTrending: boolean;

  @Column({ default: 0 })
  playCount: number;

  @Column({ nullable: true, type: 'timestamp' })
  publishedAt: Date;

  @OneToMany(() => GameCategory, (gameCategory) => gameCategory.game, {
    cascade: true,
  })
  gameCategories: GameCategory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('game_categories')
export class GameCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  gameId: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => Game, (game) => game.gameCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
