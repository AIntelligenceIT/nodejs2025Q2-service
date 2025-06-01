import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Artist } from './interfaces/artist.interface';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { validate as isUUID } from 'uuid';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';

@Injectable()
export class ArtistsService {
  private artists: Artist[] = [];

  constructor(
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
  ) {}

  findAll(): Artist[] {
    return this.artists;
  }

  findOne(id: string): Artist {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const artist = this.artists.find(artist => artist.id === id);
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }
    return artist;
  }

  create(createArtistDto: CreateArtistDto): Artist {
    if (!createArtistDto.name || typeof createArtistDto.name !== 'string') {
      throw new BadRequestException('Name is required and must be a string');
    }
    if (typeof createArtistDto.grammy !== 'boolean') {
      throw new BadRequestException('Grammy must be a boolean');
    }

    const artist: Artist = {
      id: randomUUID(),
      ...createArtistDto,
    };
    this.artists.push(artist);
    return artist;
  }

  update(id: string, updateArtistDto: UpdateArtistDto): Artist {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const artistIndex = this.artists.findIndex(artist => artist.id === id);
    if (artistIndex === -1) {
      throw new NotFoundException('Artist not found');
    }

    if (updateArtistDto.name !== undefined && typeof updateArtistDto.name !== 'string') {
      throw new BadRequestException('Name must be a string');
    }
    if (updateArtistDto.grammy !== undefined && typeof updateArtistDto.grammy !== 'boolean') {
      throw new BadRequestException('Grammy must be a boolean');
    }

    const updatedArtist: Artist = {
      ...this.artists[artistIndex],
      ...updateArtistDto,
    };

    this.artists[artistIndex] = updatedArtist;
    return updatedArtist;
  }

  remove(id: string): void {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const artistIndex = this.artists.findIndex(artist => artist.id === id);
    if (artistIndex === -1) {
      throw new NotFoundException('Artist not found');
    }

    // Ustaw artistId na null w powiązanych albumach
    this.albumsService.removeArtist(id);

    // Ustaw artistId na null w powiązanych utworach
    this.tracksService.removeArtist(id);

    this.artists.splice(artistIndex, 1);
  }
} 