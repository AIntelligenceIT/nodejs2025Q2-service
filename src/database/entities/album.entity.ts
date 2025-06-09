import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ArtistEntity } from './artist.entity';
import { TrackEntity } from './track.entity';

@Entity('albums')
export class AlbumEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  year: number;

  @ManyToOne(() => ArtistEntity, (artist) => artist.albums, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  artist: ArtistEntity | null;

  @OneToMany(() => TrackEntity, (track) => track.album, {
    onDelete: 'SET NULL',
  })
  tracks: TrackEntity[];
}
