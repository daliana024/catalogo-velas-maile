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
let inicioX = 0;
let finX = 0;
let estadoModalAgregado = false;

document.addEventListener("DOMContentLoaded", cargarProductos);

async function cargarProductos() {
    catalogo.innerHTML = `<div class="mensaje-catalogo">Cargando catálogo...</div>`;

    try {
        if (typeof supabaseClient === "undefined") throw new Error("Supabase no está conectado.");

        const { data, error } = await supabaseClient
            .from("productos")
            .select("*")
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) throw error;

        productos = (data || []).map(normalizarProducto);

        if (productos.length === 0) {
            catalogo.innerHTML = `<div class="mensaje-catalogo">No hay productos publicados todavía.</div>`;
            return;
        }

        renderizarCatalogo();
    } catch (error) {
        console.error("Error cargando productos:", error);
        catalogo.innerHTML = `<div class="mensaje-catalogo">No se pudo cargar el catálogo.</div>`;
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
        posicion_x: limitarPorcentaje(producto.posicion_x ?? 50),
        posicion_y: limitarPorcentaje(producto.posicion_y ?? 50),
        orden: Number(producto.orden) || 0
    };
}

function convertirALista(valor) {
    if (Array.isArray(valor)) return valor;
    if (!valor) return [];

    if (typeof valor === "string") {
        try {
            const resultado = JSON.parse(valor);
            if (Array.isArray(resultado)) return resultado;
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

function renderizarCatalogo() {
    catalogo.innerHTML = "";
    let cantidad = 0;

    productos.forEach(function (producto, indice) {
        if (!producto.imagenes.length) return;
        cantidad++;

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "publicacion";
        boton.dataset.indice = indice;
        boton.setAttribute("aria-label", `Abrir ${producto.titulo}`);

        const imagen = document.createElement("img");
        imagen.className = "foto-producto";
        imagen.src = producto.imagenes[0];
        imagen.alt = producto.titulo;
        imagen.loading = "lazy";
        imagen.style.objectPosition = `${producto.posicion_x}% ${producto.posicion_y}%`;

        const logo = document.createElement("img");
        logo.className = "logo-marca";
        logo.src = "imagenes/logo-maile.png";
        logo.alt = "";
        logo.setAttribute("aria-hidden", "true");

        const texto = document.createElement("span");
        texto.className = "ver-detalle";
        texto.textContent = "Toca para ver";

        boton.appendChild(imagen);
        boton.appendChild(logo);
        boton.appendChild(texto);
        catalogo.appendChild(boton);
    });

    if (cantidad === 0) {
        catalogo.innerHTML = `<div class="mensaje-catalogo">No hay productos con fotografías.</div>`;
    }
}

catalogo.addEventListener("click", function (evento) {
    const publicacion = evento.target.closest(".publicacion");
    if (!publicacion) return;

    const indice = Number(publicacion.dataset.indice);
    if (Number.isNaN(indice)) return;

    abrirPublicacion(indice);
});

function abrirPublicacion(indice) {
    const producto = productos[indice];
    if (!producto) return;

    productoActual = indice;
    fotoActual = 0;

    tituloProducto.textContent = producto.titulo;
    precioProducto.textContent = formatearPrecio(producto.precio);
    empaqueProducto.textContent = producto.empaque;

    mostrarEtiquetas(producto.etiquetas);
    crearIndicadores();
    actualizarImagen();

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;

    if (!estadoModalAgregado) {
        try {
            history.pushState({ velasMaileModal: true }, "", window.location.href);
            estadoModalAgregado = true;
        } catch (error) {
            console.warn("No se pudo agregar historial:", error);
            estadoModalAgregado = false;
        }
    }
}

function cerrarModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
    estadoModalAgregado = false;
}

function volverCatalogo() {
    if (modal.style.display !== "block") return;
    if (estadoModalAgregado) history.back();
    else cerrarModal();
}

window.addEventListener("popstate", function () {
    if (modal.style.display === "block") cerrarModal();
});

function mostrarEtiquetas(lista) {
    etiquetasProducto.innerHTML = "";
    lista.forEach(function (etiqueta) {
        const elemento = document.createElement("span");
        elemento.className = "etiqueta";
        elemento.textContent = etiqueta;
        etiquetasProducto.appendChild(elemento);
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

function actualizarFlechas() {
    const producto = productos[productoActual];
    if (!producto) return;

    if (flechaIzquierda) {
        flechaIzquierda.disabled = fotoActual === 0;
        flechaIzquierda.style.opacity = fotoActual === 0 ? "0.3" : "1";
    }

    if (flechaDerecha) {
        const ultima = fotoActual === producto.imagenes.length - 1;
        flechaDerecha.disabled = ultima;
        flechaDerecha.style.opacity = ultima ? "0.3" : "1";
    }
}

function crearIndicadores() {
    indicadores.innerHTML = "";
    const producto = productos[productoActual];
    if (!producto) return;

    producto.imagenes.forEach(function (_, indice) {
        const punto = document.createElement("button");
        punto.type = "button";
        punto.className = "punto";
        punto.setAttribute("aria-label", `Ver foto ${indice + 1}`);
        punto.addEventListener("click", function () {
            fotoActual = indice;
            actualizarImagen();
        });
        indicadores.appendChild(punto);
    });

    actualizarIndicadores();
}

function actualizarIndicadores() {
    const puntos = indicadores.querySelectorAll(".punto");
    puntos.forEach(function (punto, indice) {
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

if (carrusel) {
    carrusel.addEventListener("touchstart", function (evento) {
        inicioX = evento.touches[0].clientX;
    }, { passive: true });

    carrusel.addEventListener("touchend", function (evento) {
        finX = evento.changedTouches[0].clientX;
        const distancia = finX - inicioX;
        if (Math.abs(distancia) < 45) return;
        if (distancia < 0) fotoSiguiente();
        else fotoAnterior();
    }, { passive: true });
}

document.addEventListener("keydown", function (evento) {
    if (modal.style.display !== "block") return;
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
