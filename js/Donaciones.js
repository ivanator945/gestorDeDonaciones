window.listaAportaciones = [];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img[data-precio]").forEach(img => {
    img.addEventListener("click", () => {
      const nombre = img.alt;
      const precio = parseFloat(img.getAttribute("data-precio")) || 0;
      window.listaAportaciones.push({ organizacion: nombre, cantidad: precio });
    });
  });
});
