const productos = [

    {
        titulo: "Vela personalizada",
        descripcion: "Vela artesanal personalizada, ideal para recuerdos y celebraciones especiales.",

        imagenes: [
            "imagenes/vela1.jpg",
            "imagenes/vela2.jpg",
            "imagenes/vela3.jpg"
        ]
    },

    {
        titulo: "Vela Baby Shower",
        descripcion: "Hermoso recuerdo personalizado para celebrar la llegada de tu bebé.",

        imagenes: [
            "imagenes/vela2.jpg",
            "imagenes/vela3.jpg"
        ]
    },

    {
        titulo: "Vela Bautizo",
        descripcion: "Vela personalizada para bautizos y celebraciones religiosas.",

        imagenes: [
            "imagenes/vela3.jpg"
        ]
    },

    {
        titulo: "Vela personalizada",
        descripcion: "Diseño artesanal elaborado especialmente para tu celebración.",

        imagenes: [
            "imagenes/vela4.jpg"
        ]
    },

    {
        titulo: "Recuerdo artesanal",
        descripcion: "Recuerdo personalizado elaborado con amor.",

        imagenes: [
            "imagenes/vela5.jpg"
        ]
    },

    {
        titulo: "Velas MAILE",
        descripcion: "Detalles especiales para momentos inolvidables.",

        imagenes: [
            "imagenes/vela6.jpg"
        ]
    }

];


let productoActual = 0;

let fotoActual = 0;


function abrirPublicacion(indice) {

    productoActual = indice;

    fotoActual = 0;

    const producto = productos[indice];


    document.getElementById("tituloProducto").textContent =
        producto.titulo;

    document.getElementById("descripcionProducto").textContent =
        producto.descripcion;


    mostrarFoto();


    const mensaje =
        "Hola, estoy interesada en " +
        producto.titulo;


    document.getElementById("botonWhatsapp").href =
        "https://wa.me/573000000000?text=" +
        encodeURIComponent(mensaje);


    document.getElementById("modal").style.display =
        "block";

}


function cerrarPublicacion() {

    document.getElementById("modal").style.display =
        "none";

}


function mostrarFoto() {

    const producto =
        productos[productoActual];


    document.getElementById("imagenGrande").src =
        producto.imagenes[fotoActual];

}


function fotoSiguiente() {

    const producto =
        productos[productoActual];


    fotoActual++;


    if (fotoActual >= producto.imagenes.length) {

        fotoActual = 0;

    }


    mostrarFoto();

}


function fotoAnterior() {

    const producto =
        productos[productoActual];


    fotoActual--;


    if (fotoActual < 0) {

        fotoActual =
            producto.imagenes.length - 1;

    }


    mostrarFoto();

}