/* =====================================
   CONFIGURACIÓN DE SUPABASE
===================================== */


/*
   URL pública de tu proyecto
*/

const SUPABASE_URL =
    "https://wheowewslcmhbqchzjik.supabase.co";


/*
   Publishable Key.

   Esta clave puede utilizarse
   desde el navegador porque
   la seguridad real depende
   de las políticas RLS.
*/

const SUPABASE_KEY =
    "sb_publishable_9TnYfmwKv7Uxr-hIwSh0lw_cdbBOrrE";


/* =====================================
   CREAR CLIENTE
===================================== */

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================
   COMPROBACIÓN
===================================== */

console.log(
    "Supabase conectado correctamente"
);