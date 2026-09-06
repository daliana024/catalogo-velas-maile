/* =====================================
   ELEMENTOS DEL HTML
===================================== */

const catalogo =
    document.getElementById("catalogo");

const modal =
    document.getElementById("modal");

const tituloProducto =
    document.getElementById("tituloProducto");

const precioProducto =
    document.getElementById("precioProducto");

const etiquetasProducto =
    document.getElementById("etiquetasProducto");

const empaqueProducto =
    document.getElementById("empaqueProducto");

const imagenGrande =
    document.getElementById("imagenGrande");

const indicadores =
    document.getElementById("indicadores");

const botonWhatsapp =
    document.getElementById("botonWhatsapp");

const carrusel =
    document.getElementById("carrusel");

const flechaIzquierda =
    document.querySelector(".flecha-izquierda");

const flechaDerecha =
    document.querySelector(".flecha-derecha");


/* =====================================
   VARIABLES
===================================== */

let productos = [];

let productoActual = 0;

let fotoActual = 0;

let inicioX = 0;

let finX = 0;


/* =====================================
   INICIAR
===================================== */

cargarProductos();


/* =====================================
   CARGAR PRODUCTOS DE SUPABASE
===================================== */

async function cargarProductos() {

    catalogo.innerHTML = `
        <div class="mensaje-catalogo">
            Cargando catálogo...
        </div>
    `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("productos")
                .select("*")
                .order(
                    "orden",
                    {
                        ascending: true
                    }
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        productos =
            (data || [])
                .map(normalizarProducto);


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

        console.error(
            "Error cargando catálogo:",
            error
        );

        catalogo.innerHTML = `
            <div class="mensaje-catalogo">
                No se pudo cargar el catálogo.
            </div>
        `;

    }

}


/* =====================================
   NORMALIZAR DATOS
===================================== */

function normalizarProducto(producto) {

    return {

        id:
            producto.id,

        titulo:
            producto.titulo || "Vela Maile",

        precio:
            Number(producto.precio) || 0,

        etiquetas:
            convertirALista(
                producto.etiquetas
            ),

        imagenes:
            convertirALista(
                producto.imagenes
            ),

        // Compatible con ambas versiones de la base de datos:
        // si existe "empaque" lo usa; si no, usa la antigua columna "descripcion".
        empaque:
            producto.empaque ||
            producto.descripcion ||
            "Sin especificar",

        orden:
            Number(producto.orden) || 0

    };

}


/* =====================================
   CONVERTIR A LISTA
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

            const convertido =
                JSON.parse(valor);

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


    productos.forEach(
        (producto, indice) => {

            if (
                !producto.imagenes ||
                producto.imagenes.length === 0
            ) {
                return;
            }


            const publicacion =
                document.createElement(
                    "button"
                );


            publicacion.type =
                "button";


            publicacion.className =
                "publicacion";


            publicacion.setAttribute(
                "aria-label",
                `Abrir ${producto.titulo}`
            );


            publicacion.innerHTML = `
                <img
                    src="${producto.imagenes[0]}"
                    alt="${escaparHTML(producto.titulo)}"
                    loading="lazy"
                >

                <span class="ver-detalle">
                    Toca para ver
                </span>
            `;


            publicacion.addEventListener(
                "click",

                () =>
                    abrirPublicacion(
                        indice
                    )
            );


            catalogo.appendChild(
                publicacion
            );

        }
    );

}


/* =====================================
   ABRIR PRODUCTO
===================================== */

function abrirPublicacion(indice) {

    productoActual =
        indice;

    fotoActual =
        0;


    const producto =
        productos[
            productoActual
        ];


    tituloProducto.textContent =
        producto.titulo;


    precioProducto.textContent =
        formatearPrecio(
            producto.precio
        );


    empaqueProducto.textContent =
        producto.empaque;


    renderizarEtiquetas(
        producto.etiquetas
    );


    crearIndicadores();


    actualizarImagen();


    modal.style.display =
        "block";


    document.body.style.overflow =
        "hidden";


    modal.scrollTop =
        0;

}


/* =====================================
   CERRAR PRODUCTO
===================================== */

function cerrarPublicacion() {

    modal.style.display =
        "none";


    document.body.style.overflow =
        "";

}


/* =====================================
   ETIQUETAS
===================================== */

function renderizarEtiquetas(lista) {

    etiquetasProducto.innerHTML =
        "";


    lista.forEach(
        (etiqueta) => {

            const elemento =
                document.createElement(
                    "span"
                );


            elemento.className =
                "etiqueta";


            elemento.textContent =
                etiqueta;


            etiquetasProducto.appendChild(
                elemento
            );

        }
    );

}


/* =====================================
   IMAGEN ACTUAL
===================================== */

function actualizarImagen() {

    const producto =
        productos[
            productoActual
        ];


    if (
        producto.imagenes.length === 0
    ) {
        return;
    }


    imagenGrande.src =
        producto.imagenes[
            fotoActual
        ];


    imagenGrande.alt =
        `${producto.titulo} - Foto ${fotoActual + 1}`;


    actualizarIndicadores();

    actualizarWhatsapp(
        producto
    );

    actualizarFlechas();

}


/* =====================================
   SIGUIENTE FOTO
===================================== */

function fotoSiguiente() {

    const producto =
        productos[
            productoActual
        ];


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

    if (
        fotoActual > 0
    ) {

        fotoActual--;

        actualizarImagen();

    }

}


/* =====================================
   FLECHAS
===================================== */

function actualizarFlechas() {

    const producto =
        productos[
            productoActual
        ];


    if (
        !flechaIzquierda ||
        !flechaDerecha
    ) {
        return;
    }


    flechaIzquierda.style.opacity =
        fotoActual === 0
            ? "0.3"
            : "1";


    flechaDerecha.style.opacity =
        fotoActual ===
        producto.imagenes.length - 1
            ? "0.3"
            : "1";


    flechaIzquierda.style.pointerEvents =
        fotoActual === 0
            ? "none"
            : "auto";


    flechaDerecha.style.pointerEvents =
        fotoActual ===
        producto.imagenes.length - 1
            ? "none"
            : "auto";

}


/* =====================================
   INDICADORES
===================================== */

function crearIndicadores() {

    indicadores.innerHTML =
        "";


    const producto =
        productos[
            productoActual
        ];


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

                () => {

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

    const fotoVisible =
        producto.imagenes[
            fotoActual
        ];


    const mensaje =
`Hola, vi el catálogo de Velas Maile y estoy interesada en:

🕯️ ${producto.titulo}

💰 Precio por docena:
${formatearPrecio(producto.precio)}

📦 Empaque:
${producto.empaque}

📷 Foto:
${fotoVisible}

¿Me puedes dar más información?`;


    botonWhatsapp.href =
        "https://wa.me/573008866132?text=" +
        encodeURIComponent(
            mensaje
        );

}


/* =====================================
   SWIPE
===================================== */

if (carrusel) {

    carrusel.addEventListener(
        "touchstart",

        (evento) => {

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

        (evento) => {

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
   DETECTAR SWIPE
===================================== */

function detectarDeslizamiento() {

    const distancia =
        finX - inicioX;


    const minimo =
        45;


    if (
        Math.abs(distancia) <
        minimo
    ) {
        return;
    }


    if (
        distancia < 0
    ) {

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

    (evento) => {

        if (
            modal.style.display !==
            "block"
        ) {
            return;
        }


        if (
            evento.key ===
            "Escape"
        ) {

            cerrarPublicacion();

        }


        if (
            evento.key ===
            "ArrowRight"
        ) {

            fotoSiguiente();

        }


        if (
            evento.key ===
            "ArrowLeft"
        ) {

            fotoAnterior();

        }

    }
);


/* =====================================
   PRECIO
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

    return String(
        texto || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}