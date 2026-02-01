import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto, UpdateGameDto } from './dto/create-game.dto';
import { GameQueryDto } from './dto/game-query.dto';
import { AdminAuthGuard } from '../../modules/admin/guards/admin-auth.guard';
import { JwtOptionalAuthGuard } from '../../modules/auth/guards/jwt-optional-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Games')
@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) { }

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
    @ApiOperation({ summary: 'List all games with search, pagination, and sorting (Admin only)' })
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

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(AdminAuthGuard)
    @ApiOperation({ summary: 'Delete a game (Admin only)' })
    remove(@Param('id') id: string) {
        return this.gamesService.remove(id);
    }
}
