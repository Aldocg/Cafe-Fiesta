// 🧭 Manejo de menú desplegable
const menuToggle = document.getElementById("menuToggle");
const menuLista = document.getElementById("menuList");
const CUSTOMER_KEY = 'customer_name';

function loadCustomerName(){ try { return localStorage.getItem(CUSTOMER_KEY) || ''; } catch { return ''; } }
function saveCustomerName(v){ try { localStorage.setItem(CUSTOMER_KEY, v || ''); } catch {} }

function bindCustomerField(){
  const inp = document.getElementById('cart-customer-name');
  if (!inp) return;
  inp.value = loadCustomerName();
  inp.oninput = e => saveCustomerName((e.target.value || '').trim());
}
document.addEventListener('DOMContentLoaded', bindCustomerField);

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
window.cart = cart;
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
  toast('Agregado al carrito');
}

// UI: toast simple
function toast(msg) {
  // Overlay centrado
  const wrap = document.createElement('div');
  wrap.className = 'fixed inset-0 z-[90] flex items-center justify-center';
  // Fondo opcional semitransparente (si lo quieres, descomenta):
  // wrap.className += ' bg-black/40';

  const box = document.createElement('div');
  box.textContent = msg;
  box.className = 'bg-yellow-400 text-black font-bold px-6 py-4 rounded-xl shadow-2xl text-center transform transition-all duration-200 scale-100 opacity-100';

  wrap.appendChild(box);
  document.body.appendChild(wrap);

  // Auto-cierre suave
  setTimeout(() => {
    box.classList.add('opacity-0');
    box.classList.add('scale-95');
  }, 1200);
  setTimeout(() => wrap.remove(), 1600);
}

// Abrir/cerrar modal carrito
document.getElementById('cartButton')?.addEventListener('click', openCart);
function openCart(){ renderCart();bindCustomerField(); document.getElementById('cart-modal').classList.remove('hidden'); }
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

  totalEl.textContent = `$${total.toFixed(2)}`;
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
function downloadBlob(blob, filename){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
// === SUPABASE: guardar pedido y renglones ===
// usa el cliente global: window.supabaseClient
async function saveOrderToSupabase({ order, items }) {
  const supa = window.supabaseClient;
  // 1) Insert en Pedidos
  const { data: orderRow, error: e1 } = await supa
    .from('Pedidos')
    .insert(order)
    .select('id')
    .single();

  if (e1) throw e1;

  // 2) Insert en Pedidos_detalle (mapear order_id)
  const detalle = items.map(it => ({
    order_id: orderRow.id,
    name: it.name ?? '',
    note: it.note ?? '',
    qty: Number(it.qty ?? 1),
    unit_price: Number(
      String(it.price).replace(/[^0-9.]/g, '')
    ) || 0,
    subtotal: (Number(
      String(it.price).replace(/[^0-9.]/g, '')
    ) || 0) * Number(it.qty ?? 1)
  }));

  const { error: e2 } = await supa
    .from('Pedidos_detalle')
    .insert(detalle);

  if (e2) throw e2;

  return orderRow.id;
}

function openNameModal() {
  const m = document.getElementById('name-modal');
  const input = document.getElementById('customer-name');
  const btn = document.getElementById('name-continue');
  const newBtn = btn.cloneNode(true);               // <- limpia listeners
  btn.parentNode.replaceChild(newBtn, btn);

  input.value = '';
  m.classList.remove('hidden');
  setTimeout(()=> input.focus(), 0);
}

function closeNameModal() {
  document.getElementById('name-modal').classList.add('hidden');
}
document.getElementById('name-cancel')?.addEventListener('click', closeNameModal);

let lastPdf = null; // { blob, filename, orderCode, total }

function buildPdfFromCart() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const orderCode = 'FC-' + new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
  const fecha = new Date().toLocaleString();

  // encabezado
  doc.setFontSize(16); doc.text('Fiesta & Café - Pedido', 14, 18);
  doc.setFontSize(11); doc.text(`Orden: ${orderCode}`, 14, 26);
  doc.text(`Fecha: ${fecha}`, 14, 32);

  // tabla
  const rows = [];
  let subtotal = 0;
  cart.forEach(it => {
    const qty = Number(it.qty ?? 1);
    const p = parseFloat(String(it.price).replace(/[^0-9.]/g,'')) || 0;
    const sub = p * qty;
    subtotal += sub;
    rows.push([ String(qty), it.name, (it.note || '').slice(0,120), it.price, `$${sub.toFixed(2)}` ]);
  });

  doc.autoTable({
    startY: 38,
    head: [['Cant.', 'Producto', 'Nota', 'Precio', 'Subtotal']],
    body: rows,
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [255,214,10], textColor: 0 },
    columnStyles: { 0:{halign:'center',cellWidth:16}, 3:{halign:'right',cellWidth:24}, 4:{halign:'right',cellWidth:28} }
  });

  const endY = doc.lastAutoTable?.finalY || 38;
  doc.setFontSize(12);
  doc.text(`Total: $${subtotal.toFixed(2)}`, 14, endY + 10);

  const filename = `${orderCode}.pdf`;
  const blob = doc.output('blob');

  lastPdf = { blob, filename, orderCode, total: subtotal };
  return lastPdf;
}
// Botón Descargar PDF (solo si el usuario lo pide)
document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
  if (!Array.isArray(cart) || cart.length === 0) { toast?.('Carrito vacío'); return; }
  const pdf = buildPdfFromCart();
  downloadBlob(pdf.blob, pdf.filename);
});

// Botón Enviar (valida nombre; si falta, abre modal de nombre y NO envía)
document.getElementById('checkoutBtn')?.addEventListener('click', async () => {
  if (!Array.isArray(cart) || cart.length === 0) { toast?.('Carrito vacío'); return; }

  const nameInput = document.getElementById('cart-customer-name');
  const nameVal = (nameInput?.value || '').trim();
  
  if (!nameVal) {
    // falta nombre: levantamos modal de nombre y al aceptar llenamos el campo del carrito
    openNameModal();
    const handler = async () => {
      const v = (document.getElementById('customer-name').value || '').trim();
      if (!v) { toast?.('Ingresa el nombre'); return; }
      const nameInput = document.getElementById('cart-customer-name');
      nameInput.value = v;           // llenar campo del carrito
      saveCustomerName(v);
      closeNameModal();
      toast?.('Nombre agregado');    // no enviamos aún; usuario vuelve a dar "Enviar"
    };
    document.getElementById('name-continue')?.addEventListener('click', handler,{ once: true });
    return; // cancelar envío
  }

  // Sí hay nombre: enviar a Supabase
  await onCheckout(nameVal);
});
async function onCheckout(customerName) {
  // construir PDF (para poder descargar luego si quieren)
  const pdf = buildPdfFromCart();

  // payload de orden
  const orderPayload = {
    order_code: pdf.orderCode,
    status: 'pending',
    customer_name: customerName,
    customer_telegram: false,
    notes: '',
    subtotal: pdf.total,
    discount: 0,
    tax: 0,
    total: pdf.total,
    payment_method: null,
    payment_status: 'unpaid',
    pdf_url: null,
    source: 'web'
  };

  try {
    await saveOrderToSupabase({ order: orderPayload, items: cart });
    toast('Pedido enviado');
    closeCart();
  } catch (err) {
    console.error(err);
    toast('Error al guardar pedido');
  }
}


