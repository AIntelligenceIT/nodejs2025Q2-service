import {
  Entity,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ArtistEntity } from './artist.entity';
import { AlbumEntity } from './album.entity';
import { TrackEntity } from './track.entity';

@Entity('favorites')
export class FavoritesEntity {
  // Użyjemy stałego ID, ponieważ będzie tylko jeden globalny rekord ulubionych
  @PrimaryColumn({ default: 'global-favorites' })
  id: string;

  @ManyToMany(() => ArtistEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({ name: 'favorites_artists' })
  artists: ArtistEntity[];

  @ManyToMany(() => AlbumEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({ name: 'favorites_albums' })
  albums: AlbumEntity[];

  @ManyToMany(() => TrackEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinTable({ name: 'favorites_tracks' })
  tracks: TrackEntity[];
}