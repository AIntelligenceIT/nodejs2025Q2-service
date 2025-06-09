import { Injectable, NotFoundException } from '@nestjs/common';
import { Album } from './interfaces/album.interface';
import { CreateAlbumDto } from './dto/create-album.dto';
// import { Prisma } from '@prisma/client'; // Import Prisma type - Usunięte
import { UpdateAlbumDto } from './dto/update-album.dto';
// import { PrismaService } from '../prisma/prisma.service'; // Usunięte
import { randomUUID } from 'crypto';
import { TracksService } from '../tracks/tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class AlbumsService {
  private albums: Album[] = [];

  constructor(
    private readonly tracksService: TracksService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const { artistId, ...restOfDto } = createAlbumDto;
    const newAlbum: Album = {
      id: randomUUID(),
      ...restOfDto,
      artistId: artistId === undefined ? null : artistId,
    };
    this.albums.push(newAlbum);
    return newAlbum;
  }

  async findAll(): Promise<Album[]> {
    return this.albums;
  }

  async findOne(id: string): Promise<Album> {
    const album = this.albums.find((a) => a.id === id);
    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }
    return album;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const albumIndex = this.albums.findIndex((a) => a.id === id);
    if (albumIndex === -1) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }
    const updatedAlbum = {
      ...this.albums[albumIndex],
      ...updateAlbumDto,
    };
    this.albums[albumIndex] = updatedAlbum;
    return updatedAlbum;
  }

  async remove(id: string): Promise<void> {
    const albumIndex = this.albums.findIndex((a) => a.id === id);
    if (albumIndex === -1) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    // Disassociate tracks from this album
    this.tracksService.removeAlbumAssociation(id);

    // Remove from favorites
    try {
      await this.favoritesService.removeAlbumReferences(id);
    } catch (error) {
      console.warn(
        `Attempted to remove non-favorite album ${id} during cleanup or album was already removed from favs.`,
      );
    }

    this.albums.splice(albumIndex, 1);
  }

  removeArtist(artistId: string): void {
    this.albums = this.albums.map((album) => {
      if (album.artistId === artistId) {
        return { ...album, artistId: null };
      }
      return album;
    });
  }
}
