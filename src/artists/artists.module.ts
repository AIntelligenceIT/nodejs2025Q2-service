import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { TracksModule } from '../tracks/tracks.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [TracksModule, PrismaModule],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {} 