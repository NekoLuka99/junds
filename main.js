// main.js
import { db } from './firebase.js';
import {
  collection,
  query,
  where,
  getDocs
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
  buildNav(); // Falls kein Header vorhanden
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

  // ❗ NICHT MEHR GANZES navButtons.innerHTML überschreiben!
  // Nur Admin-Button einfügen, wenn vorhanden
  if (isAdmin) {
    const adminBtn = document.createElement("a");
    adminBtn.href = "admin.html";
    adminBtn.textContent = "Bestellungen";
    document.querySelector(".nav-buttons-row")?.appendChild(adminBtn);
  }

  // 💬 Benutzername im Button ersetzen
  const usernameDisplay = document.getElementById("usernameDisplay");
  if (usernameDisplay && username) {
    usernameDisplay.textContent = username;
  }

  // 🔁 Popup-Logik
  const userBtn = document.getElementById("userBtn");
  const popup = document.getElementById("profilePopup");
  const popupUser = document.getElementById("popupUser");
  const popupRole = document.getElementById("popupRole");

  userBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    popupUser.textContent = username;
    popupRole.textContent = isAdmin ? "Admin" : "Benutzer";
    popup.style.display = popup.style.display === "none" ? "block" : "none";
  });

  document.addEventListener("click", (e) => {
    if (!popup.contains(e.target) && e.target.id !== "userBtn") {
      popup.style.display = "none";
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
