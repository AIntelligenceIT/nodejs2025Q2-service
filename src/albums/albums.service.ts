import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Album } from './interfaces/album.interface';
import { CreateAlbumDto } from './dto/create-album.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class AlbumsService {
  private albums: Album[] = [];
  private tracks: any[] = []; // TODO: dodać interfejs Track

  findAll(): Album[] {
    return this.albums;
  }

  findOne(id: string): Album {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const album = this.albums.find(album => album.id === id);
    if (!album) {
      throw new NotFoundException('Album not found');
    }
    return album;
  }

  create(createAlbumDto: CreateAlbumDto): Album {
    if (!createAlbumDto.name || typeof createAlbumDto.name !== 'string') {
      throw new BadRequestException('Name is required and must be a string');
    }
    if (typeof createAlbumDto.year !== 'number' || createAlbumDto.year < 1900 || createAlbumDto.year > new Date().getFullYear()) {
      throw new BadRequestException('Year must be a number between 1900 and current year');
    }
    if (createAlbumDto.artistId !== null && !isUUID(createAlbumDto.artistId)) {
      throw new BadRequestException('Invalid artistId UUID');
    }

    const album: Album = {
      id: randomUUID(),
      ...createAlbumDto,
    };
    this.albums.push(album);
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

  remove(id: string): void {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const albumIndex = this.albums.findIndex(album => album.id === id);
    if (albumIndex === -1) {
      throw new NotFoundException('Album not found');
    }

    // Ustaw albumId na null w powiązanych utworach
    this.tracks = this.tracks.map(track => {
      if (track.albumId === id) {
        return { ...track, albumId: null };
      }
      return track;
    });

    this.albums.splice(albumIndex, 1);
  }
} 