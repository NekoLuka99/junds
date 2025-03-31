// main.js
import { db } from './firebase.js';

// Optional: Konsolentest, ob Firestore verbunden ist
console.log("Firestore verbunden:", db);

// Weitere globale Logik kannst du hier hinzufügen

// main.js
import { db } from './firebase.js';

// Benutzername aus localStorage holen
const username = localStorage.getItem("user");

// Wenn Header vorhanden ist, Inhalte dynamisch anpassen
const navButtons = document.querySelector(".nav-buttons");

if (navButtons) {
  if (username) {
    navButtons.innerHTML = `
      <span style="color: white; margin-right: 1rem;">Angemeldet als <strong>${username}</strong></span>
      <a href="#" id="logoutBtn">Logout</a>
    `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.reload(); // Seite neu laden
    });
  }
}
