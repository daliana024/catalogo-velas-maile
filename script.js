const catalogo = document.getElementById("catalogo");
const modal = document.getElementById("modal");
const botonVolver = document.getElementById("botonVolver");
const tituloProducto = document.getElementById("tituloProducto");
const precioProducto = document.getElementById("precioProducto");
const etiquetasProducto = document.getElementById("etiquetasProducto");
const empaqueProducto = document.getElementById("empaqueProducto");
const imagenGrande = document.getElementById("imagenGrande");
const indicadores = document.getElementById("indicadores");
const botonWhatsapp = document.getElementById("botonWhatsapp");
const carrusel = document.getElementById("carrusel");
const flechaIzquierda = document.getElementById("flechaIzquierda");
const flechaDerecha = document.getElementById("flechaDerecha");

let productos = [];
let productoActual = -1;
let fotoActual = 0;
let inicioX = 0;
let modalTieneEntradaHistorial = false;

cargarProductos();

async function cargarProductos() {
    catalogo.innerHTML = '<div class="mensaje-catalogo">Cargando catálogo...</div>';

    try {
        const { data, error } = await supabaseClient
            .from("productos")
            .select("*")
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) throw error;

        productos = (data || []).map(normalizarProducto);
        renderizarCatalogo();
    } catch (error) {
        console.error("Error cargando catálogo:", error);
        catalogo.innerHTML = '<div class="mensaje-catalogo">No se pudo cargar el catálogo.</div>';
    }
}

function normalizarProducto(producto) {
    return {
        id: producto.id,
        titulo: producto.titulo || "Vela Maile",
        precio: Number(producto.precio) || 0,
        etiquetas: convertirALista(producto.etiquetas),
        imagenes: convertirALista(producto.imagenes),
        empaque: producto.empaque || producto.descripcion || "Sin especificar",
        orden: Number(producto.orden) || 0
    };
}

function convertirALista(valor) {
    if (Array.isArray(valor)) return valor.filter(Boolean);
    if (!valor) return [];
    if (typeof valor === "string") {
        try {
            const convertido = JSON.parse(valor);
            if (Array.isArray(convertido)) return convertido.filter(Boolean);
        } catch (_) {
            return [valor];
        }
    }
    return [];
}

function renderizarCatalogo() {
    catalogo.innerHTML = "";
    let visibles = 0;

    productos.forEach((producto, indice) => {
        if (!producto.imagenes.length) return;
        visibles++;

        const tarjeta = document.createElement("button");
        tarjeta.type = "button";
        tarjeta.className = "publicacion";
        tarjeta.setAttribute("aria-label", `Abrir ${producto.titulo}`);

        const img = document.createElement("img");
        img.src = producto.imagenes[0];
        img.alt = producto.titulo;
        img.loading = "lazy";

        const texto = document.createElement("span");
        texto.className = "ver-detalle";
        texto.textContent = "Toca para ver";

        tarjeta.append(img, texto);
        tarjeta.addEventListener("click", () => abrirPublicacion(indice));
        catalogo.appendChild(tarjeta);
    });

    if (!visibles) {
        catalogo.innerHTML = '<div class="mensaje-catalogo">Próximamente encontrarás nuestros productos aquí.</div>';
    }
}

function abrirPublicacion(indice) {
    const producto = productos[indice];
    if (!producto) return;

    productoActual = indice;
    fotoActual = 0;

    tituloProducto.textContent = producto.titulo;
    precioProducto.textContent = formatearPrecio(producto.precio);
    empaqueProducto.textContent = producto.empaque;
    renderizarEtiquetas(producto.etiquetas);
    crearIndicadores();
    actualizarImagen();

    modal.classList.add("abierto");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;

    if (!modalTieneEntradaHistorial) {
        try {
            history.pushState({ maileModal: true }, "", `${location.pathname}${location.search}#producto-${producto.id}`);
            modalTieneEntradaHistorial = true;
        } catch (error) {
            console.warn("No se pudo agregar historial:", error);
            modalTieneEntradaHistorial = false;
        }
    }
}

function cerrarModalVisual() {
    modal.classList.remove("abierto");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    productoActual = -1;
    fotoActual = 0;
}

function volverCatalogo() {
    if (!modal.classList.contains("abierto")) return;

    if (modalTieneEntradaHistorial) {
        history.back();
    } else {
        cerrarModalVisual();
    }
}

botonVolver.addEventListener("click", volverCatalogo);

window.addEventListener("popstate", () => {
    if (modal.classList.contains("abierto")) {
        cerrarModalVisual();
    }
    modalTieneEntradaHistorial = false;
});

function renderizarEtiquetas(lista) {
    etiquetasProducto.innerHTML = "";
    lista.forEach(etiqueta => {
        const span = document.createElement("span");
        span.className = "etiqueta";
        span.textContent = etiqueta;
        etiquetasProducto.appendChild(span);
    });
}

function actualizarImagen() {
    const producto = productos[productoActual];
    if (!producto || !producto.imagenes.length) return;

    imagenGrande.src = producto.imagenes[fotoActual];
    imagenGrande.alt = `${producto.titulo} - Foto ${fotoActual + 1}`;
    actualizarIndicadores();
    actualizarFlechas();
    actualizarWhatsapp(producto);
}

function fotoSiguiente() {
    const producto = productos[productoActual];
    if (!producto) return;
    if (fotoActual < producto.imagenes.length - 1) {
        fotoActual++;
        actualizarImagen();
    }
}

function fotoAnterior() {
    if (fotoActual > 0) {
        fotoActual--;
        actualizarImagen();
    }
}

flechaIzquierda.addEventListener("click", fotoAnterior);
flechaDerecha.addEventListener("click", fotoSiguiente);

function actualizarFlechas() {
    const producto = productos[productoActual];
    if (!producto) return;
    flechaIzquierda.disabled = fotoActual === 0;
    flechaDerecha.disabled = fotoActual === producto.imagenes.length - 1;
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
}

function actualizarIndicadores() {
    indicadores.querySelectorAll(".punto").forEach((punto, indice) => {
        punto.classList.toggle("activo", indice === fotoActual);
    });
}

function actualizarWhatsapp(producto) {
    const fotoVisible = producto.imagenes[fotoActual];
    const categorias = producto.etiquetas.join(", ");

    let mensaje = `Hola, vi el catálogo de Velas Maile y estoy interesada en:\n\n🕯️ ${producto.titulo}\n\n💰 Precio por docena:\n${formatearPrecio(producto.precio)}\n\n📦 Empaque:\n${producto.empaque}`;

    if (categorias) mensaje += `\n\n🏷️ Categoría:\n${categorias}`;
    mensaje += `\n\n📷 Esta es la vela que estoy viendo:\n${fotoVisible}\n\n¿Me puedes dar más información?`;

    botonWhatsapp.href = `https://wa.me/573008866132?text=${encodeURIComponent(mensaje)}`;
}

carrusel.addEventListener("touchstart", evento => {
    inicioX = evento.touches[0].clientX;
}, { passive: true });

carrusel.addEventListener("touchend", evento => {
    const finX = evento.changedTouches[0].clientX;
    const distancia = finX - inicioX;
    if (Math.abs(distancia) < 45) return;
    distancia < 0 ? fotoSiguiente() : fotoAnterior();
}, { passive: true });

document.addEventListener("keydown", evento => {
    if (!modal.classList.contains("abierto")) return;
    if (evento.key === "Escape") volverCatalogo();
    if (evento.key === "ArrowRight") fotoSiguiente();
    if (evento.key === "ArrowLeft") fotoAnterior();
});

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(precio));
}
