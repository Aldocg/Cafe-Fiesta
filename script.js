// Referencias a elementos
const menuToggle = document.getElementById("menuToggle");
const menuLista = document.getElementById("menuList");

// Mostrar/ocultar menú de navegación al hacer clic en "☰ Ver Menú"
if (menuToggle && menuLista) {
  menuToggle.addEventListener("click", () => {
    menuLista.classList.toggle("hidden");
  });
}

// Mostrar solo una sección a la vez desde el menú
function showOnlySection(sectionId) {
  // Oculta todas las secciones
  document.querySelectorAll("section[id$='-section']").forEach(section => {
    section.classList.add("hidden");
  });

  // Muestra la sección seleccionada
  const target = document.getElementById(sectionId);
  if (target) {
    target.classList.remove("hidden");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Oculta el menú luego de seleccionar
  if (menuLista) {
    menuLista.classList.add("hidden");
  }
}
document.querySelectorAll('#menuList a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault(); // Evita que se desplace la página
    const targetId = this.getAttribute('href').substring(1); // Quita el #
    showOnlySection(targetId);
  });
});
function updateCartCount(count) {
  document.getElementById('cartCount').textContent = count;
}

// Ejemplo: cambiar a 5 después de 2 segundos
setTimeout(() => updateCartCount(5), 2000);

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
