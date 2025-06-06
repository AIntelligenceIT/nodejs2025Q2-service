import { Injectable, UnprocessableEntityException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArtistsService } from '../artists/artists.service';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';
import { FavoritesResponse } from './interfaces/favorites.interface';

@Injectable()
export class FavoritesService {
  // Assuming a single global favorites record for simplicity as per schema
  // In a real app, favorites would likely be tied to a user ID.
  private readonly globalFavoritesId = 'global-favorites-id'; // Or manage this ID differently

  constructor(
    private prisma: PrismaService,
    private artistService: ArtistsService, // To check if artist exists
    private albumService: AlbumsService,   // To check if album exists
    private trackService: TracksService,   // To check if track exists
  ) {}

  private async getOrCreateFavorites() {
    let favorites = await this.prisma.favorites.findUnique({
      where: { id: this.globalFavoritesId },
      include: { artists: true, albums: true, tracks: true },
    });
    if (!favorites) {
      favorites = await this.prisma.favorites.create({
        data: { id: this.globalFavoritesId },
        include: { artists: true, albums: true, tracks: true },
      });
    }
    return favorites;
  }

  async findAll(): Promise<FavoritesResponse> {
    const favs = await this.getOrCreateFavorites();
    return {
      artists: favs.artists,
      albums: favs.albums,
      tracks: favs.tracks,
    };
  }

  async addTrack(trackId: string) {
    try {
      await this.trackService.findOne(trackId); // Throws NotFoundException if track doesn't exist
      await this.prisma.favorites.update({
        where: { id: this.globalFavoritesId },
        data: { tracks: { connect: { id: trackId } } },
      });
      return { message: `Track ${trackId} added to favorites` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(`Track with ID ${trackId} not found.`);
      }
      throw error;
    }
  }

  async addAlbum(albumId: string) {
    try {
      await this.albumService.findOne(albumId); // Throws NotFoundException if album doesn't exist
      await this.prisma.favorites.update({
        where: { id: this.globalFavoritesId },
        data: { albums: { connect: { id: albumId } } },
      });
      return { message: `Album ${albumId} added to favorites` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(`Album with ID ${albumId} not found.`);
      }
      throw error;
    }
  }

  async addArtist(artistId: string) {
    try {
      await this.artistService.findOne(artistId); // Throws NotFoundException if artist doesn't exist
      await this.prisma.favorites.update({
        where: { id: this.globalFavoritesId },
        data: { artists: { connect: { id: artistId } } },
      });
      return { message: `Artist ${artistId} added to favorites` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(`Artist with ID ${artistId} not found.`);
      }
      throw error;
    }
  }

  async removeTrack(trackId: string): Promise<void> {
    // First, check if the track is actually in favorites to throw NotFoundException if not.
    const favorites = await this.getOrCreateFavorites();
    if (!favorites.tracks.find(t => t.id === trackId)) {
      throw new NotFoundException(`Track with ID ${trackId} not found in favorites.`);
    }
    await this.prisma.favorites.update({
      where: { id: this.globalFavoritesId },
      data: { tracks: { disconnect: { id: trackId } } },
    });
  }

  async removeAlbum(albumId: string): Promise<void> {
    const favorites = await this.getOrCreateFavorites();
    if (!favorites.albums.find(a => a.id === albumId)) {
      throw new NotFoundException(`Album with ID ${albumId} not found in favorites.`);
    }
    await this.prisma.favorites.update({
      where: { id: this.globalFavoritesId },
      data: { albums: { disconnect: { id: albumId } } },
    });
  }

  async removeArtist(artistId: string): Promise<void> {
    const favorites = await this.getOrCreateFavorites();
    if (!favorites.artists.find(a => a.id === artistId)) {
      throw new NotFoundException(`Artist with ID ${artistId} not found in favorites.`);
    }
    await this.prisma.favorites.update({
      where: { id: this.globalFavoritesId },
      data: { artists: { disconnect: { id: artistId } } },
    });
  }
}