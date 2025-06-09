import { Module, forwardRef } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AlbumsController } from './albums.controller';
import { ArtistsModule } from '../artists/artists.module'; // Zakładając, że ścieżka jest poprawna
import { TracksModule } from '../tracks/tracks.module'; // Import TracksModule
import { FavoritesModule } from '../favorites/favorites.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumEntity } from '../database/entities/album.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlbumEntity]),
    forwardRef(() => ArtistsModule),
    forwardRef(() => TracksModule),
    forwardRef(() => FavoritesModule),
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
