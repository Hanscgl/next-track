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