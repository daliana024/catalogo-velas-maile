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

document.querySelectorAll(".opcion-categoria").forEach((boton) => {
    boton.addEventListener("click", () => {
        const valor = boton.dataset.valor;
        if (categoriasSeleccionadas.includes(valor)) {
            categoriasSeleccionadas = categoriasSeleccionadas.filter((categoria) => categoria !== valor);
            boton.classList.remove("seleccionada");
        } else {
            categoriasSeleccionadas.push(valor);
            boton.classList.add("seleccionada");
        }
    });
});

document.querySelectorAll(".opcion-empaque").forEach((boton) => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".opcion-empaque").forEach((otro) => otro.classList.remove("seleccionada"));
        boton.classList.add("seleccionada");
        empaqueSeleccionado = boton.dataset.valor;
    });
});

async function comprobarSesion() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        if (data?.session) mostrarAdmin();
        else mostrarLogin();
    } catch (error) {
        console.error("Error comprobando sesión:", error);
        mostrarLogin();
    }
}

loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const email = document.getElementById("correo").value.trim();
    const password = document.getElementById("contrasena").value;
    mensajeLogin.textContent = "Ingresando...";

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        console.error("Error de inicio de sesión:", error);
        mensajeLogin.textContent = "Correo o contraseña incorrectos.";
        return;
    }

    mensajeLogin.textContent = "";
    loginForm.reset();
    mostrarAdmin();
});

cerrarSesion.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    mostrarLogin();
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

fotosInput.addEventListener("change", () => {
    mostrarPreviewCompleto();
    actualizarImagenPrincipal();
});

function mostrarPreviewCompleto() {
    previewFotos.innerHTML = "";
    imagenesActuales.forEach((url, indice) => agregarPreviewExistente(url, indice));
    Array.from(fotosInput.files).forEach((archivo, indice) => agregarPreviewNueva(archivo, indice));
}

function agregarPreviewExistente(url, indice) {
    const contenedor = document.createElement("div");
    contenedor.className = "preview-foto";

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Foto del producto";

    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "eliminar-foto";
    eliminar.textContent = "×";
    eliminar.setAttribute("aria-label", "Eliminar foto");
    eliminar.addEventListener("click", () => {
        imagenesActuales.splice(indice, 1);
        mostrarPreviewCompleto();
        actualizarImagenPrincipal();
    });

    contenedor.append(img, eliminar);
    previewFotos.appendChild(contenedor);
}

function agregarPreviewNueva(archivo, indice) {
    const contenedor = document.createElement("div");
    contenedor.className = "preview-foto";

    const url = URL.createObjectURL(archivo);
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Nueva foto";
    img.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });

    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "eliminar-foto";
    eliminar.textContent = "×";
    eliminar.setAttribute("aria-label", "Eliminar foto");
    eliminar.addEventListener("click", () => eliminarFotoNueva(indice));

    contenedor.append(img, eliminar);
    previewFotos.appendChild(contenedor);
}

function eliminarFotoNueva(indice) {
    const archivos = Array.from(fotosInput.files);
    archivos.splice(indice, 1);

    const transferencia = new DataTransfer();
    archivos.forEach((archivo) => transferencia.items.add(archivo));
    fotosInput.files = transferencia.files;

    mostrarPreviewCompleto();
    actualizarImagenPrincipal();
}

function actualizarImagenPrincipal() {
    if (urlTemporalPrincipal) {
        URL.revokeObjectURL(urlTemporalPrincipal);
        urlTemporalPrincipal = null;
    }

    const nuevasFotos = Array.from(fotosInput.files);

    if (imagenesActuales.length) {
        previewPrincipal.src = imagenesActuales[0];
        previewPrincipal.style.display = "block";
    } else if (nuevasFotos.length) {
        urlTemporalPrincipal = URL.createObjectURL(nuevasFotos[0]);
        previewPrincipal.src = urlTemporalPrincipal;
        previewPrincipal.style.display = "block";
    } else {
        previewPrincipal.removeAttribute("src");
        previewPrincipal.style.display = "none";
    }

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

restablecerPosicion.addEventListener("click", () => {
    posicionXInput.value = 50;
    posicionYInput.value = 50;
    actualizarPosicionPreview();
});

productoForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    mensajeProducto.textContent = "Guardando producto...";

    if (!categoriasSeleccionadas.length) {
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

    if (!titulo) {
        mensajeProducto.textContent = "Escribe el título del producto.";
        return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
        mensajeProducto.textContent = "Escribe un precio válido.";
        return;
    }

    let urlsImagenes = [...imagenesActuales];
    const nuevasFotos = Array.from(fotosInput.files);

    if (nuevasFotos.length) {
        const urlsNuevas = await subirFotos(nuevasFotos);
        if (!urlsNuevas) return;
        urlsImagenes = [...urlsImagenes, ...urlsNuevas];
    }

    if (!urlsImagenes.length) {
        mensajeProducto.textContent = "Debes agregar al menos una fotografía.";
        return;
    }

    const datos = {
        titulo,
        precio,
        descripcion: empaqueSeleccionado,
        etiquetas: categoriasSeleccionadas,
        imagenes: urlsImagenes,
        orden,
        posicion_x,
        posicion_y
    };

    const resultado = productoId
        ? await supabaseClient.from("productos").update(datos).eq("id", productoId)
        : await supabaseClient.from("productos").insert([datos]);

    if (resultado.error) {
        console.error("ERROR SUPABASE:", resultado.error);
        mensajeProducto.textContent = "No se pudo guardar: " + (resultado.error.message || "Error desconocido");
        return;
    }

    mensajeProducto.textContent = productoId ? "Producto actualizado correctamente." : "Producto publicado correctamente.";
    limpiarFormulario();
    await cargarProductos();
});

async function subirFotos(archivos) {
    const urls = [];

    for (const archivo of archivos) {
        const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase();
        const nombre = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const ruta = `catalogo/${nombre}`;

        const { error } = await supabaseClient.storage
            .from("productos")
            .upload(ruta, archivo, { cacheControl: "3600", upsert: false });

        if (error) {
            console.error("ERROR STORAGE:", error);
            mensajeProducto.textContent = "Error subiendo imagen: " + (error.message || "Storage rechazó el archivo.");
            return null;
        }

        const { data } = supabaseClient.storage.from("productos").getPublicUrl(ruta);
        if (data?.publicUrl) urls.push(data.publicUrl);
    }

    return urls;
}

async function cargarProductos() {
    listaProductos.innerHTML = "<p>Cargando productos...</p>";

    const { data, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("orden", { ascending: true })
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error cargando productos:", error);
        listaProductos.innerHTML = "<p>No se pudieron cargar los productos.</p>";
        return;
    }

    listaProductos.innerHTML = "";

    if (!data?.length) {
        listaProductos.innerHTML = "<p>No hay productos publicados todavía.</p>";
        return;
    }

    data.forEach((producto) => {
        const imagenes = convertirALista(producto.imagenes);
        const x = limitarPorcentaje(producto.posicion_x ?? 50);
        const y = limitarPorcentaje(producto.posicion_y ?? 50);
        const empaque = producto.descripcion || producto.empaque || "Sin empaque";

        const item = document.createElement("article");
        item.className = "producto-admin";
        item.innerHTML = `
            <div class="producto-miniatura">
                <img src="${escaparAtributo(imagenes[0] || "")}" alt="" style="object-position:${x}% ${y}%;">
                <img class="producto-logo-mini" src="imagenes/logo-maile.png" alt="">
            </div>
            <div>
                <h3></h3>
                <p class="precio"></p>
                <p class="empaque-mini"></p>
                <div class="acciones-producto">
                    <button type="button" class="editar">Editar</button>
                    <button type="button" class="eliminar">Eliminar</button>
                </div>
            </div>`;

        item.querySelector("h3").textContent = producto.titulo || "Vela Maile";
        item.querySelector(".precio").textContent = formatearPrecio(producto.precio);
        item.querySelector(".empaque-mini").textContent = empaque;
        item.querySelector(".editar").addEventListener("click", () => editarProducto(producto));
        item.querySelector(".eliminar").addEventListener("click", () => eliminarProducto(producto));
        listaProductos.appendChild(item);
    });
}

function editarProducto(producto) {
    document.getElementById("productoId").value = producto.id;
    document.getElementById("titulo").value = producto.titulo || "";
    document.getElementById("precio").value = producto.precio || "";
    document.getElementById("orden").value = producto.orden || 0;

    categoriasSeleccionadas = convertirALista(producto.etiquetas);
    document.querySelectorAll(".opcion-categoria").forEach((boton) => {
        boton.classList.toggle("seleccionada", categoriasSeleccionadas.includes(boton.dataset.valor));
    });

    empaqueSeleccionado = producto.descripcion || producto.empaque || "";
    document.querySelectorAll(".opcion-empaque").forEach((boton) => {
        boton.classList.toggle("seleccionada", boton.dataset.valor === empaqueSeleccionado);
    });

    imagenesActuales = convertirALista(producto.imagenes);
    posicionXInput.value = limitarPorcentaje(producto.posicion_x ?? 50);
    posicionYInput.value = limitarPorcentaje(producto.posicion_y ?? 50);
    fotosInput.value = "";

    mostrarPreviewCompleto();
    actualizarImagenPrincipal();
    guardarProducto.textContent = "Guardar cambios";
    cancelarEdicion.classList.remove("oculto");
    mensajeProducto.textContent = "Editando producto.";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarProducto(producto) {
    if (!confirm(`¿Seguro que quieres eliminar "${producto.titulo}"?`)) return;

    const { error } = await supabaseClient.from("productos").delete().eq("id", producto.id);
    if (error) {
        console.error("Error eliminando producto:", error);
        alert("No se pudo eliminar el producto.");
        return;
    }

    await cargarProductos();
}

cancelarEdicion.addEventListener("click", () => {
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

    document.querySelectorAll(".opcion-categoria, .opcion-empaque").forEach((boton) => boton.classList.remove("seleccionada"));
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
        } catch (_) {
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

function escaparAtributo(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/\"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
