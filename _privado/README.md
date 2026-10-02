# Proteger la landing con usuario y contraseña

GitHub Pages es un hosting **estático**: no admite autenticación. Por eso esta
carpeta incluye un **Cloudflare Worker gratuito** que se coloca delante del sitio
y exige credenciales. No necesitas comprar dominio.

---

## Qué hace cada capa

| Capa | Ubicación | Qué resuelve |
|---|---|---|
| `noindex` en el HTML | `src/layouts/Layout.astro` | Que Google **no indexe** la página |
| `robots.txt` con `Disallow: /` | `public/robots.txt` | Refuerza el bloqueo para todos los buscadores |
| Usuario + contraseña | `_privado/worker.js` | Que **nadie más** vea la página |

> `noindex` + `robots.txt` es lo que resuelve la indexación (gratis, ya aplicado).
> La contraseña es privacidad: requiere el Worker porque GitHub Pages no la da.

---

## Opción A · Solo bloquear Google (ya funciona, 0 configuración)

Sube el proyecto a GitHub Pages como siempre. Con los cambios actuales el sitio
**no se indexa**. Listo.

Única advertencia: la URL seguirá siendo pública para quien la conozca.

---

## Opción B · Usuario y contraseña (requiere ~15 min, gratis)

### 1. Configura las credenciales

Abre `_privado/worker.js` y cambia los 3 valores de arriba:

```js
const USUARIO = 'lipofungi';
const CLAVE = 'TU_CLAVE_LARGA_Y_UNICA';
const ORIGEN_GITHUB = 'https://josuerobld.github.io/lipo-fungi';
```

- `ORIGEN_GITHUB` debe ser la URL real de tu GitHub Pages.
  Si tu repo se llama `lipofungi`, la URL es
  `https://josuerobld.github.io/lipofungi` ( ojo: `/lipofungi`, **no** `/lipofungi/`).
- Prueba la URL real en el navegador antes de publicarla.

### 2. Sube tu sitio a GitHub Pages

Sigue los pasos habituales de Astro + GitHub Pages
(`npm run build` → carpeta `dist/` → *Settings → Pages*).

Comprueba que `https://TU-USUARIO.github.io/REPO/` funciona.

### 3. Crea el Worker

```bash
cd _privado
npm install -g wrangler      # solo la primera vez
wrangler login               # abre el navegador para autorizar
wrangler deploy
```

Wrangler imprimirá algo como:

```
Deployed to https://lipofungi-privado.<tu-usuario>.workers.dev
```

**Esa es la URL que debes compartir.** Pide usuario y contraseña con el cartelito
nativo del navegador.

### 4. Verifica

| Prueba | Resultado esperado |
|---|---|
| Abres la URL del Worker | Pide usuario y contraseña |
| Contraseña incorrecta | Vuelve a pedir |
| Credenciales correctas | Carga la landing |
| Visitas la URL de GitHub Pages | También funciona (queda accesible) |

> Importante: la URL de GitHub Pages sigue abierta. Si además quieres ocultarla,
> puedes renombrar el repo a algo no adivinable o quitarlo de `main` y dejar solo
> el Worker.

---

## Al lanzar la página al público

Desactiva el modo privado en dos archivos:

**1. `src/layouts/Layout.astro`** — no hay que tocar nada si usas la variable:
```bash
PUBLIC_NOINDEX=false npm run build
```

**2. `public/robots.txt`** — descomenta la línea del sitemap:
```
Sitemap: https://TU-DOMINIO/sitemap-index.xml
```
Y cambia `Disallow: /` por `Allow: /`.

Opcionalmente puedes dejar de desplegar el Worker y usar la URL de GitHub Pages
directamente.
