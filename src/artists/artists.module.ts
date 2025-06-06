import { Module, forwardRef } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { AlbumsModule } from '../albums/albums.module'; // Zakładając, że ścieżka jest poprawna
import { TracksModule } from '../tracks/tracks.module'; // Zakładając, że ścieżka jest poprawna
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [forwardRef(() => AlbumsModule), TracksModule, PrismaModule],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {} 