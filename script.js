  function toggleSection(id) {
  const selected = document.getElementById(id);
  const isHidden = selected.classList.contains("hidden");

  // 🔹 Cerrar todas las secciones
  document.querySelectorAll("ul[id]").forEach(section => {
    section.classList.add("hidden");
  });

  // 🔹 Si estaba oculta, mostrarla
  if (isHidden) {
    selected.classList.remove("hidden");

    // 🔹 Resaltar el enlace activo en el nav
    document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
    const activeLink = document.querySelector(`nav a[href="#${id}"]`);
    if (activeLink) activeLink.classList.add("active");
    // 🔹 Cambiar color del botón .banner activo
    document.querySelectorAll(".banner").forEach(b => b.classList.remove("active"));
    const activeBanner = document.querySelector(`.banner[onclick="toggleSection('${id}')"]`);
    if (activeBanner) activeBanner.classList.add("active");
    // 🔹 Scroll al banner de la sección
    const banner = document.querySelector(`.banner[onclick="toggleSection('${id}')"]`);
    if (banner) {
      setTimeout(() => banner.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }
  }
  const btnArriba = document.getElementById("btnArriba");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      btnArriba.classList.remove("hidden");
    } else {
      btnArriba.classList.add("hidden");
    }
  });

  btnArriba.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.getElementById("menuToggle").addEventListener("click", () => {
  const nav = document.querySelector("nav");
  window.scrollTo({ top: nav.offsetTop, behavior: "smooth" });
});
  
