import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';
import { AdminAuthGuard } from '../../modules/admin/guards/admin-auth.guard';
import { JwtOptionalAuthGuard } from '../../modules/auth/guards/jwt-optional-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(AdminAuthGuard)
    @ApiOperation({ summary: 'Create a new page (Admin only)' })
    create(@Body() createPageDto: CreatePageDto) {
        return this.pagesService.create(createPageDto);
    }

    @Get()
    @UseGuards(JwtOptionalAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List all pages' })
    findAll() {
        return this.pagesService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtOptionalAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get page details by ID' })
    findOne(@Param('id') id: string) {
        return this.pagesService.findOne(id);
    }

    // Public endpoint to fetch by slug, usually needed for frontend
    @Get('slug/:slug')
    @UseGuards(JwtOptionalAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get page details by slug' })
    findBySlug(@Param('slug') slug: string) {
        return this.pagesService.findBySlug(slug);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @UseGuards(AdminAuthGuard)
    @ApiOperation({ summary: 'Update a page (Admin only)' })
    update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
        return this.pagesService.update(id, updatePageDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(AdminAuthGuard)
    @ApiOperation({ summary: 'Delete a page (Admin only)' })
    remove(@Param('id') id: string) {
        return this.pagesService.remove(id);
    }
}
