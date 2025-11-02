document.addEventListener("DOMContentLoaded", () => {
    
    let boton = document.getElementById("btnFinalizar");

    if (boton) {
        boton.addEventListener("click", () => {
            window.mostrarResumen();
            window.mostrarPeculiaridades();
            guardarJSON();
            window.mostrarTexto();
        });
    }
});
