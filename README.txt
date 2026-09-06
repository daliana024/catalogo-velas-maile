VELAS MAILE - VERSIÓN CORREGIDA

PASO OBLIGATORIO ANTES DE PUBLICAR PRODUCTOS:

1. Abre Supabase.
2. Ve a SQL Editor.
3. Abre el archivo supabase-posicion.sql incluido en este proyecto.
4. Copia todo su contenido.
5. Pulsa RUN.

Eso crea:
- posicion_x
- posicion_y

Sin esas dos columnas, el administrador mostrará un error al publicar.

ESTRUCTURA UTILIZADA:
- descripcion = empaque
- etiquetas = categorías
- imagenes = lista de URLs
- posicion_x / posicion_y = encuadre de la foto

PRUEBA:
Usa Live Server o GitHub Pages. Evita probar funciones de historial desde file:/// cuando sea posible.
