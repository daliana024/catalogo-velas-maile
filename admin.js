(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const loginPanel = $("loginPanel");
  const adminPanel = $("adminPanel");
  const loginForm = $("loginForm");
  const mensajeLogin = $("mensajeLogin");
  const productoForm = $("productoForm");
  const mensajeProducto = $("mensajeProducto");
  const listaProductos = $("listaProductos");
  const previewFotos = $("previewFotos");
  const fotosInput = $("fotos");
  const cancelarEdicion = $("cancelarEdicion");
  const guardarProducto = $("guardarProducto");
  const cerrarSesion = $("cerrarSesion");

  let imagenesActuales = [];
  let categoriasSeleccionadas = [];
  let empaqueSeleccionado = "";

  function mostrarMensaje(elemento, texto, tipo = "") {
    elemento.textContent = texto;
    elemento.className = `mensaje ${tipo}`.trim();
  }

  function convertirALista(valor) {
    if (Array.isArray(valor)) return valor.filter(Boolean);
    if (!valor) return [];
    if (typeof valor === "string") {
      try {
        const parseado = JSON.parse(valor);
        return Array.isArray(parseado) ? parseado.filter(Boolean) : [valor];
      } catch {
        return [valor];
      }
    }
    return [];
  }

  document.querySelectorAll(".opcion-categoria").forEach((boton) => {
    boton.addEventListener("click", () => {
      const valor = boton.dataset.valor;
      const yaEsta = categoriasSeleccionadas.includes(valor);
      categoriasSeleccionadas = yaEsta
        ? categoriasSeleccionadas.filter((x) => x !== valor)
        : [...categoriasSeleccionadas, valor];
      boton.classList.toggle("seleccionada", !yaEsta);
    });
  });

  document.querySelectorAll(".opcion-empaque").forEach((boton) => {
    boton.addEventListener("click", () => {
      empaqueSeleccionado = boton.dataset.valor;
      document.querySelectorAll(".opcion-empaque").forEach((b) => {
        b.classList.toggle("seleccionada", b === boton);
      });
    });
  });

  async function comprobarSesion() {
    if (typeof supabaseClient === "undefined") {
      mostrarMensaje(mensajeLogin, "No se pudo conectar con Supabase. Revisa supabase-config.js", "error");
      return;
    }
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) console.error(error);
    data?.session ? mostrarAdmin() : mostrarLogin();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    mostrarMensaje(mensajeLogin, "Ingresando...");

    const email = $("correo").value.trim();
    const password = $("contrasena").value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      console.error(error);
      mostrarMensaje(mensajeLogin, `No se pudo iniciar sesión: ${error.message}`, "error");
      return;
    }

    loginForm.reset();
    mostrarMensaje(mensajeLogin, "");
    mostrarAdmin();
  });

  cerrarSesion.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    mostrarLogin();
  });

  function mostrarAdmin() {
    loginPanel.classList.add("oculto");
    adminPanel.classList.remove("oculto");
    cargarProductos();
  }

  function mostrarLogin() {
    adminPanel.classList.add("oculto");
    loginPanel.classList.remove("oculto");
  }

  fotosInput.addEventListener("change", mostrarPreviewCompleto);

  function mostrarPreviewCompleto() {
    previewFotos.innerHTML = "";

    imagenesActuales.forEach((url, indice) => {
      const caja = document.createElement("div");
      caja.className = "preview-foto";
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Foto existente";
      const quitar = document.createElement("button");
      quitar.type = "button";
      quitar.textContent = "×";
      quitar.title = "Quitar esta foto del producto";
      quitar.addEventListener("click", () => {
        imagenesActuales.splice(indice, 1);
        mostrarPreviewCompleto();
      });
      caja.append(img, quitar);
      previewFotos.appendChild(caja);
    });

    Array.from(fotosInput.files).forEach((archivo) => {
      const caja = document.createElement("div");
      caja.className = "preview-foto";
      const img = document.createElement("img");
      img.src = URL.createObjectURL(archivo);
      img.alt = "Nueva foto";
      caja.appendChild(img);
      previewFotos.appendChild(caja);
    });
  }

  productoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!categoriasSeleccionadas.length) {
      mostrarMensaje(mensajeProducto, "Selecciona al menos una categoría.", "error");
      return;
    }
    if (!empaqueSeleccionado) {
      mostrarMensaje(mensajeProducto, "Selecciona un empaque.", "error");
      return;
    }

    const productoId = $("productoId").value;
    const titulo = $("titulo").value.trim();
    const precio = Number($("precio").value);
    const orden = Number($("orden").value) || 0;

    guardarProducto.disabled = true;
    mostrarMensaje(mensajeProducto, "Guardando producto...");

    try {
      let urlsImagenes = [...imagenesActuales];
      const archivos = Array.from(fotosInput.files);

      if (archivos.length) {
        const nuevasUrls = await subirFotos(archivos);
        urlsImagenes = [...urlsImagenes, ...nuevasUrls];
      }

      if (!urlsImagenes.length) throw new Error("Debes agregar al menos una fotografía.");

      // IMPORTANTE: usamos la columna descripcion que ya existe para guardar el empaque.
      // Así no necesitas crear una columna nueva en Supabase.
      const datos = {
        titulo,
        precio,
        descripcion: empaqueSeleccionado,
        etiquetas: categoriasSeleccionadas,
        imagenes: urlsImagenes,
        orden
      };

      let resultado;
      if (productoId) {
        resultado = await supabaseClient.from("productos").update(datos).eq("id", productoId).select();
      } else {
        resultado = await supabaseClient.from("productos").insert([datos]).select();
      }

      if (resultado.error) throw resultado.error;

      mostrarMensaje(mensajeProducto, productoId ? "Producto actualizado correctamente." : "Producto publicado correctamente.", "ok");
      limpiarFormulario(false);
      await cargarProductos();
    } catch (error) {
      console.error("Error guardando producto:", error);
      mostrarMensaje(mensajeProducto, `No se pudo guardar: ${error.message || "Error desconocido"}`, "error");
    } finally {
      guardarProducto.disabled = false;
    }
  });

  async function subirFotos(archivos) {
    const urls = [];
    for (const archivo of archivos) {
      const extension = (archivo.name.split(".").pop() || "jpg").toLowerCase();
      const nombre = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const ruta = `catalogo/${nombre}`;

      const { error } = await supabaseClient.storage.from("productos").upload(ruta, archivo, {
        cacheControl: "3600",
        upsert: false,
        contentType: archivo.type || undefined
      });
      if (error) throw error;

      const { data } = supabaseClient.storage.from("productos").getPublicUrl(ruta);
      if (!data?.publicUrl) throw new Error("No se pudo obtener la URL pública de una foto.");
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function cargarProductos() {
    listaProductos.innerHTML = "<p>Cargando productos...</p>";
    const { data, error } = await supabaseClient
      .from("productos")
      .select("*")
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      listaProductos.innerHTML = `<p>No se pudieron cargar: ${escaparHTML(error.message)}</p>`;
      return;
    }

    listaProductos.innerHTML = "";
    if (!data?.length) {
      listaProductos.innerHTML = "<p>No hay productos publicados todavía.</p>";
      return;
    }

    data.forEach((producto) => {
      const imagenes = convertirALista(producto.imagenes);
      const categorias = convertirALista(producto.etiquetas);
      const empaque = producto.empaque || producto.descripcion || "Sin empaque";
      const item = document.createElement("article");
      item.className = "producto-admin";
      item.innerHTML = `
        <img src="${escaparAtributo(imagenes[0] || "")}" alt="${escaparAtributo(producto.titulo || "Producto")}">
        <div>
          <h3>${escaparHTML(producto.titulo || "Producto")}</h3>
          <p class="precio">${formatearPrecio(producto.precio)}</p>
          <p class="empaque-mini">Empaque: ${escaparHTML(empaque)}</p>
          <p class="categorias-mini">${escaparHTML(categorias.join(", "))}</p>
          <div class="acciones-producto">
            <button class="editar" type="button">Editar</button>
            <button class="eliminar" type="button">Eliminar</button>
          </div>
        </div>`;
      item.querySelector(".editar").addEventListener("click", () => editarProducto(producto));
      item.querySelector(".eliminar").addEventListener("click", () => eliminarProducto(producto));
      listaProductos.appendChild(item);
    });
  }

  function editarProducto(producto) {
    $("productoId").value = producto.id;
    $("titulo").value = producto.titulo || "";
    $("precio").value = producto.precio || "";
    $("orden").value = producto.orden || 0;

    categoriasSeleccionadas = convertirALista(producto.etiquetas);
    document.querySelectorAll(".opcion-categoria").forEach((b) => {
      b.classList.toggle("seleccionada", categoriasSeleccionadas.includes(b.dataset.valor));
    });

    empaqueSeleccionado = producto.empaque || producto.descripcion || "";
    document.querySelectorAll(".opcion-empaque").forEach((b) => {
      b.classList.toggle("seleccionada", b.dataset.valor === empaqueSeleccionado);
    });

    imagenesActuales = convertirALista(producto.imagenes);
    fotosInput.value = "";
    mostrarPreviewCompleto();
    guardarProducto.textContent = "Guardar cambios";
    cancelarEdicion.classList.remove("oculto");
    mostrarMensaje(mensajeProducto, "Editando producto.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminarProducto(producto) {
    if (!confirm(`¿Seguro que quieres eliminar “${producto.titulo}”?`)) return;
    const { error } = await supabaseClient.from("productos").delete().eq("id", producto.id);
    if (error) {
      alert(`No se pudo eliminar: ${error.message}`);
      return;
    }
    await cargarProductos();
  }

  cancelarEdicion.addEventListener("click", () => limpiarFormulario(true));

  function limpiarFormulario(limpiarMensaje = true) {
    productoForm.reset();
    $("productoId").value = "";
    $("orden").value = 0;
    categoriasSeleccionadas = [];
    empaqueSeleccionado = "";
    imagenesActuales = [];
    fotosInput.value = "";
    document.querySelectorAll(".opcion-categoria, .opcion-empaque").forEach((b) => b.classList.remove("seleccionada"));
    previewFotos.innerHTML = "";
    guardarProducto.textContent = "Publicar producto";
    cancelarEdicion.classList.add("oculto");
    if (limpiarMensaje) mostrarMensaje(mensajeProducto, "");
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(precio) || 0);
  }

  function escaparHTML(texto) {
    return String(texto ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  }
  function escaparAtributo(texto) { return escaparHTML(texto); }

  comprobarSesion();
})();
