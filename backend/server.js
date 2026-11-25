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

server.get('/api/users/', onGetUsers)
server.get('/api/users/:userId/playlists/', onGetUserPlaylists)

server.post('/api/playlists', onPostPlaylist)



// !!! den her fejler - skal undersøges nærmere !!!
// server.get('/api/newPlaylist/?genre=id/&min=minValue/&max=maxValue', onGetNewPlaylist)

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
        `, [genreNavn],[minYear],[maxYear]); // !!! $'erne fejler muligvis !!!

        response.json(dbResult);

};


// START: AT GEMME EN PLAYLISTE

async function onPostPlaylist(request, response) {
    const userId = request.body.userId;
    const name = request.body.name;
    const trackIds = request.body.trackIds;

    // FINDER DET HØJESTE ID PÅ PLAYLISTERNE I playlists
    const lastPlaylistId = await db.query(`
        select max(playlist_id) as latestPlaylistId
        from playlists
    `);
    
    // GÅR IND I lastPlaylistId, KIGGER PÅ DEN FØRSTE RÆKKE [0], TAGER latestPlaylistId, LAVER DET OM TIL ET NUMBER OG TILFØJER 1 TIL DET
    const currentId = lastPlaylistId.rows[0].latestPlaylistId;
    const nextPlaylistId = Number(currentId) + 1; // "Number" fordi at latestPlaylistId ligger som en string i lastPlaylistId

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
    for (let i = 0; i < trackIds.length; i++); {
        await db.query(`
            insert into playlist_track (playlist_id, track_id, position)
            values $1, $2, $3
        `,  [nextPlaylistId, trackIds[i], i + 1]);
    }
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