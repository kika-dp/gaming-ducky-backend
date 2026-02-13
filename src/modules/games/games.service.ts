import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Game, GameCategory } from './entities/game.entity';
import { GameReaction, ReactionType } from './entities/game-reaction.entity';
import { CreateGameDto, UpdateGameDto } from './dto/create-game.dto';
import { GameQueryDto } from './dto/game-query.dto';
import { GameReactionStatsDto, ReactionResponseDto } from './dto/reaction.dto';

@Injectable()
export class GamesService {
    constructor(
        @InjectRepository(Game)
        private gamesRepository: Repository<Game>,
        @InjectRepository(GameCategory)
        private gameCategoryRepository: Repository<GameCategory>,
        @InjectRepository(GameReaction)
        private gameReactionRepository: Repository<GameReaction>,
        private dataSource: DataSource,
    ) { }

    async create(createGameDto: CreateGameDto): Promise<Game> {
        const { categoryIds, ...gameData } = createGameDto;

        // Transaction to ensure consistency
        return this.dataSource.transaction(async (manager) => {
            const game = manager.create(Game, gameData);
            const savedGame = await manager.save(game);

            if (categoryIds && categoryIds.length > 0) {
                const gameCategories = categoryIds.map(catId =>
                    manager.create(GameCategory, { gameId: savedGame.id, categoryId: catId })
                );
                await manager.save(gameCategories);
            }
            return savedGame; // Return basic game info, potentially reload if relation needed
        });
    }

    async findAll(search?: string, publishedOnly: boolean = false): Promise<Game[]> {
        const query = this.gamesRepository.createQueryBuilder('game')
            .leftJoinAndSelect('game.gameCategories', 'gameCategories')
            .leftJoinAndSelect('gameCategories.category', 'category');

        if (publishedOnly) {
            query.andWhere('game.publishStatus = :status', { status: true });
        }

        if (search) {
            query.andWhere('(game.title ILIKE :search OR game.description ILIKE :search)', { search: `%${search}%` });
        }

        query.orderBy('game.createdAt', 'DESC');

        return query.getMany();
    }

    async findAllAdmin(queryDto: GameQueryDto): Promise<{ data: Game[], total: number }> {
        const { search, page, limit, sortBy, sortOrder } = queryDto;
        const skip = (page - 1) * limit;

        const query = this.gamesRepository.createQueryBuilder('game')
            .leftJoinAndSelect('game.gameCategories', 'gameCategories')
            .leftJoinAndSelect('gameCategories.category', 'category');

        if (search) {
            query.andWhere('(game.title ILIKE :search OR game.description ILIKE :search)', { search: `%${search}%` });
        }

        // Validate sortBy field to prevent SQL injection if using dynamic order
        const validSortFields = ['title', 'rating', 'publishStatus', 'isTrending', 'createdAt', 'publishedAt'];
        const sortField = validSortFields.includes(sortBy) ? `game.${sortBy}` : 'game.createdAt';

        query.orderBy(sortField, sortOrder)
            .skip(skip)
            .take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async findNew(limit: number = 10): Promise<Game[]> {
        return this.gamesRepository.find({
            where: { publishStatus: true },
            order: { publishedAt: 'DESC' },
            take: limit,
            relations: ['gameCategories', 'gameCategories.category'],
        });
    }

    async findTrending(limit: number = 10): Promise<Game[]> {
        return this.gamesRepository.find({
            where: {
                publishStatus: true,
                isTrending: true,
            },
            take: limit,
            relations: ['gameCategories', 'gameCategories.category'],
        });
    }

    async findOne(id: string): Promise<Game> {
        const game = await this.gamesRepository.findOne({
            where: { id },
            relations: ['gameCategories', 'gameCategories.category'],
        });
        if (!game) throw new NotFoundException('Game not found');
        return game;
    }

    async update(id: string, updateGameDto: UpdateGameDto): Promise<Game> {
        const { categoryIds, ...gameData } = updateGameDto;

        const game = await this.findOne(id);

        // Update basic fields
        Object.assign(game, gameData);
        await this.gamesRepository.save(game);

        // Update categories if provided
        if (categoryIds) {
            // Remove old
            await this.gameCategoryRepository.delete({ gameId: id });

            // Add new
            const gameCategories = categoryIds.map(catId =>
                this.gameCategoryRepository.create({ gameId: id, categoryId: catId })
            );
            await this.gameCategoryRepository.save(gameCategories);
        }

        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const result = await this.gamesRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException('Game not found');
    }

    // Reaction Methods
    async likeGame(gameId: string, userId: string): Promise<ReactionResponseDto> {
        // Verify game exists
        await this.findOne(gameId);

        // Check if user already has a reaction
        const existingReaction = await this.gameReactionRepository.findOne({
            where: { gameId, userId },
        });

        if (existingReaction) {
            if (existingReaction.reactionType === ReactionType.LIKE) {
                return { message: 'Game already liked', reactionType: 'like' };
            }
            // Update dislike to like
            existingReaction.reactionType = ReactionType.LIKE;
            await this.gameReactionRepository.save(existingReaction);
            return { message: 'Reaction updated to like', reactionType: 'like' };
        }

        // Create new like reaction
        const reaction = this.gameReactionRepository.create({
            gameId,
            userId,
            reactionType: ReactionType.LIKE,
        });
        await this.gameReactionRepository.save(reaction);
        return { message: 'Game liked successfully', reactionType: 'like' };
    }

    async dislikeGame(gameId: string, userId: string): Promise<ReactionResponseDto> {
        // Verify game exists
        await this.findOne(gameId);

        // Check if user already has a reaction
        const existingReaction = await this.gameReactionRepository.findOne({
            where: { gameId, userId },
        });

        if (existingReaction) {
            if (existingReaction.reactionType === ReactionType.DISLIKE) {
                return { message: 'Game already disliked', reactionType: 'dislike' };
            }
            // Update like to dislike
            existingReaction.reactionType = ReactionType.DISLIKE;
            await this.gameReactionRepository.save(existingReaction);
            return { message: 'Reaction updated to dislike', reactionType: 'dislike' };
        }

        // Create new dislike reaction
        const reaction = this.gameReactionRepository.create({
            gameId,
            userId,
            reactionType: ReactionType.DISLIKE,
        });
        await this.gameReactionRepository.save(reaction);
        return { message: 'Game disliked successfully', reactionType: 'dislike' };
    }

    async removeReaction(gameId: string, userId: string): Promise<ReactionResponseDto> {
        // Verify game exists
        await this.findOne(gameId);

        const result = await this.gameReactionRepository.delete({ gameId, userId });

        if (result.affected === 0) {
            return { message: 'No reaction to remove', reactionType: null };
        }

        return { message: 'Reaction removed successfully', reactionType: null };
    }

    async getUserReaction(gameId: string, userId: string): Promise<'like' | 'dislike' | null> {
        const reaction = await this.gameReactionRepository.findOne({
            where: { gameId, userId },
        });

        return reaction ? reaction.reactionType : null;
    }

    async getGameReactionStats(gameId: string, userId?: string): Promise<GameReactionStatsDto> {
        // Verify game exists
        await this.findOne(gameId);

        // Count likes and dislikes
        const likeCount = await this.gameReactionRepository.count({
            where: { gameId, reactionType: ReactionType.LIKE },
        });

        const dislikeCount = await this.gameReactionRepository.count({
            where: { gameId, reactionType: ReactionType.DISLIKE },
        });

        // Get user's reaction if userId provided
        let userReaction: 'like' | 'dislike' | null = null;
        if (userId) {
            userReaction = await this.getUserReaction(gameId, userId);
        }

        return {
            likeCount,
            dislikeCount,
            userReaction,
        };
    }
}
