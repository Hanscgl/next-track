const saveButton = document.getElementById("saved-button")
saveButton.addEventListener("click", function () {
    console.log("Button clicked!");
    hentPlaylists();
});
//console.log("Sara test");
async function hentPlaylists() {
    console.log("hello");
    if (!activeUser) {
        alert("Vælg først en bruger");
        return;
    }

    const response = await fetch(`/api/users/${activeUser.user_id}/playlists/`);
    const savedPlaylists = await response.json() ;
    console.log(savedPlaylists);

    const newPlaylist = document.getElementById("new-playlist");
        newPlaylist.innerHTML = "";
    for (const playlist of savedPlaylists) {
        console.log(playlist.name);
        
        const button = document.createElement("button");
        button.textContent = playlist.name;
        button.addEventListener("click", async function () {
        
            const response = await fetch(`/api/playlist/${playlist.playlist_id}/tracks/`);
            const tracks = await response.json();
            console.log(tracks);
            const playlistView = document.getElementById("playlist-view");
            playlistView.innerHTML = "";

            if (tracks.length === 0) {
                playlistView.textContent = "Ingen numre i denne playliste.";
            }

            for (const track of tracks) {
                const p = document.createElement("p");
                p.textContent = track.title;
                playlistView.appendChild(p);
            }
        });

        newPlaylist.appendChild(button);
    }
};
    
    



/*
const savedButton = document.getElementById("saved-button");
const newPlaylist = document.getElementById("new-playlist");

savedButton.addEventListener("click", function(){
    newPlaylist.innerHTML = "";
})*/