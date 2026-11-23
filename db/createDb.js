import { connect } from './connect.js';
import upload from 'pg-upload';

const db = await connect();
const timestamp = (await db.query('select now() as timestamp')).rows[0]['timestamp'];
console.log(`Recreating database on ${timestamp}...`);

console.log('Dropping existing tables...');
await db.query('drop table if exists artists');
await db.query('drop table if exists albums');

await db.query('drop table if exists genres');
await db.query('drop table if exists tracks');

//await db.query('drop table if exists category');
await db.query('drop table if exists users');
await db.query('drop table if exists playlists');
await db.query('drop table if exists playlist_tracks');
await db.query('drop table if exists queue');
await db.query('drop table if exists playlist_in_queue');

console.log('Creating tables...');

await db.query(`
    create table artists (
        artist_id   integer     primary key,
        stage_name  text        unique not null
    )
`);
await db.query(`
    create table albums (
        album_id         integer    primary key,
        artist_id        integer    references(artist_id),
        release_date     date       not null,
        title            text       not null       
    )
`);


await db.query(`
    create table genres (
        genre_id    integer         primary key,
        name        text            not null,
        description text            
    )
`);

await db.query(`
    create table tracks (
        track_id      integer       primary key,
        album_id      integer       references(album_id),
        genre_id      integer       references(genre_id),
        milliseconds  integer       not null,
        title         text          not null,
        bpm           numeric       not null
    )
`);

/*await db.query(`
    create table category (
        category_id         integer,
        category_name       text,
        bpm                 numeric,
        release_date        date,
        genre_id            integer,
        genreTwo_id         integer
    )
`);*/


await db.query(`
    create table users (
        user_id     bigint      primary key,
        signed_up   timestamp,
        active      boolean,
        screen_name text        not null,
        email       text
    )
`);

await db.query(`
    create table playlists (
        playlist_id bigint      primary key,
        user_id     bigint      references(user_id),
        created     timestamp   not null,
        name        text        not null
    )
`);
        /*category_id integer*/

await db.query(`
    create table playlist_track (
        playlist_id bigint      references(playlist_id),
        track_id    integer     references(track_id),
        position    integer,

        unique(playlist_id, track_id),
        unique(playlist_id, track_position) 
    )
`);

await db.query(`
    create table queue (
        queue_id            integer         primary key,
        current_position    integer         not null,
        name                text            not null,
        created_at          timestamp       not null         
    )
`);

await db.query(`
    create table playlist_in_queue (
        queue_id    integer                 references(queue_id),
        playlist_position integer           primary key,
        playlist_id integer                 references(playlist_id),
    )
`);

console.log('Importing csv-data into tables...')
await upload(db, 'db/artists.csv', `
    copy artists (artist_id, stage_name)
    from stdin
    with csv encoding 'UTF-8'
`);
await upload(db, 'db/albums.csv', `
    copy albums (album_id, title, artist_id, release_date)
    from stdin
    with csv header encoding 'UTF-8'
`);
await upload(db, 'db/media_types.csv', `
    copy media_types (media_type_id, name, description, sample_rate, bit_depth, lossless)
    from stdin
    with csv header encoding 'UTF-8'
`);
await upload(db, 'db/tracks.csv', `
    copy tracks (track_id, title, album_id, media_type_id, genre_id, milliseconds, bytes, unit_price)
    from stdin
    with csv header encoding 'win1252'
`);
await upload(db, 'db/genres.csv', `
    copy genres (name, genre_id, description)
    from stdin
    with csv encoding 'UTF-8'
`);
await upload(db, 'db/users.csv', `
    copy users (user_id, screen_name, email, active, signed_up)
    from stdin
    with csv encoding 'UTF-8'
`);
await upload(db, 'db/playlists.csv', `
    copy playlists (playlist_id, created, user_id, name)
    from stdin
    with csv header encoding 'UTF-8'
`);
await upload(db, 'db/playlist_track.csv', `
    copy playlist_track (playlist_id, track_id)
    from stdin
    with csv header encoding 'UTF-8'
`);
await db.end();
console.log('Database successfully recreated.');