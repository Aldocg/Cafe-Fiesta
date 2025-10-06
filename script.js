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
setTimeout(() => updateCartCount(5), 2000);

// 🧩 Modal de producto
function openModal(category, product, price) {
  document.getElementById('modal-category').textContent = category;
  document.getElementById('modal-product').textContent = product;
  document.getElementById('modal-price').textContent = price;
  document.getElementById('modal-quantity').textContent = 1;
  document.getElementById('modal-note').value = "";
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
