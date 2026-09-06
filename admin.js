const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const mensajeLogin = document.getElementById("mensajeLogin");
const productoForm = document.getElementById("productoForm");
const mensajeProducto = document.getElementById("mensajeProducto");
const listaProductos = document.getElementById("listaProductos");
const previewFotos = document.getElementById("previewFotos");
const fotosInput = document.getElementById("fotos");
const cancelarEdicion = document.getElementById("cancelarEdicion");
const guardarProducto = document.getElementById("guardarProducto");
const cerrarSesion = document.getElementById("cerrarSesion");
const posicionXInput = document.getElementById("posicionX");
const posicionYInput = document.getElementById("posicionY");
const valorPosicionX = document.getElementById("valorPosicionX");
const valorPosicionY = document.getElementById("valorPosicionY");
const previewPrincipal = document.getElementById("previewPrincipal");
const restablecerPosicion = document.getElementById("restablecerPosicion");

let imagenesActuales = [];
let categoriasSeleccionadas = [];
let empaqueSeleccionado = "";
let urlTemporalPrincipal = null;

document.addEventListener("DOMContentLoaded", comprobarSesion);

document.querySelectorAll(".opcion-categoria").forEach(function (boton) {
    boton.addEventListener("click", function () {
        const valor = boton.dataset.valor;

        if (categoriasSeleccionadas.includes(valor)) {
            categoriasSeleccionadas = categoriasSeleccionadas.filter(function (categoria) {
                return categoria !== valor;
            });
            boton.classList.remove("seleccionada");
        } else {
            categoriasSeleccionadas.push(valor);
            boton.classList.add("seleccionada");
        }
    });
});

document.querySelectorAll(".opcion-empaque").forEach(function (boton) {
    boton.addEventListener("click", function () {
        document.querySelectorAll(".opcion-empaque").forEach(function (otro) {
            otro.classList.remove("seleccionada");
        });
        boton.classList.add("seleccionada");
        empaqueSeleccionado = boton.dataset.valor;
    });
});

async function comprobarSesion() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (data.session) mostrarAdmin();
        else mostrarLogin();
    } catch (error) {
        console.error("Error comprobando sesión:", error);
        mostrarLogin();
    }
}

loginForm.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const email = document.getElementById("correo").value.trim();
    const password = document.getElementById("contrasena").value;
    mensajeLogin.textContent = "Ingresando...";

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        mensajeLogin.textContent = "";
        loginForm.reset();
        mostrarAdmin();
    } catch (error) {
        console.error("Error de inicio de sesión:", error);
        mensajeLogin.textContent = "Correo o contraseña incorrectos.";
    }
});

cerrarSesion.addEventListener("click", async function () {
    try {
        await supabaseClient.auth.signOut();
    } finally {
        mostrarLogin();
    }
});

function mostrarAdmin() {
    loginPanel.classList.add("oculto");
    adminPanel.classList.remove("oculto");
    cargarProductos();
}

function mostrarLogin() {
    adminPanel.classList.add("oculto");
    loginPanel.classList.remove("oculto");
}

fotosInput.addEventListener("change", function () {
    mostrarPreviewCompleto();
    actualizarImagenPrincipalDesdeFormulario();
});

function mostrarPreviewCompleto() {
    previewFotos.innerHTML = "";

    imagenesActuales.forEach(function (url) {
        agregarPreview(url);
    });

    Array.from(fotosInput.files).forEach(function (archivo) {
        agregarPreview(URL.createObjectURL(archivo));
    });
}

function agregarPreview(url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Foto del producto";
    previewFotos.appendChild(img);
}

function actualizarImagenPrincipalDesdeFormulario() {
    if (urlTemporalPrincipal) {
        URL.revokeObjectURL(urlTemporalPrincipal);
        urlTemporalPrincipal = null;
    }

    const archivos = Array.from(fotosInput.files);

    if (imagenesActuales.length > 0) {
        establecerPreviewPrincipal(imagenesActuales[0]);
        return;
    }

    if (archivos.length > 0) {
        urlTemporalPrincipal = URL.createObjectURL(archivos[0]);
        establecerPreviewPrincipal(urlTemporalPrincipal);
        return;
    }

    previewPrincipal.removeAttribute("src");
    previewPrincipal.style.display = "none";
}

function establecerPreviewPrincipal(url) {
    previewPrincipal.src = url;
    previewPrincipal.style.display = "block";
    actualizarPosicionPreview();
}

posicionXInput.addEventListener("input", actualizarPosicionPreview);
posicionYInput.addEventListener("input", actualizarPosicionPreview);

function actualizarPosicionPreview() {
    const x = limitarPorcentaje(posicionXInput.value);
    const y = limitarPorcentaje(posicionYInput.value);

    valorPosicionX.textContent = `${x}%`;
    valorPosicionY.textContent = `${y}%`;
    previewPrincipal.style.objectPosition = `${x}% ${y}%`;
}

restablecerPosicion.addEventListener("click", function () {
    posicionXInput.value = 50;
    posicionYInput.value = 50;
    actualizarPosicionPreview();
});

productoForm.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    mensajeProducto.textContent = "Guardando producto...";

    if (categoriasSeleccionadas.length === 0) {
        mensajeProducto.textContent = "Selecciona al menos una categoría.";
        return;
    }

    if (!empaqueSeleccionado) {
        mensajeProducto.textContent = "Selecciona un empaque.";
        return;
    }

    const productoId = document.getElementById("productoId").value;
    const titulo = document.getElementById("titulo").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const orden = Number(document.getElementById("orden").value) || 0;
    const posicion_x = limitarPorcentaje(posicionXInput.value);
    const posicion_y = limitarPorcentaje(posicionYInput.value);

    let urlsImagenes = [...imagenesActuales];
    const nuevasFotos = Array.from(fotosInput.files);

    if (nuevasFotos.length > 0) {
        const urlsNuevas = await subirFotos(nuevasFotos);
        if (!urlsNuevas) {
            mensajeProducto.textContent = "No se pudieron subir las fotos.";
            return;
        }
        urlsImagenes = [...urlsImagenes, ...urlsNuevas];
    }

    if (urlsImagenes.length === 0) {
        mensajeProducto.textContent = "Debes agregar al menos una fotografía.";
        return;
    }

    const datos = {
        titulo,
        precio,
        etiquetas: categoriasSeleccionadas,
        descripcion: empaqueSeleccionado,
        imagenes: urlsImagenes,
        orden,
        posicion_x,
        posicion_y
    };

    try {
        let resultado;

        if (productoId) {
            resultado = await supabaseClient.from("productos").update(datos).eq("id", productoId);
        } else {
            resultado = await supabaseClient.from("productos").insert([datos]);
        }

        if (resultado.error) throw resultado.error;

        mensajeProducto.textContent = productoId
            ? "Producto actualizado correctamente."
            : "Producto publicado correctamente.";

        limpiarFormulario();
        await cargarProductos();
    } catch (error) {
        console.error("Error guardando producto:", error);
        mensajeProducto.textContent = "No se pudo guardar. " + (error.message || "Revisa Supabase.");
    }
});

async function subirFotos(archivos) {
    const urls = [];

    for (const archivo of archivos) {
        const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase();
        const nombre = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const ruta = `catalogo/${nombre}`;

        const { error: errorSubida } = await supabaseClient.storage
            .from("productos")
            .upload(ruta, archivo, { cacheControl: "3600", upsert: false });

        if (errorSubida) {
            console.error("Error subiendo foto:", errorSubida);
            return null;
        }

        const { data } = supabaseClient.storage.from("productos").getPublicUrl(ruta);
        if (data && data.publicUrl) urls.push(data.publicUrl);
    }

    return urls;
}

async function cargarProductos() {
    listaProductos.innerHTML = "<p>Cargando productos...</p>";

    try {
        const { data, error } = await supabaseClient
            .from("productos")
            .select("*")
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) throw error;

        listaProductos.innerHTML = "";

        if (!data || data.length === 0) {
            listaProductos.innerHTML = "<p>No hay productos publicados todavía.</p>";
            return;
        }

        data.forEach(function (producto) {
            const imagenes = convertirALista(producto.imagenes);
            const imagenPrincipal = imagenes[0] || "";
            const x = limitarPorcentaje(producto.posicion_x ?? 50);
            const y = limitarPorcentaje(producto.posicion_y ?? 50);
            const empaque = producto.empaque || producto.descripcion || "Sin empaque";

            const item = document.createElement("article");
            item.className = "producto-admin";

            const miniatura = document.createElement("div");
            miniatura.className = "producto-miniatura";

            const img = document.createElement("img");
            img.src = imagenPrincipal;
            img.alt = producto.titulo || "Producto";
            img.style.objectPosition = `${x}% ${y}%`;

            const logo = document.createElement("img");
            logo.className = "producto-logo-mini";
            logo.src = "imagenes/logo-maile.png";
            logo.alt = "";

            miniatura.appendChild(img);
            miniatura.appendChild(logo);

            const info = document.createElement("div");
            info.innerHTML = `
                <h3>${escaparHTML(producto.titulo || "Vela Maile")}</h3>
                <p class="precio">${formatearPrecio(producto.precio)}</p>
                <p class="empaque-mini">${escaparHTML(empaque)}</p>
                <div class="acciones-producto">
                    <button class="editar" type="button">Editar</button>
                    <button class="eliminar" type="button">Eliminar</button>
                </div>
            `;

            info.querySelector(".editar").addEventListener("click", function () {
                editarProducto(producto);
            });

            info.querySelector(".eliminar").addEventListener("click", function () {
                eliminarProducto(producto);
            });

            item.appendChild(miniatura);
            item.appendChild(info);
            listaProductos.appendChild(item);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        listaProductos.innerHTML = "<p>No se pudieron cargar los productos.</p>";
    }
}

function editarProducto(producto) {
    document.getElementById("productoId").value = producto.id;
    document.getElementById("titulo").value = producto.titulo || "";
    document.getElementById("precio").value = producto.precio || "";
    document.getElementById("orden").value = producto.orden || 0;

    categoriasSeleccionadas = convertirALista(producto.etiquetas);
    document.querySelectorAll(".opcion-categoria").forEach(function (boton) {
        boton.classList.toggle("seleccionada", categoriasSeleccionadas.includes(boton.dataset.valor));
    });

    empaqueSeleccionado = producto.empaque || producto.descripcion || "";
    document.querySelectorAll(".opcion-empaque").forEach(function (boton) {
        boton.classList.toggle("seleccionada", boton.dataset.valor === empaqueSeleccionado);
    });

    imagenesActuales = convertirALista(producto.imagenes);
    posicionXInput.value = limitarPorcentaje(producto.posicion_x ?? 50);
    posicionYInput.value = limitarPorcentaje(producto.posicion_y ?? 50);
    fotosInput.value = "";

    mostrarPreviewCompleto();
    actualizarImagenPrincipalDesdeFormulario();
    actualizarPosicionPreview();

    guardarProducto.textContent = "Guardar cambios";
    cancelarEdicion.classList.remove("oculto");
    mensajeProducto.textContent = "Editando producto.";

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarProducto(producto) {
    if (!confirm(`¿Seguro que quieres eliminar "${producto.titulo}"?`)) return;

    try {
        const { error } = await supabaseClient.from("productos").delete().eq("id", producto.id);
        if (error) throw error;
        await cargarProductos();
    } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("No se pudo eliminar el producto.");
    }
}

cancelarEdicion.addEventListener("click", function () {
    limpiarFormulario();
    mensajeProducto.textContent = "";
});

function limpiarFormulario() {
    productoForm.reset();
    document.getElementById("productoId").value = "";
    document.getElementById("orden").value = 0;

    categoriasSeleccionadas = [];
    empaqueSeleccionado = "";
    imagenesActuales = [];
    fotosInput.value = "";
    posicionXInput.value = 50;
    posicionYInput.value = 50;

    document.querySelectorAll(".opcion-categoria, .opcion-empaque").forEach(function (boton) {
        boton.classList.remove("seleccionada");
    });

    previewFotos.innerHTML = "";

    if (urlTemporalPrincipal) {
        URL.revokeObjectURL(urlTemporalPrincipal);
        urlTemporalPrincipal = null;
    }

    previewPrincipal.removeAttribute("src");
    previewPrincipal.style.display = "none";
    actualizarPosicionPreview();

    guardarProducto.textContent = "Publicar producto";
    cancelarEdicion.classList.add("oculto");
}

function convertirALista(valor) {
    if (Array.isArray(valor)) return valor;
    if (!valor) return [];

    if (typeof valor === "string") {
        try {
            const convertido = JSON.parse(valor);
            if (Array.isArray(convertido)) return convertido;
        } catch (error) {
            return [valor];
        }
    }

    return [];
}

function limitarPorcentaje(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return 50;
    return Math.max(0, Math.min(100, numero));
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(precio));
}

function escaparHTML(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
