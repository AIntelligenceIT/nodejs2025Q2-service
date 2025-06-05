import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TracksService {
  private tracks: Track[] = [];

  findAll(): Track[] {
    return this.tracks; // Dodano typ zwracany
  }

  findOne(id: string): Track {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const track = this.tracks.find(track => track.id === id);
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  create(createTrackDto: CreateTrackDto): Track { // Dodano typ zwracany
    // Walidacja DTO jest obsługiwana przez ValidationPipe
    const track: Track = {
      id: randomUUID(),
      ...createTrackDto,
    };
    this.tracks.push(track);
    return track;
  }

  update(id: string, updateTrackDto: UpdateTrackDto): Track {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const trackIndex = this.tracks.findIndex(track => track.id === id);
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

  remove(id: string): void { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const trackIndex = this.tracks.findIndex(track => track.id === id);
    if (trackIndex === -1) {
      throw new NotFoundException('Track not found');
    }
    this.tracks.splice(trackIndex, 1);
  }

  removeArtist(artistId: string): void { // Dodano typ zwracany
    this.tracks = this.tracks.map(track => {
      if (track.artistId === artistId) {
        return { ...track, artistId: null };
      }
      return track;
    });
  }
} 