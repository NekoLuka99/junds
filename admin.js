// admin.js
import { db } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const username = localStorage.getItem("user")?.toLowerCase();
const ordersContainer = document.getElementById("ordersContainer");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popup-content");
const popupOverlay = document.getElementById("popup-overlay");
const popupClose = document.getElementById("popup-close");

popupClose.addEventListener("click", closePopup);
popupOverlay.addEventListener("click", closePopup);

function openPopup(html) {
  popupContent.innerHTML = html;
  popup.style.display = "block";
  popupOverlay.style.display = "block";
}

function closePopup() {
  popup.style.display = "none";
  popupOverlay.style.display = "none";
}

async function updateStatus(orderId, newStatus) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status: newStatus });
  loadOrders();
}

async function deleteOrder(orderId) {
  const ref = doc(db, "orders", orderId);
  if (confirm("Bestellung wirklich löschen?")) {
    await deleteDoc(ref);
    loadOrders();
  }
}

async function loadOrders() {
  if (!username) {
    ordersContainer.textContent = "Nicht eingeloggt.";
    return;
  }

  const usersRef = collection(db, "users");
  const userQuery = query(usersRef, where("username", "==", username));
  const userSnap = await getDocs(userQuery);

  if (userSnap.empty || !userSnap.docs[0].data().isAdmin) {
    ordersContainer.textContent = "Zugriff verweigert – nur für Admins.";
    return;
  }

  const ordersRef = collection(db, "orders");
  const orderSnap = await getDocs(ordersRef);

  if (orderSnap.empty) {
    ordersContainer.textContent = "Keine Bestellungen vorhanden.";
    return;
  }

  ordersContainer.innerHTML = "";

  for (const docItem of orderSnap.docs) {
    const order = docItem.data();
    const orderId = docItem.id;
    const status = (order.status || "offen").toLowerCase();
    const cssClass = status === "abgeschlossen" ? "status-abgeschlossen"
                    : status === "in bearbeitung" ? "status-bearbeitung"
                    : "status-offen";

    // Adresse des Bestellers auslesen
    let addressHtml = "";
    const userQuery = query(collection(db, "users"), where("username", "==", order.user));
    const userSnap = await getDocs(userQuery);
    if (!userSnap.empty) {
      const userData = userSnap.docs[0].data();
      if (userData.address) {
        addressHtml = `<p><strong>Adresse:</strong> ${userData.address}</p>`;
      }
    }

    const div = document.createElement("div");
    div.className = `order-card ${cssClass}`;
    div.innerHTML = `
      <div><strong>Bestellung von ${order.user}</strong></div>
      <div class="order-actions">
        <button class="btn-bearbeitung">→ In Bearbeitung</button>
        <button class="btn-abgeschlossen">→ Abgeschlossen</button>
        <button class="btn-delete">Löschen</button>
      </div>
    `;

    div.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") return;

      const itemList = order.items?.map(item =>
        `<li>${item.menge}x ${item.product} – ${item.price.toFixed(2)} €</li>`
      ).join("") || "<li>-</li>";

      openPopup(`
        <h3>Bestellung von ${order.user}</h3>
        <p><strong>Artikel:</strong></p>
        <ul>${itemList}</ul>
        ${addressHtml}
        <p><strong>Status:</strong> ${order.status || "offen"}</p>
      `);
    });

    div.querySelector(".btn-bearbeitung").addEventListener("click", () => updateStatus(orderId, "in bearbeitung"));
    div.querySelector(".btn-abgeschlossen").addEventListener("click", () => updateStatus(orderId, "abgeschlossen"));
    div.querySelector(".btn-delete").addEventListener("click", () => deleteOrder(orderId));

    ordersContainer.appendChild(div);
  }
}

loadOrders();
