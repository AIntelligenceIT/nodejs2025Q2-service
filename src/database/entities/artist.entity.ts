import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AlbumEntity } from './album.entity';
import { TrackEntity } from './track.entity';

@Entity('artists')
export class ArtistEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  grammy: boolean;

  @OneToMany(() => AlbumEntity, (album) => album.artist, { onDelete: 'SET NULL' })
  albums: AlbumEntity[];

  @OneToMany(() => TrackEntity, (track) => track.artist, { onDelete: 'SET NULL' })
  tracks: TrackEntity[];
}