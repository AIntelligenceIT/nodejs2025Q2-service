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
  Track,
} from './interfaces/favorites.interface';
import { Album as AlbumInterface } from '../albums/interfaces/album.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { FavoritesEntity } from '../database/entities/favorites.entity';
import { Repository } from 'typeorm';
import { ArtistEntity } from '../database/entities/artist.entity';
import { AlbumEntity } from '../database/entities/album.entity';
import { TrackEntity } from '../database/entities/track.entity';

@Injectable()
export class FavoritesService {
  private readonly favoritesId = 'global-favorites';

  constructor(
    @InjectRepository(FavoritesEntity)
    private favoritesRepository: Repository<FavoritesEntity>,
    // Usługi są lepsze niż bezpośrednie repozytoria, aby nie duplikować logiki sprawdzania istnienia
    @Inject(forwardRef(() => ArtistsService))
    private artistService: ArtistsService,
    @Inject(forwardRef(() => AlbumsService))
    private albumService: AlbumsService,
    @Inject(forwardRef(() => TracksService))
    private trackService: TracksService,
  ) {}

  private async getOrCreateFavorites(): Promise<FavoritesEntity> {
    let favorites = await this.favoritesRepository.findOne({
      where: { id: this.favoritesId },
      relations: ['artists', 'albums', 'tracks'],
    });
    if (!favorites) {
      favorites = this.favoritesRepository.create({
        id: this.favoritesId,
        artists: [],
        albums: [],
        tracks: [],
      });
      await this.favoritesRepository.save(favorites);
    }
    return favorites;
  }

  async findAll(): Promise<FavoritesResponse> {
    const favs = await this.getOrCreateFavorites();
    // Mapowanie encji na interfejsy odpowiedzi
    return {
      artists: favs.artists.map(artist => ({ id: artist.id, name: artist.name, grammy: artist.grammy })),
      albums: favs.albums.map(album => ({ id: album.id, name: album.name, year: album.year, artistId: album.artist ? album.artist.id : null })),
      tracks: favs.tracks.map(track => ({ id: track.id, name: track.name, duration: track.duration, artistId: track.artist ? track.artist.id : null, albumId: track.album ? track.album.id : null })),
    };
  }

  async addTrack(trackId: string): Promise<{ message: string }> {
    const track = await this.trackService.findOneEntity(trackId);
    if (!track) {
      throw new UnprocessableEntityException(`Track with ID ${trackId} not found.`);
    }
    const favorites = await this.getOrCreateFavorites();
    if (!favorites.tracks.find(t => t.id === track.id)) {
      favorites.tracks.push(track);
      await this.favoritesRepository.save(favorites);
    }
    return { message: `Track ${trackId} added to favorites` };
  }

  async addAlbum(albumId: string): Promise<{ message: string }> {
    const album = await this.albumService.findOneEntity(albumId);
    if (!album) {
      throw new UnprocessableEntityException(`Album with ID ${albumId} not found.`);
    }
    const favorites = await this.getOrCreateFavorites();
    if (!favorites.albums.find(a => a.id === album.id)) {
      favorites.albums.push(album);
      await this.favoritesRepository.save(favorites);
    }
    return { message: `Album ${albumId} added to favorites` };
  }

  async addArtist(artistId: string): Promise<{ message: string }> {
    const artist = await this.artistService.findOneEntity(artistId);
    if (!artist) {
      throw new UnprocessableEntityException(`Artist with ID ${artistId} not found.`);
    }
    const favorites = await this.getOrCreateFavorites();
    if (!favorites.artists.find(a => a.id === artist.id)) {
      favorites.artists.push(artist);
      await this.favoritesRepository.save(favorites);
    }
    return { message: `Artist ${artistId} added to favorites` };
  }

  async removeTrack(trackId: string): Promise<void> {
    const favorites = await this.getOrCreateFavorites();
    const trackIndex = favorites.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      throw new NotFoundException(
        `Track with ID ${trackId} not found in favorites.`,
      );
    }
    favorites.tracks.splice(trackIndex, 1);
    await this.favoritesRepository.save(favorites);
  }

  async removeAlbum(albumId: string): Promise<void> {
    const favorites = await this.getOrCreateFavorites();
    const albumIndex = favorites.albums.findIndex(a => a.id === albumId);
    if (albumIndex === -1) {
      throw new NotFoundException(
        `Album with ID ${albumId} not found in favorites.`,
      );
    }
    favorites.albums.splice(albumIndex, 1);
    await this.favoritesRepository.save(favorites);
  }

  async removeArtist(artistId: string): Promise<void> {
    const favorites = await this.getOrCreateFavorites();
    const artistIndex = favorites.artists.findIndex(a => a.id === artistId);
    if (artistIndex === -1) {
      throw new NotFoundException(
        `Artist with ID ${artistId} not found in favorites.`,
      );
    }
    favorites.artists.splice(artistIndex, 1);
    await this.favoritesRepository.save(favorites);
  }

  async removeArtistReferences(artistId: string): Promise<void> {
    const favorites = await this.favoritesRepository.findOne({
        where: { id: this.favoritesId },
        relations: ['artists'],
    });
    if (favorites && favorites.artists) {
        favorites.artists = favorites.artists.filter(artist => artist.id !== artistId);
        await this.favoritesRepository.save(favorites);
    }
  }

  async removeAlbumReferences(albumId: string): Promise<void> {
    const favorites = await this.favoritesRepository.findOne({
        where: { id: this.favoritesId },
        relations: ['albums'],
    });
    if (favorites && favorites.albums) {
        favorites.albums = favorites.albums.filter(album => album.id !== albumId);
        await this.favoritesRepository.save(favorites);
    }
  }

  async removeTrackReferences(trackId: string): Promise<void> {
    const favorites = await this.favoritesRepository.findOne({
        where: { id: this.favoritesId },
        relations: ['tracks'],
    });
    if (favorites && favorites.tracks) {
        favorites.tracks = favorites.tracks.filter(track => track.id !== trackId);
        await this.favoritesRepository.save(favorites);
    }
  }
}
