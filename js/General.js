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
    const campoSocio = document.getElementById("campoSocio");
    const inputCodigoSocio = document.getElementById("codigoSocio");


    document.querySelectorAll('input[name="esSocio"]').forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "si") {
                campoSocio.style.display = "block";
                inputCodigoSocio.required = true;
            } else {
                campoSocio.style.display = "none";
                inputCodigoSocio.required = false;
                inputCodigoSocio.value = "";
            }
        });
    });


    document.getElementById("btnLimpiar").addEventListener("click", () => {
        form.reset();
        campoSocio.style.display = "none";
        inputCodigoSocio.required = false;
        limpiarLabels();
    });


    form.addEventListener("submit", function(e) {
        e.preventDefault();
        limpiarLabels();

        const errores = [];


        form.querySelectorAll("input").forEach(input => {
            if (!input.validity.valid) {

                const label = document.querySelector(`label[for="${input.id}"]`);
                const nombreCampo = label ? label.textContent.replace(":", "") : input.name;

                if (label) label.style.color = "red";

                if (input.validity.valueMissing) {
                    errores.push("• " + nombreCampo + " es obligatorio");
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


        if (errores.length > 0) {
            alert("ERRORES EN EL FORMULARIO:\n\n" + errores.join("\n"));
            return;
        }


        abrirVentanaEmergente();
    });
}

function limpiarLabels() {
    document.querySelectorAll("label").forEach(l => l.style.color = "black");
}

function abrirVentanaEmergente() {
    const popup = window.open("", "resumenDonacion", "width=500,height=350,toolbar=no,location=no,scrollbars=yes,resizable=yes");
    const doc = popup.document;
    doc.open();
    doc.write("<!DOCTYPE html><html><head><meta charset='utf-8'><title>Resumen de Donación</title></head><body></body></html>");
    doc.close();

    const style = doc.createElement("style");
    style.textContent = `
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f9ff; color: #1e293b; }
        h2 { color: #1e40af; text-align: center; margin-bottom: 20px; }
        p { margin: 10px 0; font-size: 1.1em; }
        ul { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        li { margin: 8px 0; padding: 8px; background: #ecfdf5; border-radius: 6px; }
        .botones { text-align: center; margin-top: 25px; }
        button { padding: 12px 28px; margin: 0 10px; border: none; border-radius: 8px; font-size: 1.1em; cursor: pointer; transition: 0.2s; }
        #volver { background: #ef4444; color: white; }
        #terminar { background: #10b981; color: white; }
        button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
    `;
    doc.head.appendChild(style);

    const body = doc.body;

    const titulo = doc.createElement("h2");
    titulo.textContent = "Resumen Final del Trámite";
    body.appendChild(titulo);

    const fecha = doc.createElement("p");
    fecha.innerHTML = `<strong>Fecha:</strong> ${new Date().toLocaleString()}`;
    body.appendChild(fecha);

    const totalDonado = window.listaAportaciones.reduce((sum, d) => sum + d.cantidad, 0).toFixed(2);
    const totalP = doc.createElement("p");
    totalP.innerHTML = `<strong>Total donado:</strong> ${totalDonado} €`;
    body.appendChild(totalP);

    const listaTitulo = doc.createElement("p");
    listaTitulo.innerHTML = "<strong>Donaciones realizadas:</strong>";
    body.appendChild(listaTitulo);

    const ul = doc.createElement("ul");
    window.listaAportaciones.forEach(d => {
        const li = doc.createElement("li");
        const veces = d.numDonaciones > 1 ? "veces" : "vez";
        li.innerHTML = `<strong>${d.organizacion}</strong>: ${d.cantidad.toFixed(2)}€ (${d.numDonaciones} ${veces})`;
        ul.appendChild(li);
    });
    body.appendChild(ul);

    const divBotones = doc.createElement("div");
    divBotones.className = "botones";

    const btnVolver = doc.createElement("button");
    btnVolver.id = "volver";
    btnVolver.textContent = "Volver";
    btnVolver.onclick = () => popup.close();

    const btnTerminar = doc.createElement("button");
    btnTerminar.id = "terminar";
    btnTerminar.textContent = "Terminar Pedido";
    btnTerminar.onclick = () => {
        window.finalizarPedido();
        popup.close();
    };

    divBotones.appendChild(btnVolver);
    divBotones.appendChild(btnTerminar);
    body.appendChild(divBotones);
}

window.finalizarPedido = function() {
    enviarDonacionesAlServidor();

    window.listaAportaciones = [];
    window.ultimaDonacion = null;
    actualizarResumen();

    document.getElementById("donacionForm").reset();
    document.getElementById("campoSocio").style.display = "none";
    document.getElementById("codigoSocio").removeAttribute("required");

    alert("Donación realizada correctamente. ¡Gracias por tu solidaridad!");
};