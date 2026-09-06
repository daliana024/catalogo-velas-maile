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

const descripcionProducto =
    document.getElementById("descripcionProducto");

const etiquetasProducto =
    document.getElementById("etiquetasProducto");

const imagenGrande =
    document.getElementById("imagenGrande");

const indicadores =
    document.getElementById("indicadores");

const botonWhatsapp =
    document.getElementById("botonWhatsapp");

const carrusel =
    document.getElementById("carrusel");


/* =====================================
   VARIABLES
===================================== */

let productos = [];

let productoActual = 0;

let fotoActual = 0;

let inicioX = 0;

let finX = 0;


/* =====================================
   INICIAR CATÁLOGO
===================================== */

cargarProductos();


/* =====================================
   CARGAR PRODUCTOS DESDE SUPABASE
===================================== */

async function cargarProductos() {

    catalogo.innerHTML = `
        <div class="mensaje-catalogo">
            Cargando catálogo...
        </div>
    `;


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

        console.error(
            "Error cargando productos:",
            error
        );


        catalogo.innerHTML = `
            <div class="mensaje-catalogo">
                No se pudo cargar el catálogo.
            </div>
        `;

        return;
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
}


/* =====================================
   NORMALIZAR PRODUCTO
===================================== */

function normalizarProducto(producto) {

    return {

        id:
            producto.id,

        titulo:
            producto.titulo || "Vela Maile",

        precio:
            Number(producto.precio) || 0,

        descripcion:
            producto.descripcion || "",

        etiquetas:
            convertirALista(
                producto.etiquetas
            ),

        imagenes:
            convertirALista(
                producto.imagenes
            ),

        orden:
            producto.orden || 0

    };

}


/* =====================================
   CONVERTIR JSON A ARRAY
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
                producto.imagenes.length === 0
            ) {
                return;
            }


            const publicacion =
                document.createElement(
                    "button"
                );


            publicacion.className =
                "publicacion";


            publicacion.type =
                "button";


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

    productoActual = indice;

    fotoActual = 0;


    const producto =
        productos[productoActual];


    tituloProducto.textContent =
        producto.titulo;


    precioProducto.textContent =
        formatearPrecio(
            producto.precio
        );


    descripcionProducto.textContent =
        producto.descripcion;


    renderizarEtiquetas(
        producto.etiquetas
    );


    crearIndicadores();


    actualizarImagen();


    modal.style.display =
        "block";


    document.body.style.overflow =
        "hidden";


    modal.scrollTop = 0;
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
        etiqueta => {

            const elemento =
                document.createElement(
                    "span"
                );


            elemento.className =
                "etiqueta";


            elemento.textContent =
                etiqueta;


            etiquetasProducto
                .appendChild(
                    elemento
                );

        }
    );

}


/* =====================================
   ACTUALIZAR IMAGEN
===================================== */

function actualizarImagen() {

    const producto =
        productos[productoActual];


    if (
        producto.imagenes.length === 0
    ) {
        return;
    }


    imagenGrande.style.opacity =
        "0";


    setTimeout(
        () => {

            imagenGrande.src =
                producto.imagenes[
                    fotoActual
                ];


            imagenGrande.alt =
                `${producto.titulo} - Foto ${fotoActual + 1}`;


            imagenGrande.style.opacity =
                "1";

        },

        90
    );


    actualizarIndicadores();


    /*
       MUY IMPORTANTE:
       Actualiza el enlace de WhatsApp
       con la foto visible actualmente.
    */

    actualizarBotonWhatsapp(
        producto
    );

}


/* =====================================
   FOTO SIGUIENTE
===================================== */

function fotoSiguiente() {

    const producto =
        productos[productoActual];


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
   INDICADORES
===================================== */

function crearIndicadores() {

    indicadores.innerHTML =
        "";


    const producto =
        productos[productoActual];


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
   ENVÍA LA FOTO QUE SE ESTÁ VIENDO
===================================== */

function actualizarBotonWhatsapp(producto) {

    const fotoVisible =
        producto.imagenes[
            fotoActual
        ];


    const mensaje =
`Hola, vi el catálogo de Velas Maile y estoy interesada en:

🕯️ ${producto.titulo}

💰 ${formatearPrecio(producto.precio)}

Esta es la vela que estoy viendo:

${fotoVisible}

¿Me puedes dar más información?`;


    botonWhatsapp.href =
        "https://wa.me/573008866132?text=" +
        encodeURIComponent(
            mensaje
        );

}


/* =====================================
   SWIPE CON EL DEDO
===================================== */

carrusel.addEventListener(
    "touchstart",

    function(evento) {

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

    function(evento) {

        finX =
            evento.changedTouches[0]
                .clientX;


        detectarDeslizamiento();

    },

    {
        passive: true
    }
);


/* =====================================
   DIRECCIÓN DEL SWIPE
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

    function(evento) {

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
   FORMATEAR PRECIO
===================================== */

function formatearPrecio(precio) {

    return new Intl.NumberFormat(
        "es-CO",
        {
            style:
                "currency",

            currency:
                "COP",

            maximumFractionDigits:
                0
        }
    ).format(
        Number(precio)
    );

}


/* =====================================
   ESCAPAR HTML
===================================== */

function escaparHTML(texto) {

    return String(texto)
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