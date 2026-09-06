/* =====================================
   ELEMENTOS
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

let estadoModalAgregado = false;


/* =====================================
   INICIAR
===================================== */

document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();
});


/* =====================================
   CARGAR PRODUCTOS
===================================== */

async function cargarProductos() {

    catalogo.innerHTML = `
        <div class="mensaje-catalogo">
            Cargando catálogo...
        </div>
    `;

    try {

        if (typeof supabaseClient === "undefined") {
            throw new Error("Supabase no está conectado.");
        }

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
                    No hay productos publicados todavía.
                </div>
            `;

            return;
        }

        renderizarCatalogo();

    } catch (error) {

        console.error("Error cargando productos:", error);

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

            const resultado = JSON.parse(valor);

            if (Array.isArray(resultado)) {
                return resultado;
            }

        } catch (error) {

            return [valor];
        }
    }

    return [];
}


/* =====================================
   MOSTRAR CATÁLOGO
===================================== */

function renderizarCatalogo() {

    catalogo.innerHTML = "";

    let cantidad = 0;

    productos.forEach(function (producto, indice) {

        if (!producto.imagenes.length) {
            return;
        }

        cantidad++;

        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "publicacion";

        boton.dataset.indice = indice;

        const imagen = document.createElement("img");

        imagen.src = producto.imagenes[0];
        imagen.alt = producto.titulo;
        imagen.loading = "lazy";

        const texto = document.createElement("span");

        texto.className = "ver-detalle";
        texto.textContent = "Toca para ver";

        boton.appendChild(imagen);
        boton.appendChild(texto);

        catalogo.appendChild(boton);
    });


    if (cantidad === 0) {

        catalogo.innerHTML = `
            <div class="mensaje-catalogo">
                No hay productos con fotografías.
            </div>
        `;
    }
}


/* =====================================
   CLIC EN UNA FOTO DEL CATÁLOGO
===================================== */

/*
   Usamos un solo listener sobre el catálogo.

   Esto es más seguro que añadir un listener
   diferente a cada producto.
*/

catalogo.addEventListener("click", function (evento) {

    const publicacion =
        evento.target.closest(".publicacion");

    if (!publicacion) {
        return;
    }

    const indice =
        Number(publicacion.dataset.indice);

    if (Number.isNaN(indice)) {
        return;
    }

    abrirPublicacion(indice);
});


/* =====================================
   ABRIR PRODUCTO
===================================== */

function abrirPublicacion(indice) {

    const producto = productos[indice];

    if (!producto) {

        console.error(
            "No se encontró el producto:",
            indice
        );

        return;
    }


    productoActual = indice;
    fotoActual = 0;


    /* TÍTULO */

    tituloProducto.textContent =
        producto.titulo;


    /* PRECIO */

    precioProducto.textContent =
        formatearPrecio(producto.precio);


    /* EMPAQUE */

    empaqueProducto.textContent =
        producto.empaque;


    /* ETIQUETAS */

    mostrarEtiquetas(
        producto.etiquetas
    );


    /* PUNTOS */

    crearIndicadores();


    /* IMAGEN */

    actualizarImagen();


    /* ABRIR MODAL */

    modal.style.display = "block";

    document.body.style.overflow = "hidden";

    modal.scrollTop = 0;


    /* =====================================
       HISTORIAL PARA GESTO ATRÁS
    ===================================== */

    if (!estadoModalAgregado) {

        try {

            history.pushState(
                {
                    velasMaileModal: true
                },
                "",
                window.location.href
            );

            estadoModalAgregado = true;

        } catch (error) {

            /*
               Si estás ejecutando desde
               file:/// puede fallar.

               Eso NO impide abrir la vela.
            */

            console.warn(
                "No se pudo agregar historial:",
                error
            );

            estadoModalAgregado = false;
        }
    }
}


/* =====================================
   CERRAR VISUALMENTE
===================================== */

function cerrarModal() {

    modal.style.display = "none";

    document.body.style.overflow = "";

    estadoModalAgregado = false;
}


/* =====================================
   BOTÓN ←
===================================== */

function volverCatalogo() {

    if (
        modal.style.display !== "block"
    ) {
        return;
    }

    if (estadoModalAgregado) {

        history.back();

    } else {

        cerrarModal();
    }
}


/* =====================================
   GESTO ATRÁS DEL CELULAR
===================================== */

window.addEventListener(
    "popstate",
    function () {

        if (
            modal.style.display === "block"
        ) {

            cerrarModal();
        }
    }
);


/* =====================================
   ETIQUETAS
===================================== */

function mostrarEtiquetas(lista) {

    etiquetasProducto.innerHTML = "";

    lista.forEach(function (etiqueta) {

        const elemento =
            document.createElement("span");

        elemento.className = "etiqueta";

        elemento.textContent = etiqueta;

        etiquetasProducto.appendChild(
            elemento
        );
    });
}


/* =====================================
   IMAGEN
===================================== */

function actualizarImagen() {

    const producto =
        productos[productoActual];

    if (!producto) {
        return;
    }

    if (!producto.imagenes.length) {
        return;
    }


    imagenGrande.src =
        producto.imagenes[fotoActual];

    imagenGrande.alt =
        producto.titulo;


    actualizarIndicadores();

    actualizarFlechas();

    actualizarWhatsapp(producto);
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
   FLECHAS
===================================== */

function actualizarFlechas() {

    const producto =
        productos[productoActual];

    if (!producto) {
        return;
    }


    if (flechaIzquierda) {

        if (fotoActual === 0) {

            flechaIzquierda.style.opacity =
                "0.3";

            flechaIzquierda.disabled =
                true;

        } else {

            flechaIzquierda.style.opacity =
                "1";

            flechaIzquierda.disabled =
                false;
        }
    }


    if (flechaDerecha) {

        if (
            fotoActual ===
            producto.imagenes.length - 1
        ) {

            flechaDerecha.style.opacity =
                "0.3";

            flechaDerecha.disabled =
                true;

        } else {

            flechaDerecha.style.opacity =
                "1";

            flechaDerecha.disabled =
                false;
        }
    }
}


/* =====================================
   INDICADORES
===================================== */

function crearIndicadores() {

    indicadores.innerHTML = "";

    const producto =
        productos[productoActual];

    if (!producto) {
        return;
    }


    producto.imagenes.forEach(
        function (_, indice) {

            const punto =
                document.createElement("button");

            punto.type = "button";

            punto.className = "punto";


            punto.addEventListener(
                "click",
                function () {

                    fotoActual = indice;

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
   INDICADOR ACTIVO
===================================== */

function actualizarIndicadores() {

    const puntos =
        indicadores.querySelectorAll(
            ".punto"
        );


    puntos.forEach(
        function (punto, indice) {

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

    const foto =
        producto.imagenes[fotoActual];


    const categorias =
        producto.etiquetas.length
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
${foto}

¿Me puedes dar más información?`;


    botonWhatsapp.href =
        "https://wa.me/573008866132?text=" +
        encodeURIComponent(mensaje);
}


/* =====================================
   SWIPE ENTRE FOTOS
===================================== */

if (carrusel) {

    carrusel.addEventListener(
        "touchstart",
        function (evento) {

            inicioX =
                evento.touches[0].clientX;
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


            const distancia =
                finX - inicioX;


            if (
                Math.abs(distancia) < 45
            ) {
                return;
            }


            if (distancia < 0) {

                fotoSiguiente();

            } else {

                fotoAnterior();
            }
        },
        {
            passive: true
        }
    );
}


/* =====================================
   TECLADO
===================================== */

document.addEventListener(
    "keydown",
    function (evento) {

        if (
            modal.style.display !==
            "block"
        ) {
            return;
        }


        if (evento.key === "Escape") {

            volverCatalogo();
        }


        if (
            evento.key ===
            "ArrowLeft"
        ) {

            fotoAnterior();
        }


        if (
            evento.key ===
            "ArrowRight"
        ) {

            fotoSiguiente();
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