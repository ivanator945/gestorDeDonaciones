window.listaAportaciones = [];

document.addEventListener("DOMContentLoaded", () => {
  let imagenes = document.querySelectorAll("img[data-precio]");
  
  imagenes.forEach(img => {
    img.addEventListener("click", () => {
      let nombre = img.alt;
      let precio = parseFloat(img.getAttribute("data-precio")) || 0;
      let output = document.getElementById("output");
      if (output) output.innerHTML = "";

      window.listaAportaciones.push({ organizacion: nombre, cantidad: precio });
    });
  });

  let boton = document.querySelector("button");
  if (boton) {
    boton.addEventListener("click", () => {
      window.mostrarTexto();
    });
  }
});