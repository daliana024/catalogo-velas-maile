/* =====================================
   ELEMENTOS DEL HTML
===================================== */

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


/* =====================================
   VARIABLES
===================================== */

let productos = [];
let productoActual = 0;
let fotoActual = 0;

let inicioX = 0;
let finX = 0;

let modalTieneHistorial = false;


/* =====================================
   INICIAR
===================================== */

cargarProductos();


/* =====================================
   CARGAR PRODUCTOS DE SUPABASE
===================================== */

async function cargarProductos() {

    if (!catalogo) {
        console.error("No se encontró el elemento #catalogo.");
        return;
    }

    catalogo.innerHTML = `
        <div class="mensaje-catalogo">
            Cargando catálogo...
        </div>
    `;

    try {

        const { data, error } = await supabaseClient
            .from("productos")
            .select("*")
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            throw error;
        }

        productos = (data || []).map(normalizarProducto);

        if (productos.length === 0) {

            catalogo.innerHTML = `
                <div class="mensaje-catalogo">
                    Próximamente encontrarás nuestros productos aquí.
                </div>
            `;

            return;
        }

        renderizarCatalogo();

    } catch (error) {

        console.error("Error cargando catálogo:", error);

        catalogo.innerHTML = `
            <div class="mensaje-catalogo">
                No se pudo cargar el catálogo.
            </div>
        `;
    }
}


/* =====================================
   NORMALIZAR PRODUCTO
===================================== */

function normalizarProducto(producto) {

    return {
        id: producto.id,

        titulo:
            producto.titulo ||
            "Vela Maile",

        precio:
            Number(producto.precio) || 0,

        etiquetas:
            convertirALista(producto.etiquetas),

        imagenes:
            convertirALista(producto.imagenes),

        empaque:
            producto.empaque ||
            producto.descripcion ||
            "Sin especificar",

        orden:
            Number(producto.orden) || 0
    };
}


/* =====================================
   CONVERTIR JSON A LISTA
===================================== */

function convertirALista(valor) {

    if (Array.isArray(valor)) {
        return valor;
    }

    if (!valor) {
        return [];
    }

    if (typeof valor === "string") {

        try {

            const convertido = JSON.parse(valor);

            if (Array.isArray(convertido)) {
                return convertido;
            }

        } catch (error) {

            return [valor];
        }
    }

    return [];
}


/* =====================================
   RENDERIZAR CATÁLOGO
===================================== */

function renderizarCatalogo() {

    catalogo.innerHTML = "";

    let productosMostrados = 0;

    productos.forEach((producto, indice) => {

        if (
            !producto.imagenes ||
            producto.imagenes.length === 0
        ) {
            return;
        }

        productosMostrados++;

        const publicacion =
            document.createElement("button");

        publicacion.type = "button";
        publicacion.className = "publicacion";

        publicacion.setAttribute(
            "aria-label",
            `Abrir ${producto.titulo}`
        );

        publicacion.innerHTML = `
            <img
                src="${escaparHTML(producto.imagenes[0])}"
                alt="${escaparHTML(producto.titulo)}"
                loading="lazy"
            >

            <span class="ver-detalle">
                Toca para ver
            </span>
        `;

        publicacion.addEventListener(
            "click",
            function () {
                abrirPublicacion(indice);
            }
        );

        catalogo.appendChild(publicacion);
    });


    if (productosMostrados === 0) {

        catalogo.innerHTML = `
            <div class="mensaje-catalogo">
                No hay productos con fotografías todavía.
            </div>
        `;
    }
}


/* =====================================
   ABRIR PUBLICACIÓN
===================================== */

function abrirPublicacion(indice) {

    const producto = productos[indice];

    if (!producto) {
        console.error("Producto no encontrado:", indice);
        return;
    }

    productoActual = indice;
    fotoActual = 0;


    /* INFORMACIÓN */

    if (tituloProducto) {
        tituloProducto.textContent =
            producto.titulo;
    }

    if (precioProducto) {
        precioProducto.textContent =
            formatearPrecio(producto.precio);
    }

    if (empaqueProducto) {
        empaqueProducto.textContent =
            producto.empaque;
    }


    /* ETIQUETAS */

    renderizarEtiquetas(
        producto.etiquetas
    );


    /* CARRUSEL */

    crearIndicadores();

    actualizarImagen();


    /* =====================================
       ABRIR PRIMERO EL MODAL
    ===================================== */

    if (modal) {

        modal.style.display =
            "block";

        modal.scrollTop =
            0;
    }

    document.body.style.overflow =
        "hidden";


    /* =====================================
       HISTORIAL SEGURO
    ===================================== */

    if (!modalTieneHistorial) {

        try {

            history.pushState(
                {
                    modalVelasMaile: true,
                    producto: indice
                },
                "",
                window.location.href
            );

            modalTieneHistorial =
                true;

        } catch (error) {

            /*
               Si estás abriendo la página
               como file:///C:/...
               algunos navegadores pueden
               bloquear pushState.

               El producto ya quedó abierto,
               así que simplemente continuamos.
            */

            console.warn(
                "Historial no disponible en este modo:",
                error
            );

            modalTieneHistorial =
                false;
        }
    }
}


/* =====================================
   CERRAR MODAL VISUALMENTE
===================================== */

function cerrarModalVisualmente() {

    if (modal) {
        modal.style.display =
            "none";
    }

    document.body.style.overflow =
        "";

    modalTieneHistorial =
        false;
}


/* =====================================
   VOLVER AL CATÁLOGO
===================================== */

function volverCatalogo() {

    if (!modal) {
        return;
    }

    if (
        modal.style.display !== "block"
    ) {
        return;
    }


    if (modalTieneHistorial) {

        /*
           Esto dispara el evento popstate.
           Allí se cierra el producto.
        */

        history.back();

    } else {

        /*
           Si estás usando file:/// o
           el historial no está disponible,
           simplemente cerramos el modal.
        */

        cerrarModalVisualmente();
    }
}


/* =====================================
   GESTO ATRÁS / BOTÓN DEL NAVEGADOR
===================================== */

window.addEventListener(
    "popstate",
    function () {

        if (
            modal &&
            modal.style.display === "block"
        ) {

            cerrarModalVisualmente();
        }
    }
);


/* =====================================
   ETIQUETAS
===================================== */

function renderizarEtiquetas(lista) {

    if (!etiquetasProducto) {
        return;
    }

    etiquetasProducto.innerHTML = "";

    if (
        !Array.isArray(lista) ||
        lista.length === 0
    ) {
        return;
    }

    lista.forEach((etiqueta) => {

        const elemento =
            document.createElement("span");

        elemento.className =
            "etiqueta";

        elemento.textContent =
            etiqueta;

        etiquetasProducto.appendChild(
            elemento
        );
    });
}


/* =====================================
   ACTUALIZAR IMAGEN
===================================== */

function actualizarImagen() {

    const producto =
        productos[productoActual];

    if (
        !producto ||
        !producto.imagenes ||
        producto.imagenes.length === 0
    ) {
        return;
    }


    if (
        fotoActual < 0 ||
        fotoActual >= producto.imagenes.length
    ) {
        fotoActual = 0;
    }


    if (imagenGrande) {

        imagenGrande.src =
            producto.imagenes[fotoActual];

        imagenGrande.alt =
            `${producto.titulo} - Foto ${fotoActual + 1}`;
    }


    actualizarIndicadores();

    actualizarWhatsapp(producto);

    actualizarFlechas();
}


/* =====================================
   FOTO SIGUIENTE
===================================== */

function fotoSiguiente() {

    const producto =
        productos[productoActual];

    if (!producto) {
        return;
    }

    if (
        fotoActual <
        producto.imagenes.length - 1
    ) {

        fotoActual++;

        actualizarImagen();
    }
}


/* =====================================
   FOTO ANTERIOR
===================================== */

function fotoAnterior() {

    if (fotoActual > 0) {

        fotoActual--;

        actualizarImagen();
    }
}


/* =====================================
   ACTUALIZAR FLECHAS
===================================== */

function actualizarFlechas() {

    const producto =
        productos[productoActual];

    if (!producto) {
        return;
    }


    /* IZQUIERDA */

    if (flechaIzquierda) {

        if (fotoActual === 0) {

            flechaIzquierda.style.opacity =
                "0.3";

            flechaIzquierda.style.pointerEvents =
                "none";

        } else {

            flechaIzquierda.style.opacity =
                "1";

            flechaIzquierda.style.pointerEvents =
                "auto";
        }
    }


    /* DERECHA */

    if (flechaDerecha) {

        if (
            fotoActual ===
            producto.imagenes.length - 1
        ) {

            flechaDerecha.style.opacity =
                "0.3";

            flechaDerecha.style.pointerEvents =
                "none";

        } else {

            flechaDerecha.style.opacity =
                "1";

            flechaDerecha.style.pointerEvents =
                "auto";
        }
    }
}


/* =====================================
   CREAR INDICADORES
===================================== */

function crearIndicadores() {

    if (!indicadores) {
        return;
    }

    indicadores.innerHTML =
        "";

    const producto =
        productos[productoActual];

    if (
        !producto ||
        !producto.imagenes
    ) {
        return;
    }


    producto.imagenes.forEach(
        (_, indice) => {

            const punto =
                document.createElement(
                    "button"
                );

            punto.type =
                "button";

            punto.className =
                "punto";

            punto.setAttribute(
                "aria-label",
                `Ver foto ${indice + 1}`
            );

            punto.addEventListener(
                "click",
                function () {

                    fotoActual =
                        indice;

                    actualizarImagen();
                }
            );

            indicadores.appendChild(
                punto
            );
        }
    );


    actualizarIndicadores();
}


/* =====================================
   ACTUALIZAR INDICADORES
===================================== */

function actualizarIndicadores() {

    if (!indicadores) {
        return;
    }

    const puntos =
        indicadores.querySelectorAll(
            ".punto"
        );

    puntos.forEach(
        (punto, indice) => {

            punto.classList.toggle(
                "activo",
                indice === fotoActual
            );
        }
    );
}


/* =====================================
   WHATSAPP
===================================== */

function actualizarWhatsapp(producto) {

    if (!botonWhatsapp) {
        return;
    }

    if (
        !producto ||
        !producto.imagenes ||
        producto.imagenes.length === 0
    ) {
        return;
    }


    const fotoVisible =
        producto.imagenes[fotoActual];


    const categorias =
        producto.etiquetas.length > 0
            ? producto.etiquetas.join(", ")
            : "";


    let mensaje =
`Hola, vi el catálogo de Velas Maile y estoy interesada en:

🕯️ ${producto.titulo}

💰 Precio por docena:
${formatearPrecio(producto.precio)}

📦 Empaque:
${producto.empaque}`;


    if (categorias) {

        mensaje += `

🏷️ Categoría:
${categorias}`;
    }


    mensaje += `

📷 Esta es la vela que estoy viendo:
${fotoVisible}

¿Me puedes dar más información?`;


    botonWhatsapp.href =
        "https://wa.me/573008866132?text=" +
        encodeURIComponent(mensaje);
}


/* =====================================
   SWIPE DEL CARRUSEL
===================================== */

if (carrusel) {

    carrusel.addEventListener(
        "touchstart",
        function (evento) {

            inicioX =
                evento.touches[0]
                    .clientX;
        },
        {
            passive: true
        }
    );


    carrusel.addEventListener(
        "touchend",
        function (evento) {

            finX =
                evento.changedTouches[0]
                    .clientX;

            detectarDeslizamiento();
        },
        {
            passive: true
        }
    );
}


/* =====================================
   DETECTAR DESLIZAMIENTO
===================================== */

function detectarDeslizamiento() {

    const distancia =
        finX - inicioX;

    const minimo =
        45;


    if (
        Math.abs(distancia) < minimo
    ) {
        return;
    }


    if (distancia < 0) {

        fotoSiguiente();

    } else {

        fotoAnterior();
    }
}


/* =====================================
   TECLADO
===================================== */

document.addEventListener(
    "keydown",
    function (evento) {

        if (
            !modal ||
            modal.style.display !== "block"
        ) {
            return;
        }


        if (
            evento.key === "Escape"
        ) {

            volverCatalogo();
        }


        if (
            evento.key === "ArrowRight"
        ) {

            fotoSiguiente();
        }


        if (
            evento.key === "ArrowLeft"
        ) {

            fotoAnterior();
        }
    }
);


/* =====================================
   FORMATEAR PRECIO
===================================== */

function formatearPrecio(precio) {

    return new Intl.NumberFormat(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }
    ).format(
        Number(precio)
    );
}


/* =====================================
   ESCAPAR HTML
===================================== */

function escaparHTML(texto) {

    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}