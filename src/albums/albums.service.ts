import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Album } from './interfaces/album.interface';
import { CreateAlbumDto } from './dto/create-album.dto';
import { Prisma } from '@prisma/client'; // Import Prisma type
import { UpdateAlbumDto } from './dto/update-album.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlbumsService {
  constructor(private prisma: PrismaService) {}

  async create(createAlbumDto: CreateAlbumDto): Promise<Album> { // Dodano typ zwracany
    return this.prisma.album.create({
      data: createAlbumDto,
    });
  }

  async findAll(): Promise<Album[]> { // Dodano typ zwracany
    return this.prisma.album.findMany();
  }

  async findOne(id: string): Promise<Album> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    return album;
  }

  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    // Usunięto redundantną walidację - obsługuje ją ValidationPipe
    return this.prisma.album.update({
      where: { id },
      data: updateAlbumDto,
    });
  }

  async remove(id: string) {
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const album = await this.prisma.album.findUnique({
      where: { id },
      include: {
        favorites: true,
      },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    // Najpierw ustawiamy track.albumId na null dla wszystkich utworów z tego albumu
    await this.prisma.track.updateMany({
      where: { albumId: id },
      data: { albumId: null },
    });

    // Remove album from favorites
    await Promise.all(
      album.favorites.map((favorite) =>
        this.prisma.favorites.update({
          where: { id: favorite.id },
          data: {
            albums: {
              disconnect: { id },
            },
          },
        }),
      ),
    );

    // Następnie usuwamy album
    await this.prisma.album.delete({
      where: { id },
    });
  }

  async removeArtist(artistId: string): Promise<Prisma.BatchPayload> { // Dodano typ zwracany
    return this.prisma.album.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
  }
} 