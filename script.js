const productos = [

    {
        titulo: "Vela personalizada",
        descripcion: "Vela artesanal personalizada para momentos especiales.",

        imagenes: [
            "imagenes/vela1.jpg",
            "imagenes/vela2.jpg",
            "imagenes/vela3.jpg"
        ]
    },


    {
        titulo: "Vela Baby Shower",
        descripcion: "Un detalle especial para celebrar la llegada de tu bebé.",

        imagenes: [
            "imagenes/vela2.jpg",
            "imagenes/vela3.jpg"
        ]
    },


    {
        titulo: "Vela para Bautizo",
        descripcion: "Recuerdo personalizado para bautizos y celebraciones religiosas.",

        imagenes: [
            "imagenes/vela3.jpg"
        ]
    },


    {
        titulo: "Vela personalizada",
        descripcion: "Diseño artesanal creado especialmente para tu celebración.",

        imagenes: [
            "imagenes/vela4.jpg"
        ]
    },


    {
        titulo: "Recuerdo artesanal",
        descripcion: "Velas personalizadas elaboradas con dedicación y amor.",

        imagenes: [
            "imagenes/vela5.jpg"
        ]
    },


    {
        titulo: "Velas MAILE",
        descripcion: "Detalles personalizados para momentos inolvidables.",

        imagenes: [
            "imagenes/vela6.jpg"
        ]
    }

];


let productoActual = 0;

let fotoActual = 0;


/* ABRIR PUBLICACIÓN */

function abrirPublicacion(indice) {

    productoActual = indice;

    fotoActual = 0;


    const producto = productos[indice];


    document.getElementById("tituloProducto").textContent =
        producto.titulo;


    document.getElementById("descripcionProducto").textContent =
        producto.descripcion;


    actualizarImagen();


    crearIndicadores();


    const mensaje =
        `Hola, estoy interesada en: ${producto.titulo}`;


    document.getElementById("botonWhatsapp").href =
        "https://wa.me/573000000000?text=" +
        encodeURIComponent(mensaje);


    document.getElementById("modal").style.display =
        "block";


    document.body.style.overflow =
        "hidden";
}


/* CERRAR */

function cerrarPublicacion() {

    document.getElementById("modal").style.display =
        "none";


    document.body.style.overflow =
        "auto";
}


/* ACTUALIZAR FOTO */

function actualizarImagen() {

    const producto =
        productos[productoActual];


    document.getElementById("imagenGrande").src =
        producto.imagenes[fotoActual];


    actualizarIndicadores();
}


/* SIGUIENTE */

function fotoSiguiente() {

    const producto =
        productos[productoActual];


    fotoActual++;


    if (fotoActual >= producto.imagenes.length) {

        fotoActual = 0;

    }


    actualizarImagen();
}


/* ANTERIOR */

function fotoAnterior() {

    const producto =
        productos[productoActual];


    fotoActual--;


    if (fotoActual < 0) {

        fotoActual =
            producto.imagenes.length - 1;

    }


    actualizarImagen();
}


/* CREAR PUNTOS */

function crearIndicadores() {

    const contenedor =
        document.getElementById("indicadores");


    contenedor.innerHTML = "";


    const producto =
        productos[productoActual];


    producto.imagenes.forEach(() => {

        const punto =
            document.createElement("div");


        punto.classList.add("punto");


        contenedor.appendChild(punto);

    });


    actualizarIndicadores();
}


/* ACTUALIZAR PUNTOS */

function actualizarIndicadores() {

    const puntos =
        document.querySelectorAll(".punto");


    puntos.forEach((punto, indice) => {

        punto.classList.remove("activo");


        if (indice === fotoActual) {

            punto.classList.add("activo");

        }

    });
}