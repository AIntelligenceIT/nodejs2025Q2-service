--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: albums; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.albums (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    year integer NOT NULL,
    "artistId" uuid
);


ALTER TABLE public.albums OWNER TO twoj_uzytkownik;

--
-- Name: artists; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.artists (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    grammy boolean NOT NULL
);


ALTER TABLE public.artists OWNER TO twoj_uzytkownik;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.favorites (
    id character varying DEFAULT 'global-favorites'::character varying NOT NULL
);


ALTER TABLE public.favorites OWNER TO twoj_uzytkownik;

--
-- Name: favorites_albums; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.favorites_albums (
    "favoritesId" character varying NOT NULL,
    "albumsId" uuid NOT NULL
);


ALTER TABLE public.favorites_albums OWNER TO twoj_uzytkownik;

--
-- Name: favorites_artists; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.favorites_artists (
    "favoritesId" character varying NOT NULL,
    "artistsId" uuid NOT NULL
);


ALTER TABLE public.favorites_artists OWNER TO twoj_uzytkownik;

--
-- Name: favorites_tracks; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.favorites_tracks (
    "favoritesId" character varying NOT NULL,
    "tracksId" uuid NOT NULL
);


ALTER TABLE public.favorites_tracks OWNER TO twoj_uzytkownik;

--
-- Name: tracks; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.tracks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    duration integer NOT NULL,
    "artistId" uuid,
    "albumId" uuid
);


ALTER TABLE public.tracks OWNER TO twoj_uzytkownik;

--
-- Name: users; Type: TABLE; Schema: public; Owner: twoj_uzytkownik
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    login character varying NOT NULL,
    password character varying NOT NULL,
    version integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO twoj_uzytkownik;

--
-- Data for Name: albums; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.albums (id, name, year, "artistId") FROM stdin;
451a5829-35da-49e8-b8ee-3736c1a341b0	TEST_ALBUM	2022	\N
874d2cb1-a99f-4c25-856d-29f17481db91	TEST_album	2023	\N
1377c961-9352-49db-afc2-b3281610600c	TEST_ALBUM	2022	68d7a28d-81de-4a9e-ae01-c104d36442d7
9c3ffc4b-c038-4640-81d4-9a231d575e60	TEST_ALBUM	2022	\N
eaaa349b-6df7-4ff6-8c55-a386eb3ecbff	TEST_ALBUM	2022	aafe8e4c-a3bc-4771-bdaf-022861ed98a0
9f4498dd-1d8e-4431-9f96-1aae6ea8fa73	TEST_ALBUM	2022	\N
4a6f7b70-5ad5-46f5-8b95-9adc2981a3a0	TEST_ALBUM	2022	\N
15c9e643-864e-478e-965f-2a2b4783bc0a	TEST_album	2023	\N
\.


--
-- Data for Name: artists; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.artists (id, name, grammy) FROM stdin;
f4f3fee2-372b-4de8-8f55-8406c97b42c6	TEST_artist	t
3cba9e66-9fdd-4a3f-843c-eaaec1771f1b	TEST_artist	t
68d7a28d-81de-4a9e-ae01-c104d36442d7	TEST_artist	t
bed656d8-d41e-41a7-9897-4d20de23861c	TEST_artist	t
aafe8e4c-a3bc-4771-bdaf-022861ed98a0	TEST_artist	t
29a43f57-497a-43eb-9a38-f244de93746b	TEST_artist	t
60e7fced-f02d-4693-ad38-9b93217c217f	TEST_artist	t
a6d11c9b-3933-4a3a-be90-771a428e595d	TEST_artist	t
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.favorites (id) FROM stdin;
global-favorites
\.


--
-- Data for Name: favorites_albums; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.favorites_albums ("favoritesId", "albumsId") FROM stdin;
global-favorites	1377c961-9352-49db-afc2-b3281610600c
global-favorites	9c3ffc4b-c038-4640-81d4-9a231d575e60
global-favorites	eaaa349b-6df7-4ff6-8c55-a386eb3ecbff
global-favorites	9f4498dd-1d8e-4431-9f96-1aae6ea8fa73
\.


--
-- Data for Name: favorites_artists; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.favorites_artists ("favoritesId", "artistsId") FROM stdin;
global-favorites	68d7a28d-81de-4a9e-ae01-c104d36442d7
global-favorites	bed656d8-d41e-41a7-9897-4d20de23861c
global-favorites	aafe8e4c-a3bc-4771-bdaf-022861ed98a0
global-favorites	29a43f57-497a-43eb-9a38-f244de93746b
\.


--
-- Data for Name: favorites_tracks; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.favorites_tracks ("favoritesId", "tracksId") FROM stdin;
global-favorites	a97c44f9-3074-4c34-8056-8c5aa68b20f0
global-favorites	6efe835f-ebb8-4767-b9e8-3d7787fa5623
global-favorites	ec7f505e-36ae-4596-865e-8d7a6bc97933
global-favorites	eb32658c-40e1-48d9-bab3-0490c2822875
\.


--
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.tracks (id, name, duration, "artistId", "albumId") FROM stdin;
696b4137-1fd8-41b1-81ca-2ca0376e9d81	TEST_TRACK	199	\N	\N
3a94db06-ae96-43c2-887d-f9bd4b86fdc1	TEST_track	200	\N	\N
a97c44f9-3074-4c34-8056-8c5aa68b20f0	Test track	335	68d7a28d-81de-4a9e-ae01-c104d36442d7	1377c961-9352-49db-afc2-b3281610600c
6efe835f-ebb8-4767-b9e8-3d7787fa5623	Test track	335	\N	\N
0f27791d-cdb1-40af-a23c-74e4beb0d9cc	TEST_TRACK	199	\N	\N
ec7f505e-36ae-4596-865e-8d7a6bc97933	Test track	335	aafe8e4c-a3bc-4771-bdaf-022861ed98a0	eaaa349b-6df7-4ff6-8c55-a386eb3ecbff
eb32658c-40e1-48d9-bab3-0490c2822875	Test track	335	\N	\N
2047c54b-326f-419b-afbb-9ba476dc0faa	TEST_TRACK	199	\N	\N
98b8ccc4-cb4a-44e3-8c17-0c41a0fde4f5	TEST_TRACK	199	\N	\N
1603b831-84e6-47a2-8a10-2b0624455e3e	TEST_track	200	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: twoj_uzytkownik
--

COPY public.users (id, login, password, version, "createdAt", "updatedAt") FROM stdin;
cc6217cb-ae6b-4ac1-bb34-a560062fe060	jankowalski	$2b$10$uzmNFgwrDqVFUu4IJPNxB.9uHJv5KxsqQQ0g/yWK9cA/uxHEmuy7W	1	2025-06-09 19:18:17.111841+02	2025-06-09 19:18:17.111841+02
\.


--
-- Name: artists PK_09b823d4607d2675dc4ffa82261; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.artists
    ADD CONSTRAINT "PK_09b823d4607d2675dc4ffa82261" PRIMARY KEY (id);


--
-- Name: tracks PK_242a37ffc7870380f0e611986e8; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT "PK_242a37ffc7870380f0e611986e8" PRIMARY KEY (id);


--
-- Name: favorites_artists PK_25b7d2bbf5745d06ce4ec4bc12d; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_artists
    ADD CONSTRAINT "PK_25b7d2bbf5745d06ce4ec4bc12d" PRIMARY KEY ("favoritesId", "artistsId");


--
-- Name: favorites_albums PK_485f265072e2f35c21a14c4a874; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_albums
    ADD CONSTRAINT "PK_485f265072e2f35c21a14c4a874" PRIMARY KEY ("favoritesId", "albumsId");


--
-- Name: albums PK_838ebae24d2e12082670ffc95d7; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT "PK_838ebae24d2e12082670ffc95d7" PRIMARY KEY (id);


--
-- Name: favorites PK_890818d27523748dd36a4d1bdc8; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: favorites_tracks PK_b93682e2c5de38d0d36b916fa11; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_tracks
    ADD CONSTRAINT "PK_b93682e2c5de38d0d36b916fa11" PRIMARY KEY ("favoritesId", "tracksId");


--
-- Name: users UQ_2d443082eccd5198f95f2a36e2c; Type: CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE (login);


--
-- Name: IDX_742c8c8695facaa53dac91dcb0; Type: INDEX; Schema: public; Owner: twoj_uzytkownik
--

CREATE INDEX "IDX_742c8c8695facaa53dac91dcb0" ON public.favorites_albums USING btree ("favoritesId");


--
-- Name: IDX_b1258cf7560cd97b330cf7e923; Type: INDEX; Schema: public; Owner: twoj_uzytkownik
--

CREATE INDEX "IDX_b1258cf7560cd97b330cf7e923" ON public.favorites_artists USING btree ("artistsId");


--
-- Name: IDX_b8670610383af0d4c3614607ad; Type: INDEX; Schema: public; Owner: twoj_uzytkownik
--

CREATE INDEX "IDX_b8670610383af0d4c3614607ad" ON public.favorites_tracks USING btree ("favoritesId");


--
-- Name: IDX_c6f49f60cf32753d164b1d6f3b; Type: INDEX; Schema: public; Owner: twoj_uzytkownik
--

CREATE INDEX "IDX_c6f49f60cf32753d164b1d6f3b" ON public.favorites_tracks USING btree ("tracksId");


--
-- Name: IDX_efc778ae742551c6b1efd43deb; Type: INDEX; Schema: public; Owner: twoj_uzytkownik
--

CREATE INDEX "IDX_efc778ae742551c6b1efd43deb" ON public.favorites_albums USING btree ("albumsId");


--
-- Name: IDX_f63a65b7c5ccd375222059b99d; Type: INDEX; Schema: public; Owner: twoj_uzytkownik
--

CREATE INDEX "IDX_f63a65b7c5ccd375222059b99d" ON public.favorites_artists USING btree ("favoritesId");


--
-- Name: tracks FK_5c52e761792791f57de2fec342d; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT "FK_5c52e761792791f57de2fec342d" FOREIGN KEY ("albumId") REFERENCES public.albums(id) ON DELETE SET NULL;


--
-- Name: tracks FK_62f595181306916265849fced48; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT "FK_62f595181306916265849fced48" FOREIGN KEY ("artistId") REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: favorites_albums FK_742c8c8695facaa53dac91dcb07; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_albums
    ADD CONSTRAINT "FK_742c8c8695facaa53dac91dcb07" FOREIGN KEY ("favoritesId") REFERENCES public.favorites(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites_artists FK_b1258cf7560cd97b330cf7e9231; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_artists
    ADD CONSTRAINT "FK_b1258cf7560cd97b330cf7e9231" FOREIGN KEY ("artistsId") REFERENCES public.artists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites_tracks FK_b8670610383af0d4c3614607adf; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_tracks
    ADD CONSTRAINT "FK_b8670610383af0d4c3614607adf" FOREIGN KEY ("favoritesId") REFERENCES public.favorites(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites_tracks FK_c6f49f60cf32753d164b1d6f3b4; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_tracks
    ADD CONSTRAINT "FK_c6f49f60cf32753d164b1d6f3b4" FOREIGN KEY ("tracksId") REFERENCES public.tracks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: albums FK_ed378d7c337efd4d5c8396a77a1; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.albums
    ADD CONSTRAINT "FK_ed378d7c337efd4d5c8396a77a1" FOREIGN KEY ("artistId") REFERENCES public.artists(id) ON DELETE SET NULL;


--
-- Name: favorites_albums FK_efc778ae742551c6b1efd43debb; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_albums
    ADD CONSTRAINT "FK_efc778ae742551c6b1efd43debb" FOREIGN KEY ("albumsId") REFERENCES public.albums(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites_artists FK_f63a65b7c5ccd375222059b99d4; Type: FK CONSTRAINT; Schema: public; Owner: twoj_uzytkownik
--

ALTER TABLE ONLY public.favorites_artists
    ADD CONSTRAINT "FK_f63a65b7c5ccd375222059b99d4" FOREIGN KEY ("favoritesId") REFERENCES public.favorites(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1() TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1mc() TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v3(namespace uuid, name text) TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v5(namespace uuid, name text) TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_nil() TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_dns() TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_oid() TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_url() TO twoj_uzytkownik;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_x500() TO twoj_uzytkownik;


--
-- PostgreSQL database dump complete
--

