
window.listaAportaciones = [];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img[data-precio]").forEach(img => {
    img.addEventListener("click", () => {
      const nombre = img.alt;
      const precio = parseFloat(img.getAttribute("data-precio")) || 0;
     
      const output = document.getElementById("output");
      if (output) output.innerHTML = "";

      window.listaAportaciones.push({ organizacion: nombre, cantidad: precio });
    });
  });

 
  const boton = document.querySelector("button");
  if (boton) {
    boton.addEventListener("click", () => {
      window.mostrarTexto();
    });
  }
});
