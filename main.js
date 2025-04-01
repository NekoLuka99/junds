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
    let userId = null;
    let userData = {};

    try {
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("username", "==", username));
      const userSnap = await getDocs(userQuery);

      if (!userSnap.empty) {
        const docSnap = userSnap.docs[0];
        userData = docSnap.data();
        userId = docSnap.id;
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
        <a href="#" id="userBtn">👤 <span id="usernameDisplay">${username}</span></a>
        <a href="#" id="logoutBtn">Logout</a>
      </div>
    `;

    // Popup-Logik
    const userBtn = document.getElementById("userBtn");
    const popup = document.getElementById("profilePopup");
    const popupUser = document.getElementById("popupUser");
    const popupRole = document.getElementById("popupRole");
    const popupTel = document.getElementById("popupTel");
    const popupAdr = document.getElementById("popupAdr");
    const popupSave = document.getElementById("popupSave");

    userBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      popupUser.textContent = username;
      popupRole.textContent = isAdmin ? "Admin" : "Benutzer";
      popupTel.value = userData.telefon || "";
      popupAdr.value = userData.adresse || "";
      popup.style.display = popup.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("click", (e) => {
      if (!popup.contains(e.target) && e.target.id !== "userBtn") {
        popup.style.display = "none";
      }
    });

    popupSave?.addEventListener("click", async () => {
      const neueTel = popupTel.value.trim();
      const neueAdr = popupAdr.value.trim();
      try {
        const ref = doc(db, "users", userId);
        await updateDoc(ref, {
          telefon: neueTel,
          adresse: neueAdr
        });
        popup.style.display = "none";
        alert("✅ Profil gespeichert!");
      } catch (err) {
        console.error("Fehler beim Speichern des Profils:", err);
        alert("❌ Fehler beim Speichern");
      }
    });

    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("isAdmin");
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

// Debug-Ausgabe
console.log("Firestore verbunden:", db);
