const catalogo =
    document.getElementById(
        "catalogo"
    );

const modal =
    document.getElementById(
        "modal"
    );

const tituloProducto =
    document.getElementById(
        "tituloProducto"
    );

const precioProducto =
    document.getElementById(
        "precioProducto"
    );

const etiquetasProducto =
    document.getElementById(
        "etiquetasProducto"
    );

const empaqueProducto =
    document.getElementById(
        "empaqueProducto"
    );

const imagenGrande =
    document.getElementById(
        "imagenGrande"
    );

const indicadores =
    document.getElementById(
        "indicadores"
    );

const botonWhatsapp =
    document.getElementById(
        "botonWhatsapp"
    );

const carrusel =
    document.getElementById(
        "carrusel"
    );


let productos = [];

let productoActual = 0;

let fotoActual = 0;

let inicioX = 0;

let finX = 0;


cargarProductos();


/* =====================================
   CARGAR PRODUCTOS
===================================== */

async function cargarProductos() {

    catalogo.innerHTML =
        `
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

        console.error(error);

        catalogo.innerHTML =
            `
            <div class="mensaje-catalogo">
                No se pudo cargar el catálogo.
            </div>
            `;

        return;
    }


    productos =
        (data || [])
            .map(
                normalizarProducto
            );


    renderizarCatalogo();

}


/* =====================================
   NORMALIZAR
===================================== */

function normalizarProducto(
    producto
) {

    return {

        id:
            producto.id,

        titulo:
            producto.titulo ||
            "Vela Maile",

        precio:
            Number(
                producto.precio
            ) || 0,

        etiquetas:
            convertirALista(
                producto.etiquetas
            ),

        imagenes:
            convertirALista(
                producto.imagenes
            ),

        empaque:
            producto.empaque || "",

        orden:
            producto.orden || 0

    };

}


/* =====================================
   CATÁLOGO
===================================== */

function renderizarCatalogo() {

    catalogo.innerHTML = "";


    productos.forEach(
        (
            producto,
            indice
        ) => {

            if (
                producto.imagenes
                    .length === 0
            ) {
                return;
            }


            const publicacion =
                document.createElement(
                    "button"
                );


            publicacion.className =
                "publicacion";


            publicacion.innerHTML = `

                <img
                    src="${producto.imagenes[0]}"
                    alt="${producto.titulo}"
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
   ABRIR
===================================== */

function abrirPublicacion(
    indice
) {

    productoActual =
        indice;

    fotoActual = 0;


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


    modal.scrollTop = 0;

}


/* =====================================
   CERRAR
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

function renderizarEtiquetas(
    lista
) {

    etiquetasProducto.innerHTML =
        "";


    lista.forEach(
        etiqueta => {

            const span =
                document.createElement(
                    "span"
                );


            span.className =
                "etiqueta";


            span.textContent =
                etiqueta;


            etiquetasProducto
                .appendChild(
                    span
                );

        }
    );

}


/* =====================================
   IMAGEN
===================================== */

function actualizarImagen() {

    const producto =
        productos[
            productoActual
        ];


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
   SIGUIENTE
===================================== */

function fotoSiguiente() {

    const producto =
        productos[
            productoActual
        ];


    if (
        fotoActual <
        producto.imagenes
            .length - 1
    ) {

        fotoActual++;

        actualizarImagen();

    }

}


/* =====================================
   ANTERIOR
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


    const izquierda =
        document.querySelector(
            ".flecha-izquierda"
        );


    const derecha =
        document.querySelector(
            ".flecha-derecha"
        );


    izquierda.style.opacity =
        fotoActual === 0
            ? "0.3"
            : "1";


    derecha.style.opacity =
        fotoActual ===
        producto.imagenes.length - 1
            ? "0.3"
            : "1";

}


/* =====================================
   PUNTOS
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


            punto.className =
                "punto";


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


function actualizarIndicadores() {

    const puntos =
        indicadores
            .querySelectorAll(
                ".punto"
            );


    puntos.forEach(
        (
            punto,
            indice
        ) => {

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

function actualizarWhatsapp(
    producto
) {

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

carrusel.addEventListener(
    "touchstart",

    evento => {

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

    evento => {

        finX =
            evento.changedTouches[0]
                .clientX;


        const distancia =
            finX - inicioX;


        if (
            Math.abs(distancia)
            < 45
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

    },

    {
        passive: true
    }
);


/* =====================================
   UTILIDADES
===================================== */

function convertirALista(
    valor
) {

    if (
        Array.isArray(valor)
    ) {
        return valor;
    }


    if (!valor) {
        return [];
    }


    if (
        typeof valor ===
        "string"
    ) {

        try {

            const convertido =
                JSON.parse(
                    valor
                );


            return Array.isArray(
                convertido
            )
                ? convertido
                : [];

        } catch {

            return [valor];

        }

    }


    return [];
}


function formatearPrecio(
    precio
) {

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