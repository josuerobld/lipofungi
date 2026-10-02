/**
 * LipoFungi · Proteccion HTTP Basic Auth (pre-lanzamiento)
 * -------------------------------------------------------
 * GitHub Pages es 100% estatico: NO admite usuario/contrasea.
 * Este Worker de Cloudflare (plan gratuito) se pone DELANTE del
 * sitio de GitHub Pages y exige credenciales antes de servirlo.
 *
 * La URL publica queda en:  https://lipofungi.<tu-subdominio>.workers.dev
 * (no se usa ningun dominio propio).
 */

// ---------------------------------------------------------------------------
// CONFIGURACION  ->  cambia estos 3 valores
// ---------------------------------------------------------------------------
const USUARIO = 'lipofungi'; // <- tu usuario
const CLAVE = 'CAMBIAR_ESTA_CLAVE'; // <- tu clave (min. 8 caracteres)
const ORIGEN_GITHUB = 'https://josuerobld.github.io/lipo-fungi'; // <- tu repo de GitHub Pages

// ---------------------------------------------------------------------------

const REALM = 'LipoFungi - Area privada';

const encoder = new TextEncoder();

/** Compara en tiempo constante para no filtrar la clave por tiempos. */
function coincide(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Valida el header Authorization: Basic base64(user:pass) */
function autorizado(req) {
  const header = req.headers.get('Authorization');
  if (!header || !header.startsWith('Basic ')) return false;
  try {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(':');
    if (sep < 0) return false;
    const user = decoded.slice(0, sep);
    const pass = decoded.slice(sep + 1);
    return coincide(user, USUARIO) && coincide(pass, CLAVE);
  } catch {
    return false;
  }
}

/** Cabeceras de seguridad + no-cache (pagina en construccion). */
function cabeceras(extra = {}) {
  return {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    ...extra,
  };
}

/** Pantalla de login del navegador. */
function paginaLogin() {
  return new Response(
    `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Acceso restringido · LipoFungi</title>
<style>
  :root { --bosque:#1E4530; --oliva:#8A8819; --salvia:#DCE5D7; --crema:#F5F2E8; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { min-height:100vh; display:grid; place-items:center; padding:1.5rem;
         font-family:'Lato',ui-sans-serif,system-ui,sans-serif;
         background:var(--crema); color:var(--bosque); }
  .card { width:100%; max-width:26rem; padding:2.5rem; text-align:center;
          background:#fff; border-radius:1rem; box-shadow:0 20px 45px -25px rgba(30,69,48,.45); }
  h1 { font-size:1.4rem; font-weight:900; letter-spacing:-.01em; }
  p  { margin-top:.6rem; font-size:.95rem; color:#5a615c; }
  .tag { display:inline-block; margin-bottom:1.25rem; padding:.35rem .9rem;
         border-radius:999px; background:var(--salvia); font-size:.7rem;
         font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
  button { margin-top:1.75rem; width:100%; padding:.9rem 1.25rem; border:0;
           border-radius:999px; background:var(--oliva); color:#fff; font-size:1rem;
           font-weight:800; cursor:pointer; transition:background .25s ease; }
  button:hover { background:var(--bosque); }
</style>
</head>
<body>
  <main class="card">
    <span class="tag">Acceso privado</span>
    <h1>Área restringida</h1>
    <p>Esta página está en preparación. Introduce tus credenciales para continuar.</p>
    <button type="button" onclick="document.getElementById('u').focus()">Continuar</button>
  </main>
</body>
</html>`,
    {
      status: 401,
      headers: cabeceras({
        'Content-Type': 'text/html; charset=utf-8',
        'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      }),
    }
  );
}

export default {
  async fetch(request) {
    if (autorizado(request)) {
      const url = new URL(request.url);
      const destino = new URL(ORIGEN_GITHUB + url.pathname + url.search);

      // Solo se permiten metodos seguros de lectura
      const method = request.method.toUpperCase();
      if (method !== 'GET' && method !== 'HEAD') {
        return new Response('Method Not Allowed', { status: 405, headers: cabeceras() });
      }

      const hacia = new Request(destino, request);
      const res = await fetch(hacia, { redirect: 'follow' });

      // Se reenvian las cabeceras originales + las de seguridad
      const out = new Headers(res.headers);
      const c = cabeceras();
      for (const [k, v] of Object.entries(c)) out.set(k, v);

      return new Response(res.body, { status: res.status, headers: out });
    }

    return paginaLogin();
  },
};
