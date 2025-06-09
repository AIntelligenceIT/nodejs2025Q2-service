import { Injectable, NotFoundException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { FavoritesService } from '../favorites/favorites.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackEntity } from '../database/entities/track.entity';
import { Repository } from 'typeorm';
import { ArtistEntity } from '../database/entities/artist.entity';
import { AlbumEntity } from '../database/entities/album.entity';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(TrackEntity)
    private trackRepository: Repository<TrackEntity>,
    @InjectRepository(ArtistEntity) // Potrzebne do znalezienia artysty
    private artistRepository: Repository<ArtistEntity>,
    @InjectRepository(AlbumEntity) // Potrzebne do znalezienia albumu
    private albumRepository: Repository<AlbumEntity>,
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async findAll(): Promise<Track[]> {
    const tracks = await this.trackRepository.find({ relations: ['artist', 'album'] });
    return tracks.map(track => this.toResponse(track));
  }

  async findOne(id: string): Promise<Track> {
    const track = await this.trackRepository.findOne({ where: { id }, relations: ['artist', 'album'] });
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return this.toResponse(track);
  }

  async findOneEntity(id: string): Promise<TrackEntity | null> {
    return await this.trackRepository.findOneBy({ id });
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    let artist: ArtistEntity | null = null;
    if (createTrackDto.artistId) {
      artist = await this.artistRepository.findOneBy({ id: createTrackDto.artistId });
      if (!artist) throw new BadRequestException(`Artist with ID ${createTrackDto.artistId} not found.`);
    }
    let album: AlbumEntity | null = null;
    if (createTrackDto.albumId) {
      album = await this.albumRepository.findOneBy({ id: createTrackDto.albumId });
      if (!album) throw new BadRequestException(`Album with ID ${createTrackDto.albumId} not found.`);
    }

    const trackToCreate = this.trackRepository.create({
      name: createTrackDto.name,
      duration: createTrackDto.duration,
      artist: artist,
      album: album,
    });
    const savedTrack = await this.trackRepository.save(trackToCreate);
    return this.toResponse(savedTrack);
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    let track = await this.trackRepository.findOne({ where: {id}, relations: ['artist', 'album']});
    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    track = this.trackRepository.merge(track, {
      id: id,
      ...updateTrackDto, // name, duration
    });

    if (updateTrackDto.artistId !== undefined) {
      track.artist = updateTrackDto.artistId
        ? await this.artistRepository.findOneBy({ id: updateTrackDto.artistId })
        : null;
    }
    if (updateTrackDto.albumId !== undefined) {
      track.album = updateTrackDto.albumId
        ? await this.albumRepository.findOneBy({ id: updateTrackDto.albumId })
        : null;
    }

    const updatedTrack = await this.trackRepository.save(track);
    return this.toResponse(updatedTrack);
  }

  async remove(id: string): Promise<void> {
    const track = await this.findOneEntity(id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    try {
      await this.favoritesService.removeTrackReferences(id);
    } catch (error) {
      console.warn(
        `Attempted to remove non-favorite track ${id} during cleanup or track was already removed from favs.`,
      );
    }
    const result = await this.trackRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Track with ID ${id} not found during delete operation`);
    }
  }

  async removeArtistReferences(artistId: string): Promise<void> {
    await this.trackRepository.update({ artist: { id: artistId } }, { artist: null });
  }

  async removeAlbumAssociation(albumId: string): Promise<void> {
    await this.trackRepository.update({ album: { id: albumId } }, { album: null });
  }

  private toResponse(trackEntity: TrackEntity): Track {
    return {
      id: trackEntity.id,
      name: trackEntity.name,
      duration: trackEntity.duration,
      artistId: trackEntity.artist ? trackEntity.artist.id : null,
      albumId: trackEntity.album ? trackEntity.album.id : null,
    };
  }
}
