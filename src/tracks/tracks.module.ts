import { Module, forwardRef } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { FavoritesModule } from '../favorites/favorites.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackEntity } from '../database/entities/track.entity';
import { ArtistsModule } from '../artists/artists.module'; // Potrzebne do weryfikacji artistId
import { AlbumsModule } from '../albums/albums.module';   // Potrzebne do weryfikacji albumId

@Module({
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
  imports: [TypeOrmModule.forFeature([TrackEntity]), forwardRef(() => FavoritesModule), forwardRef(() => ArtistsModule), forwardRef(() => AlbumsModule)],
})
export class TracksModule {}
