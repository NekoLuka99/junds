// checkout.js
import { db } from './firebase.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

const cartItemsEl = document.getElementById("cartItems");
const placeOrderBtn = document.getElementById("placeOrderBtn");
const toast = document.getElementById("toast");

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function showToast(message = "Aktion erfolgreich!") {
  toast.textContent = "✅ " + message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
    return;
  }

  cartItemsEl.innerHTML = "";

  cart.forEach((item, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "cart-item";

    wrapper.innerHTML = `
      <span><strong>${item.product}</strong> – ${item.price.toFixed(2)} €/${item.unit}</span>
      <input type="number" value="${item.menge}" min="1" id="qty-${index}">
      <button id="remove-${index}" style="background:red;color:white;">✖</button>
    `;

    cartItemsEl.appendChild(wrapper);

    document.getElementById(`qty-${index}`).addEventListener("change", (e) => {
      cart[index].menge = parseInt(e.target.value);
      localStorage.setItem("cart", JSON.stringify(cart));
    });

    document.getElementById(`remove-${index}`).addEventListener("click", () => {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    });
  });
}

placeOrderBtn.addEventListener("click", async () => {
  const username = localStorage.getItem("user")?.toLowerCase();
  if (!username) {
    alert("Du musst angemeldet sein.");
    return;
  }

  if (cart.length === 0) {
    alert("Warenkorb ist leer.");
    return;
  }

  try {
    await addDoc(collection(db, "orders"), {
      user: username,
      timestamp: serverTimestamp(),
      items: cart,
      status: "offen"
    });

    localStorage.removeItem("cart");
    cart = [];
    renderCart();
    showToast("Bestellung wurde gespeichert!");
  } catch (err) {
    console.error("Fehler beim Absenden:", err);
    alert("❌ Fehler beim Absenden der Bestellung");
  }
});

renderCart();
