import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto, UpdateGameDto } from './dto/create-game.dto';
import { GameQueryDto } from './dto/game-query.dto';
import { AdminAuthGuard } from '../../modules/admin/guards/admin-auth.guard';
import { JwtOptionalAuthGuard } from '../../modules/auth/guards/jwt-optional-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Create a new game (Admin only)' })
  create(@Body() createGameDto: CreateGameDto) {
    return this.gamesService.create(createGameDto);
  }

  @Get('admin/list')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'List all games with search, pagination, and sorting (Admin only)',
  })
  findAllAdmin(@Query() queryDto: GameQueryDto) {
    return this.gamesService.findAllAdmin(queryDto);
  }

  @Get('new')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get new published games' })
  getNewGames() {
    return this.gamesService.findNew();
  }

  @Get('trending')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trending published games' })
  getTrendingGames() {
    return this.gamesService.findTrending();
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all published games with search' })
  findAll(@Query('search') search?: string) {
    // Defaulting to published only for public listing as per requirement
    // Ideally we'd have a separate admin endpoint or a query param 'includeUnpublished' protected by guard
    return this.gamesService.findAll(search, true);
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get game details by ID' })
  findOne(@Param('id') id: string) {
    return this.gamesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Update a game (Admin only)' })
  update(@Param('id') id: string, @Body() updateGameDto: UpdateGameDto) {
    return this.gamesService.update(id, updateGameDto);
  }

  @Post(':id/like')
  @ApiOperation({
    summary: 'Like a game (Public API - provide userId in query)',
  })
  likeGame(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.gamesService.likeGame(id, userId);
  }

  @Post(':id/dislike')
  @ApiOperation({
    summary: 'Dislike a game (Public API - provide userId in query)',
  })
  dislikeGame(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.gamesService.dislikeGame(id, userId);
  }

  @Delete(':id/reaction')
  @ApiOperation({
    summary:
      'Remove reaction from a game (Public API - provide userId in query)',
  })
  removeReaction(@Param('id') id: string, @Query('userId') userId: string) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.gamesService.removeReaction(id, userId);
  }

  @Get(':id/reactions')
  @ApiOperation({ summary: 'Get reaction statistics for a game' })
  getReactionStats(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.gamesService.getGameReactionStats(id, userId);
  }

  @Post(':id/increment-play-count')
  @ApiOperation({ summary: 'Increment play count for a game' })
  incrementPlayCount(@Param('id') id: string) {
    return this.gamesService.incrementPlayCount(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Delete a game (Admin only)' })
  remove(@Param('id') id: string) {
    return this.gamesService.remove(id);
  }
}
