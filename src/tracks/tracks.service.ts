import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Track } from './interfaces/track.interface';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { validate as isUUID } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TracksService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Track[]> {
    return this.prisma.track.findMany();
  }

  async findOne(id: string): Promise<Track> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  async create(createTrackDto: CreateTrackDto): Promise<Track> {
    if (!createTrackDto.name || typeof createTrackDto.name !== 'string') {
      throw new BadRequestException('Name is required and must be a string');
    }
    if (typeof createTrackDto.duration !== 'number') {
      throw new BadRequestException('Duration must be a number');
    }
    if (createTrackDto.artistId !== null && !isUUID(createTrackDto.artistId)) {
      throw new BadRequestException('Invalid artist UUID');
    }
    if (createTrackDto.albumId !== null && !isUUID(createTrackDto.albumId)) {
      throw new BadRequestException('Invalid album UUID');
    }

    return this.prisma.track.create({ data: createTrackDto });
  }

  async update(id: string, updateTrackDto: UpdateTrackDto): Promise<Track> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    if (updateTrackDto.name !== undefined && typeof updateTrackDto.name !== 'string') {
      throw new BadRequestException('Name must be a string');
    }
    if (updateTrackDto.duration !== undefined && typeof updateTrackDto.duration !== 'number') {
      throw new BadRequestException('Duration must be a number');
    }
    if (updateTrackDto.artistId !== undefined && updateTrackDto.artistId !== null && !isUUID(updateTrackDto.artistId)) {
      throw new BadRequestException('Invalid artist UUID');
    }
    if (updateTrackDto.albumId !== undefined && updateTrackDto.albumId !== null && !isUUID(updateTrackDto.albumId)) {
      throw new BadRequestException('Invalid album UUID');
    }

    return this.prisma.track.update({ where: { id }, data: updateTrackDto });
  }

  async remove(id: string): Promise<void> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const track = await this.prisma.track.findUnique({ where: { id } });
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    await this.prisma.track.delete({ where: { id } });
  }

  async removeArtist(artistId: string): Promise<void> {
    await this.prisma.track.updateMany({ where: { artistId }, data: { artistId: null } });
  }
}
