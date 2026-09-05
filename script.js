const productos = [
    {
        titulo: "Vela personalizada",
        precio: "$12.000",
        descripcion: "Vela artesanal personalizada para momentos especiales. Ideal como detalle decorativo o recuerdo para celebraciones.",
        etiquetas: ["Personalizada", "Recuerdos", "Detalles"],
        imagenes: [
            "imagenes/vela1.jpg",
            "imagenes/vela1.jpg",
            "imagenes/vela1.jpg"
        ]
    },

    {
        titulo: "Vela religiosa",
        precio: "$18.000",
        descripcion: "Diseño especial con temática religiosa, elaborado con mucho cuidado para un detalle significativo y elegante.",
        etiquetas: ["Religiosa", "Bautizo", "Primera Comunión"],
        imagenes: [
            "imagenes/vela2.png",
            "imagenes/vela2.png",
            "imagenes/vela2.png"
        ]
    },

    {
        titulo: "Vela clásica blanca",
        precio: "$10.000",
        descripcion: "Una vela de estilo clásico y limpio, perfecta para celebraciones, recordatorios o decoración especial.",
        etiquetas: ["Clásica", "Decoración", "Eventos"],
        imagenes: [
            "imagenes/vela3.png",
            "imagenes/vela3.png",
            "imagenes/vela3.png"
        ]
    },

    {
        titulo: "Vela de grado",
        precio: "$11.000",
        descripcion: "Detalle especial para grados y logros académicos. Personalizable con nombre, color y ocasión.",
        etiquetas: ["Grado", "Personalizada", "Souvenir"],
        imagenes: [
            "imagenes/vela4.png",
            "imagenes/vela4.png",
            "imagenes/vela4.png"
        ]
    },

    {
        titulo: "Vela decorativa",
        precio: "$11.500",
        descripcion: "Diseño decorativo artesanal con acabado elegante, pensado para regalar o decorar celebraciones.",
        etiquetas: ["Decorativa", "Regalo", "Eventos"],
        imagenes: [
            "imagenes/vela5.png",
            "imagenes/vela5.png",
            "imagenes/vela5.png"
        ]
    },

    {
        titulo: "Vela para recuerdo",
        precio: "$13.000",
        descripcion: "Vela personalizada para recuerdos de eventos especiales, con presentación delicada y elegante.",
        etiquetas: ["Baby Shower", "Bautizo", "Cumpleaños"],
        imagenes: [
            "imagenes/vela6.png",
            "imagenes/vela6.png",
            "imagenes/vela6.png"
        ]
    }
];

const catalogo = document.getElementById("catalogo");
const modal = document.getElementById("modal");
const tituloProducto = document.getElementById("tituloProducto");
const precioProducto = document.getElementById("precioProducto");
const descripcionProducto = document.getElementById("descripcionProducto");
const etiquetasProducto = document.getElementById("etiquetasProducto");
const imagenGrande = document.getElementById("imagenGrande");
const indicadores = document.getElementById("indicadores");
const botonWhatsapp = document.getElementById("botonWhatsapp");
const carrusel = document.getElementById("carrusel");

let productoActual = 0;
let fotoActual = 0;

let inicioX = 0;
let finX = 0;

renderizarCatalogo();

function renderizarCatalogo() {
    catalogo.innerHTML = "";

    productos.forEach((producto, indice) => {
        const boton = document.createElement("button");
        boton.className = "publicacion";
        boton.setAttribute("aria-label", `Abrir ${producto.titulo}`);
        boton.onclick = () => abrirPublicacion(indice);

        boton.innerHTML = `
            <img src="${producto.imagenes[0]}" alt="${producto.titulo}">
            <span class="ver-detalle">Toca para ver</span>
        `;

        catalogo.appendChild(boton);
    });
}

function abrirPublicacion(indice) {
    productoActual = indice;
    fotoActual = 0;

    const producto = productos[productoActual];

    tituloProducto.textContent = producto.titulo;
    precioProducto.textContent = producto.precio;
    descripcionProducto.textContent = producto.descripcion;

    renderizarEtiquetas(producto.etiquetas);
    crearIndicadores();
    actualizarImagen();

    const mensaje = `Hola, vi su catálogo de Velas MAILE y estoy interesada en ${producto.titulo}, con precio ${producto.precio}. ¿Me puedes dar más información?`;

    botonWhatsapp.href =
        "https://wa.me/573008866132?text=" +
        encodeURIComponent(mensaje);

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function cerrarPublicacion() {
    modal.style.display = "none";
    document.body.style.overflow = "";
}

function renderizarEtiquetas(listaEtiquetas) {
    etiquetasProducto.innerHTML = "";

    listaEtiquetas.forEach((texto) => {
        const span = document.createElement("span");
        span.className = "etiqueta";
        span.textContent = texto;
        etiquetasProducto.appendChild(span);
    });
}

function actualizarImagen() {
    const producto = productos[productoActual];

    imagenGrande.style.opacity = "0";

    setTimeout(() => {
        imagenGrande.src = producto.imagenes[fotoActual];
        imagenGrande.alt = producto.titulo + " - foto " + (fotoActual + 1);
        imagenGrande.style.opacity = "1";
    }, 90);

    actualizarIndicadores();
}

function fotoSiguiente() {
    const total = productos[productoActual].imagenes.length;

    fotoActual++;

    if (fotoActual >= total) {
        fotoActual = 0;
    }

    actualizarImagen();
}

function fotoAnterior() {
    const total = productos[productoActual].imagenes.length;

    fotoActual--;

    if (fotoActual < 0) {
        fotoActual = total - 1;
    }

    actualizarImagen();
}

function crearIndicadores() {
    indicadores.innerHTML = "";

    const total = productos[productoActual].imagenes.length;

    for (let i = 0; i < total; i++) {
        const punto = document.createElement("div");
        punto.className = "punto";
        indicadores.appendChild(punto);
    }

    actualizarIndicadores();
}

function actualizarIndicadores() {
    const puntos = document.querySelectorAll(".punto");

    puntos.forEach((punto, indice) => {
        punto.classList.toggle("activo", indice === fotoActual);
    });
}

carrusel.addEventListener(
    "touchstart",
    function(evento) {
        inicioX = evento.touches[0].clientX;
    },
    { passive: true }
);

carrusel.addEventListener(
    "touchend",
    function(evento) {
        finX = evento.changedTouches[0].clientX;
        detectarDeslizamiento();
    },
    { passive: true }
);

function detectarDeslizamiento() {
    const distancia = finX - inicioX;
    const minimo = 50;

    if (Math.abs(distancia) < minimo) {
        return;
    }

    if (distancia < 0) {
        fotoSiguiente();
    } else {
        fotoAnterior();
    }
}

document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") {
        cerrarPublicacion();
    }

    if (modal.style.display === "block") {
        if (evento.key === "ArrowRight") {
            fotoSiguiente();
        }

        if (evento.key === "ArrowLeft") {
            fotoAnterior();
        }
    }
});