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
