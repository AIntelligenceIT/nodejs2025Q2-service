import { Controller, Get, Post, Body, Put, Param, Delete, HttpCode, HttpStatus, BadRequestException, UseGuards } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { validate as isUUID } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('album')
@UseGuards(JwtAuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.albumsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    return this.albumsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAlbumDto: CreateAlbumDto) {
    return this.albumsService.create(createAlbumDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    return this.albumsService.update(id, updateAlbumDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    return this.albumsService.remove(id);
  }
} 