const loginPanel =
    document.getElementById("loginPanel");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const mensajeLogin =
    document.getElementById("mensajeLogin");

const productoForm =
    document.getElementById("productoForm");

const mensajeProducto =
    document.getElementById("mensajeProducto");

const listaProductos =
    document.getElementById("listaProductos");

const previewFotos =
    document.getElementById("previewFotos");

const fotosInput =
    document.getElementById("fotos");

const cancelarEdicion =
    document.getElementById("cancelarEdicion");


let imagenesActuales = [];

let categoriasSeleccionadas = [];

let empaqueSeleccionado = "";


/* =====================================
   INICIAR
===================================== */

comprobarSesion();


/* =====================================
   CATEGORÍAS
===================================== */

document
    .querySelectorAll(
        ".opcion-categoria"
    )
    .forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    const valor =
                        boton.dataset.valor;


                    if (
                        categoriasSeleccionadas
                            .includes(valor)
                    ) {

                        categoriasSeleccionadas =
                            categoriasSeleccionadas
                                .filter(
                                    categoria =>
                                        categoria !== valor
                                );


                        boton.classList.remove(
                            "seleccionada"
                        );

                    } else {

                        categoriasSeleccionadas
                            .push(valor);


                        boton.classList.add(
                            "seleccionada"
                        );

                    }

                }
            );

        }
    );


/* =====================================
   EMPAQUE
===================================== */

document
    .querySelectorAll(
        ".opcion-empaque"
    )
    .forEach(
        boton => {

            boton.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".opcion-empaque"
                        )
                        .forEach(
                            otro =>
                                otro.classList.remove(
                                    "seleccionada"
                                )
                        );


                    boton.classList.add(
                        "seleccionada"
                    );


                    empaqueSeleccionado =
                        boton.dataset.valor;

                }
            );

        }
    );


/* =====================================
   SESIÓN
===================================== */

async function comprobarSesion() {

    const {
        data: { session }
    } =
        await supabaseClient.auth
            .getSession();


    if (session) {

        mostrarAdmin();

    } else {

        mostrarLogin();

    }

}


/* =====================================
   LOGIN
===================================== */

loginForm.addEventListener(
    "submit",

    async evento => {

        evento.preventDefault();


        const email =
            document
                .getElementById(
                    "correo"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "contrasena"
                )
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

            console.error(error);

            mensajeLogin.textContent =
                "Correo o contraseña incorrectos.";

            return;

        }


        mensajeLogin.textContent = "";

        mostrarAdmin();

    }
);


/* =====================================
   CERRAR SESIÓN
===================================== */

document
    .getElementById(
        "cerrarSesion"
    )
    .addEventListener(
        "click",

        async () => {

            await supabaseClient.auth
                .signOut();


            mostrarLogin();

        }
    );


function mostrarAdmin() {

    loginPanel
        .classList
        .add("oculto");


    adminPanel
        .classList
        .remove("oculto");


    cargarProductos();

}


function mostrarLogin() {

    adminPanel
        .classList
        .add("oculto");


    loginPanel
        .classList
        .remove("oculto");

}


/* =====================================
   PREVISUALIZAR FOTOS
===================================== */

fotosInput.addEventListener(
    "change",

    () => {

        mostrarPreviewCompleto();

    }
);


function mostrarPreviewCompleto() {

    previewFotos.innerHTML = "";


    imagenesActuales.forEach(
        url => {

            const img =
                document.createElement(
                    "img"
                );


            img.src = url;


            previewFotos.appendChild(
                img
            );

        }
    );


    const archivos =
        Array.from(
            fotosInput.files
        );


    archivos.forEach(
        archivo => {

            const url =
                URL.createObjectURL(
                    archivo
                );


            const img =
                document.createElement(
                    "img"
                );


            img.src = url;


            previewFotos.appendChild(
                img
            );

        }
    );

}


/* =====================================
   GUARDAR PRODUCTO
===================================== */

productoForm.addEventListener(
    "submit",

    async evento => {

        evento.preventDefault();


        mensajeProducto.textContent =
            "Guardando producto...";


        if (
            categoriasSeleccionadas.length === 0
        ) {

            mensajeProducto.textContent =
                "Selecciona al menos una categoría.";

            return;
        }


        if (!empaqueSeleccionado) {

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


        let urlsImagenes =
            [...imagenesActuales];


        const nuevasFotos =
            Array.from(
                fotosInput.files
            );


        if (
            nuevasFotos.length > 0
        ) {

            const urlsNuevas =
                await subirFotos(
                    nuevasFotos
                );


            if (!urlsNuevas) {

                mensajeProducto.textContent =
                    "No se pudieron subir las fotos.";

                return;
            }


            urlsImagenes = [
                ...urlsImagenes,
                ...urlsNuevas
            ];

        }


        if (
            urlsImagenes.length === 0
        ) {

            mensajeProducto.textContent =
                "Agrega al menos una fotografía.";

            return;
        }


        const datos = {

            titulo,

            precio,

            etiquetas:
                categoriasSeleccionadas,

            empaque:
                empaqueSeleccionado,

            imagenes:
                urlsImagenes,

            orden

        };


        let error;


        if (productoId) {

            const resultado =
                await supabaseClient
                    .from("productos")
                    .update(datos)
                    .eq(
                        "id",
                        productoId
                    );


            error =
                resultado.error;

        } else {

            const resultado =
                await supabaseClient
                    .from("productos")
                    .insert(datos);


            error =
                resultado.error;

        }


        if (error) {

            console.error(error);

            mensajeProducto.textContent =
                "No se pudo guardar el producto.";

            return;
        }


        mensajeProducto.textContent =
            "Producto guardado correctamente.";


        limpiarFormulario();

        cargarProductos();

    }
);


/* =====================================
   SUBIR FOTOS
===================================== */

async function subirFotos(
    archivos
) {

    const urls = [];


    for (
        const archivo
        of archivos
    ) {

        const extension =
            archivo.name
                .split(".")
                .pop();


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
                    archivo
                );


        if (error) {

            console.error(
                "Error subiendo foto:",
                error
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


        urls.push(
            data.publicUrl
        );

    }


    return urls;

}


/* =====================================
   CARGAR PRODUCTOS
===================================== */

async function cargarProductos() {

    listaProductos.innerHTML =
        "Cargando...";


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

        listaProductos.innerHTML =
            "No se pudieron cargar.";

        return;
    }


    listaProductos.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        listaProductos.innerHTML =
            "<p>No hay productos todavía.</p>";

        return;
    }


    data.forEach(
        producto => {

            const imagenes =
                convertirALista(
                    producto.imagenes
                );


            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "producto-admin";


            item.innerHTML = `

                <img
                    src="${imagenes[0] || ""}"
                    alt="${producto.titulo}"
                >

                <div>

                    <h3>
                        ${producto.titulo}
                    </h3>

                    <p class="precio">
                        ${formatearPrecio(
                            producto.precio
                        )}
                    </p>

                    <p class="empaque-mini">
                        ${producto.empaque || ""}
                    </p>

                    <div class="acciones-producto">

                        <button
                            class="editar"
                            type="button"
                        >
                            Editar
                        </button>

                        <button
                            class="eliminar"
                            type="button"
                        >
                            Eliminar
                        </button>

                    </div>

                </div>
            `;


            item
                .querySelector(
                    ".editar"
                )
                .addEventListener(
                    "click",
                    () =>
                        editarProducto(
                            producto
                        )
                );


            item
                .querySelector(
                    ".eliminar"
                )
                .addEventListener(
                    "click",
                    () =>
                        eliminarProducto(
                            producto
                        )
                );


            listaProductos
                .appendChild(
                    item
                );

        }
    );

}


/* =====================================
   EDITAR
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


    categoriasSeleccionadas =
        convertirALista(
            producto.etiquetas
        );


    document
        .querySelectorAll(
            ".opcion-categoria"
        )
        .forEach(
            boton => {

                boton.classList.toggle(
                    "seleccionada",
                    categoriasSeleccionadas
                        .includes(
                            boton.dataset.valor
                        )
                );

            }
        );


    empaqueSeleccionado =
        producto.empaque || "";


    document
        .querySelectorAll(
            ".opcion-empaque"
        )
        .forEach(
            boton => {

                boton.classList.toggle(
                    "seleccionada",
                    boton.dataset.valor ===
                    empaqueSeleccionado
                );

            }
        );


    imagenesActuales =
        convertirALista(
            producto.imagenes
        );


    mostrarPreviewCompleto();


    document
        .getElementById(
            "guardarProducto"
        )
        .textContent =
        "Guardar cambios";


    cancelarEdicion
        .classList
        .remove("oculto");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================
   ELIMINAR
===================================== */

async function eliminarProducto(
    producto
) {

    const confirmar =
        confirm(
            `¿Eliminar "${producto.titulo}"?`
        );


    if (!confirmar) {
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


    if (error) {

        console.error(error);

        alert(
            "No se pudo eliminar."
        );

        return;
    }


    cargarProductos();

}


/* =====================================
   CANCELAR EDICIÓN
===================================== */

cancelarEdicion.addEventListener(
    "click",
    limpiarFormulario
);


/* =====================================
   LIMPIAR
===================================== */

function limpiarFormulario() {

    productoForm.reset();


    document
        .getElementById(
            "productoId"
        )
        .value = "";


    document
        .getElementById(
            "orden"
        )
        .value = 0;


    categoriasSeleccionadas = [];

    empaqueSeleccionado = "";

    imagenesActuales = [];


    document
        .querySelectorAll(
            ".opcion-categoria,
             .opcion-empaque"
        )
        .forEach(
            boton =>
                boton.classList.remove(
                    "seleccionada"
                )
        );


    previewFotos.innerHTML = "";


    document
        .getElementById(
            "guardarProducto"
        )
        .textContent =
        "Publicar producto";


    cancelarEdicion
        .classList
        .add("oculto");

}


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
                JSON.parse(valor);


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