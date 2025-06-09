import { Module, forwardRef } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { AlbumsModule } from '../albums/albums.module'; // Zakładając, że ścieżka jest poprawna
import { TracksModule } from '../tracks/tracks.module'; // Zakładając, że ścieżka jest poprawna
import { FavoritesModule } from '../favorites/favorites.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistEntity } from '../database/entities/artist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArtistEntity]),
    forwardRef(() => AlbumsModule), // AlbumsModule może potrzebować ArtistsService
    forwardRef(() => TracksModule), // TracksModule może potrzebować ArtistsService
    forwardRef(() => FavoritesModule),
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
