window.mostrarTexto = function () {
  let resumenDonaciones = window.contarDonaciones();
  let conteoPorOrganizacion = resumenDonaciones.conteo;
  let totalDonado = resumenDonaciones.totalDonado;

  let listaNombres = [];
  for (let nombreOrganizacion in conteoPorOrganizacion) {
    listaNombres.push(nombreOrganizacion);
  }
  listaNombres.sort().reverse();

  let resultado = "";

  for (let nombre of listaNombres) {
    let datos = conteoPorOrganizacion[nombre];

    let palabraAportacion = datos.veces > 1 ? "aportaciones" : "aportación";

    resultado +=
    nombre + " ---- " + datos.veces + " " + palabraAportacion + "<br>";

  }

  var donacionMedia = 0;
  if (window.listaAportaciones.length > 0) {
  
    donacionMedia = Math.round((totalDonado / window.listaAportaciones.length) * 100) / 100;
  }
  resultado += "<br>Donación final: " + totalDonado + " €<br>";
  resultado += "Donación media: " + donacionMedia + " €/aportación";

  document.getElementById("output").innerHTML = resultado;
    
}