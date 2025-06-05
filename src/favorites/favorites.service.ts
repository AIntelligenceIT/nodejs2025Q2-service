import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Favorites } from '@prisma/client'; // Import Favorites type

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Favorites & { artists: any[]; albums: any[]; tracks: any[] }> { // Dodano typ zwracany
    let favorites = await this.prisma.favorites.findFirst({
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });

    if (!favorites) {
      // Utwórz domyślny wpis ulubionych, jeśli żaden nie istnieje
      favorites = await this.prisma.favorites.create({
        data: {}, // Początkowo brak artystów, albumów, utworów
        include: {
          artists: true,
          albums: true,
          tracks: true,
        },
      });
    }
    return favorites;
  }

  async addArtist(id: string): Promise<Favorites & { artists: any[]; albums: any[]; tracks: any[] }> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze

    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      return this.prisma.favorites.create({
        data: {
          artists: {
            connect: { id },
          },
        },
        include: {
          artists: true,
          albums: true,
          tracks: true,
        },
      });
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        artists: {
          connect: { id },
        },
      },
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });
  }

  async removeArtist(id: string): Promise<Favorites> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze

    const favorites = await this.prisma.favorites.findFirst({
      where: {
        artists: {
          some: { id },
        },
      },
    });

    if (!favorites) {
      throw new NotFoundException('Artist not found in favorites');
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        artists: {
          disconnect: { id },
        },
      },
    });
  }

  async addAlbum(id: string): Promise<Favorites & { artists: any[]; albums: any[]; tracks: any[] }> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze

    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    const favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      return this.prisma.favorites.create({
        data: {
          albums: {
            connect: { id },
          },
        },
        include: {
          artists: true,
          albums: true,
          tracks: true,
        },
      });
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        albums: {
          connect: { id },
        },
      },
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });
  }

  async removeAlbum(id: string): Promise<Favorites> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze

    const favorites = await this.prisma.favorites.findFirst({
      where: {
        albums: {
          some: { id },
        },
      },
    });

    if (!favorites) {
      throw new NotFoundException('Album not found in favorites');
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        albums: {
          disconnect: { id },
        },
      },
    });
  }

  async addTrack(id: string): Promise<Favorites & { artists: any[]; albums: any[]; tracks: any[] }> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze

    const track = await this.prisma.track.findUnique({
      where: { id },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const favorites = await this.prisma.favorites.findFirst();
    if (!favorites) {
      return this.prisma.favorites.create({
        data: {
          tracks: {
            connect: { id },
          },
        },
        include: {
          artists: true,
          albums: true,
          tracks: true,
        },
      });
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        tracks: {
          connect: { id },
        },
      },
      include: {
        artists: true,
        albums: true,
        tracks: true,
      },
    });
  }

  async removeTrack(id: string): Promise<Favorites> { // Dodano typ zwracany
    // Walidacja UUID jest teraz obsługiwana przez ParseUUIDPipe w kontrolerze

    const favorites = await this.prisma.favorites.findFirst({
      where: {
        tracks: {
          some: { id },
        },
      },
    });

    if (!favorites) {
      throw new NotFoundException('Track not found in favorites');
    }

    return this.prisma.favorites.update({
      where: { id: favorites.id },
      data: {
        tracks: {
          disconnect: { id },
        },
      },
    });
  }
} 