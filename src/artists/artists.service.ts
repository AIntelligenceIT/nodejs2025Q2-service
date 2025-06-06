import { Injectable, NotFoundException } from '@nestjs/common';
import { Artist } from './interfaces/artist.interface';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { AlbumsService } from '../albums/albums.service'; // Zakładając, że ścieżka jest poprawna
import { TracksService } from '../tracks/tracks.service'; // Zakładając, że ścieżka jest poprawna
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client'; // Import Prisma type
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
  constructor(
    private readonly albumsService: AlbumsService,
    private readonly tracksService: TracksService,
    private prisma: PrismaService
  ) {}

  async findAll(): Promise<Artist[]> { // Zmieniono typ zwracany na Artist[]
    return this.prisma.artist.findMany();
  }

  async findOne(id: string): Promise<Artist> { // Zmieniono typ zwracany na Artist
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    return artist;
  }

  async create(createArtistDto: CreateArtistDto): Promise<Artist> { // Zmieniono typ zwracany na Artist
    return this.prisma.artist.create({
      data: createArtistDto,
    });
  }

  async update(id: string, updateArtistDto: UpdateArtistDto): Promise<Artist> { // Zmieniono typ zwracany na Artist
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    return this.prisma.artist.update({
      where: { id },
      data: updateArtistDto,
    });
  }

  async remove(id: string): Promise<void> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze
    const artist = await this.prisma.artist.findUnique({
      where: { id },
      include: {
        albums: true,
        favorites: true,
      },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    // Najpierw ustawiamy track.artistId na null dla wszystkich utworów tego artysty
    await this.prisma.track.updateMany({
      where: { artistId: id },
      data: { artistId: null },
    });

    // Update all albums to remove artist reference
    await Promise.all(
      artist.albums.map((album) =>
        this.prisma.album.update({
          where: { id: album.id },
          data: { artistId: null },
        }),
      ),
    );

    // Remove artist from favorites
    await Promise.all(
      artist.favorites.map((favorite) =>
        this.prisma.favorites.update({
          where: { id: favorite.id },
          data: {
            artists: {
              disconnect: { id },
            },
          },
        }),
      ),
    );

    // Delete the artist
    await this.prisma.artist.delete({
      where: { id },
    });
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