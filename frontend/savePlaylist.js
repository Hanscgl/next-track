const savePlaylistBtn = document.getElementById("save-button")
savePlaylistBtn.addEventListener('click', savePlaylist)

async function savePlaylist() {
    if (!activeUser) {          // TJEKKER OM DER ER VALGT EN BRUGER FØR DER FORSØGES, AT GEMME PLAYLISTEN
        alert("Vælg først en bruger.");
        return;
    }
    const playlistName = "Test playlist"    // KUN TIL TEST (SKAL ÆNDRES)
    const trackIds = [1, 746, 21, 78, 91]   // KUN TIL TEST (SKAL ÆNDRES)

    const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, //fortæller Express, at indholdet er JSON så Express ved, at den skal pakke det ud i request.body
        body: JSON.stringify({  //oversætter objektet til en tekststreng, fordi HTTP kun kan sende rå tekst
            userId: activeUser.user_id,
            name: playlistName,
            trackIds: trackIds
        })
    });
    const result = await response.json();
    console.log("Ny playliste gemt med ID: ", result.playlistId)
}

