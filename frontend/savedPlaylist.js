const saveButton = document.getElementById("saved-button")
saveButton.addEventListener('click', hentPlaylists) 

    async function hentPlaylists() {
        console.log("hello");
        const response = await fetch('/api/savedPlaylist/') ;  
        const savedPlaylists = await response.json() ;
        console.log(savedPlaylists);
        
        const newPlaylist = document.getElementById("new-playlist");
            newPlaylist.innerHTML = "";
    };
    



/*
const savedButton = document.getElementById("saved-button");
const newPlaylist = document.getElementById("new-playlist");

savedButton.addEventListener("click", function(){
    newPlaylist.innerHTML = "";
})*/