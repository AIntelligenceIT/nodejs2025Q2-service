import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { FavoritesService } from '../favorites/favorites.service';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class TracksService {
  private tracks: Track[] = [];

  constructor(
    @Inject(forwardRef(() => FavoritesService))
    private readonly favoritesService: FavoritesService,
  ) {}

  async findAll(): Promise<Track[]> {
    return this.tracks; // Dodano typ zwracany
  }

  async findOne(id: string): Promise<Track> {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const track = this.tracks.find((track) => track.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }
  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    // Dodano typ zwracany
    // Walidacja DTO jest obsługiwana przez ValidationPipe
    const track: Track = {
      id: randomUUID(),
      ...createTrackDto,
    };
    this.tracks.push(track);
    return track;
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const trackIndex = this.tracks.findIndex((track) => track.id === id);
    if (trackIndex === -1) {
      throw new NotFoundException('Track not found');
    }
    // Walidacja DTO jest obsługiwana przez ValidationPipe
    const updatedTrack: Track = {
      ...this.tracks[trackIndex],
      ...updateTrackDto,
    };

    this.tracks[trackIndex] = updatedTrack;
    return updatedTrack;
  }

  async remove(id: string): Promise<void> {
    // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const trackIndex = this.tracks.findIndex((track) => track.id === id);
    if (trackIndex === -1) {
      throw new NotFoundException('Track not found');
    }
    // Remove from favorites
    try {
      await this.favoritesService.removeTrackReferences(id);
    } catch (error) {
      console.warn(
        `Attempted to remove non-favorite track ${id} during cleanup or track was already removed from favs.`,
      );
    }
    this.tracks.splice(trackIndex, 1);
  }

  removeArtist(artistId: string): void {
    // Dodano typ zwracany
    this.tracks = this.tracks.map((track) => {
      if (track.artistId === artistId) {
        return { ...track, artistId: null };
      }
      return track;
    });
  }

  removeAlbumAssociation(albumId: string): void {
    this.tracks = this.tracks.map((track) => {
      if (track.albumId === albumId) {
        return { ...track, albumId: null };
      }
      return track;
    });
  }
}
