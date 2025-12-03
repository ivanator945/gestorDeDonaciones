window.listaAportaciones = [];
window.ultimaDonacion = null;

document.addEventListener("DOMContentLoaded", async() => {
    const zonaPrincipal = document.getElementById("zonaPrincipal");

    const tablaAntigua = zonaPrincipal.querySelector("table");
    if (tablaAntigua) tablaAntigua.remove();

    const tabla = document.createElement("table");
    let fila = document.createElement("tr");
    let columnas = 0;

    try {
        const respuesta = await fetch("http://localhost:3000/organizaciones");
        const organizaciones = await respuesta.json();

        organizaciones.forEach(org => {
            if (columnas === 5) {
                tabla.appendChild(fila);
                fila = document.createElement("tr");
                columnas = 0;
            }

            const celda = document.createElement("td");

            const img = document.createElement("img");
            img.src = org.imagen;
            img.alt = org.nombre;
            img.title = "Click para donar";

            const nombreDiv = document.createElement("div");
            nombreDiv.textContent = org.nombre;
            nombreDiv.style.fontWeight = "bold";
            nombreDiv.style.margin = "8px 0";

            const inputDiv = document.createElement("div");
            const input = document.createElement("input");
            input.type = "number";
            input.min = "0";
            input.step = "0.01";
            input.placeholder = "€";
            input.classList.add("donacionInput");
            input.dataset.org = org.nombre;
            input.id = String(org.id);

            inputDiv.appendChild(input);

            celda.appendChild(img);
            celda.appendChild(nombreDiv);
            celda.appendChild(inputDiv);
            fila.appendChild(celda);
            columnas++;
        });

        if (columnas > 0) tabla.appendChild(fila);
        zonaPrincipal.appendChild(tabla);

        activarEventosDonacion();

    } catch (error) {
        zonaPrincipal.innerHTML = "<p>Error al cargar las organizaciones.</p>";
    }

    configurarFormulario();
});

function activarEventosDonacion() {
    document.querySelectorAll("img[alt]").forEach(img => {
        img.addEventListener("click", () => {
            const nombre = img.alt;
            const input = document.querySelector(`.donacionInput[data-org="${nombre}"]`);
            const cantidad = parseFloat(input.value) || 0;

            if (cantidad <= 0) {
                alert("Introduce una cantidad válida mayor que 0");
                return;
            }

            window.ultimaDonacion = nombre;

            const existente = window.listaAportaciones.find(d => d.organizacion === nombre);
            if (existente) {
                existente.cantidad += cantidad;
                existente.numDonaciones++;
            } else {
                window.listaAportaciones.push({
                    id: parseInt(input.id),
                    organizacion: nombre,
                    cantidad: cantidad,
                    numDonaciones: 1
                });
            }

            input.value = "";
            actualizarResumen();
        });
    });
}