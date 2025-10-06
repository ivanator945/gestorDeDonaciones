window.contarDonaciones = function () {
  let conteo = {};
  let totalDonado = 0;
  let aportaciones = window.listaAportaciones;
  if (!aportaciones) {
    aportaciones = [];
  }

  for (let i = 0; i < aportaciones.length; i++) {
    const aportacion = aportaciones[i];
    const nombre = aportacion.organizacion;
    const cantidad = aportacion.cantidad;
      if (!conteo[nombre]) {
        conteo[nombre] = { veces: 0, total: 0 };
      }
    conteo[nombre].veces = conteo[nombre].veces + 1;
    conteo[nombre].total = conteo[nombre].total + cantidad;
    totalDonado = totalDonado + cantidad;
  }

  return { conteo: conteo, totalDonado: totalDonado };
};
