window.listaAportaciones = [];
window.ultimaDonacion = null;
window.idDonacionGlobal = 1;

let data = [
    { id: 1, 
        nombre: "cruz roja", 
        acogida: true, 
        rangoEdad: "infancia" 
    },
    { id: 2, 
        nombre: "medicos sin fronteras", 
        acogida: true, 
        rangoEdad: "adultos" 
    },
    { id: 3, 
        nombre: "unicef", 
        acogida: false, 
        rangoEdad: "juventud" 
    },
    { id: 4, 
        nombre: "Save the Children", 
        acogida: false, 
        rangoEdad: "infancia" 
    },
    { id: 5, 
        nombre: "ACNUR", 
        acogida: true, 
        rangoEdad: "infancia" 
    },
    { id: 6, 
        nombre: "amnesty international", 
        acogida: false, 
        internacional: "internacional" 
    },
    { id: 7, 
        nombre: "Cáritas", 
        acogida: true, 
        rangoEdad: "tercera edad" 
    },
    { id: 8, 
        nombre: "WWF", 
        acogida: false, 
        ambito: "internacional" 
    },
    { id: 9, 
        nombre: "Fundación Vicente Ferrer", 
        acogida: true, 
        rangoEdad: "infancia" 
    },
    { id: 10, 
        nombre: "Oxfam Intermón", 
        acogida: false, 
        rangoEdad: "internacional"
    }
];

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
                    id: parseInt(inputCantidad.id),
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

    var imagenesEnviar = document.querySelectorAll("img[alt]");
    for (var k = 0; k < imagenesEnviar.length; k++) {
        imagenesEnviar[k].addEventListener("click", function () {
            window.enviarDonacionesAlServidor();
        });
    }
});

window.enviarDonacionesAlServidor = function() {
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

    var tramiteDonacion = {
        id: Date.now(),
        fecha: new Date().toISOString().split("T")[0],
        donaciones: donaciones
    };

    fetch("http://localhost:3000/tramiteDonacion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tramiteDonacion: [tramiteDonacion] })
        })
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(datos) {
            console.log("Donación enviada:", datos);
        })
        .catch(function(error) {
            console.error("Error enviando donación:", error);
        });
};
