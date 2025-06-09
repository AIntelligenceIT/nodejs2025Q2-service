import { Injectable, NotFoundException } from '@nestjs/common';
import { Album } from './interfaces/album.interface';
import { CreateAlbumDto } from './dto/create-album.dto';
// import { Prisma } from '@prisma/client'; // Import Prisma type - Usunięte
import { UpdateAlbumDto } from './dto/update-album.dto';
// import { PrismaService } from '../prisma/prisma.service'; // Usunięte
import { TracksService } from '../tracks/tracks.service';
import { FavoritesService } from '../favorites/favorites.service';
import { forwardRef, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlbumEntity } from '../database/entities/album.entity';
import { Repository } from 'typeorm';
import { ArtistEntity } from '../database/entities/artist.entity';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(AlbumEntity)
    private albumRepository: Repository<AlbumEntity>,
    @InjectRepository(ArtistEntity) // Potrzebne do znalezienia artysty
    private artistRepository: Repository<ArtistEntity>,
    @Inject(forwardRef(() => TracksService))
    private readonly tracksService: TracksService,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    let artist: ArtistEntity | null = null;
    if (createAlbumDto.artistId) {
      artist = await this.artistRepository.findOneBy({ id: createAlbumDto.artistId });
      if (!artist) {
        // Można rzucić błąd lub utworzyć album bez artysty, zależnie od logiki biznesowej
        // Tutaj rzucamy błąd, jeśli podano ID artysty, ale on nie istnieje
        throw new BadRequestException(`Artist with ID ${createAlbumDto.artistId} not found.`);
      }
    }
    const albumToCreate = this.albumRepository.create({
      name: createAlbumDto.name,
      year: createAlbumDto.year,
      artist: artist, // Przypisz encję artysty lub null
    });
    const savedAlbum = await this.albumRepository.save(albumToCreate);
    return this.toResponse(savedAlbum);
  }

  async findAll(): Promise<Album[]> {
    const albums = await this.albumRepository.find({ relations: ['artist'] });
    return albums.map(album => this.toResponse(album));
  }

  async findOne(id: string): Promise<Album> {
    const album = await this.albumRepository.findOne({ where: { id }, relations: ['artist'] });
    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }
    return this.toResponse(album);
  }

  async findOneEntity(id: string): Promise<AlbumEntity | null> {
    return await this.albumRepository.findOneBy({ id });
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    // Najpierw pobierz encję, aby upewnić się, że istnieje i załadować relację, jeśli jest potrzebna do aktualizacji
    let album = await this.albumRepository.findOne({ where: {id}, relations: ['artist']});
    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    // Zastosuj zmiany z DTO
    album = this.albumRepository.merge(album, {
      id: id,
      ...updateAlbumDto,
    });

    if (updateAlbumDto.artistId !== undefined) { // Sprawdź, czy artistId jest aktualizowane
      album.artist = updateAlbumDto.artistId
        ? await this.artistRepository.findOneBy({ id: updateAlbumDto.artistId })
        : null;
      if (updateAlbumDto.artistId && !album.artist) {
        throw new BadRequestException(`Artist with ID ${updateAlbumDto.artistId} not found for update.`);
      }
    }
    const updatedAlbum = await this.albumRepository.save(album);
    return this.toResponse(updatedAlbum);
  }

  async remove(id: string): Promise<void> {
    const album = await this.findOneEntity(id);
    if (!album) {
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
    const result = await this.albumRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Album with ID ${id} not found during delete operation`);
    }
  }

  async removeArtistReferences(artistId: string): Promise<void> {
    // Ta metoda jest wywoływana, gdy artysta jest usuwany
    // Ustawia artistId na null dla wszystkich albumów tego artysty
    // Zgodnie z onDelete: 'SET NULL' w encji AlbumEntity, to powinno dziać się automatycznie
    // jeśli usuwamy artystę. Jeśli jednak chcemy to zrobić manualnie:
    await this.albumRepository.update({ artist: { id: artistId } }, { artist: null });
  }

  private toResponse(albumEntity: AlbumEntity): Album {
    return {
      id: albumEntity.id,
      name: albumEntity.name,
      year: albumEntity.year,
      artistId: albumEntity.artist ? albumEntity.artist.id : null,
    };
  }
}
