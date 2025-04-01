// meine-bestellungen.js
import { db } from './firebase.js';
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

export async function loadOrders() {
  const username = localStorage.getItem("user")?.toLowerCase();
  const ordersContainer = document.getElementById("ordersContainer");

  if (!username) {
    ordersContainer.textContent = "Nicht eingeloggt.";
    return;
  }

  const usersRef = collection(db, "users");
  const userQuery = query(usersRef, where("username", "==", username));
  const userSnap = await getDocs(userQuery);

  if (userSnap.empty) {
    ordersContainer.textContent = "Benutzer nicht gefunden.";
    return;
  }

  const userData = userSnap.docs[0].data();
  const isAdmin = userData.isAdmin === true;

  const ordersRef = collection(db, "orders");
  const ordersQuery = isAdmin
    ? query(ordersRef)
    : query(ordersRef, where("user", "==", username));

  const orderSnap = await getDocs(ordersQuery);

  if (orderSnap.empty) {
    ordersContainer.textContent = "Keine Bestellungen gefunden.";
  } else {
    ordersContainer.innerHTML = "";
    orderSnap.forEach(doc => {
      const order = doc.data();
      const div = document.createElement("div");
      div.className = "order-card";

      const itemList = order.items?.map(item =>
        `<div><strong>${item.product}</strong> – ${item.menge} Stück – ${item.price.toFixed(2)} €</div>`
      ).join("") || "<div>Keine Artikel</div>";

      div.innerHTML = `
        ${itemList}
        <em>von ${order.user}</em>
      `;

      ordersContainer.appendChild(div);
    });
  }
}
