window.mostrarTexto = function () {
    var fecha = new Date();
    var fechaActual = fecha.toISOString().split("T")[0];
    var horaActual = fecha.toLocaleTimeString("es-ES", { hour12: false });

    if (!window.listaAportaciones || window.listaAportaciones.length === 0) {
        var salidaVacia = "No hay donaciones registradas aún.";
        var outputTexto = document.getElementById("outputTexto");
        var output = document.getElementById("output");
        if (outputTexto) outputTexto.innerText = salidaVacia;
        if (output) output.innerHTML = salidaVacia;
        return;
    }

    var resumenDonaciones = window.listaAportaciones.map(function (donacion) {
        return {
            id: donacion.id,
            organizacion: donacion.organizacion,
            importeTotal: parseFloat(donacion.cantidad.toFixed(2)),
            numDonaciones: donacion.numDonaciones,
            cantidad: parseFloat((donacion.cantidad / donacion.numDonaciones).toFixed(2)),
            fecha: fechaActual,
            hora: horaActual
        };
    });

    var totalDonado = 0;
    for (var i = 0; i < resumenDonaciones.length; i++) {
        totalDonado += resumenDonaciones[i].importeTotal;
    }

    var aporteMedio = totalDonado / resumenDonaciones.length;

    var textoPlano = "Fecha de donación: " + fechaActual + " " + horaActual + "\n\n";
    var textoHTML = "Fecha de donación: " + fechaActual + " " + horaActual + "<br><br>";

    for (var i = 0; i < resumenDonaciones.length; i++) {
        var d = resumenDonaciones[i];
        var linea = d.organizacion + " ---- " + d.numDonaciones + " donaciones --- " +
            d.cantidad.toFixed(2) + "€ -- " + d.importeTotal.toFixed(2) + "€";
        textoPlano += linea + "\n";
        textoHTML += linea + "<br>";
    }

    textoPlano += "\nAporte total: " + totalDonado.toFixed(2) + " €";
    textoPlano += "\nAporte medio: " + aporteMedio.toFixed(2) + " €/donación";

    textoHTML += "<br>Aporte total: " + totalDonado.toFixed(2) + " €<br>";
    textoHTML += "Aporte medio: " + aporteMedio.toFixed(2) + " €/donación";

    var outputTexto = document.getElementById("outputTexto");
    var output = document.getElementById("output");

    if (outputTexto) outputTexto.innerText = textoPlano;
    if (output) output.innerHTML = textoHTML;

    var mensajePopup = "";
    window.listaAportaciones.forEach(function (ap, index) {
        var orgInfo = data.find(d => d.nombre.toLowerCase() === ap.organizacion.toLowerCase());
        if (orgInfo) {
            var linea = (index + 1) + ". " + orgInfo.nombre + " ";
            if (orgInfo.rangoEdad) {
                linea += "trabaja con personas, está enfocada en la " + orgInfo.rangoEdad;
                if (orgInfo.acogida) {
                    linea += " y tramita acogidas.";
                } else {
                    linea += " y no tramita acogidas.";
                }
            } else if (orgInfo.ambito || orgInfo.internacional) {
                linea += "trabaja con todo tipo de animales a nivel " + (orgInfo.ambito || orgInfo.internacional) + ".";
            }
            mensajePopup += linea + "\n";
        }
    });

    if (mensajePopup !== "") {
        alert(mensajePopup);
    }


    setTimeout(() => {
        if (outputTexto) outputTexto.innerText = "";
        if (output) output.innerHTML = "";

        var zonaDerecha = document.getElementById("zonaDerecha");
        if (zonaDerecha) zonaDerecha.innerHTML = "<h2>Resumen de Donaciones</h2>";

        window.listaAportaciones = [];

        if (modal) modal.remove();
    }, 10000);
    return resumenDonaciones;
};

