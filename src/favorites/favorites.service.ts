import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { ArtistsService } from '../artists/artists.service';
import { AlbumsService } from '../albums/albums.service';
import { TracksService } from '../tracks/tracks.service';
import {
  FavoritesResponse,
  Artist,
  Track
} from './interfaces/favorites.interface';
import { Album as AlbumInterface } from '../albums/interfaces/album.interface';

@Injectable()
export class FavoritesService {
  private favoritesStore: {
    artists: string[];
    albums: string[];
    tracks: string[];
  } = {
    artists: [],
    albums: [],
    tracks: [],
  };

  constructor(
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
    @Inject(forwardRef(() => AlbumsService))
    private albumService: AlbumsService,
    @Inject(forwardRef(() => TracksService))
    private trackService: TracksService,
  ) {}

  private async getFavoriteEntities(): Promise<FavoritesResponse> {
    const artists: Artist[] = [];
    for (const artistId of this.favoritesStore.artists) {
      try {
        const artist = await this.artistService.findOne(artistId);
        artists.push(artist);
      } catch (e) {
      }
    }

    const albums: AlbumInterface[] = [];
    for (const albumId of this.favoritesStore.albums) {
      try {
        const album = await this.albumService.findOne(albumId);
        albums.push(album);
      } catch (e) {
      }
    }

    const tracks: Track[] = [];
    for (const trackId of this.favoritesStore.tracks) {
      try {
        const track = await this.trackService.findOne(trackId);
        tracks.push(track);
      } catch (e) {
      }
    }
    return { artists, albums, tracks };
  }

  async findAll(): Promise<FavoritesResponse> {
    return this.getFavoriteEntities();
  }

  async addTrack(trackId: string): Promise<{ message: string }> {
    try {
      await this.trackService.findOne(trackId);
      if (!this.favoritesStore.tracks.includes(trackId)) {
        this.favoritesStore.tracks.push(trackId);
      }
      return { message: `Track ${trackId} added to favorites` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(
          `Track with ID ${trackId} not found.`,
        );
      }
      throw error;
    }
  }

  async addAlbum(albumId: string): Promise<{ message: string }> {
    try {
      await this.albumService.findOne(albumId);
      if (!this.favoritesStore.albums.includes(albumId)) {
        this.favoritesStore.albums.push(albumId);
      }
      return { message: `Album ${albumId} added to favorites` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(
          `Album with ID ${albumId} not found.`,
        );
      }
      throw error;
    }
  }

  async addArtist(artistId: string): Promise<{ message: string }> {
    try {
      await this.artistService.findOne(artistId);
      if (!this.favoritesStore.artists.includes(artistId)) {
        this.favoritesStore.artists.push(artistId);
      }
      return { message: `Artist ${artistId} added to favorites` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnprocessableEntityException(
          `Artist with ID ${artistId} not found.`,
        );
      }
      throw error;
    }
  }

  async removeTrack(trackId: string): Promise<void> {
    const index = this.favoritesStore.tracks.indexOf(trackId);
    if (index === -1) {
      throw new NotFoundException(
        `Track with ID ${trackId} not found in favorites.`,
      );
    }
    this.favoritesStore.tracks.splice(index, 1);
  }

  async removeAlbum(albumId: string): Promise<void> {
    const index = this.favoritesStore.albums.indexOf(albumId);
    if (index === -1) {
      throw new NotFoundException(
        `Album with ID ${albumId} not found in favorites.`,
      );
    }
    this.favoritesStore.albums.splice(index, 1);
  }

  async removeArtist(artistId: string): Promise<void> {
    const index = this.favoritesStore.artists.indexOf(artistId);
    if (index === -1) {
      throw new NotFoundException(
        `Artist with ID ${artistId} not found in favorites.`,
      );
    }
    this.favoritesStore.artists.splice(index, 1);
  }

  removeArtistReferences(artistId: string): void {
    const index = this.favoritesStore.artists.indexOf(artistId);
    if (index > -1) {
      this.favoritesStore.artists.splice(index, 1);
    }
  }

  removeAlbumReferences(albumId: string): void {
    const index = this.favoritesStore.albums.indexOf(albumId);
    if (index > -1) {
      this.favoritesStore.albums.splice(index, 1);
    }
  }

  removeTrackReferences(trackId: string): void {
    const index = this.favoritesStore.tracks.indexOf(trackId);
    if (index > -1) {
      this.favoritesStore.tracks.splice(index, 1);
    }
  }
}
