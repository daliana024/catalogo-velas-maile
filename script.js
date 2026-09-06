(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const catalogo = $("catalogo");
  const modal = $("modal");
  const cerrarModal = $("cerrarModal");
  const tituloProducto = $("tituloProducto");
  const precioProducto = $("precioProducto");
  const etiquetasProducto = $("etiquetasProducto");
  const empaqueProducto = $("empaqueProducto");
  const imagenGrande = $("imagenGrande");
  const indicadores = $("indicadores");
  const botonWhatsapp = $("botonWhatsapp");
  const carrusel = $("carrusel");
  const botonAnterior = $("fotoAnterior");
  const botonSiguiente = $("fotoSiguiente");

  let productos = [];
  let productoActual = 0;
  let fotoActual = 0;
  let inicioX = 0;

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

  function normalizarProducto(p) {
    return {
      id: p.id,
      titulo: p.titulo || "Vela Maile",
      precio: Number(p.precio) || 0,
      etiquetas: convertirALista(p.etiquetas),
      imagenes: convertirALista(p.imagenes),
      // Para que funcione con tu tabla actual, el empaque se guarda en descripcion.
      // Si luego creas una columna empaque, también la leerá automáticamente.
      empaque: p.empaque || p.descripcion || "Sin especificar",
      orden: Number(p.orden) || 0
    };
  }

  async function cargarProductos() {
    catalogo.innerHTML = '<div class="mensaje-catalogo">Cargando catálogo...</div>';

    if (typeof supabaseClient === "undefined") {
      catalogo.innerHTML = '<div class="mensaje-catalogo">No se pudo conectar con el catálogo.</div>';
      console.error("supabaseClient no está definido. Revisa supabase-config.js");
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("orden", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      productos = (data || []).map(normalizarProducto);
      renderizarCatalogo();
    } catch (error) {
      console.error("Error cargando catálogo:", error);
      catalogo.innerHTML = `<div class="mensaje-catalogo">No se pudo cargar el catálogo.<br><small>${escaparHTML(error.message || "Error desconocido")}</small></div>`;
    }
  }

  function renderizarCatalogo() {
    catalogo.innerHTML = "";

    const visibles = productos.filter((p) => p.imagenes.length > 0);
    if (!visibles.length) {
      catalogo.innerHTML = '<div class="mensaje-catalogo">Próximamente encontrarás nuestros productos aquí.</div>';
      return;
    }

    productos.forEach((producto, indice) => {
      if (!producto.imagenes.length) return;

      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "publicacion";
      boton.setAttribute("aria-label", `Abrir ${producto.titulo}`);
      boton.innerHTML = `
        <img src="${escaparAtributo(producto.imagenes[0])}" alt="${escaparAtributo(producto.titulo)}" loading="lazy">
        <span class="ver-detalle">Toca para ver</span>
      `;
      boton.addEventListener("click", () => abrirPublicacion(indice));
      catalogo.appendChild(boton);
    });
  }

  function abrirPublicacion(indice) {
    productoActual = indice;
    fotoActual = 0;
    const producto = productos[productoActual];

    tituloProducto.textContent = producto.titulo;
    precioProducto.textContent = formatearPrecio(producto.precio);
    empaqueProducto.textContent = producto.empaque;
    renderizarEtiquetas(producto.etiquetas);
    crearIndicadores();
    actualizarImagen();

    modal.classList.add("abierto");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.scrollTop = 0;
  }

  function cerrarPublicacion() {
    modal.classList.remove("abierto");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderizarEtiquetas(lista) {
    etiquetasProducto.innerHTML = "";
    lista.forEach((texto) => {
      const span = document.createElement("span");
      span.className = "etiqueta";
      span.textContent = texto;
      etiquetasProducto.appendChild(span);
    });
  }

  function actualizarImagen() {
    const producto = productos[productoActual];
    if (!producto || !producto.imagenes.length) return;

    imagenGrande.src = producto.imagenes[fotoActual];
    imagenGrande.alt = `${producto.titulo} - Foto ${fotoActual + 1}`;
    actualizarIndicadores();
    actualizarFlechas();
    actualizarWhatsapp(producto);
  }

  function fotoSiguiente() {
    const producto = productos[productoActual];
    if (producto && fotoActual < producto.imagenes.length - 1) {
      fotoActual++;
      actualizarImagen();
    }
  }

  function fotoAnterior() {
    if (fotoActual > 0) {
      fotoActual--;
      actualizarImagen();
    }
  }

  function crearIndicadores() {
    indicadores.innerHTML = "";
    const producto = productos[productoActual];
    if (!producto) return;

    producto.imagenes.forEach((_, indice) => {
      const punto = document.createElement("button");
      punto.type = "button";
      punto.className = "punto";
      punto.setAttribute("aria-label", `Ver foto ${indice + 1}`);
      punto.addEventListener("click", () => {
        fotoActual = indice;
        actualizarImagen();
      });
      indicadores.appendChild(punto);
    });
  }

  function actualizarIndicadores() {
    indicadores.querySelectorAll(".punto").forEach((punto, indice) => {
      punto.classList.toggle("activo", indice === fotoActual);
    });
  }

  function actualizarFlechas() {
    const producto = productos[productoActual];
    if (!producto) return;
    botonAnterior.disabled = fotoActual === 0;
    botonSiguiente.disabled = fotoActual === producto.imagenes.length - 1;
    const mostrar = producto.imagenes.length > 1;
    botonAnterior.style.display = mostrar ? "flex" : "none";
    botonSiguiente.style.display = mostrar ? "flex" : "none";
  }

  function actualizarWhatsapp(producto) {
    const fotoVisible = producto.imagenes[fotoActual] || "";
    const categorias = producto.etiquetas.length ? producto.etiquetas.join(", ") : "";
    const mensaje = `Hola, vi el catálogo de Velas Maile y estoy interesada en:\n\n🕯️ ${producto.titulo}\n💰 Precio por docena: ${formatearPrecio(producto.precio)}\n📦 Empaque: ${producto.empaque}${categorias ? `\n🏷️ Categoría: ${categorias}` : ""}\n\n📷 Esta es la foto que estoy viendo:\n${fotoVisible}\n\n¿Me puedes dar más información?`;
    botonWhatsapp.href = "https://wa.me/573008866132?text=" + encodeURIComponent(mensaje);
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(Number(precio) || 0);
  }

  function escaparHTML(texto) {
    return String(texto ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escaparAtributo(texto) {
    return escaparHTML(texto);
  }

  cerrarModal.addEventListener("click", cerrarPublicacion);
  botonAnterior.addEventListener("click", fotoAnterior);
  botonSiguiente.addEventListener("click", fotoSiguiente);

  carrusel.addEventListener("touchstart", (e) => {
    inicioX = e.touches[0].clientX;
  }, { passive: true });

  carrusel.addEventListener("touchend", (e) => {
    const finX = e.changedTouches[0].clientX;
    const distancia = finX - inicioX;
    if (Math.abs(distancia) < 45) return;
    distancia < 0 ? fotoSiguiente() : fotoAnterior();
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("abierto")) return;
    if (e.key === "Escape") cerrarPublicacion();
    if (e.key === "ArrowRight") fotoSiguiente();
    if (e.key === "ArrowLeft") fotoAnterior();
  });

  cargarProductos();
})();
