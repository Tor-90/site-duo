import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBS5ZVhHgbQI1YFsvQbciGIzRIvk8vPE88",
  authDomain: "site-duo-3f7bd.firebaseapp.com",
  databaseURL: "https://site-duo-3f7bd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "site-duo-3f7bd",
  storageBucket: "site-duo-3f7bd.firebasestorage.app",
  messagingSenderId: "598351431088",
  appId: "1:598351431088:web:5f9e22ebd0bc6a20028275"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const allowedUsers = ["Nicolas", "Luxi"];

window.login = async function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("login-message");

  if (!allowedUsers.includes(username)) {
    message.textContent = "Pseudo invalide.";
    return;
  }
  if (!password) {
    message.textContent = "Entre un mot de passe.";
    return;
  }

  const userRef = ref(db, "users/" + username);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await set(userRef, { password: password });
    enterApp(username);
  } else {
    if (snapshot.val().password === password) {
      enterApp(username);
    } else {
      message.textContent = "Mot de passe incorrect.";
    }
  }
};

function enterApp(username) {
  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");

  document.getElementById("welcome-text").textContent =
    username === "Nicolas"
      ? "Bienvenue Nicolas 💙"
      : "Bienvenue Luxi 💜";

  document.body.className =
    username === "Nicolas" ? "nicolas" : "luxi";
}

window.logout = function () {
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("app-container").classList.add("hidden");
  document.body.className = "";
  document.getElementById("password").value = "";
};

window.openApp = function(page) {
  window.location.href = page;
};