const catalogo = document.getElementById("catalogo");
const modal = document.getElementById("modal");
const tituloProducto = document.getElementById("tituloProducto");
const precioProducto = document.getElementById("precioProducto");
const etiquetasProducto = document.getElementById("etiquetasProducto");
const empaqueProducto = document.getElementById("empaqueProducto");
const imagenGrande = document.getElementById("imagenGrande");
const indicadores = document.getElementById("indicadores");
const botonWhatsapp = document.getElementById("botonWhatsapp");
const carrusel = document.getElementById("carrusel");
const flechaIzquierda = document.querySelector(".flecha-izquierda");
const flechaDerecha = document.querySelector(".flecha-derecha");

let productos = [];
let productoActual = 0;
let fotoActual = 0;
let estadoModalAgregado = false;
let cambioBloqueado = false;

const cacheImagenes = new Map();
let gesto = null;

document.addEventListener("DOMContentLoaded", cargarProductos, { once: true });

async function cargarProductos() {
    if (!catalogo) return;
    catalogo.innerHTML = '<div class="mensaje-catalogo">Cargando catálogo...</div>';

    try {
        if (typeof supabaseClient === "undefined") throw new Error("No se pudo conectar con Supabase.");

        const { data, error } = await supabaseClient
            .from("productos")
            .select("id,titulo,precio,descripcion,etiquetas,imagenes,orden,posicion_x,posicion_y,created_at")
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) throw error;

        productos = (data || []).map(normalizarProducto);

        if (!productos.length) {
            catalogo.innerHTML = '<div class="mensaje-catalogo">No hay productos publicados todavía.</div>';
            return;
        }

        renderizarCatalogo();
        programarPrecargaGeneral();
    } catch (error) {
        console.error("ERROR CARGANDO CATÁLOGO:", error);
        catalogo.innerHTML = `<div class="mensaje-catalogo">No se pudo cargar el catálogo.<br><small>${escaparHTML(error.message || "Error de conexión")}</small></div>`;
    }
}

function normalizarProducto(producto) {
    return {
        id: producto.id,
        titulo: producto.titulo || "Vela Maile",
        precio: Number(producto.precio) || 0,
        etiquetas: convertirALista(producto.etiquetas),
        imagenes: convertirALista(producto.imagenes).filter(Boolean),
        empaque: producto.descripcion || "Sin especificar",
        orden: Number(producto.orden) || 0,
        posicion_x: limitarPorcentaje(producto.posicion_x ?? 50),
        posicion_y: limitarPorcentaje(producto.posicion_y ?? 50)
    };
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

function renderizarCatalogo() {
    catalogo.innerHTML = "";
    const fragmento = document.createDocumentFragment();
    let cantidad = 0;

    productos.forEach((producto, indice) => {
        if (!producto.imagenes.length) return;
        cantidad++;

        const publicacion = document.createElement("button");
        publicacion.type = "button";
        publicacion.className = "publicacion";
        publicacion.dataset.indice = indice;
        publicacion.setAttribute("aria-label", `Abrir ${producto.titulo}`);

        const foto = document.createElement("img");
        foto.className = "foto-producto";
        foto.src = producto.imagenes[0];
        foto.alt = producto.titulo;
        foto.loading = indice < 4 ? "eager" : "lazy";
        foto.decoding = "async";
        if (indice < 2) foto.fetchPriority = "high";
        foto.style.objectPosition = `${producto.posicion_x}% ${producto.posicion_y}%`;

        const logo = document.createElement("img");
        logo.className = "logo-marca";
        logo.src = "imagenes/logo-maile.webp";
        logo.alt = "";
        logo.decoding = "async";
        logo.setAttribute("aria-hidden", "true");

        const texto = document.createElement("span");
        texto.className = "ver-detalle";
        texto.textContent = "Toca para ver";

        publicacion.append(foto, logo, texto);
        fragmento.appendChild(publicacion);
    });

    catalogo.appendChild(fragmento);

    if (!cantidad) {
        catalogo.innerHTML = '<div class="mensaje-catalogo">No hay productos con fotografías.</div>';
    }
}

catalogo?.addEventListener("click", (evento) => {
    const publicacion = evento.target.closest(".publicacion");
    if (!publicacion) return;

    const indice = Number(publicacion.dataset.indice);
    if (Number.isNaN(indice)) return;

    abrirPublicacion(indice);
});

function abrirPublicacion(indice) {
    const producto = productos[indice];
    if (!producto || !modal) return;

    productoActual = indice;
    fotoActual = 0;

    tituloProducto.textContent = producto.titulo;
    precioProducto.textContent = formatearPrecio(producto.precio);
    empaqueProducto.textContent = producto.empaque;

    renderizarEtiquetas(producto.etiquetas);
    crearIndicadores();
    actualizarImagen(true);

    modal.style.display = "block";
    modal.scrollTop = 0;
    document.body.style.overflow = "hidden";

    // Precarga inmediatamente todas las demás fotos de ESTA publicación.
    precargarProducto(producto, true);

    if (!estadoModalAgregado) {
        try {
            history.pushState({ velasMaileModal: true }, "", window.location.href);
            estadoModalAgregado = true;
        } catch (_) {
            estadoModalAgregado = false;
        }
    }
}

function cerrarModal() {
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
    estadoModalAgregado = false;
    cambioBloqueado = false;
}

function volverCatalogo() {
    if (!modal || modal.style.display !== "block") return;
    if (estadoModalAgregado) history.back();
    else cerrarModal();
}

window.addEventListener("popstate", () => {
    if (modal && modal.style.display === "block") cerrarModal();
});

function renderizarEtiquetas(lista) {
    etiquetasProducto.innerHTML = "";
    const fragmento = document.createDocumentFragment();

    lista.forEach((etiqueta) => {
        const elemento = document.createElement("span");
        elemento.className = "etiqueta";
        elemento.textContent = etiqueta;
        fragmento.appendChild(elemento);
    });

    etiquetasProducto.appendChild(fragmento);
}

function actualizarImagen(inmediata = false) {
    const producto = productos[productoActual];
    if (!producto || !producto.imagenes.length) return;

    const url = producto.imagenes[fotoActual];

    imagenGrande.alt = `${producto.titulo} - Foto ${fotoActual + 1}`;
    imagenGrande.style.objectPosition = `${producto.posicion_x}% ${producto.posicion_y}%`;

    // Si ya está precargada, el cambio es prácticamente instantáneo.
    if (inmediata || cacheImagenes.has(url)) {
        imagenGrande.src = url;
    } else {
        precargarImagen(url, true).finally(() => {
            if (productos[productoActual]?.imagenes[fotoActual] === url) imagenGrande.src = url;
        });
    }

    // Precarga la foto siguiente y anterior con máxima prioridad.
    precargarVecinas(producto);

    actualizarIndicadores();
    actualizarFlechas();
    actualizarWhatsapp(producto);
}

function cambiarFoto(nuevoIndice) {
    const producto = productos[productoActual];
    if (!producto || cambioBloqueado) return;
    if (nuevoIndice < 0 || nuevoIndice >= producto.imagenes.length || nuevoIndice === fotoActual) return;

    cambioBloqueado = true;
    fotoActual = nuevoIndice;
    actualizarImagen();

    // Evita dobles saltos accidentales, pero sin hacer sentir lento el carrusel.
    window.setTimeout(() => {
        cambioBloqueado = false;
    }, 120);
}

function fotoSiguiente() {
    cambiarFoto(fotoActual + 1);
}

function fotoAnterior() {
    cambiarFoto(fotoActual - 1);
}

function actualizarFlechas() {
    const producto = productos[productoActual];
    if (!producto) return;

    if (flechaIzquierda) {
        const primera = fotoActual === 0;
        flechaIzquierda.disabled = primera;
        flechaIzquierda.style.opacity = primera ? ".3" : "1";
    }

    if (flechaDerecha) {
        const ultima = fotoActual === producto.imagenes.length - 1;
        flechaDerecha.disabled = ultima;
        flechaDerecha.style.opacity = ultima ? ".3" : "1";
    }
}

function crearIndicadores() {
    indicadores.innerHTML = "";
    const producto = productos[productoActual];
    if (!producto) return;

    const fragmento = document.createDocumentFragment();

    producto.imagenes.forEach((_, indice) => {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.className = "punto";
        punto.setAttribute("aria-label", `Ver foto ${indice + 1}`);
        punto.addEventListener("click", () => cambiarFoto(indice));
        fragmento.appendChild(punto);
    });

    indicadores.appendChild(fragmento);
    actualizarIndicadores();
}

function actualizarIndicadores() {
    indicadores.querySelectorAll(".punto").forEach((punto, indice) => {
        punto.classList.toggle("activo", indice === fotoActual);
    });
}

function actualizarWhatsapp(producto) {
    const foto = producto.imagenes[fotoActual];
    const categorias = producto.etiquetas.length ? producto.etiquetas.join(", ") : "";

    let mensaje = `Hola, vi el catálogo de Velas Maile y estoy interesada en:\n\n🕯️ ${producto.titulo}\n\n💰 Precio por docena:\n${formatearPrecio(producto.precio)}\n\n📦 Empaque:\n${producto.empaque}`;
    if (categorias) mensaje += `\n\n🏷️ Categoría:\n${categorias}`;
    mensaje += `\n\n📷 Esta es la vela que estoy viendo:\n${foto}\n\n¿Me puedes dar más información?`;

    botonWhatsapp.href = "https://wa.me/573008866132?text=" + encodeURIComponent(mensaje);
}

function precargarImagen(url, prioridadAlta = false) {
    if (!url) return Promise.resolve();
    if (cacheImagenes.has(url)) return cacheImagenes.get(url);

    const promesa = new Promise((resolve) => {
        const img = new Image();
        img.decoding = "async";
        if (prioridadAlta) img.fetchPriority = "high";
        img.onload = async () => {
            try {
                if (img.decode) await img.decode();
            } catch (_) {}
            resolve();
        };
        img.onerror = resolve;
        img.src = url;
    });

    cacheImagenes.set(url, promesa);
    return promesa;
}

function precargarVecinas(producto) {
    const anterior = producto.imagenes[fotoActual - 1];
    const siguiente = producto.imagenes[fotoActual + 1];
    if (siguiente) precargarImagen(siguiente, true);
    if (anterior) precargarImagen(anterior, true);
}

function precargarProducto(producto, prioridadAlta = false) {
    producto.imagenes.forEach((url, indice) => {
        // La primera ya suele estar en caché por la miniatura.
        if (indice > 0) precargarImagen(url, prioridadAlta && indice <= 2);
    });
}

function programarPrecargaGeneral() {
    const tarea = () => {
        // Primero las publicaciones iniciales; luego el resto sin bloquear la interfaz.
        productos.slice(0, 8).forEach((producto) => precargarProducto(producto, false));

        window.setTimeout(() => {
            productos.slice(8).forEach((producto) => precargarProducto(producto, false));
        }, 1200);
    };

    if ("requestIdleCallback" in window) {
        requestIdleCallback(tarea, { timeout: 1800 });
    } else {
        window.setTimeout(tarea, 700);
    }
}

// Gesto más preciso y rápido que touchstart/touchend.
if (carrusel) {
    carrusel.addEventListener("pointerdown", (evento) => {
        if (!evento.isPrimary) return;
        gesto = {
            id: evento.pointerId,
            x: evento.clientX,
            y: evento.clientY,
            tiempo: performance.now()
        };

        try {
            carrusel.setPointerCapture(evento.pointerId);
        } catch (_) {}
    });

    carrusel.addEventListener("pointerup", (evento) => {
        if (!gesto || gesto.id !== evento.pointerId) return;

        const dx = evento.clientX - gesto.x;
        const dy = evento.clientY - gesto.y;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        const ancho = carrusel.clientWidth || 320;
        const umbral = Math.max(24, ancho * 0.065);

        gesto = null;

        // Solo cuenta como swipe si el movimiento es claramente horizontal.
        if (ax < umbral || ax <= ay * 1.15) return;

        if (dx < 0) fotoSiguiente();
        else fotoAnterior();
    });

    carrusel.addEventListener("pointercancel", () => {
        gesto = null;
    });
}

document.addEventListener("keydown", (evento) => {
    if (!modal || modal.style.display !== "block") return;
    if (evento.key === "Escape") volverCatalogo();
    if (evento.key === "ArrowLeft") fotoAnterior();
    if (evento.key === "ArrowRight") fotoSiguiente();
});

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
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
