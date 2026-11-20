import { connect } from './connect.js';
import upload from 'pg-upload';

const db = await connect();
const timestamp = (await db.query('select now() as timestamp')).rows[0]['timestamp'];
console.log(`Recreating database on ${timestamp}...`);

/* Her sletter vi eksisterende tabeller. Derfor er det vigtigt at slette "børnene" først! 
Derfor bør der tages hensyn til hvilket niveau hver tabel ligger i. 
Altså tabellerne (ablums, genres_in_category og playlists) er børn til forældrene i 
niveau 1 (tabeller: artists, genres, category, users)
*/

console.log('Dropping existing tables...');
await db.query('drop table if exists playlist_in_queue'); // niveau 5

await db.query('drop table if exists playlist_track'); // niveau 4
await db.query('drop table if exists queue'); // niveau 4

await db.query('drop table if exists tracks'); // niveau 3

await db.query('drop table if exists albums'); // niveau 2
await db.query('drop table if exists playlists'); // niveau 2
await db.query('drop table if exists genres_in_category'); // niveau 2

await db.query('drop table if exists artists'); // niveau 1
await db.query('drop table if exists genres'); // niveau 1
await db.query('drop table if exists category'); // niveau 1
await db.query('drop table if exists users'); // niveau 1

console.log('Creating tables...');

/*  Her opretter vi tabellerne FORLÆNS: niveau 1 -> 5 (forældrene før børnene).
    En tabel kan nemlig først pege på (references) en anden tabel, når den anden tabel findes.

Reglerne (constraints) er de fire begreber fra Modul 13 – datakvalitet:
- primary key / unique  = entydighed     (ingen dubletter)
- not null              = fuldstændighed (værdien må ikke mangle)
- references            = konsistens     (id'et skal findes i den anden tabel)
- check (...)           = gyldighed      (værdien skal give mening)
*/

// ---------- Niveau 1: peger ikke på nogen andre tabeller ----------

await db.query(`
    create table artists (
        artist_id   integer     primary key,
        stage_name  text        not null unique
    )
`);

await db.query(`
    create table genres (
        genre_id    integer     primary key,
        name        text        not null,
        description text
    )
`);

/*  Et tomt felt i category.csv bliver til NULL = "ingen grænse". 
    Derfor er der ikke not null på min/max.
*/

 await db.query(`
    create table category (
        category_id       integer   primary key,
        category_name     text      not null,
        bpm_min           numeric,
        bpm_max           numeric,
        release_date_min  date,
        release_date_max  date,

        check (bpm_min <= bpm_max),
        check (release_date_min <= release_date_max)
    )
`);

await db.query(`
    create table users (
        user_id     bigint      primary key,
        signed_up   timestamp,
        active      boolean,
        screen_name text        not null,
        email       text
    )
`);

// ---------- Niveau 2: peger på tabeller i niveau 1 ----------

await db.query(`
    create table albums (
        album_id         integer    primary key,
        artist_id        integer    not null    references artists (artist_id),
        release_date     date       not null,
        title            text       not null
    )
`);

// category_id må gerne være NULL, fordi playlists.csv ikke har nogen kategori.
await db.query(`
    create table playlists (
        playlist_id     bigint      primary key,
        user_id         bigint      not null references users (user_id),
        created         timestamp   not null,
        name            text        not null,
        category_id     integer     references category (category_id)
    )
`);

// Koblingstabel: hvilke genrer hører til hvilken kategori.
// Primærnøglen er KOMBINATIONEN (category_id, genre_id): samme genre kan ikke stå to gange i samme kategori.
await db.query(`
    create table genres_in_category (
        category_id     integer     references category (category_id),
        genre_id        integer     references genres (genre_id),

        primary key (category_id, genre_id)
    )
`);

// ---------- Niveau 3: peger på albums (niveau 2) og genres ----------

await db.query(`
    create table tracks (
        track_id      integer   primary key,
        album_id      integer   not null    references albums (album_id),
        genre_id      integer   not null    references genres (genre_id),
        milliseconds  integer   not null,
        title         text      not null,
        bpm           numeric   not null
    )
`);

// ---------- Niveau 4 ----------

// Ingen primærnøgle (gruppens valg): den samme sang må gerne stå flere gange i en playliste.
await db.query(`
    create table playlist_track (
        playlist_id         bigint      not null    references playlists (playlist_id),
        track_id            integer     not null    references tracks (track_id),
        track_position      integer
    )
`);

// Som i ER-diagrammet. Stadig åbent i gruppen: skal køen have et user_id (én kø per bruger)?
await db.query(`
    create table queue (
        queue_id          integer   primary key,
        name              text      not null,
        current_position  integer   not null,
        created_at        timestamp not null
    )
`);

// ---------- Niveau 5: peger på queue (niveau 4) og playlists ----------

// Koblingstabel: hvilke playlister ligger i køen, og i hvilken rækkefølge.
// Primærnøglen (queue_id, playlist_position): der kan kun være én playliste på hver plads i en kø.
await db.query(`
    create table playlist_in_queue (
        queue_id           integer  references queue (queue_id),
        playlist_position  integer,
        playlist_id        bigint   not null    references playlists (playlist_id),

        primary key (queue_id, playlist_position)
    )
`);

console.log('Importing csv-data into tables...')

/* Data importeres i SAMME rækkefølge som create (niveau 1 -> 5).
Ellers peger f.eks. albums på artister, der ikke er importeret endnu, og så afviser references rækkerne.
Husk: copy-listen følger CSV-filens rækkefølge, ikke tabellens. */

// ---------- Niveau 1 ----------
await upload(db, 'db/artists.csv', `
    copy artists (artist_id, stage_name)
    from stdin
    with csv encoding 'UTF-8'
`);
await upload(db, 'db/genres.csv', `
    copy genres (name, genre_id, description)
    from stdin
    with csv encoding 'UTF-8'
`);
await upload(db, 'db/category.csv', `
    copy category (category_id, category_name, bpm_min, bpm_max, release_date_min, release_date_max)
    from stdin
    with csv header encoding 'UTF-8'
`);
await upload(db, 'db/users.csv', `
    copy users (user_id, screen_name, email, active, signed_up)
    from stdin
    with csv encoding 'UTF-8'
`);

// ---------- Niveau 2 ----------
await upload(db, 'db/albums.csv', `
    copy albums (album_id, title, artist_id, release_date)
    from stdin
    with csv header encoding 'UTF-8'
`);
await upload(db, 'db/playlists.csv', `
    copy playlists (playlist_id, created, user_id, name)
    from stdin
    with csv header encoding 'UTF-8'
`);
await upload(db, 'db/genres_in_category.csv', `
    copy genres_in_category (category_id, genre_id)
    from stdin
    with csv header encoding 'UTF-8'
`);

// ---------- Niveau 3 ----------
await upload(db, 'db/tracks.csv', `
    copy tracks (track_id, title, album_id, genre_id, milliseconds, bpm)
    from stdin
    with csv header encoding 'UTF-8'
`);

// ---------- Niveau 4 ----------
await upload(db, 'db/playlist_track.csv', `
    copy playlist_track (playlist_id, track_id)
    from stdin
    with csv header encoding 'UTF-8'
`);

// queue og playlist_in_queue har ingen CSV-fil. De bliver fyldt, når appen kører.

await db.end();
console.log('Database successfully recreated.');