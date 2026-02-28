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

/* ===== Login / Firebase ===== */
window.login = async function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("login-message");

  if (!allowedUsers.includes(username)) { message.textContent = "Pseudo invalide."; return; }
  if (!password) { message.textContent = "Entre un mot de passe."; return; }

  const userRef = ref(db, "users/" + username);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await set(userRef, { password: password });
    enterApp(username);
  } else {
    if (snapshot.val().password === password) enterApp(username);
    else message.textContent = "Mot de passe incorrect.";
  }
};

/* ===== Entrée dans l'app ===== */
function enterApp(username) {
  document.getElementById("login-container").classList.add("hidden");
  document.getElementById("app-container").classList.remove("hidden");

  const banner = document.getElementById("banner-top");
  banner.style.display = "flex";
  setTimeout(()=> banner.classList.add("show"), 100); // animation fade-in du haut

  document.getElementById("welcome-text").textContent =
    username === "Nicolas"
      ? "Bienvenue Nicolas 💙"
      : "Bienvenue Luxi 💜";

  document.body.className =
    username === "Nicolas" ? "nicolas" : "luxi";
}

/* ===== Logout ===== */
window.logout = function () {
  document.getElementById("login-container").classList.remove("hidden");
  document.getElementById("app-container").classList.add("hidden");

  const banner = document.getElementById("banner-top");
  banner.classList.remove("show");
  setTimeout(()=> banner.style.display="none", 600);

  document.body.className = "";
  document.getElementById("password").value = "";
};

/* ===== Ouvrir mini-app ===== */
window.openApp = function(page) { window.location.href = page; };

/* ===== Création étoiles ===== */
function createStars(count = 120) {
  for(let i=0;i<count;i++){
    const star=document.createElement("div");
    star.classList.add("star");
    star.style.top=Math.random()*window.innerHeight+"px";
    star.style.left=Math.random()*window.innerWidth+"px";
    star.style.width=star.style.height=(1+Math.random()*2)+"px";
    star.style.animationDuration=(1+Math.random()*3)+"s";
    document.body.appendChild(star);
  }
}

/* ===== Création particules ===== */
function createParticles(count = 80) {
  for(let i=0;i<count;i++){
    const p=document.createElement("div");
    p.classList.add("particle");
    p.style.top=Math.random()*window.innerHeight+"px";
    p.style.left=Math.random()*window.innerWidth+"px";
    const size=1+Math.random()*2;
    p.style.width=p.style.height=size+"px";
    p.style.animationDuration=(5+Math.random()*5)+"s";
    p.style.animationDelay=Math.random()*5+"s";
    document.body.appendChild(p);
  }
}

/* ===== Lancer étoiles + particules ===== */
window.addEventListener("load", ()=>{
  createStars();
  createParticles();
});