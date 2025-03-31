// store.js
import { db, storage } from './firebase.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

const productList = document.getElementById("productList");
const cartEl = document.getElementById("cart");
const adminForm = document.getElementById("adminForm");
const statusEl = document.getElementById("adminStatus");
const modal = document.getElementById("productModal");
const openModalBtn = document.getElementById("addProductBtn");
const closeModalBtn = document.getElementById("closeModal");

let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let isAdmin = false;

openModalBtn.addEventListener("click", () => modal.style.display = "flex");
closeModalBtn.addEventListener("click", () => modal.style.display = "none");

function updateCartDisplay() {
  const total = cart.reduce((sum, item) => sum + item.menge, 0);
  cartEl.textContent = `🛒 ${total} Artikel`;
}

function addToCart(product, menge) {
  if (menge < 1) return;
  const existing = cart.find(item => item.product === product.product);
  if (existing) {
    existing.menge += menge;
  } else {
    cart.push({ ...product, menge });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
}

async function loadProducts() {
  const snapshot = await getDocs(collection(db, "products"));
  if (snapshot.empty) {
    productList.innerHTML = "<p>Keine Produkte gefunden.</p>";
    return;
  }
  productList.innerHTML = "";

  snapshot.forEach(docItem => {
    const data = docItem.data();
    const docId = docItem.id;

    const card = document.createElement("div");
    card.className = "product-card";

    const name = data.product || "Unbenannt";
    const price = data.price || 0;
    const unit = data.unit || "";
    const desc = data.desc || "";
    const imageUrl = data.imageUrl || "";

    card.innerHTML = `
      <h3 contenteditable="${isAdmin}" id="name-${docId}">${name}</h3>
      <p><strong><span contenteditable="${isAdmin}" id="price-${docId}">${price.toFixed(2)}</span> €</strong> pro <span contenteditable="${isAdmin}" id="unit-${docId}">${unit}</span></p>
      ${desc ? `<p contenteditable="${isAdmin}" id="desc-${docId}">${desc}</p>` : ""}
      ${imageUrl ? `<img src="${imageUrl}" alt="${name}">` : ""}
      <div style="margin-top: 0.5rem;">
        <input type="number" min="1" value="1" id="qty-${docId}">
        <button id="btn-${docId}">Hinzufügen</button>
        ${isAdmin ? `
          <button id="save-${docId}" style="background:#5cb85c; color:white; margin-left:0.5rem;">Speichern</button>
          <button id="del-${docId}" style="background:red; color:white; margin-left:0.5rem;">Löschen</button>
        ` : ""}
      </div>
    `;

    productList.appendChild(card);

    document.getElementById(`btn-${docId}`).addEventListener("click", () => {
      const menge = parseInt(document.getElementById(`qty-${docId}`).value);
      addToCart({ product: name, price, unit }, menge);
    });

    if (isAdmin) {
      document.getElementById(`del-${docId}`).addEventListener("click", async () => {
        if (confirm(`Produkt „${name}" wirklich löschen?`)) {
          await deleteDoc(doc(db, "products", docId));
          loadProducts();
        }
      });

      document.getElementById(`save-${docId}`).addEventListener("click", async () => {
        const newName = document.getElementById(`name-${docId}`).textContent.trim();
        const newPrice = parseFloat(document.getElementById(`price-${docId}`).textContent);
        const newUnit = document.getElementById(`unit-${docId}`).textContent;
        const newDesc = document.getElementById(`desc-${docId}`)?.textContent || "";
        await updateDoc(doc(db, "products", docId), {
          product: newName,
          price: newPrice,
          unit: newUnit,
          desc: newDesc
        });
        alert("✅ Änderungen gespeichert");
        loadProducts();
      });
    }
  });
}

async function checkIfAdmin() {
  const username = localStorage.getItem("user")?.toLowerCase();
  if (!username) return;
  const userQuery = query(collection(db, "users"), where("username", "==", username));
  const userSnap = await getDocs(userQuery);
  if (!userSnap.empty && userSnap.docs[0].data().isAdmin) {
    isAdmin = true;
    openModalBtn.style.display = "inline-block";
  }
}

adminForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = document.getElementById("newName").value.trim();
  const price = parseFloat(document.getElementById("newPrice").value);
  const unit = document.getElementById("newUnit").value.trim();
  const desc = document.getElementById("newDesc").value.trim();
  const file = document.getElementById("newImage").files[0];

  statusEl.textContent = "Wird gespeichert...";

  if (file) {
    window.validateImageSize(file, async (isValid) => {
      if (!isValid) {
        statusEl.textContent = "❌ Das Bild muss genau 160x160 Pixel groß sein.";
        return;
      }

      try {
        const storageRef = ref(storage, `product_images/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, "products"), {
          product,
          price,
          unit,
          desc,
          imageUrl
        });

        statusEl.textContent = "✅ Produkt hinzugefügt!";
        adminForm.reset();
        modal.style.display = "none";
        loadProducts();
      } catch (err) {
        console.error("Fehler beim Speichern:", err);
        statusEl.textContent = "❌ Fehler beim Speichern.";
      }
    });
  } else {
    // kein Bild, trotzdem speichern
    await addDoc(collection(db, "products"), {
      product,
      price,
      unit,
      desc,
      imageUrl: ""
    });

    statusEl.textContent = "✅ Produkt ohne Bild gespeichert!";
    adminForm.reset();
    modal.style.display = "none";
    loadProducts();
  }
});

await checkIfAdmin();
await loadProducts();
updateCartDisplay();
