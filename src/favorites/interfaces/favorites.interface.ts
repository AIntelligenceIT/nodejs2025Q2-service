// favorites.interface.ts
import { Artist, Album, Track } from '@prisma/client';

export interface FavoritesResponse {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
}
