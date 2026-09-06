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


/* =====================================
   COMPROBAR SESIÓN
===================================== */

comprobarSesion();


async function comprobarSesion() {

    const {
        data: { session }
    } =
        await supabaseClient.auth.getSession();


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

    async function(evento) {

        evento.preventDefault();


        const email =
            document.getElementById(
                "correo"
            ).value.trim();


        const password =
            document.getElementById(
                "contrasena"
            ).value;


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

            mensajeLogin.textContent =
                "No se pudo iniciar sesión.";

            return;

        }


        mensajeLogin.textContent = "";

        mostrarAdmin();

    }
);


/* =====================================
   CERRAR SESIÓN
===================================== */

document.getElementById(
    "cerrarSesion"
).addEventListener(
    "click",

    async function() {

        await supabaseClient.auth
            .signOut();


        mostrarLogin();

    }
);


/* =====================================
   MOSTRAR PANELES
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


function mostrarLogin() {

    adminPanel.classList.add(
        "oculto"
    );

    loginPanel.classList.remove(
        "oculto"
    );

}


/* =====================================
   PREVISUALIZACIÓN DE FOTOS
===================================== */

fotosInput.addEventListener(
    "change",

    function() {

        previewFotos.innerHTML = "";


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
);


/* =====================================
   GUARDAR PRODUCTO
===================================== */

productoForm.addEventListener(
    "submit",

    async function(evento) {

        evento.preventDefault();


        mensajeProducto.textContent =
            "Guardando producto...";


        const productoId =
            document.getElementById(
                "productoId"
            ).value;


        const titulo =
            document.getElementById(
                "titulo"
            ).value.trim();


        const precio =
            Number(
                document.getElementById(
                    "precio"
                ).value
            );


        const descripcion =
            document.getElementById(
                "descripcion"
            ).value.trim();


        const etiquetas =
            document.getElementById(
                "etiquetas"
            )
            .value
            .split(",")
            .map(
                etiqueta =>
                    etiqueta.trim()
            )
            .filter(Boolean);


        const orden =
            Number(
                document.getElementById(
                    "orden"
                ).value
            ) || 0;


        let urlsImagenes =
            [...imagenesActuales];


        const nuevasFotos =
            Array.from(
                fotosInput.files
            );


        if (nuevasFotos.length > 0) {

            const urlsNuevas =
                await subirFotos(
                    nuevasFotos
                );


            if (!urlsNuevas) {

                mensajeProducto.textContent =
                    "No se pudieron subir las fotos.";

                return;

            }


            urlsImagenes =
                [
                    ...urlsImagenes,
                    ...urlsNuevas
                ];

        }


        if (
            urlsImagenes.length === 0
        ) {

            mensajeProducto.textContent =
                "Debes agregar al menos una foto.";

            return;

        }


        const datos = {

            titulo,

            precio,

            descripcion,

            etiquetas,

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

            console.error(error);

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
            "No se pudieron cargar los productos.";

        return;

    }


    listaProductos.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        listaProductos.innerHTML =
            "<p>No hay productos publicados todavía.</p>";

        return;

    }


    data.forEach(
        producto => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "producto-admin";


            const imagen =
                Array.isArray(
                    producto.imagenes
                )
                ? producto.imagenes[0]
                : "";


            item.innerHTML = `

                <img
                    src="${imagen}"
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


            item.querySelector(
                ".editar"
            ).addEventListener(
                "click",

                () =>
                    editarProducto(
                        producto
                    )
            );


            item.querySelector(
                ".eliminar"
            ).addEventListener(
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

    document.getElementById(
        "productoId"
    ).value =
        producto.id;


    document.getElementById(
        "titulo"
    ).value =
        producto.titulo || "";


    document.getElementById(
        "precio"
    ).value =
        producto.precio || "";


    document.getElementById(
        "descripcion"
    ).value =
        producto.descripcion || "";


    document.getElementById(
        "etiquetas"
    ).value =
        Array.isArray(
            producto.etiquetas
        )
        ? producto.etiquetas.join(
            ", "
        )
        : "";


    document.getElementById(
        "orden"
    ).value =
        producto.orden || 0;


    imagenesActuales =
        Array.isArray(
            producto.imagenes
        )
        ? [...producto.imagenes]
        : [];


    mostrarImagenesActuales();


    document.getElementById(
        "guardarProducto"
    ).textContent =
        "Guardar cambios";


    cancelarEdicion.classList
        .remove(
            "oculto"
        );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================
   IMÁGENES EXISTENTES
===================================== */

function mostrarImagenesActuales() {

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

}


/* =====================================
   CANCELAR EDICIÓN
===================================== */

cancelarEdicion.addEventListener(
    "click",

    limpiarFormulario
);


/* =====================================
   ELIMINAR PRODUCTO
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
   LIMPIAR FORMULARIO
===================================== */

function limpiarFormulario() {

    productoForm.reset();


    document.getElementById(
        "productoId"
    ).value = "";


    document.getElementById(
        "orden"
    ).value = 0;


    imagenesActuales = [];


    previewFotos.innerHTML = "";


    document.getElementById(
        "guardarProducto"
    ).textContent =
        "Publicar producto";


    cancelarEdicion.classList
        .add(
            "oculto"
        );

}


/* =====================================
   PRECIO
===================================== */

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