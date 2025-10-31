document.addEventListener("DOMContentLoaded", () => {
    
    let boton = document.getElementById("btnFinalizar");

    if (boton) {
        boton.addEventListener("click", () => {
            // Ejecutar funciones existentes
            window.mostrarResumen();
            window.mostrarPeculiaridades();
            guardarJSON();
            window.mostrarTexto();
        });
    }
});
