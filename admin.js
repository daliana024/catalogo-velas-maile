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

let imagenesActuales = [];
let nuevosArchivos = [];
let categoriasSeleccionadas = [];
let empaqueSeleccionado = "";

iniciar();

async function iniciar() {
    configurarSelectores();
    configurarEventos();
    await comprobarSesion();
}

function configurarSelectores() {
    document.querySelectorAll(".opcion-categoria").forEach(boton => {
        boton.addEventListener("click", () => {
            const valor = boton.dataset.valor;
            if (categoriasSeleccionadas.includes(valor)) {
                categoriasSeleccionadas = categoriasSeleccionadas.filter(item => item !== valor);
                boton.classList.remove("seleccionada");
            } else {
                categoriasSeleccionadas.push(valor);
                boton.classList.add("seleccionada");
            }
        });
    });

    document.querySelectorAll(".opcion-empaque").forEach(boton => {
        boton.addEventListener("click", () => {
            document.querySelectorAll(".opcion-empaque").forEach(item => item.classList.remove("seleccionada"));
            boton.classList.add("seleccionada");
            empaqueSeleccionado = boton.dataset.valor;
        });
    });
}

function configurarEventos() {
    loginForm.addEventListener("submit", iniciarSesion);
    cerrarSesion.addEventListener("click", salir);
    productoForm.addEventListener("submit", guardar);
    cancelarEdicion.addEventListener("click", limpiarFormulario);

    fotosInput.addEventListener("change", () => {
        nuevosArchivos = Array.from(fotosInput.files || []);
        renderPreview();
    });
}

async function comprobarSesion() {
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        data.session ? mostrarAdmin() : mostrarLogin();
    } catch (error) {
        console.error("Error comprobando sesión:", error);
        mostrarLogin();
        mensajeLogin.textContent = "No se pudo comprobar la sesión.";
    }
}

async function iniciarSesion(evento) {
    evento.preventDefault();
    mensajeLogin.textContent = "Ingresando...";

    const email = document.getElementById("correo").value.trim();
    const password = document.getElementById("contrasena").value;

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        mensajeLogin.textContent = "";
        loginForm.reset();
        mostrarAdmin();
    } catch (error) {
        console.error("Error de inicio de sesión:", error);
        mensajeLogin.textContent = "No fue posible ingresar. Revisa el correo y la contraseña.";
    }
}

async function salir() {
    await supabaseClient.auth.signOut();
    limpiarFormulario();
    mostrarLogin();
}

function mostrarAdmin() {
    loginPanel.classList.add("oculto");
    adminPanel.classList.remove("oculto");
    cargarProductos();
}

function mostrarLogin() {
    adminPanel.classList.add("oculto");
    loginPanel.classList.remove("oculto");
}

function renderPreview() {
    previewFotos.innerHTML = "";

    imagenesActuales.forEach((url, indice) => {
        previewFotos.appendChild(crearPreview(url, () => {
            imagenesActuales.splice(indice, 1);
            renderPreview();
        }));
    });

    nuevosArchivos.forEach((archivo, indice) => {
        const url = URL.createObjectURL(archivo);
        previewFotos.appendChild(crearPreview(url, () => {
            URL.revokeObjectURL(url);
            nuevosArchivos.splice(indice, 1);
            renderPreview();
        }));
    });
}

function crearPreview(url, quitar) {
    const contenedor = document.createElement("div");
    contenedor.className = "preview-foto";

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Vista previa";

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "quitar-foto";
    boton.textContent = "×";
    boton.setAttribute("aria-label", "Quitar foto");
    boton.addEventListener("click", quitar);

    contenedor.append(img, boton);
    return contenedor;
}

async function guardar(evento) {
    evento.preventDefault();

    const productoId = document.getElementById("productoId").value;
    const titulo = document.getElementById("titulo").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const orden = Number(document.getElementById("orden").value) || 0;

    if (!categoriasSeleccionadas.length) {
        mensajeProducto.textContent = "Selecciona al menos una categoría.";
        return;
    }

    if (!empaqueSeleccionado) {
        mensajeProducto.textContent = "Selecciona un empaque.";
        return;
    }

    if (!titulo || !Number.isFinite(precio)) {
        mensajeProducto.textContent = "Completa el título y el precio.";
        return;
    }

    guardarProducto.disabled = true;
    mensajeProducto.textContent = "Guardando producto...";

    try {
        let urlsImagenes = [...imagenesActuales];

        if (nuevosArchivos.length) {
            const nuevasUrls = await subirFotos(nuevosArchivos);
            urlsImagenes = [...urlsImagenes, ...nuevasUrls];
        }

        if (!urlsImagenes.length) throw new Error("Debes agregar al menos una fotografía.");

        // Se usa la columna original 'descripcion' para guardar el empaque.
        // Así el proyecto funciona con tu tabla actual sin exigir una columna nueva.
        const datos = {
            titulo,
            precio,
            descripcion: empaqueSeleccionado,
            etiquetas: categoriasSeleccionadas,
            imagenes: urlsImagenes,
            orden
        };

        let respuesta;
        if (productoId) {
            respuesta = await supabaseClient.from("productos").update(datos).eq("id", productoId);
        } else {
            respuesta = await supabaseClient.from("productos").insert([datos]);
        }

        if (respuesta.error) throw respuesta.error;

        mensajeProducto.textContent = productoId ? "Producto actualizado correctamente." : "Producto publicado correctamente.";
        limpiarFormulario(false);
        await cargarProductos();
    } catch (error) {
        console.error("Error guardando producto:", error);
        mensajeProducto.textContent = `No se pudo guardar. ${error.message || "Revisa Supabase."}`;
    } finally {
        guardarProducto.disabled = false;
    }
}

async function subirFotos(archivos) {
    const urls = [];

    for (const archivo of archivos) {
        const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase();
        const id = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const ruta = `catalogo/${Date.now()}-${id}.${extension}`;

        const { error } = await supabaseClient.storage
            .from("productos")
            .upload(ruta, archivo, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const { data } = supabaseClient.storage.from("productos").getPublicUrl(ruta);
        if (!data?.publicUrl) throw new Error("No se pudo obtener la URL pública de una foto.");
        urls.push(data.publicUrl);
    }

    return urls;
}

async function cargarProductos() {
    listaProductos.innerHTML = "<p>Cargando productos...</p>";

    try {
        const { data, error } = await supabaseClient
            .from("productos")
            .select("*")
            .order("orden", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) throw error;

        listaProductos.innerHTML = "";
        if (!data?.length) {
            listaProductos.innerHTML = "<p>No hay productos publicados todavía.</p>";
            return;
        }

        data.forEach(producto => listaProductos.appendChild(crearProductoAdmin(producto)));
    } catch (error) {
        console.error("Error cargando productos:", error);
        listaProductos.innerHTML = `<p>No se pudieron cargar. ${escaparHTML(error.message || "")}</p>`;
    }
}

function crearProductoAdmin(producto) {
    const imagenes = convertirALista(producto.imagenes);
    const item = document.createElement("article");
    item.className = "producto-admin";

    const img = document.createElement("img");
    img.src = imagenes[0] || "";
    img.alt = producto.titulo || "Producto";

    const info = document.createElement("div");
    const titulo = document.createElement("h3");
    titulo.textContent = producto.titulo || "Vela Maile";

    const precio = document.createElement("p");
    precio.className = "precio";
    precio.textContent = formatearPrecio(producto.precio);

    const empaque = document.createElement("p");
    empaque.className = "empaque-mini";
    empaque.textContent = producto.empaque || producto.descripcion || "Sin empaque";

    const acciones = document.createElement("div");
    acciones.className = "acciones-producto";

    const editar = document.createElement("button");
    editar.type = "button";
    editar.className = "editar";
    editar.textContent = "Editar";
    editar.addEventListener("click", () => editarProducto(producto));

    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "eliminar";
    eliminar.textContent = "Eliminar";
    eliminar.addEventListener("click", () => eliminarProducto(producto));

    acciones.append(editar, eliminar);
    info.append(titulo, precio, empaque, acciones);
    item.append(img, info);
    return item;
}

function editarProducto(producto) {
    document.getElementById("productoId").value = producto.id;
    document.getElementById("titulo").value = producto.titulo || "";
    document.getElementById("precio").value = producto.precio ?? "";
    document.getElementById("orden").value = producto.orden || 0;

    categoriasSeleccionadas = convertirALista(producto.etiquetas);
    document.querySelectorAll(".opcion-categoria").forEach(boton => {
        boton.classList.toggle("seleccionada", categoriasSeleccionadas.includes(boton.dataset.valor));
    });

    empaqueSeleccionado = producto.empaque || producto.descripcion || "";
    document.querySelectorAll(".opcion-empaque").forEach(boton => {
        boton.classList.toggle("seleccionada", boton.dataset.valor === empaqueSeleccionado);
    });

    imagenesActuales = convertirALista(producto.imagenes);
    nuevosArchivos = [];
    fotosInput.value = "";
    renderPreview();

    guardarProducto.textContent = "Guardar cambios";
    cancelarEdicion.classList.remove("oculto");
    mensajeProducto.textContent = "Editando producto.";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function eliminarProducto(producto) {
    if (!confirm(`¿Eliminar "${producto.titulo}"?`)) return;

    try {
        const { error } = await supabaseClient.from("productos").delete().eq("id", producto.id);
        if (error) throw error;
        await cargarProductos();
    } catch (error) {
        console.error("Error eliminando producto:", error);
        alert(`No se pudo eliminar. ${error.message || ""}`);
    }
}

function limpiarFormulario(limpiarMensaje = true) {
    productoForm.reset();
    document.getElementById("productoId").value = "";
    document.getElementById("orden").value = 0;
    categoriasSeleccionadas = [];
    empaqueSeleccionado = "";
    imagenesActuales = [];
    nuevosArchivos = [];

    document.querySelectorAll(".opcion-categoria, .opcion-empaque").forEach(boton => boton.classList.remove("seleccionada"));
    previewFotos.innerHTML = "";
    guardarProducto.textContent = "Publicar producto";
    cancelarEdicion.classList.add("oculto");
    if (limpiarMensaje) mensajeProducto.textContent = "";
}

function convertirALista(valor) {
    if (Array.isArray(valor)) return valor.filter(Boolean);
    if (!valor) return [];
    if (typeof valor === "string") {
        try {
            const convertido = JSON.parse(valor);
            return Array.isArray(convertido) ? convertido.filter(Boolean) : [valor];
        } catch (_) {
            return [valor];
        }
    }
    return [];
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Number(precio) || 0);
}

function escaparHTML(texto) {
    return String(texto || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
