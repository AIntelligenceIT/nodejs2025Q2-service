import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { ArtistEntity } from './entities/artist.entity';
import { AlbumEntity } from './entities/album.entity';
import { TrackEntity } from './entities/track.entity';
import { FavoritesEntity } from './entities/favorites.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER || 'user',
  password: process.env.POSTGRES_PASSWORD || 'password',
  database: process.env.POSTGRES_DB || 'homelibrary',
  entities: [UserEntity, ArtistEntity, AlbumEntity, TrackEntity, FavoritesEntity],
  // Include both source and dist migrations so migrations run in dev and in built image
  migrations: ['dist/migrations/*{.js,.cjs}', 'src/migrations/*{.ts,.js}'],
});

export default AppDataSource;
