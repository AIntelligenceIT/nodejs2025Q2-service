// favorites.interface.ts
// import { Artist, Album, Track } from '@prisma/client'; // Usunięte

// TODO: Zaimportuj te interfejsy z odpowiednich modułów (np. ../artists/interfaces/artist.interface)
// lub zdefiniuj je tutaj, jeśli nie są dostępne globalnie.
// Poniżej przykładowe definicje, dostosuj je do swoich potrzeb.

export interface Artist {
  id: string;
  name: string;
  grammy: boolean;
  // inne pola, jeśli istnieją
}

export interface Album {
  id: string;
  name: string;
  year: number;
  artistId: string | null;
  // inne pola, jeśli istnieją
}

export interface Track {
  id: string;
  name: string;
  // inne pola, jeśli istnieją (np. artistId, albumId, duration)
}

export interface FavoritesResponse {
  artists: Artist[];
  albums: Album[];
  tracks: Track[];
}
