/* =====================================
   ELEMENTOS DEL HTML
===================================== */

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

const guardarProducto =
    document.getElementById("guardarProducto");

const cerrarSesion =
    document.getElementById("cerrarSesion");


/* =====================================
   VARIABLES
===================================== */

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

    const {
        data: { session },
        error
    } =
        await supabaseClient.auth
            .getSession();


    if (error) {

        console.error(
            "Error comprobando sesión:",
            error
        );

    }


    if (session) {

        mostrarAdmin();

    } else {

        mostrarLogin();

    }

}


/* =====================================
   INICIAR SESIÓN
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

        const {
            error
        } =
            await supabaseClient.auth
                .signOut();


        if (error) {

            console.error(
                "Error cerrando sesión:",
                error
            );

            return;
        }


        mostrarLogin();

    }
);


/* =====================================
   MOSTRAR ADMINISTRADOR
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
   PREVISUALIZAR FOTOS
===================================== */

fotosInput.addEventListener(
    "change",

    () => {

        mostrarPreviewCompleto();

    }
);


/* =====================================
   MOSTRAR TODAS LAS FOTOS
===================================== */

function mostrarPreviewCompleto() {

    previewFotos.innerHTML =
        "";


    /* FOTOS QUE YA EXISTEN */

    imagenesActuales.forEach(
        (url) => {

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


            contenedor.appendChild(
                img
            );


            previewFotos.appendChild(
                contenedor
            );

        }
    );


    /* FOTOS NUEVAS */

    const archivos =
        Array.from(
            fotosInput.files
        );


    archivos.forEach(
        (archivo) => {

            const url =
                URL.createObjectURL(
                    archivo
                );


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
                "Nueva foto";


            contenedor.appendChild(
                img
            );


            previewFotos.appendChild(
                contenedor
            );

        }
    );

}


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


        /* SUBIR FOTOS NUEVAS */

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


        /* AL MENOS UNA FOTO */

        if (
            urlsImagenes.length === 0
        ) {

            mensajeProducto.textContent =
                "Debes agregar al menos una fotografía.";

            return;
        }


        /* DATOS */

        const datos = {

            titulo,

            precio,

            etiquetas:
                categoriasSeleccionadas,

            // Usamos la columna existente "descripcion" para guardar el empaque.
            // Así no dependemos de crear una columna nueva en Supabase.
            descripcion:
                empaqueSeleccionado,

            imagenes:
                urlsImagenes,

            orden

        };


        let error;


        /* EDITAR PRODUCTO */

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

        }


        /* CREAR PRODUCTO */

        else {

            const resultado =
                await supabaseClient
                    .from("productos")
                    .insert([
                        datos
                    ]);


            error =
                resultado.error;

        }


        if (error) {

            console.error(
                "Error guardando producto:",
                error
            );


            mensajeProducto.textContent =
                `No se pudo guardar: ${error.message || "error desconocido"}`;

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
   SUBIR FOTOS A SUPABASE STORAGE
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
            archivo.name
                .split(".")
                .pop()
                .toLowerCase();


        const nombre =
            `${Date.now()}-${crypto.randomUUID()}.${extension}`;


        const ruta =
            `catalogo/${nombre}`;


        const {
            error: errorSubida
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


        if (errorSubida) {

            console.error(
                "Error subiendo foto:",
                errorSubida
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


    if (error) {

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


            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "producto-admin";


            const imagenPrincipal =
                imagenes.length > 0
                    ? imagenes[0]
                    : "";


            item.innerHTML = `

                <img
                    src="${imagenPrincipal}"
                    alt="${escaparHTML(producto.titulo)}"
                >

                <div>

                    <h3>
                        ${escaparHTML(producto.titulo)}
                    </h3>

                    <p class="precio">
                        ${formatearPrecio(
                            producto.precio
                        )}
                    </p>

                    <p class="empaque-mini">
                        ${
                            (producto.empaque || producto.descripcion)
                                ? escaparHTML(
                                    producto.empaque || producto.descripcion
                                )
                                : "Sin empaque"
                        }
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

                const activa =
                    categoriasSeleccionadas
                        .includes(
                            boton.dataset.valor
                        );


                boton.classList.toggle(
                    "seleccionada",
                    activa
                );

            }
        );


    /* EMPAQUE */

    empaqueSeleccionado =
        producto.empaque ||
        producto.descripcion ||
        "";


    document
        .querySelectorAll(
            ".opcion-empaque"
        )
        .forEach(
            (boton) => {

                const activo =
                    boton.dataset.valor ===
                    empaqueSeleccionado;


                boton.classList.toggle(
                    "seleccionada",
                    activo
                );

            }
        );


    /* IMÁGENES */

    imagenesActuales =
        convertirALista(
            producto.imagenes
        );


    fotosInput.value =
        "";


    mostrarPreviewCompleto();


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


    /* CORRECCIÓN IMPORTANTE:
       TODO EN UNA MISMA LÍNEA
    */

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


    guardarProducto.textContent =
        "Publicar producto";


    cancelarEdicion.classList.add(
        "oculto"
    );

}


/* =====================================
   CONVERTIR JSON A ARRAY
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


/* =====================================
   ESCAPAR TEXTO HTML
===================================== */

function escaparHTML(
    texto
) {

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