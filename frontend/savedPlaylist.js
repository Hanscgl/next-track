const saveButton = document.getElementById("saved-button")
saveButton.addEventListener("click", function () {
    console.log("Button clicked!");
    hentPlaylists();
});
//console.log("Sara test");
async function hentPlaylists() {
    console.log("hello");
    const response = await fetch('/api/savedPlaylist/') ;  
    const savedPlaylists = await response.json() ;
    console.log(savedPlaylists);

   const newPlaylist = document.getElementById("new-playlist");
        newPlaylist.innerHTML = "";
    for (const playlist of savedPlaylists) {
    console.log(playlist.name);
    const button = document.createElement("button");
    button.textContent = playlist.name;
    button.addEventListener("click", function () {
    console.log(playlist.name);
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