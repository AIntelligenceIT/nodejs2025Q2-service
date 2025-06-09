import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Artist } from './interfaces/artist.interface';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AlbumsService } from '../albums/albums.service'; // Zakładając, że ścieżka jest poprawna
import { TracksService } from '../tracks/tracks.service'; // Zakładając, że ścieżka jest poprawna
import { FavoritesService } from '../favorites/favorites.service';
// import { PrismaService } from '../prisma/prisma.service'; // Usunięte
// import { Prisma } from '@prisma/client'; // Import Prisma type - Usunięte
import { randomUUID } from 'crypto';
import { ApiProperty } from '@nestjs/swagger';

export class ArtistResponse implements Artist {
  @ApiProperty({ description: 'Artist ID' })
  id: string;

  @ApiProperty({ description: 'Artist name' })
  name: string;

  @ApiProperty({ description: 'Whether artist has won Grammy' })
  grammy: boolean;
}

@Injectable()
export class ArtistsService {
  private artists: Artist[] = [];

  constructor(
    @Inject(forwardRef(() => AlbumsService))
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    const newArtist: Artist = {
      id: randomUUID(),
      ...createArtistDto,
    };
    this.artists.push(newArtist);
    return newArtist;
  }

  async findAll(): Promise<Artist[]> {
    return this.artists;
  }

  async findOne(id: string): Promise<Artist> {
    const artist = this.artists.find((a) => a.id === id);
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return artist;
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    const artistIndex = this.artists.findIndex((a) => a.id === id);
    if (artistIndex === -1) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    const updatedArtist = {
      ...this.artists[artistIndex],
      ...updateArtistDto,
    };
    this.artists[artistIndex] = updatedArtist;
    return updatedArtist;
  }

  async remove(id: string): Promise<void> {
    const artistIndex = this.artists.findIndex((a) => a.id === id);
    if (artistIndex === -1) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    this.artists.splice(artistIndex, 1);

    // Disassociate from tracks and albums
    this.tracksService.removeArtist(id);
    this.albumsService.removeArtist(id);

    // Remove from favorites
    try {
      await this.favoritesService.removeArtistReferences(id);
    } catch (error) {
      // Log or handle if necessary, e.g., if artist wasn't in favorites
      console.warn(
        `Attempted to remove non-favorite artist ${id} during cleanup or artist was already removed from favs.`,
      );
    }
  }

  // Metody removeAlbum i removeTrack z ArtistsService są redundantne,
  // ponieważ logika usuwania powiązań jest już w metodzie remove.
  // Jeśli te metody były używane gdzieś indziej, należy je przenieść lub usunąć.
  // async removeAlbum(artistId: string): Promise<Prisma.BatchPayload> {
  //   await this.prisma.album.updateMany({
  //     where: { artistId },
  //     data: { artistId: null },
  //   });
  // }
  // async removeTrack(artistId: string): Promise<Prisma.BatchPayload> {
  //   await this.prisma.track.updateMany({
  //     where: { artistId },
  //     data: { artistId: null },
  //   });
  // }
}
