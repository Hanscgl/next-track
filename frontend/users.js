let activeUser = null;

const userButtonsBox = document.querySelector("#user-buttons");

async function loadUsers() {
  const response = await fetch("/api/users/");
  const users = await response.json();

  userButtonsBox.innerHTML = "";

  users.forEach((user) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = user.screen_name;
    btn.className = "user-btn";

    btn.addEventListener("click", () => selectUser(user, btn));
    userButtonsBox.appendChild(btn);
  });
}

function selectUser(user, clickedBtn) {
  activeUser = user;

  document.querySelectorAll(".user-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  clickedBtn.classList.add("active");

  console.log("Aktiv bruger:", activeUser);
}

loadUsers();