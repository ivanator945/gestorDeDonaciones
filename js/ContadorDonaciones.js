window.contarDonaciones = function () {
    var aportaciones = window.listaAportaciones || [];
    var conteo = {};
    var totalDonado = 0;

    for (var i = 0; i < aportaciones.length; i++) {
        var donacion = aportaciones[i];
        var nombre = donacion.organizacion;
        var cantidad = parseFloat(donacion.cantidad) || 0;
        var veces = donacion.numDonaciones || 1;

        if (!conteo[nombre]) {
            conteo[nombre] = { veces: 0, total: 0 };
        }

        conteo[nombre].veces += veces;
        conteo[nombre].total += cantidad;
        totalDonado += cantidad;
    }

    return { conteo: conteo, totalDonado: totalDonado };
};

window.actualizarResumen = function () {
    var resultado = window.contarDonaciones();
    var conteo = resultado.conteo;
    var totalDonado = resultado.totalDonado;

    var zonaDerecha = document.getElementById("zonaDerecha");

    var html = "<h2>Resumen de Donaciones</h2>";

    var hayDonaciones = false;
    for (var nombre in conteo) {
        hayDonaciones = true;
        break;
    }

    if (!hayDonaciones) {
        html += "<p>No hay donaciones registradas.</p>";
    } else {
        html += "<ul>";
        for (var nombre in conteo) {
            var color = (nombre === window.ultimaDonacion) ? "green" : "black";
            html += "<li style='color:" + color + "'><strong>" + nombre + "</strong>: " +
                conteo[nombre].veces + " veces, total " + conteo[nombre].total.toFixed(2) + " €</li>";
        }
        html += "</ul>";
    }

    zonaDerecha.innerHTML = html;
};