// 🧭 Manejo de menú desplegable
const menuToggle = document.getElementById("menuToggle");
const menuLista = document.getElementById("menuList");

// Mostrar/ocultar menú al hacer clic en el botón "☰ Ver Menú"
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation(); // Previene que se cierre de inmediato al abrir
  const isHidden = menuLista.classList.contains("hidden");
  menuLista.classList.toggle("hidden");

  // Cierra submenú de bebidas si se vuelve a abrir el menú
  if (isHidden) {
    document.querySelector('.bebidas-submenu')?.classList.add('hidden');
    document.querySelector('.arrow-down')?.classList.remove('rotate-180');
  }
});

// Cierra el menú si haces clic fuera de él
document.addEventListener("click", (e) => {
  if (!menuLista.contains(e.target) && !menuToggle.contains(e.target)) {
    menuLista.classList.add("hidden");
  }
});

// 🎯 Mostrar solo una sección
function showOnlySection(sectionId) {
  document.querySelectorAll("section[id$='-section']").forEach(section => {
    section.classList.add("hidden");
  });

  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove("hidden");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ❌ No cierres el menú si es bebidas
  if (sectionId !== "bebidas") {
    menuLista.classList.add("hidden");
    if (submenu) submenu.classList.add("hidden");
  }
}


// Asigna la función a cada enlace del menú EXCEPTO "Bebidas"
document.querySelectorAll('#menuList a').forEach(link => {
  const href = link.getAttribute('href');
  if (href !== "#bebidas-section") {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = href.replace("-section", "").substring(1);
      showOnlySection(`${targetId}-section`);
    });
  }
});

// 🛒 Carrito
function updateCartCount(count) {
  document.getElementById('cartCount').textContent = count;
}

// Ejemplo de actualización del carrito luego de 2 segundos
//setTimeout(() => updateCartCount(5), 2000);

// 🧩 Modal de producto
function openModal(category, product, price, description = "") {
  document.getElementById('modal-category').textContent = category;
  document.getElementById('modal-product').textContent = product;
  document.getElementById('modal-price').textContent = price;
  document.getElementById('modal-quantity').textContent = 1;

  const note = document.getElementById('modal-note');
  note.value = description || "";
  note.placeholder = description ? "Puedes editar la descripción…" : "Agregar una descripción o nota...";

  document.getElementById('product-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

function adjustQuantity(change) {
  const quantityElem = document.getElementById('modal-quantity');
  let qty = parseInt(quantityElem.textContent);
  qty += change;
  if (qty < 1) qty = 1;
  quantityElem.textContent = qty;
}

// Cerrar submenu cuando clic fuera
const submenu = document.querySelector('.bebidas-submenu');
const parentMenu = document.querySelector('.bebidas-toggle');

document.addEventListener("click", (e) => {
  if (
    submenu && parentMenu &&
    !submenu.contains(e.target) &&
    !parentMenu.contains(e.target) &&
    !menuToggle.contains(e.target) &&
    !menuLista.contains(e.target)
  ) {
    submenu.classList.add("hidden");
    menuLista.classList.add("hidden");
  }
});
// 🍹 Lógica de despliegue de submenú de Bebidas
document.addEventListener('DOMContentLoaded', () => {
  const bebidasToggle = document.querySelector('.bebidas-toggle');
  const bebidasSubmenu = document.querySelector('.bebidas-submenu');
  const arrow = bebidasToggle.querySelector('.arrow-down');

  bebidasToggle.addEventListener('click', () => {
    bebidasSubmenu.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
  });

  document.querySelectorAll('.bebidas-submenu a').forEach(link => {
    link.addEventListener('click', () => {
      bebidasSubmenu.classList.add('hidden');
      arrow.classList.remove('rotate-180');
      document.getElementById('menuList').classList.add('hidden');
    });
  });
});
// ==== 🛒 CARRITO (localStorage) ====
const CART_KEY = 'fc_cart_v1';
let cart = loadCart();
updateCartCount(totalQty());

function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount(totalQty());
  renderCart();
}
function totalQty() {
  return cart.reduce((s, it) => s + it.qty, 0);
}

// Desde modal de producto -> agregar al carrito
function addToCartFromModal() {
  const category = document.getElementById('modal-category').textContent;
  const name = document.getElementById('modal-product').textContent;
  const price = document.getElementById('modal-price').textContent; // ej. "$65"
  const note = document.getElementById('modal-note').value.trim();
  const qty = parseInt(document.getElementById('modal-quantity').textContent, 10) || 1;

  // clave de igualdad: mismo producto, precio y nota
  const key = `${category}|${name}|${price}|${note}`;
  const found = cart.find(it => it.key === key);
  if (found) found.qty += qty;
  else cart.push({ key, category, name, price, note, qty });

  saveCart();
  closeModal();
  //toast('Agregado al carrito');
}

// UI: toast simple
function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.className = 'fixed top-4 right-4 bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg shadow-lg z-[60]';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 1200);
  setTimeout(() => t.remove(), 1600);
}

// Abrir/cerrar modal carrito
document.getElementById('cartButton')?.addEventListener('click', openCart);
function openCart(){ renderCart(); document.getElementById('cart-modal').classList.remove('hidden'); }
function closeCart(){ document.getElementById('cart-modal').classList.add('hidden'); }

// Render de items
function renderCart() {
  const list = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const totalEl = document.getElementById('cart-total');
  if (!list) return;

  list.innerHTML = '';
  if (cart.length === 0) {
    empty.classList.remove('hidden');
    totalEl.textContent = '$0';
    return;
  }
  empty.classList.add('hidden');

  let total = 0;
  cart.forEach((it, i) => {
    const priceNum = parseFloat(it.price.replace(/[^0-9.]/g, '')) || 0;
    total += priceNum * it.qty;

    const li = document.createElement('li');
    li.className = 'border border-white/20 rounded-lg p-3';

    li.innerHTML = `
      <div class="flex justify-between items-start gap-4">
        <div>
          <div class="text-xl font-bold text-yellow-400">${it.name}</div>
          <div class="text-sm text-gray-300">${it.category}</div>
          <textarea class="w-full mt-2 p-2 rounded-md text-black" data-idx="${i}">${it.note || ''}</textarea>
        </div>
        <div class="text-right">
          <div class="text-xl font-bold">${it.price}</div>
          <div class="flex items-center gap-2 mt-2 justify-end">
            <button class="bg-yellow-400 text-black w-8 h-8 rounded-full" data-act="dec" data-idx="${i}">-</button>
            <span class="min-w-[2ch] inline-block text-2xl" id="q_${i}">${it.qty}</span>
            <button class="bg-yellow-400 text-black w-8 h-8 rounded-full" data-act="inc" data-idx="${i}">+</button>
          </div>
          <button class="mt-2 text-sm text-red-300 underline" data-act="del" data-idx="${i}">Eliminar</button>
        </div>
      </div>
    `;
    list.appendChild(li);
  });

  totalEl.textContent = `$${total}`;
  // listeners de qty / delete / note
  list.querySelectorAll('button[data-act]').forEach(btn=>{
    const i = +btn.dataset.idx;
    const act = btn.dataset.act;
    btn.onclick = () => {
      if (act === 'inc') cart[i].qty++;
      if (act === 'dec') cart[i].qty = Math.max(1, cart[i].qty - 1);
      if (act === 'del') cart.splice(i,1);
      saveCart();
    };
  });
  list.querySelectorAll('textarea[data-idx]').forEach(t=>{
    t.oninput = (e) => {
      const i = +t.dataset.idx;
      cart[i].note = e.target.value;
      saveCart();
    };
  });
}
// === CHECKOUT: PDF + WhatsApp ===
const WHATSAPP_PHONE = ""; 
// Opcional: "5218112345678" para abrir chat con ese número. Vacío -> selector de contacto.

document.getElementById('checkoutBtn')?.addEventListener('click', onCheckout);

async function onCheckout() {
  if (!cart || cart.length === 0) { toast('Carrito vacío'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const orderId = 'FC-' + new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
  const now = new Date();
  const fecha = now.toLocaleString();

  // Encabezado
  doc.setFontSize(16);
  doc.text('Fiesta & Café - Pedido', 14, 18);
  doc.setFontSize(11);
  doc.text(`Orden: ${orderId}`, 14, 26);
  doc.text(`Fecha: ${fecha}`, 14, 32);

  // Tabla de items
  const rows = [];
  let total = 0;
  cart.forEach(it => {
    const p = parseFloat(it.price.replace(/[^0-9.]/g, '')) || 0;
    const sub = p * it.qty;
    total += sub;
    rows.push([
      String(it.qty),
      it.name,
      (it.note || '').slice(0,120),
      it.price,
      `$${sub.toFixed(2)}`
    ]);
  });

  doc.autoTable({
    startY: 38,
    head: [['Cant.', 'Producto', 'Nota', 'Precio', 'Subtotal']],
    body: rows,
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [255,214,10], textColor: 0 },
    columnStyles: { 0: { halign: 'center', cellWidth: 16 }, 3: { halign: 'right', cellWidth: 24 }, 4: { halign: 'right', cellWidth: 28 } }
  });

  // Total
  const endY = doc.lastAutoTable.finalY || 38;
  doc.setFontSize(12);
  doc.text(`Total: $${total.toFixed(2)}`, 14, endY + 10);

  // Guardar local + obtener Blob
  const filename = `${orderId}.pdf`;
  doc.save(filename);
  const pdfBlob = doc.output('blob');

  // Hook opcional de subida (devuelve URL pública). Implementa window.uploadOrderPdf si tienes backend:
  //   window.uploadOrderPdf = async (blob, name) => { ...return 'https://.../pedido.pdf'; }
  let publicUrl = '';
  if (typeof window.uploadOrderPdf === 'function') {
    try { publicUrl = await window.uploadOrderPdf(pdfBlob, filename); }
    catch { /* si falla, seguimos sin URL pública */ }
  }

  // Construir texto para WhatsApp
  const waText = buildWhatsAppText(orderId, fecha, total, publicUrl);
  const waBase = WHATSAPP_PHONE ? `https://wa.me/${552441215613}?text=` : `https://wa.me/?text=`;
  const waUrl = waBase + encodeURIComponent(waText);

  // Abrir WhatsApp
  window.open(waUrl, '_blank');
}

function buildWhatsAppText(orderId, fecha, total, publicUrl='') {
  const lines = [];
  lines.push(`*Confirmación de pedido*`);
  lines.push(`*Orden:* ${orderId}`);
  lines.push(`*Fecha:* ${fecha}`);
  lines.push('');
  lines.push(`*Productos:*`);

  cart.forEach(it => {
    const p = parseFloat(it.price.replace(/[^0-9.]/g, '')) || 0;
    const sub = p * it.qty;
    const nota = it.note ? ` _(${it.note})_` : '';
    lines.push(`• ${it.qty} × ${it.name}${nota} — ${it.price} => $${sub.toFixed(2)}`);
  });

  lines.push('');
  lines.push(`*Total:* $${total.toFixed(2)}`);

  if (publicUrl) {
    lines.push('');
    lines.push(`PDF del pedido: ${publicUrl}`);
  } else {
    lines.push('');
    lines.push(`(El PDF se descargó en tu dispositivo)`);
  }

  lines.push('');
  lines.push(`¿Confirmas el envío?`);
  return lines.join('\n');
}

