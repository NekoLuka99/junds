// main.js
import { db } from './firebase.js';

// Header laden
const headerContainer = document.getElementById("header-container");
if (headerContainer) {
  fetch("header.html")
    .then(res => res.text())
    .then(html => {
      headerContainer.innerHTML = html;
      buildNav();
    });
} else {
  buildNav(); // Falls kein Header vorhanden, trotzdem Navigation erzeugen
}

async function buildNav() {
  const username = localStorage.getItem("user")?.toLowerCase();
  const navButtons = document.querySelector(".nav-buttons");

  if (!navButtons) return;

  if (username) {
    let isAdmin = false;

    // Firestore prüfen, ob User Admin ist
    try {
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("username", "==", username));
      const userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        isAdmin = userData.isAdmin === true;
      }
    } catch (err) {
      console.error("Fehler beim Admin-Check:", err);
    }

    navButtons.innerHTML = `
      <a href="index.html">Startseite</a>
      <a href="meine-bestellungen.html">Meine Bestellungen</a>
      ${isAdmin ? '<a href="admin.html">Bestellungen</a>' : ''}
      <span style="color: white;">Angemeldet als <strong>${username}</strong></span>
      <a href="#" id="logoutBtn">Logout</a>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  } else {
    navButtons.innerHTML = `
      <a href="index.html">Startseite</a>
      <a href="login.html">Anmelden</a>
      <a href="register.html">Registrieren</a>
    `;
  }
}


// Optional: Konsolentest, ob Firestore verbunden ist
console.log("Firestore verbunden:", db);
