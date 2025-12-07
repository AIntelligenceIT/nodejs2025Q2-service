import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from './entities/user.entity';
import { ArtistEntity } from './entities/artist.entity';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from './entities/track.entity';
import { FavoritesEntity } from './entities/favorites.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [
    UserEntity,
    ArtistEntity,
    AlbumEntity,
    TrackEntity,
    FavoritesEntity,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
