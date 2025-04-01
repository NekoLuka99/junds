// main.js
import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
  buildNav();
}

async function buildNav() {
  const username = localStorage.getItem("user")?.toLowerCase();
  const navButtons = document.querySelector(".nav-buttons");

  if (!navButtons) return;

  if (username) {
    let isAdmin = false;

    try {
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("username", "==", username));
      const userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        const userData = userSnap.docs[0].data();
        isAdmin = userData.isAdmin === true;
        localStorage.setItem("isAdmin", isAdmin);
      }
    } catch (err) {
      console.error("Fehler beim Admin-Check:", err);
    }

    navButtons.innerHTML = `
      <div class="nav-buttons-row">
        <a href="meine-bestellungen.html">Meine Bestellungen</a>
        ${isAdmin ? '<a href="admin.html">Bestellungen</a>' : ''}
      </div>
      <div class="nav-buttons-row">
        <a href="#" id="userBtn">👤 ${username}</a>
        <a href="#" id="logoutBtn">Logout</a>
      </div>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("isAdmin");
      window.location.href = "index.html";
    });

    // ➕ Jetzt kommt die Popup-Logik
    const userBtn = document.getElementById("userBtn");
    const popup = document.getElementById("profilePopup");
    const popupUser = document.getElementById("popupUser");
    const popupRole = document.getElementById("popupRole");

    if (userBtn && popup && popupUser && popupRole) {
      userBtn.addEventListener("click", (e) => {
        e.preventDefault();
        popupUser.textContent = username;
        popupRole.textContent = isAdmin ? "Admin" : "Benutzer";
        popup.style.display = popup.style.display === "block" ? "none" : "block";
      });

      document.addEventListener("click", (e) => {
        if (
          popup.style.display === "block" &&
          !popup.contains(e.target) &&
          e.target.id !== "userBtn"
        ) {
          popup.style.display = "none";
        }
      });
    } else {
      console.warn("❗ Benutzer-Popup oder -Elemente nicht gefunden");
    }

  } else {
    navButtons.innerHTML = `
      <a href="index.html">Startseite</a>
      <a href="login.html">Anmelden</a>
      <a href="register.html">Registrieren</a>
    `;
  }
}

console.log("Firestore verbunden:", db);
