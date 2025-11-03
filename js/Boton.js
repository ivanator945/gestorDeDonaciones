document.addEventListener("DOMContentLoaded", () => {
    
    let boton = document.getElementById("btnFinalizar");

    if (boton) {
        boton.addEventListener("click", () => {
            window.mostrarResumen();
            guardarJSON();
            window.mostrarTexto();
        });
    }
});
