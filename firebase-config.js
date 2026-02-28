// Firebase Configuration - Site Duo (Toratino & Luxi)

const firebaseConfig = {
  apiKey: "AIzaSyBS5ZVhHgbQI1YFsvQbciGIzRIvk8vPE88",
  authDomain: "site-duo-3f7bd.firebaseapp.com",
  databaseURL: "https://site-duo-3f7bd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "site-duo-3f7bd",
  storageBucket: "site-duo-3f7bd.firebasestorage.app",
  messagingSenderId: "598351431088",
  appId: "1:598351431088:web:5f9e22ebd0bc6a20028275"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
