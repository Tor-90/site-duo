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

function createStars(count = 100) {
  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.classList.add("star");
    star.style.top = Math.random() * window.innerHeight + "px";
    star.style.left = Math.random() * window.innerWidth + "px";
    star.style.width = star.style.height = Math.random() * 2 + 1 + "px";
    star.style.animationDuration = 1 + Math.random() * 3 + "s";
    document.body.appendChild(star);
  }
}

// Créer étoiles après que la page soit chargée
window.addEventListener("load", () => {
  createStars(120); // 120 étoiles
});

function createParticles(count = 80) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    // Position initiale aléatoire
    particle.style.top = Math.random() * window.innerHeight + "px";
    particle.style.left = Math.random() * window.innerWidth + "px";
    // Taille et vitesse aléatoire
    const size = 1 + Math.random() * 2;
    particle.style.width = particle.style.height = size + "px";
    particle.style.animationDuration = 5 + Math.random() * 5 + "s";
    particle.style.animationDelay = Math.random() * 5 + "s";
    document.body.appendChild(particle);
  }
}

window.addEventListener("load", () => {
  createStars(120);      // les étoiles
  createParticles(80);   // particules flottantes
});