import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Album } from './interfaces/album.interface';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { validate as isUUID } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  private albums: Album[] = [];
  private tracks: any[] = []; // TODO: dodać interfejs Track

  async create(createAlbumDto: CreateAlbumDto) {
    return this.prisma.album.create({
      data: createAlbumDto,
    });
  }

  async findAll() {
    return this.prisma.album.findMany();
  }

  async findOne(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    return album;
  }

  update(id: string, updateAlbumDto: UpdateAlbumDto): Album {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const albumIndex = this.albums.findIndex(album => album.id === id);
    if (albumIndex === -1) {
      throw new NotFoundException('Album not found');
    }

    if (updateAlbumDto.name !== undefined && typeof updateAlbumDto.name !== 'string') {
      throw new BadRequestException('Name must be a string');
    }
    if (updateAlbumDto.year !== undefined && (typeof updateAlbumDto.year !== 'number' || updateAlbumDto.year < 1900 || updateAlbumDto.year > new Date().getFullYear())) {
      throw new BadRequestException('Year must be a number between 1900 and current year');
    }
    if (updateAlbumDto.artistId !== undefined && updateAlbumDto.artistId !== null && !isUUID(updateAlbumDto.artistId)) {
      throw new BadRequestException('Invalid artistId UUID');
    }

    const updatedAlbum: Album = {
      ...this.albums[albumIndex],
      ...updateAlbumDto,
    };

    this.albums[albumIndex] = updatedAlbum;
    return updatedAlbum;
  }

  async remove(id: string) {
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    await this.prisma.album.delete({
      where: { id },
    });
  }

  removeArtist(artistId: string): void {
    this.albums = this.albums.map(album => {
      if (album.artistId === artistId) {
        return { ...album, artistId: null };
      }
      return album;
    });
  }
} 