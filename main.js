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
  <div id="profilePopup" class="profile-popup" style="display:none;">
    <p><strong>Benutzer:</strong> <span id="popupUser">–</span></p>
    <p><strong>Rolle:</strong> <span id="popupRole">–</span></p>
    <a href="#">🔧 Profil bearbeiten</a>
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
  // Popup öffnen/schließen
  userBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popupUser.textContent = username;
    popupRole.textContent = isAdmin ? "Admin" : "Benutzer";
    popup.style.display = popup.style.display === "block" ? "none" : "block";
  });

  // Bearbeitungsformular einmalig einfügen (wenn nicht vorhanden)
  if (!document.getElementById("editProfileForm")) {
    const editHtml = `
      <div id="editProfileForm" style="display:none; margin-top: 1rem;">
        <input type="text" id="editName" placeholder="Name" style="display:block; margin-bottom:0.5rem; width:100%;">
        <input type="text" id="editAddress" placeholder="Adresse" style="display:block; margin-bottom:0.5rem; width:100%;">
        <input type="text" id="editPhone" placeholder="Telefonnummer" style="display:block; margin-bottom:0.5rem; width:100%;">
        <button id="saveProfileBtn" style="width:100%;">💾 Speichern</button>
      </div>
    `;
    popup.insertAdjacentHTML("beforeend", editHtml);
  }

  // Toggle-Funktion für Formular
  const toggleEditLink = popup.querySelector("a[href='#']");
  const editForm = document.getElementById("editProfileForm");
  toggleEditLink?.addEventListener("click", (e) => {
    e.preventDefault();
    editForm.style.display = editForm.style.display === "block" ? "none" : "block";
  });

  // Speichern
  const saveBtn = document.getElementById("saveProfileBtn");
  saveBtn?.addEventListener("click", async () => {
    const name = document.getElementById("editName").value.trim();
    const address = document.getElementById("editAddress").value.trim();
    const phone = document.getElementById("editPhone").value.trim();

    try {
      const userQuery = query(collection(db, "users"), where("username", "==", username));
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        const userRef = doc(db, "users", userSnap.docs[0].id);
        await updateDoc(userRef, { name, address, phone });
        alert("✅ Profil aktualisiert!");
        editForm.style.display = "none";
      }
    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
      alert("❌ Fehler beim Speichern.");
    }
  });

  // Klick außerhalb → Popup schließen
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
