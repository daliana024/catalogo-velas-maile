const loginPanel = document.getElementById("loginPanel");
const adminPanel = document.getElementById("adminPanel");
const loginForm = document.getElementById("loginForm");
const mensajeLogin = document.getElementById("mensajeLogin");
const productoForm = document.getElementById("productoForm");
const mensajeProducto = document.getElementById("mensajeProducto");
const listaProductos = document.getElementById("listaProductos");
const previewFotos = document.getElementById("previewFotos");
const fotosInput = document.getElementById("fotos");
const cancelarEdicion = document.getElementById("cancelarEdicion");
const guardarProducto = document.getElementById("guardarProducto");
const cerrarSesion = document.getElementById("cerrarSesion");

const posicionXInput = document.getElementById("posicionX");
const posicionYInput = document.getElementById("posicionY");
const valorPosicionX = document.getElementById("valorPosicionX");
const valorPosicionY = document.getElementById("valorPosicionY");
const previewPrincipal = document.getElementById("previewPrincipal");
const restablecerPosicion = document.getElementById("restablecerPosicion");


let imagenesActuales = [];
let categoriasSeleccionadas = [];
let empaqueSeleccionado = "";

let urlTemporalPrincipal = null;


/* =====================================
   INICIAR
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    comprobarSesion
);


/* =====================================
   CATEGORÍAS
===================================== */

document
    .querySelectorAll(".opcion-categoria")
    .forEach((boton) => {

        boton.addEventListener(
            "click",
            () => {

                const valor =
                    boton.dataset.valor;


                if (
                    categoriasSeleccionadas.includes(
                        valor
                    )
                ) {

                    categoriasSeleccionadas =
                        categoriasSeleccionadas.filter(
                            (categoria) =>
                                categoria !== valor
                        );


                    boton.classList.remove(
                        "seleccionada"
                    );

                } else {

                    categoriasSeleccionadas.push(
                        valor
                    );


                    boton.classList.add(
                        "seleccionada"
                    );
                }

            }
        );

    });


/* =====================================
   EMPAQUE
===================================== */

document
    .querySelectorAll(".opcion-empaque")
    .forEach((boton) => {

        boton.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".opcion-empaque"
                    )
                    .forEach(
                        (otroBoton) => {

                            otroBoton.classList.remove(
                                "seleccionada"
                            );

                        }
                    );


                boton.classList.add(
                    "seleccionada"
                );


                empaqueSeleccionado =
                    boton.dataset.valor;

            }
        );

    });


/* =====================================
   COMPROBAR SESIÓN
===================================== */

async function comprobarSesion() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {
            throw error;
        }


        if (
            data &&
            data.session
        ) {

            mostrarAdmin();

        } else {

            mostrarLogin();

        }

    } catch (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );


        mostrarLogin();

    }

}


/* =====================================
   LOGIN
===================================== */

loginForm.addEventListener(
    "submit",

    async (evento) => {

        evento.preventDefault();


        const email =
            document
                .getElementById("correo")
                .value
                .trim();


        const password =
            document
                .getElementById("contrasena")
                .value;


        mensajeLogin.textContent =
            "Ingresando...";


        const {
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            console.error(
                "Error de inicio de sesión:",
                error
            );


            mensajeLogin.textContent =
                "Correo o contraseña incorrectos.";

            return;
        }


        mensajeLogin.textContent =
            "";


        loginForm.reset();


        mostrarAdmin();

    }
);


/* =====================================
   CERRAR SESIÓN
===================================== */

cerrarSesion.addEventListener(
    "click",

    async () => {

        await supabaseClient.auth
            .signOut();


        mostrarLogin();

    }
);


/* =====================================
   MOSTRAR ADMIN
===================================== */

function mostrarAdmin() {

    loginPanel.classList.add(
        "oculto"
    );


    adminPanel.classList.remove(
        "oculto"
    );


    cargarProductos();

}


/* =====================================
   MOSTRAR LOGIN
===================================== */

function mostrarLogin() {

    adminPanel.classList.add(
        "oculto"
    );


    loginPanel.classList.remove(
        "oculto"
    );

}


/* =====================================
   CAMBIO DE FOTOS
===================================== */

fotosInput.addEventListener(
    "change",

    () => {

        mostrarPreviewCompleto();

        actualizarImagenPrincipal();

    }
);


/* =====================================
   MOSTRAR PREVIEW COMPLETO
===================================== */

function mostrarPreviewCompleto() {

    previewFotos.innerHTML =
        "";


    /* FOTOS YA GUARDADAS */

    imagenesActuales.forEach(
        (url, indice) => {

            agregarPreviewExistente(
                url,
                indice
            );

        }
    );


    /* FOTOS NUEVAS */

    const archivos =
        Array.from(
            fotosInput.files
        );


    archivos.forEach(
        (archivo, indice) => {

            agregarPreviewNueva(
                archivo,
                indice
            );

        }
    );

}


/* =====================================
   PREVIEW FOTO EXISTENTE
===================================== */

function agregarPreviewExistente(
    url,
    indice
) {

    const contenedor =
        document.createElement(
            "div"
        );


    contenedor.className =
        "preview-foto";


    const img =
        document.createElement(
            "img"
        );


    img.src =
        url;


    img.alt =
        "Foto del producto";


    const eliminar =
        document.createElement(
            "button"
        );


    eliminar.type =
        "button";


    eliminar.className =
        "eliminar-foto";


    eliminar.textContent =
        "×";


    eliminar.setAttribute(
        "aria-label",
        "Eliminar foto"
    );


    eliminar.addEventListener(
        "click",

        () => {

            imagenesActuales.splice(
                indice,
                1
            );


            mostrarPreviewCompleto();

            actualizarImagenPrincipal();

        }
    );


    contenedor.appendChild(
        img
    );


    contenedor.appendChild(
        eliminar
    );


    previewFotos.appendChild(
        contenedor
    );

}


/* =====================================
   PREVIEW FOTO NUEVA
===================================== */

function agregarPreviewNueva(
    archivo,
    indice
) {

    const contenedor =
        document.createElement(
            "div"
        );


    contenedor.className =
        "preview-foto";


    const url =
        URL.createObjectURL(
            archivo
        );


    const img =
        document.createElement(
            "img"
        );


    img.src =
        url;


    img.alt =
        "Nueva foto";


    const eliminar =
        document.createElement(
            "button"
        );


    eliminar.type =
        "button";


    eliminar.className =
        "eliminar-foto";


    eliminar.textContent =
        "×";


    eliminar.setAttribute(
        "aria-label",
        "Eliminar foto"
    );


    eliminar.addEventListener(
        "click",

        () => {

            eliminarFotoNueva(
                indice
            );

        }
    );


    contenedor.appendChild(
        img
    );


    contenedor.appendChild(
        eliminar
    );


    previewFotos.appendChild(
        contenedor
    );

}


/* =====================================
   ELIMINAR FOTO NUEVA
===================================== */

function eliminarFotoNueva(
    indice
) {

    const archivos =
        Array.from(
            fotosInput.files
        );


    archivos.splice(
        indice,
        1
    );


    const transferencia =
        new DataTransfer();


    archivos.forEach(
        (archivo) => {

            transferencia.items.add(
                archivo
            );

        }
    );


    fotosInput.files =
        transferencia.files;


    mostrarPreviewCompleto();

    actualizarImagenPrincipal();

}


/* =====================================
   IMAGEN PRINCIPAL
===================================== */

function actualizarImagenPrincipal() {

    if (
        urlTemporalPrincipal
    ) {

        URL.revokeObjectURL(
            urlTemporalPrincipal
        );


        urlTemporalPrincipal =
            null;
    }


    const nuevasFotos =
        Array.from(
            fotosInput.files
        );


    /* PRIMERO FOTO EXISTENTE */

    if (
        imagenesActuales.length > 0
    ) {

        previewPrincipal.src =
            imagenesActuales[0];


        previewPrincipal.style.display =
            "block";


        actualizarPosicionPreview();

        return;
    }


    /* SI NO HAY EXISTENTES, USAR NUEVA */

    if (
        nuevasFotos.length > 0
    ) {

        urlTemporalPrincipal =
            URL.createObjectURL(
                nuevasFotos[0]
            );


        previewPrincipal.src =
            urlTemporalPrincipal;


        previewPrincipal.style.display =
            "block";


        actualizarPosicionPreview();

        return;
    }


    previewPrincipal.removeAttribute(
        "src"
    );


    previewPrincipal.style.display =
        "none";

}


/* =====================================
   POSICIÓN HORIZONTAL / VERTICAL
===================================== */

posicionXInput.addEventListener(
    "input",
    actualizarPosicionPreview
);


posicionYInput.addEventListener(
    "input",
    actualizarPosicionPreview
);


/* =====================================
   ACTUALIZAR POSICIÓN PREVIEW
===================================== */

function actualizarPosicionPreview() {

    const x =
        limitarPorcentaje(
            posicionXInput.value
        );


    const y =
        limitarPorcentaje(
            posicionYInput.value
        );


    valorPosicionX.textContent =
        `${x}%`;


    valorPosicionY.textContent =
        `${y}%`;


    previewPrincipal.style.objectPosition =
        `${x}% ${y}%`;

}


/* =====================================
   CENTRAR FOTO
===================================== */

restablecerPosicion.addEventListener(
    "click",

    () => {

        posicionXInput.value =
            50;


        posicionYInput.value =
            50;


        actualizarPosicionPreview();

    }
);


/* =====================================
   GUARDAR PRODUCTO
===================================== */

productoForm.addEventListener(
    "submit",

    async (evento) => {

        evento.preventDefault();


        mensajeProducto.textContent =
            "Guardando producto...";


        /* VALIDAR CATEGORÍA */

        if (
            categoriasSeleccionadas.length === 0
        ) {

            mensajeProducto.textContent =
                "Selecciona al menos una categoría.";

            return;
        }


        /* VALIDAR EMPAQUE */

        if (
            !empaqueSeleccionado
        ) {

            mensajeProducto.textContent =
                "Selecciona un empaque.";

            return;
        }


        const productoId =
            document
                .getElementById(
                    "productoId"
                )
                .value;


        const titulo =
            document
                .getElementById(
                    "titulo"
                )
                .value
                .trim();


        const precio =
            Number(
                document
                    .getElementById(
                        "precio"
                    )
                    .value
            );


        const orden =
            Number(
                document
                    .getElementById(
                        "orden"
                    )
                    .value
            ) || 0;


        const posicion_x =
            limitarPorcentaje(
                posicionXInput.value
            );


        const posicion_y =
            limitarPorcentaje(
                posicionYInput.value
            );


        if (!titulo) {

            mensajeProducto.textContent =
                "Escribe el título del producto.";

            return;
        }


        if (
            !Number.isFinite(precio) ||
            precio < 0
        ) {

            mensajeProducto.textContent =
                "Escribe un precio válido.";

            return;
        }


        let urlsImagenes =
            [...imagenesActuales];


        const nuevasFotos =
            Array.from(
                fotosInput.files
            );


        /* SUBIR NUEVAS FOTOS */

        if (
            nuevasFotos.length > 0
        ) {

            const urlsNuevas =
                await subirFotos(
                    nuevasFotos
                );


            if (
                !urlsNuevas
            ) {

                mensajeProducto.textContent =
                    "No se pudieron subir las fotos.";

                return;
            }


            urlsImagenes = [
                ...urlsImagenes,
                ...urlsNuevas
            ];

        }


        /* VALIDAR AL MENOS UNA FOTO */

        if (
            urlsImagenes.length === 0
        ) {

            mensajeProducto.textContent =
                "Debes agregar al menos una fotografía.";

            return;
        }


        /* =====================================
           DATOS PARA SUPABASE

           Empaque se guarda en descripcion
        ===================================== */

        const datos = {

            titulo,

            precio,

            descripcion:
                empaqueSeleccionado,

            etiquetas:
                categoriasSeleccionadas,

            imagenes:
                urlsImagenes,

            orden,

            posicion_x,

            posicion_y

        };


        let resultado;


        /* EDITAR */

        if (
            productoId
        ) {

            resultado =
                await supabaseClient
                    .from("productos")
                    .update(datos)
                    .eq(
                        "id",
                        productoId
                    );

        }


        /* CREAR */

        else {

            resultado =
                await supabaseClient
                    .from("productos")
                    .insert([
                        datos
                    ]);

        }


        if (
            resultado.error
        ) {

            console.error(
                "ERROR SUPABASE:",
                resultado.error
            );


            mensajeProducto.textContent =
                "No se pudo guardar: " +
                (
                    resultado.error.message ||
                    "Error desconocido"
                );


            return;
        }


        mensajeProducto.textContent =
            productoId
                ? "Producto actualizado correctamente."
                : "Producto publicado correctamente.";


        limpiarFormulario();


        await cargarProductos();

    }
);


/* =====================================
   SUBIR FOTOS A STORAGE
===================================== */

async function subirFotos(
    archivos
) {

    const urls =
        [];


    for (
        const archivo
        of archivos
    ) {

        const extension =
            (
                archivo.name
                    .split(".")
                    .pop() ||
                "jpg"
            )
                .toLowerCase();


        const nombre =
            `${Date.now()}-${crypto.randomUUID()}.${extension}`;


        const ruta =
            `catalogo/${nombre}`;


        const {
            error
        } =
            await supabaseClient.storage
                .from("productos")
                .upload(
                    ruta,
                    archivo,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false
                    }
                );


        if (
            error
        ) {

            console.error(
                "ERROR STORAGE:",
                error
            );


            mensajeProducto.textContent =
                "Error subiendo imagen: " +
                (
                    error.message ||
                    ""
                );


            return null;
        }


        const {
            data
        } =
            supabaseClient.storage
                .from("productos")
                .getPublicUrl(
                    ruta
                );


        if (
            data &&
            data.publicUrl
        ) {

            urls.push(
                data.publicUrl
            );

        }

    }


    return urls;

}


/* =====================================
   CARGAR PRODUCTOS
===================================== */

async function cargarProductos() {

    listaProductos.innerHTML =
        "<p>Cargando productos...</p>";


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


    if (
        error
    ) {

        console.error(
            "Error cargando productos:",
            error
        );


        listaProductos.innerHTML =
            "<p>No se pudieron cargar los productos.</p>";

        return;
    }


    listaProductos.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        listaProductos.innerHTML =
            "<p>No hay productos publicados todavía.</p>";

        return;
    }


    data.forEach(
        (producto) => {

            const imagenes =
                convertirALista(
                    producto.imagenes
                );


            const x =
                limitarPorcentaje(
                    producto.posicion_x ??
                    50
                );


            const y =
                limitarPorcentaje(
                    producto.posicion_y ??
                    50
                );


            const empaque =
                producto.descripcion ||
                producto.empaque ||
                "Sin empaque";


            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "producto-admin";


            /* MINIATURA */

            const miniatura =
                document.createElement(
                    "div"
                );


            miniatura.className =
                "producto-miniatura";


            const imagen =
                document.createElement(
                    "img"
                );


            imagen.src =
                imagenes[0] || "";


            imagen.alt =
                producto.titulo || "";


            imagen.style.objectPosition =
                `${x}% ${y}%`;


            const logo =
                document.createElement(
                    "img"
                );


            logo.className =
                "producto-logo-mini";


            logo.src =
                "imagenes/logo-maile.png";


            logo.alt =
                "";


            miniatura.appendChild(
                imagen
            );


            miniatura.appendChild(
                logo
            );


            /* INFORMACIÓN */

            const info =
                document.createElement(
                    "div"
                );


            const titulo =
                document.createElement(
                    "h3"
                );


            titulo.textContent =
                producto.titulo ||
                "Vela Maile";


            const precio =
                document.createElement(
                    "p"
                );


            precio.className =
                "precio";


            precio.textContent =
                formatearPrecio(
                    producto.precio
                );


            const empaqueTexto =
                document.createElement(
                    "p"
                );


            empaqueTexto.className =
                "empaque-mini";


            empaqueTexto.textContent =
                empaque;


            /* ACCIONES */

            const acciones =
                document.createElement(
                    "div"
                );


            acciones.className =
                "acciones-producto";


            const editar =
                document.createElement(
                    "button"
                );


            editar.type =
                "button";


            editar.className =
                "editar";


            editar.textContent =
                "Editar";


            editar.addEventListener(
                "click",
                () => {

                    editarProducto(
                        producto
                    );

                }
            );


            const eliminar =
                document.createElement(
                    "button"
                );


            eliminar.type =
                "button";


            eliminar.className =
                "eliminar";


            eliminar.textContent =
                "Eliminar";


            eliminar.addEventListener(
                "click",
                () => {

                    eliminarProducto(
                        producto
                    );

                }
            );


            acciones.appendChild(
                editar
            );


            acciones.appendChild(
                eliminar
            );


            info.appendChild(
                titulo
            );


            info.appendChild(
                precio
            );


            info.appendChild(
                empaqueTexto
            );


            info.appendChild(
                acciones
            );


            item.appendChild(
                miniatura
            );


            item.appendChild(
                info
            );


            listaProductos.appendChild(
                item
            );

        }
    );

}


/* =====================================
   EDITAR PRODUCTO
===================================== */

function editarProducto(
    producto
) {

    document
        .getElementById(
            "productoId"
        )
        .value =
        producto.id;


    document
        .getElementById(
            "titulo"
        )
        .value =
        producto.titulo || "";


    document
        .getElementById(
            "precio"
        )
        .value =
        producto.precio || "";


    document
        .getElementById(
            "orden"
        )
        .value =
        producto.orden || 0;


    /* CATEGORÍAS */

    categoriasSeleccionadas =
        convertirALista(
            producto.etiquetas
        );


    document
        .querySelectorAll(
            ".opcion-categoria"
        )
        .forEach(
            (boton) => {

                boton.classList.toggle(
                    "seleccionada",
                    categoriasSeleccionadas.includes(
                        boton.dataset.valor
                    )
                );

            }
        );


    /* EMPAQUE */

    empaqueSeleccionado =
        producto.descripcion ||
        producto.empaque ||
        "";


    document
        .querySelectorAll(
            ".opcion-empaque"
        )
        .forEach(
            (boton) => {

                boton.classList.toggle(
                    "seleccionada",
                    boton.dataset.valor ===
                    empaqueSeleccionado
                );

            }
        );


    /* FOTOS */

    imagenesActuales =
        convertirALista(
            producto.imagenes
        );


    /* POSICIÓN */

    posicionXInput.value =
        limitarPorcentaje(
            producto.posicion_x ??
            50
        );


    posicionYInput.value =
        limitarPorcentaje(
            producto.posicion_y ??
            50
        );


    fotosInput.value =
        "";


    mostrarPreviewCompleto();

    actualizarImagenPrincipal();


    guardarProducto.textContent =
        "Guardar cambios";


    cancelarEdicion.classList.remove(
        "oculto"
    );


    mensajeProducto.textContent =
        "Editando producto.";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================
   ELIMINAR PRODUCTO
===================================== */

async function eliminarProducto(
    producto
) {

    const confirmar =
        confirm(
            `¿Seguro que quieres eliminar "${producto.titulo}"?`
        );


    if (
        !confirmar
    ) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("productos")
            .delete()
            .eq(
                "id",
                producto.id
            );


    if (
        error
    ) {

        console.error(
            "Error eliminando producto:",
            error
        );


        alert(
            "No se pudo eliminar el producto."
        );


        return;
    }


    await cargarProductos();

}


/* =====================================
   CANCELAR EDICIÓN
===================================== */

cancelarEdicion.addEventListener(
    "click",

    () => {

        limpiarFormulario();

        mensajeProducto.textContent =
            "";

    }
);


/* =====================================
   LIMPIAR FORMULARIO
===================================== */

function limpiarFormulario() {

    productoForm.reset();


    document
        .getElementById(
            "productoId"
        )
        .value =
        "";


    document
        .getElementById(
            "orden"
        )
        .value =
        0;


    categoriasSeleccionadas =
        [];


    empaqueSeleccionado =
        "";


    imagenesActuales =
        [];


    fotosInput.value =
        "";


    posicionXInput.value =
        50;


    posicionYInput.value =
        50;


    document
        .querySelectorAll(
            ".opcion-categoria, .opcion-empaque"
        )
        .forEach(
            (boton) => {

                boton.classList.remove(
                    "seleccionada"
                );

            }
        );


    previewFotos.innerHTML =
        "";


    if (
        urlTemporalPrincipal
    ) {

        URL.revokeObjectURL(
            urlTemporalPrincipal
        );


        urlTemporalPrincipal =
            null;

    }


    previewPrincipal.removeAttribute(
        "src"
    );


    previewPrincipal.style.display =
        "none";


    actualizarPosicionPreview();


    guardarProducto.textContent =
        "Publicar producto";


    cancelarEdicion.classList.add(
        "oculto"
    );

}


/* =====================================
   CONVERTIR A LISTA
===================================== */

function convertirALista(
    valor
) {

    if (
        Array.isArray(valor)
    ) {

        return valor;
    }


    if (
        !valor
    ) {

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


            if (
                Array.isArray(
                    convertido
                )
            ) {

                return convertido;
            }

        } catch (error) {

            return [
                valor
            ];
        }

    }


    return [];

}


/* =====================================
   LIMITAR PORCENTAJE
===================================== */

function limitarPorcentaje(
    valor
) {

    const numero =
        Number(valor);


    if (
        !Number.isFinite(
            numero
        )
    ) {

        return 50;
    }


    return Math.max(
        0,
        Math.min(
            100,
            numero
        )
    );

}


/* =====================================
   FORMATEAR PRECIO
===================================== */

function formatearPrecio(
    precio
) {

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