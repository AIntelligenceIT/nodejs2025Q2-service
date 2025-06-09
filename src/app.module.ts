import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { ArtistsModule } from './artists/artists.module';
import { AlbumsModule } from './albums/albums.module';
import { TracksModule } from './tracks/tracks.module';
import { FavoritesModule } from './favorites/favorites.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Zaimportuj swoje encje bezpośrednio
import { UserEntity } from './database/entities/user.entity';
import { ArtistEntity } from './database/entities/artist.entity';
import { AlbumEntity } from './database/entities/album.entity';
import { TrackEntity } from './database/entities/track.entity';
import { FavoritesEntity } from './database/entities/favorites.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('[AppModule] Initializing TypeORM configuration...');

        const host = configService.get<string>('POSTGRES_HOST');
        const portStr = configService.get<string>('POSTGRES_PORT');
        const username = configService.get<string>('POSTGRES_USER');
        const password = configService.get<string>('POSTGRES_PASSWORD');
        const database = configService.get<string>('POSTGRES_DB');
        const nodeEnv = configService.get<string>('NODE_ENV');

        console.log(
          `[AppModule] POSTGRES_HOST: ${host} (type: ${typeof host})`,
        );
        console.log(
          `[AppModule] POSTGRES_PORT: ${portStr} (type: ${typeof portStr})`,
        );
        console.log(
          `[AppModule] POSTGRES_USER: ${username} (type: ${typeof username})`,
        );
        console.log(`[AppModule] POSTGRES_PASSWORD_PRESENT: ${!!password}`);
        console.log(
          `[AppModule] POSTGRES_DB: ${database} (type: ${typeof database})`,
        );
        console.log(
          `[AppModule] NODE_ENV: ${nodeEnv} (type: ${typeof nodeEnv})`,
        );

        if (!host || !portStr || !username || !password || !database) {
          console.error(
            '[AppModule] CRITICAL: One or more database connection parameters are missing from .env!',
          );
          // Możesz rzucić błąd tutaj, aby zatrzymać aplikację, jeśli parametry są krytyczne
          // throw new Error('Missing database configuration parameters');
        }

        return {
          type: 'postgres',
          host: host,
          port: parseInt(portStr || '5432', 10),
          username: username,
          password: password,
          database: database,
          // entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          entities: [
            UserEntity,
            ArtistEntity,
            AlbumEntity,
            TrackEntity,
            FavoritesEntity,
          ], // Użyj bezpośrednio zaimportowanych encji
          synchronize: nodeEnv !== 'production', // Lepsze: true tylko w dev
          logging: nodeEnv === 'development',
        };
      },
    }),
    UsersModule,
    AuthModule,
    ArtistsModule,
    AlbumsModule,
    TracksModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
