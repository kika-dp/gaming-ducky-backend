import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Game } from './game.entity';
import { User } from '../../users/entities/user.entity';

export enum ReactionType {
    LIKE = 'like',
    DISLIKE = 'dislike',
}

@Entity('game_reactions')
@Unique(['userId', 'gameId'])
export class GameReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    gameId: string;

    @Column({
        type: 'enum',
        enum: ReactionType,
    })
    reactionType: ReactionType;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Game, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'gameId' })
    game: Game;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
