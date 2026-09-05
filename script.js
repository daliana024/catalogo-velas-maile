/* =====================================
   PRODUCTOS
===================================== */

const productos = [

    {
        titulo: "Vela personalizada",

        precio: "$12.000",

        descripcion:
            "Vela artesanal personalizada para momentos especiales.",

        imagenes: [
            "imagenes/vela1.jpg",
            "imagenes/vela2.png",
            "imagenes/vela3.png"
        ]
    },


    {
        titulo: "Vela Baby Shower",

        precio: "$10.000",

        descripcion:
            "Un hermoso detalle personalizado para celebrar la llegada de tu bebé.",

        imagenes: [
            "imagenes/vela2.png",
            "imagenes/vela3.png",
            "imagenes/vela4.png"
        ]
    },


    {
        titulo: "Vela para Bautizo",

        precio: "$11.000",

        descripcion:
            "Recuerdo personalizado para bautizos y celebraciones religiosas.",

        imagenes: [
            "imagenes/vela3.png",
            "imagenes/vela4.png"
        ]
    },


    {
        titulo: "Vela personalizada",

        precio: "$15.000",

        descripcion:
            "Diseño artesanal creado especialmente para tu celebración.",

        imagenes: [
            "imagenes/vela4.png",
            "imagenes/vela5.png"
        ]
    },


    {
        titulo: "Recuerdo artesanal",

        precio: "$9.000",

        descripcion:
            "Velas personalizadas elaboradas con dedicación y amor.",

        imagenes: [
            "imagenes/vela5.png",
            "imagenes/vela6.png"
        ]
    },


    {
        titulo: "Velas MAILE",

        precio: "$13.000",

        descripcion:
            "Detalles personalizados para momentos inolvidables.",

        imagenes: [
            "imagenes/vela6.png",
            "imagenes/vela1.jpg"
        ]
    }

];


/* =====================================
   VARIABLES
===================================== */

let productoActual = 0;

let fotoActual = 0;


/* VARIABLES PARA SWIPE */

let inicioX = 0;

let finX = 0;


/* =====================================
   ABRIR PUBLICACIÓN
===================================== */

function abrirPublicacion(indice) {

    productoActual = indice;

    fotoActual = 0;


    const producto =
        productos[productoActual];


    /* TÍTULO */

    document.getElementById(
        "tituloProducto"
    ).textContent =
        producto.titulo;


    /* PRECIO */

    document.getElementById(
        "precioProducto"
    ).textContent =
        producto.precio;


    /* DESCRIPCIÓN */

    document.getElementById(
        "descripcionProducto"
    ).textContent =
        producto.descripcion;


    /* INDICADORES */

    crearIndicadores();


    /* FOTO */

    actualizarImagen();


    /* WHATSAPP */

    const mensaje =
        `Hola, vi su catálogo de Velas MAILE y estoy interesada en ${producto.titulo} con precio ${producto.precio}.`;


    document.getElementById(
        "botonWhatsapp"
    ).href =
        "https://wa.me/573008866132?text=" +
        encodeURIComponent(mensaje);


    /* MOSTRAR MODAL */

    document.getElementById(
        "modal"
    ).style.display =
        "block";


    /* BLOQUEAR SCROLL DE FONDO */

    document.body.style.overflow =
        "hidden";
}


/* =====================================
   CERRAR PUBLICACIÓN
===================================== */

function cerrarPublicacion() {

    document.getElementById(
        "modal"
    ).style.display =
        "none";


    document.body.style.overflow =
        "";
}


/* =====================================
   ACTUALIZAR IMAGEN
===================================== */

function actualizarImagen() {

    const producto =
        productos[productoActual];


    const imagen =
        document.getElementById(
            "imagenGrande"
        );


    /*
       Pequeño efecto de transición
    */

    imagen.style.opacity =
        "0";


    setTimeout(() => {

        imagen.src =
            producto.imagenes[
                fotoActual
            ];


        imagen.style.opacity =
            "1";

    }, 100);


    actualizarIndicadores();
}


/* =====================================
   FOTO SIGUIENTE
===================================== */

function fotoSiguiente() {

    const producto =
        productos[productoActual];


    fotoActual++;


    if (
        fotoActual >=
        producto.imagenes.length
    ) {

        fotoActual = 0;

    }


    actualizarImagen();
}


/* =====================================
   FOTO ANTERIOR
===================================== */

function fotoAnterior() {

    const producto =
        productos[productoActual];


    fotoActual--;


    if (
        fotoActual < 0
    ) {

        fotoActual =
            producto.imagenes.length - 1;

    }


    actualizarImagen();
}


/* =====================================
   CREAR INDICADORES
===================================== */

function crearIndicadores() {

    const contenedor =
        document.getElementById(
            "indicadores"
        );


    contenedor.innerHTML =
        "";


    const producto =
        productos[productoActual];


    producto.imagenes.forEach(
        () => {

            const punto =
                document.createElement(
                    "div"
                );


            punto.classList.add(
                "punto"
            );


            contenedor.appendChild(
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
        document.querySelectorAll(
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
   SWIPE CON EL DEDO
===================================== */

const carrusel =
    document.getElementById(
        "carrusel"
    );


/* CUANDO TOCA LA PANTALLA */

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


/* CUANDO SUELTA EL DEDO */

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
   DETECTAR DIRECCIÓN
===================================== */

function detectarDeslizamiento() {

    const distancia =
        finX - inicioX;


    /*
       Distancia mínima que debe
       mover el dedo para cambiar foto.
    */

    const minimo =
        50;


    if (
        Math.abs(distancia) <
        minimo
    ) {

        return;

    }


    /*
       Desliza hacia la izquierda
       = siguiente imagen
    */

    if (
        distancia < 0
    ) {

        fotoSiguiente();

    }


    /*
       Desliza hacia la derecha
       = imagen anterior
    */

    else {

        fotoAnterior();

    }
}


/* =====================================
   CERRAR CON TECLA ESC
===================================== */

document.addEventListener(
    "keydown",

    function(evento) {

        if (
            evento.key === "Escape"
        ) {

            cerrarPublicacion();

        }

    }
);