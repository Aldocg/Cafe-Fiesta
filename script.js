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
