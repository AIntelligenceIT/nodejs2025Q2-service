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
import { ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ArtistEntity } from '../database/entities/artist.entity';
import { Repository } from 'typeorm';

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
  constructor(
    @InjectRepository(ArtistEntity)
    private artistRepository: Repository<ArtistEntity>,
    @Inject(forwardRef(() => AlbumsService))
    private readonly albumsService: AlbumsService,
    @Inject(forwardRef(() => TracksService))
    private readonly tracksService: TracksService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async create(createArtistDto: CreateArtistDto): Promise<Artist> {
    const newArtist = this.artistRepository.create(createArtistDto);
    return await this.artistRepository.save(newArtist);
  }

  async findAll(): Promise<Artist[]> {
    return await this.artistRepository.find();
  }

  async findOne(id: string): Promise<Artist> {
    const artist = await this.artistRepository.findOneBy({ id });
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return artist;
  }

  async findOneEntity(id: string): Promise<ArtistEntity | null> {
    return await this.artistRepository.findOneBy({ id });
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> {
    const artist = await this.artistRepository.preload({
      id: id,
      ...updateArtistDto,
    });
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return await this.artistRepository.save(artist);
  }

  async remove(id: string): Promise<void> {
    const artist = await this.findOneEntity(id); // Sprawdź czy istnieje
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    // Disassociate from tracks and albums
    // Ta logika powinna być obsługiwana przez kaskadowe usuwanie lub SET NULL w definicjach encji
    // lub przez bezpośrednie zapytania, jeśli TypeORM nie obsługuje tego w pełni dla SET NULL przy usuwaniu rodzica.
    // Na razie zakładamy, że onDelete: 'SET NULL' w encjach AlbumEntity i TrackEntity zadziała.
    // Jeśli nie, trzeba będzie dodać:
    // await this.tracksService.removeArtistReferences(id);
    // await this.albumsService.removeArtistReferences(id);

    // Remove from favorites
    try {
      await this.favoritesService.removeArtistReferences(id);
    } catch (error) {
      console.warn(
        `Attempted to remove non-favorite artist ${id} during cleanup or artist was already removed from favs.`,
      );
    }

    const result = await this.artistRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Artist with ID ${id} not found during delete operation`,
      );
    }
  }
}
