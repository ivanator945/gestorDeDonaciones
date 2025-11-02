window.listaAportaciones = [];
window.ultimaDonacion = null;
window.idDonacionGlobal = 1;

document.addEventListener("DOMContentLoaded", function () {
    var imagenes = document.querySelectorAll("img[alt]");

    for (var i = 0; i < imagenes.length; i++) {
        var img = imagenes[i];
        img.addEventListener("click", function () {
            var nombre = this.alt;
            var inputCantidad = document.querySelector('.donacionInput[data-org="' + nombre + '"]');
            var cantidad = parseFloat(inputCantidad.value) || 0;
            window.ultimaDonacion = nombre;
            var existente = null;
            for (var j = 0; j < window.listaAportaciones.length; j++) {
                if (window.listaAportaciones[j].organizacion === nombre) {
                    existente = window.listaAportaciones[j];
                    break;
                }
            }
            if (existente) {
                existente.cantidad += cantidad;
                existente.numDonaciones += 1;
            } else {
                window.listaAportaciones.push({
                    id: window.idDonacionGlobal++,
                    organizacion: nombre,
                    cantidad: cantidad,
                    numDonaciones: 1
                });
            }
            inputCantidad.value = "";
            window.actualizarResumen();
        });
    }
var btnMostrar = document.getElementById("btnMostrar");
    if (btnMostrar) {
        btnMostrar.addEventListener("click", function () {
            window.mostrarTexto();
            window.actualizarResumen();
        });
    }


});

window.enviarDonacionesAlServidor = function () {
    var donaciones = [];

    for (var i = 0; i < window.listaAportaciones.length; i++) {
        var ap = window.listaAportaciones[i];
        donaciones.push({
            id: ap.id,
            organizacion: ap.organizacion,
            importeTotal: parseFloat(ap.cantidad.toFixed(2)),
            numDonaciones: ap.numDonaciones,
            cantidad: parseFloat((ap.cantidad / ap.numDonaciones).toFixed(2)),
            fecha: new Date().toISOString().split("T")[0],
            hora: new Date().toLocaleTimeString("es-ES", { hour12: false })
        });
    }

};
