import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitEntities1691400000000 implements MigrationInterface {
  name = 'InitEntities1691400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // We reuse the SQL from db/init.sql to initialize schema and seed data.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.artists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    grammy boolean NOT NULL,
    CONSTRAINT "PK_artists" PRIMARY KEY (id)
);
`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.albums (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    year integer NOT NULL,
    "artistId" uuid,
    CONSTRAINT "PK_albums" PRIMARY KEY (id)
);
`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.tracks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    duration integer NOT NULL,
    "artistId" uuid,
    "albumId" uuid,
    CONSTRAINT "PK_tracks" PRIMARY KEY (id)
);
`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    login character varying NOT NULL,
    password character varying NOT NULL,
    version integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "PK_users" PRIMARY KEY (id)
);
`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.favorites (
    id character varying DEFAULT 'global-favorites'::character varying NOT NULL,
    CONSTRAINT "PK_favorites" PRIMARY KEY (id)
);
`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.favorites_artists (
    "favoritesId" character varying NOT NULL,
    "artistsId" uuid NOT NULL,
    CONSTRAINT "PK_favorites_artists" PRIMARY KEY ("favoritesId","artistsId")
);
`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.favorites_albums (
    "favoritesId" character varying NOT NULL,
    "albumsId" uuid NOT NULL,
    CONSTRAINT "PK_favorites_albums" PRIMARY KEY ("favoritesId","albumsId")
);
`);

    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS public.favorites_tracks (
    "favoritesId" character varying NOT NULL,
    "tracksId" uuid NOT NULL,
    CONSTRAINT "PK_favorites_tracks" PRIMARY KEY ("favoritesId","tracksId")
);
`);

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.tracks ADD CONSTRAINT IF NOT EXISTS "FK_tracks_album" FOREIGN KEY ("albumId") REFERENCES public.albums(id) ON DELETE SET NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.tracks ADD CONSTRAINT IF NOT EXISTS "FK_tracks_artist" FOREIGN KEY ("artistId") REFERENCES public.artists(id) ON DELETE SET NULL;`,
    );

    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.favorites_albums ADD CONSTRAINT IF NOT EXISTS "FK_fav_albums_fav" FOREIGN KEY ("favoritesId") REFERENCES public.favorites(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.favorites_artists ADD CONSTRAINT IF NOT EXISTS "FK_fav_artists_art" FOREIGN KEY ("artistsId") REFERENCES public.artists(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.favorites_tracks ADD CONSTRAINT IF NOT EXISTS "FK_fav_tracks_fav" FOREIGN KEY ("favoritesId") REFERENCES public.favorites(id) ON UPDATE CASCADE ON DELETE CASCADE;`,
    );

    // Insert minimal seed: ensure global favorites row exists
    await queryRunner.query(`INSERT INTO public.favorites (id) VALUES ('global-favorites') ON CONFLICT DO NOTHING;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS public.favorites_tracks;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.favorites_albums;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.favorites_artists;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.favorites;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.tracks;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.albums;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.artists;`);
    await queryRunner.query(`DROP TABLE IF EXISTS public.users;`);
  }
}

export default InitEntities1691400000000;
