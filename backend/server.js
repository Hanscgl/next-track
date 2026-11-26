import express from 'express';
import { pool } from '../db/connect.js';

const db = pool();

const port = 3002;
const server = express();

server.use(express.static('frontend'));

// Hvad gør nedenstående linje? LÆS https://www.geeksforgeeks.org/web-tech/express-js-express-json-function/
server.use(express.json())
server.use(onEachRequest);
server.get('/api/genres/', onGetGenres);
server.get('/api/savedPlaylist/', onGetPlaylists)
server.get('/api/users/', onGetUsers);
server.get('/api/users/:userId/playlists/', onGetUserPlaylists);
server.get('/api/playlist/:id/tracks/', onGetPlaylistTracks);
server.get('/api/users/', onGetUsers)
server.get('/api/users/:userId/playlists/', onGetUserPlaylist)

server.post('/api/playlists', onPostPlaylist)

// Virker nu !!! Ny playliste: 15 tilfældige sange ud fra genre og årti
server.get('/api/newPlaylist/:genre/:minValue/:maxValue', onGetNewPlaylist)

server.listen(port, onServerReady);

// HENTER GENRE FRA GENRES.CSV OG OPSTILLER DEM I ALFABETISK RÆKKEFØLGE
async function onGetGenres(request, response) {

    const dbResult = await db.query(`
        select   name, genre_id
        from     genres
        order by genre_id asc
        `);
    response.json(dbResult.rows);
}
async function onGetPlaylistTracks(request, response) {
    const playlistId = request.params.id;

    const dbResult = await db.query(`
        select track_id, title
        from playlist_track
        join tracks using (track_id)
        where playlist_id = $1
        order by position asc
    `, [playlistId]);

    response.json(dbResult.rows);
}
// HENTER GEMTE PLAYLISTER FRA PLAYLISTS.CSV OG OPSTILLER DEM I RÆKKEFØLGE EFTER ID(fra laveste til højeste)
async function onGetPlaylists(request, response){
    const dbResult = await db.query(`
        select  playlist_id, name, user_id, created
        from    playlists
        order by playlist_id asc

        `);
    response.json(dbResult.rows);
}


async function onGetUsers(request, response) {
  const dbResult = await db.query(`
    select      user_id, screen_name
    from        users
    order by    user_id asc
  `);
  response.json(dbResult.rows);
}

// HENTER USER PLAYLISTS FRA ??
async function onGetUserPlaylists(request, response){
    const userId = request.params.userId;
    
    const dbResult = await db.query(`
        select      playlist_id, name, user_id, created
        from        playlists
        where       user_id = $1
        order by    playlist_id asc
        `,
        [userId])
    response.json(dbResult.rows);
}

//lav en ny liste, som er en playliste lavet ud fra vores parametre
async function onGetNewPlaylist(request, response){
    
    const genreNavn = request.params.genre ;
    const minYear = parseInt(request.params.minValue) ;
    const maxYear = parseInt(request.params.maxValue) ;
    
    /*                  --- SQL for filtreringen af sange ---
    
     IDEEN: At der skal udvælges 15 sange ud fra parametrene (genre, start-årstal & slut-årstal)
            Ud fra ER-modellen kan vi se, hvilke tabeller vi skal have fat i, og hvordan de hænger sammen.
            Vi skal bruge tabellerne: tracks, albums, artists og genres

            HUSK hvilken rækkefølge vores SQL maskine læser denne query !
                Trin 1-6 herunder følger IKKE maskinens rækkefølge !
                -> "Maskinen læser: from/join → where → select → order by → limit"

        1. vi opstiller hvilke kolonner vi vil have vist, hvori year-kolonnen er kun årstallet, hvilket
            bliver hivet ud af release_date, da udgivelsesdatoen er yyyy-mm-dd
        2. vi starter ud fra tabellen tracks, som får et alias 't'
        3. vi sammenkæder de andre tabeller og giver dem hver et alias
        4. Der søges ud fra genre OG årstal... 
            Den givne genre placeres ved '$1'.
            Det givne start-år placeres ved '$2'
            Det givne slut-år placeres ved '$3'
               ! 'between' tager begge ender !
        5. sorteres random ()
        6. limit er på 15 rækker
    */

    const dbResult = await db.query(`
        select t.track_id, t.title, al.album_id, ar.stage_name, g.name,
        extract(year from al.release_date) as year

        from tracks t

        join albums al using (album_id)
        join artists ar using (artist_id)
        join genres g using (genre_id)

        where g.name = $1
        and extract(year from al.release_date) between $2 and $3
        order by random()
        limit 15;
        `, [genreNavn, minYear, maxYear]);

        response.json(dbResult.rows);

};


// START: AT GEMME EN PLAYLISTE

async function onPostPlaylist(request, response) {
    const userId = request.body.userId;
    const name = request.body.name;
    const trackIds = request.body.trackIds;

    // FINDER DET HØJESTE ID PÅ PLAYLISTERNE I playlists
    const lastPlaylistId = await db.query(`
        select max(playlist_id) as latest_playlist_id
        from playlists
    `);
    
    // GÅR IND I lastPlaylistId, KIGGER PÅ DEN FØRSTE RÆKKE [0], TAGER latest_playlist_id, LAVER DET OM TIL ET NUMBER OG TILFØJER 1 TIL DET
    const currentId = lastPlaylistId.rows[0].latest_playlist_id;
    const nextPlaylistId = Number(currentId) + 1; // "Number" fordi at latest_playlist_id ligger som en "string" i lastPlaylistId

    // NY RÆKKE I PLAYLISTS MED VÆRDIERNE:
    // $1 = den nye playlistes ID
    // now() = tidspunkt for oprettelsen af den nye playliste
    // $2 = ID'et for brugeren der har oprettet playlisten
    // $3 = navnet på den nye playliste
    await db.query(`
            insert into playlists (playlist_id, created, user_id, name)
            values ($1, now(), $2, $3)
    `,      [nextPlaylistId, userId, name]);

    // FOR HVERT TRACK TILDELES playlist_id, track_id, position OG SÆTTES IND I TABELLEN playlist_track
    for (let i = 0; i < trackIds.length; i++) {
        await db.query(`
            insert into playlist_track (playlist_id, track_id, position)
            values ($1, $2, $3)
        `,  [nextPlaylistId, trackIds[i], i + 1]);
    }
    response.json()
}
// SLUT: AT GEMME EN PLAYLISTE



// UDSKRIVER I KONSOLLEN, AT SERVEREN ER OPPE AT KØRE PÅ (PORT)
function onServerReady(){
    console.log('Webserver running on port', port);
}

function onEachRequest(request, response, next){
    console.log(new Date(), request.method, request.url);
    next();
}








/*server.use(express.static('frontend'));
server.use(onEachRequest);
server.get('/api/artist/:id', onGetArtistById);
server.get('/api/albumsByReleaseDate', onGetAlbumsByReleaseDate);
server.get('/api/artist/:artist/albums', onGetAlbumsForArtist);
server.get('/api/album/:album/tracks', onGetTracksForAlbum);
server.get('/api/artist/:artist/tracks', onGetTracksForArtist);
server.get('/api/artist/:artist/tracksWithGenre', onGetTracksWithGenreForArtist);
server.get('/api/playlist/:playlist/nationality/:nationality/mediaTypes', onGetMediaTypesForPlaylistAndNationality);
server.get('/api/user/:user/genre/:genre/nationalities', onGetNationalitiesForUserAndGenre);
server.get('/api/albumCountByArtist', onGetAlbumCountByArtist);
server.listen(port, onServerReady);


async function onGetAlbumCountByArtist(request, response) {
    const limit = request.query.limit;
    const dbResult = await db.query(`
        select   stage_name, count(*) as album_count
        from     artists
        join     albums using (artist_id)
        group by stage_name
        order by album_count desc
        limit    $1`, [limit]);
    response.json(dbResult.rows);
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}
    */