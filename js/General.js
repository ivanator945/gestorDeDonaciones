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
window.actualizarResumen = function() {
    const zona = document.getElementById("zonaDerecha");
    zona.innerHTML = "<h2>Resumen de Donaciones</h2>";

    if (window.listaAportaciones.length === 0) {
        zona.innerHTML += "<p>No hay donaciones registradas.</p>";
        return;
    }

    const ul = document.createElement("ul");
    window.listaAportaciones.forEach(d => {
        const li = document.createElement("li");
        const veces = d.numDonaciones > 1 ? "veces" : "vez";
        li.innerHTML = `<strong>${d.organizacion}</strong>: ${d.numDonaciones} ${veces} — ${d.cantidad.toFixed(2)} €`;
        li.style.color = d.organizacion === window.ultimaDonacion ? "green" : "black";
        ul.appendChild(li);
    });

    zona.appendChild(ul);
    zona.scrollTop = zona.scrollHeight;
};
window.enviarDonacionesAlServidor = function() {
    if (window.listaAportaciones.length === 0) return;

    const donacionesResumen = window.listaAportaciones.map(d => ({
        id: d.id,
        organizacion: d.organizacion,
        importeTotal: parseFloat(d.cantidad.toFixed(2)),
        numDonaciones: d.numDonaciones,
        cantidad: parseFloat((d.cantidad / d.numDonaciones).toFixed(2)),
        fecha: new Date().toISOString().split("T")[0],
        hora: new Date().toLocaleTimeString("es-ES", { hour12: false })
    }));

    const tramite = {
        id: Date.now(),
        fecha: new Date().toISOString().split("T")[0],
        donaciones: donacionesResumen
    };

    fetch("http://localhost:3000/tramiteDonacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tramiteDonacion: [tramite] })
    }).catch(() => {});
};

function configurarFormulario() {
    const form = document.getElementById("donacionForm");

    document.querySelectorAll('input[name="esSocio"]').forEach(radio => {
        radio.addEventListener("change", () => {
            const campo = document.getElementById("campoSocio");
            const inputCodigo = document.getElementById("codigoSocio");
            if (radio.value === "si") {
                campo.style.display = "block";
                inputCodigo.setAttribute("required", "required");
            } else {
                campo.style.display = "none";
                inputCodigo.removeAttribute("required");
                inputCodigo.value = "";
            }
        });
    });

    document.getElementById("btnLimpiar").addEventListener("click", () => {
        form.reset();
        document.getElementById("campoSocio").style.display = "none";
        document.getElementById("codigoSocio").removeAttribute("required");
        limpiarLabels();
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        limpiarLabels();

        const errores = [];

        if (!form.checkValidity()) {
            form.querySelectorAll("input").forEach(input => {
                if (!input.validity.valid) {
                    const label = document.querySelector(`label[for="${input.id}"]`);
                    if (label) label.style.color = "red";

                    if (input.validity.valueMissing) {
                        const nombreCampo = label ? .textContent.replace(":", "") || input.name;
                        errores.push(`• ${nombreCampo} es obligatorio`);
                    }
                    if (input.validity.tooShort || input.validity.tooLong) {
                        errores.push("• El nombre debe tener entre 4 y 15 caracteres");
                    }
                    if (input.validity.typeMismatch && input.type === "email") {
                        errores.push("• Formato de correo electrónico incorrecto");
                    }
                    if (input.validity.patternMismatch && input.id === "codigoSocio") {
                        errores.push("• Código de socio: 3 letras + 4 números + símbolo final (ej: Abc1234#)");
                    }
                }
            });

            if (!document.querySelector('input[name="metodoPago"]:checked')) {
                errores.push("• Debes seleccionar un método de pago");
            }

            alert("ERRORES EN EL FORMULARIO:\n\n" + errores.join("\n"));
            return;
        }

        abrirVentanaEmergente();
    });
}

function limpiarLabels() {
    document.querySelectorAll("label").forEach(l => l.style.color = "black");
}