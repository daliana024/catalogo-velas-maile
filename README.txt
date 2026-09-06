VELAS MAILE - PROYECTO LIMPIO
=============================

ARCHIVOS PRINCIPALES
- index.html: catálogo público
- estilos.css: diseño del catálogo
- script.js: carga productos, modal, carrusel, WhatsApp y gesto atrás
- admin.html: panel de administración
- admin.css: diseño del administrador
- admin.js: login, crear, editar y eliminar productos
- supabase-config.js: conexión a Supabase
- imagenes/: portada, logo y fotografías locales de respaldo

FUNCIONAMIENTO DEL EMPAQUE
Este proyecto guarda el empaque en la columna existente "descripcion" de la tabla productos.
No es obligatorio crear una columna nueva llamada "empaque".
El catálogo público también entiende una futura columna "empaque" si luego decides crearla.

OPCIONES DE EMPAQUE
- Cajita blanca
- Cajita de acetato
- Bolsita de organza
- Cúpula

NAVEGACIÓN EN CELULAR
- El botón ← cierra el producto y vuelve al catálogo.
- El gesto de retroceso del navegador también cierra el producto primero.
- El carrusel se mueve horizontalmente con el dedo.

WHATSAPP
El mensaje incluye título, precio por docena, empaque, categoría y el enlace de la foto que se está viendo.
WhatsApp no permite adjuntar automáticamente el archivo de imagen usando wa.me.

PRUEBA LOCAL
Se recomienda usar VS Code + Live Server en vez de abrir index.html con file:///.

SUPABASE
La tabla esperada es public.productos con al menos:
- id
- titulo
- precio
- descripcion
- etiquetas
- imagenes
- orden
- created_at

El bucket Storage esperado se llama: productos
Debe ser público para que el catálogo pueda mostrar las fotos.

PUBLICACIÓN EN GITHUB
Sube todos los archivos a la raíz del repositorio catalogo-velas-maile.
Luego Commit + Push y espera la actualización de GitHub Pages.
