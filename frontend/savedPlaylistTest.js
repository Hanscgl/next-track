/*
const playlistsBox = document.querySelector("#user-playlists");
const savedButton = document.querySelector("#saved-button");
const newButton = document.querySelector("#new-button");

async function loadUserPlaylists(userId) {
  const response = await fetch(`/api/users/${userId}/playlists/`);
  return await response.json();
}

function renderPlaylists(playlists) {
  playlistsBox.innerHTML = "";

  if (!activeUser) {
    playlistsBox.textContent = "Vælg først en bruger.";
    return;
  }

  if (playlists.length === 0) {
    playlistsBox.textContent = "Ingen playlister fundet.";
    return;
  }

  playlists.forEach((playlist) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = playlist.name;

    btn.addEventListener("click", () => {
      console.log("Valgt playliste:", playlist);
    });

    playlistsBox.appendChild(btn);
  });
}

savedButton.addEventListener("click", async () => {
  playlistsBox.style.display = "block";

  if (!activeUser) {
    playlistsBox.textContent = "Vælg først en bruger.";
    return;
  }

  const playlists = await loadUserPlaylists(activeUser.user_id);
  renderPlaylists(playlists);
});

newButton.addEventListener("click", () => {
  playlistsBox.style.display = "none";
});
*/