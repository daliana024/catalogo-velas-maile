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

/*
   ORDEN AUTOMÁTICO DEL CATÁLOGO
   Las categorías cercanas quedan juntas.
   Si un producto tiene varias etiquetas, se usa la primera
   que aparezca en esta lista solo para decidir su posición.
*/
const CATEGORIAS_PRIORIDAD = [
    "Baby Shower",
    "Infantiles",
    "Bautizos",
    "Religiosa",
    "Matrimonios",
    "Quinceañeras",
    "Cumpleaños",
    "Graduaciones",
    "Corporativas",
    "Cabos de año",
    "Personalizadas"
];

const CATEGORIAS_VALIDAS = new Set(CATEGORIAS_PRIORIDAD);

let productos = [];
let productoActual = 0;
let fotoActual = 0;
let estadoModalAgregado = false;
let inicioPointerX = 0;
let inicioPointerY = 0;
let pointerActivo = false;
let ultimoCambioFoto = 0;
const CACHE_IMAGENES = new Set();

cargarProductos();

async function cargarProductos() {
    if (!catalogo) return;
    catalogo.innerHTML = '<div class="mensaje-catalogo">Cargando catálogo...</div>';

    try {
        if (typeof supabaseClient === "undefined") {
            throw new Error("No se pudo conectar con Supabase.");
        }

        const { data, error } = await supabaseClient
            .from("productos")
            .select("id,titulo,precio,descripcion,etiquetas,imagenes,orden,posicion_x,posicion_y,created_at")
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) throw error;

        productos = (data || []).map(normalizarProducto);
        productos = ordenarProductosPorCategoria(productos);

        if (!productos.length) {
            catalogo.innerHTML = '<div class="mensaje-catalogo">No hay productos publicados todavía.</div>';
            return;
        }

        renderizarCatalogo();
        precargarPortadasVisibles();

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
        etiquetas: normalizarEtiquetas(producto.etiquetas),
        imagenes: convertirALista(producto.imagenes),
        empaque: producto.descripcion || "Sin especificar",
        orden: Number(producto.orden) || 0,
        posicion_x: limitarPorcentaje(producto.posicion_x ?? 50),
        posicion_y: limitarPorcentaje(producto.posicion_y ?? 50),
        created_at: producto.created_at || ""
    };
}

function normalizarEtiquetas(valor) {
    const lista = convertirALista(valor)
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .filter((x) => CATEGORIAS_VALIDAS.has(x));

    return [...new Set(lista)];
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

function prioridadDeProducto(producto) {
    let prioridad = CATEGORIAS_PRIORIDAD.length;

    producto.etiquetas.forEach((etiqueta) => {
        const indice = CATEGORIAS_PRIORIDAD.indexOf(etiqueta);
        if (indice !== -1 && indice < prioridad) prioridad = indice;
    });

    return prioridad;
}

function ordenarProductosPorCategoria(lista) {
    return lista
        .map((producto, indiceOriginal) => ({ ...producto, _indiceOriginal: indiceOriginal }))
        .sort((a, b) => {
            const categoriaA = prioridadDeProducto(a);
            const categoriaB = prioridadDeProducto(b);

            if (categoriaA !== categoriaB) return categoriaA - categoriaB;
            if (a.orden !== b.orden) return a.orden - b.orden;

            const fechaA = Date.parse(a.created_at) || 0;
            const fechaB = Date.parse(b.created_at) || 0;
            if (fechaA !== fechaB) return fechaB - fechaA;

            return a._indiceOriginal - b._indiceOriginal;
        });
}

function renderizarCatalogo() {
    catalogo.innerHTML = "";
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
        foto.fetchPriority = indice < 2 ? "high" : "auto";
        foto.style.objectPosition = `${producto.posicion_x}% ${producto.posicion_y}%`;

        const logo = document.createElement("img");
        logo.className = "logo-marca";
        logo.src = "imagenes/logo-maile.png";
        logo.alt = "";
        logo.loading = "eager";
        logo.decoding = "async";
        logo.setAttribute("aria-hidden", "true");

        const texto = document.createElement("span");
        texto.className = "ver-detalle";
        texto.textContent = "Toca para ver";

        publicacion.append(foto, logo, texto);
        catalogo.appendChild(publicacion);
    });

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
    actualizarImagen();
    precargarFotosAlrededor();

    modal.style.display = "block";
    modal.scrollTop = 0;
    document.body.style.overflow = "hidden";

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

    lista.forEach((etiqueta) => {
        const elemento = document.createElement("span");
        elemento.className = "etiqueta";
        elemento.textContent = etiqueta;
        etiquetasProducto.appendChild(elemento);
    });
}

function actualizarImagen() {
    const producto = productos[productoActual];
    if (!producto || !producto.imagenes.length) return;

    const url = producto.imagenes[fotoActual];

    imagenGrande.src = url;
    imagenGrande.alt = `${producto.titulo} - Foto ${fotoActual + 1}`;
    imagenGrande.decoding = "async";
    imagenGrande.style.objectPosition = `${producto.posicion_x}% ${producto.posicion_y}%`;

    actualizarIndicadores();
    actualizarFlechas();
    actualizarWhatsapp(producto);
    precargarFotosAlrededor();
}

function puedeCambiarFoto() {
    const ahora = performance.now();
    if (ahora - ultimoCambioFoto < 120) return false;
    ultimoCambioFoto = ahora;
    return true;
}

function fotoSiguiente() {
    const producto = productos[productoActual];
    if (!producto || !puedeCambiarFoto()) return;

    if (fotoActual < producto.imagenes.length - 1) {
        fotoActual++;
        actualizarImagen();
    }
}

function fotoAnterior() {
    if (!puedeCambiarFoto()) return;

    if (fotoActual > 0) {
        fotoActual--;
        actualizarImagen();
    }
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

    producto.imagenes.forEach((_, indice) => {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.className = "punto";
        punto.setAttribute("aria-label", `Ver foto ${indice + 1}`);
        punto.addEventListener("click", () => {
            fotoActual = indice;
            actualizarImagen();
        });
        indicadores.appendChild(punto);
    });

    actualizarIndicadores();
}

function actualizarIndicadores() {
    indicadores.querySelectorAll(".punto").forEach((punto, indice) => {
        punto.classList.toggle("activo", indice === fotoActual);
    });
}

function precargarImagen(url) {
    if (!url || CACHE_IMAGENES.has(url)) return;
    CACHE_IMAGENES.add(url);

    const img = new Image();
    img.decoding = "async";
    img.src = url;
}

function precargarFotosAlrededor() {
    const producto = productos[productoActual];
    if (!producto) return;

    const indices = [fotoActual + 1, fotoActual - 1, fotoActual + 2];
    indices.forEach((indice) => {
        if (indice >= 0 && indice < producto.imagenes.length) {
            precargarImagen(producto.imagenes[indice]);
        }
    });
}

function precargarPortadasVisibles() {
    const trabajo = () => {
        productos.slice(0, 8).forEach((producto) => {
            if (producto.imagenes[0]) precargarImagen(producto.imagenes[0]);
        });
    };

    if ("requestIdleCallback" in window) requestIdleCallback(trabajo, { timeout: 1500 });
    else setTimeout(trabajo, 700);
}

function actualizarWhatsapp(producto) {
    const foto = producto.imagenes[fotoActual];
    const categorias = producto.etiquetas.length ? producto.etiquetas.join(", ") : "";

    let mensaje = `Hola, vi el catálogo de Velas Maile y estoy interesada en:\n\n🕯️ ${producto.titulo}\n\n💰 Precio por docena:\n${formatearPrecio(producto.precio)}\n\n📦 Empaque:\n${producto.empaque}`;
    if (categorias) mensaje += `\n\n🏷️ Categoría:\n${categorias}`;
    mensaje += `\n\n📷 Esta es la vela que estoy viendo:\n${foto}\n\n¿Me puedes dar más información?`;

    botonWhatsapp.href = "https://wa.me/573008866132?text=" + encodeURIComponent(mensaje);
}

/* Swipe preciso: distingue desplazamiento horizontal de scroll vertical. */
if (carrusel) {
    carrusel.addEventListener("pointerdown", (evento) => {
        if (evento.pointerType === "mouse" && evento.button !== 0) return;
        inicioPointerX = evento.clientX;
        inicioPointerY = evento.clientY;
        pointerActivo = true;
        try { carrusel.setPointerCapture(evento.pointerId); } catch (_) {}
    });

    carrusel.addEventListener("pointerup", (evento) => {
        if (!pointerActivo) return;
        pointerActivo = false;

        const dx = evento.clientX - inicioPointerX;
        const dy = evento.clientY - inicioPointerY;

        if (Math.abs(dx) < 28) return;
        if (Math.abs(dx) <= Math.abs(dy) * 1.15) return;

        if (dx < 0) fotoSiguiente();
        else fotoAnterior();
    });

    carrusel.addEventListener("pointercancel", () => {
        pointerActivo = false;
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
