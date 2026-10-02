# Publicar LipoFungi en GitHub Pages

## ¿Subo el build o el código?

**El código fuente.** Nunca subas `dist/` ni `node_modules/`.

GitHub Pages solo sirve archivos estáticos: no puede compilar. La solución es
**GitHub Actions**, que ya configuré en `.github/workflows/deploy.yml`:

```
 Tú haces:  editás código  →  git push  →  GitHub compila  →  sitio publicado
```

**¿Por qué es mejor que subir el build?**

| | Subir `dist/` | Subir código (Actions) |
|---|---|---|
| Cada cambio | compilar + subir archivos a mano | solo `git push` |
| Historial | se ve `index.html` gigante | se ve el código real |
| Revertir | tienes que buscar el build viejo | `git revert` |
| Errores | no los ves nunca | los ves en la pestaña *Actions* |
| Otro dispositivo | necesitas Node instalado | funciona desde el navegador |

---

## Paso 1 · Crear el repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name**: `lipofungi` (o el que quieras)
3. Marca **Add a README** → **Private**
   > Privado si el proyecto aún está en desarrollo.
   > GitHub Pages de repositorios privados da error de "no pages".
   > Si te pasa, hazlo público y usa el Worker con contraseña.
4. Clic en **Create repository**

---

## Paso 2 · Subir el código

En tu terminal, dentro de la carpeta del proyecto:

```bash
cd ~/Documents/LipoFungi

# Conectar con el repo que acabas de crear
git remote add origin https://github.com/TU_USUARIO/lipofungi.git

# Publicar
git push -u origin main
```

Si pide autenticación, usa un **Personal Access Token** (no tu contraseña):
- GitHub → *Settings* → *Developer settings* → *Personal access tokens*
- Marca `repo` y `workflow`
- Copia el token y úsalo como contraseña

---

## Paso 3 · Activar GitHub Pages

1. En tu repo: **Settings** → **Pages**
2. En **Build and deployment**:
   - **Source**: `GitHub Actions`
3. Guardar

> Esto es lo que le indica a GitHub que use el workflow
> en vez de la carpeta `/docs` clásica.

El primer deploy tarda ~1-2 minutos.

---

## Paso 4 · Configurar la URL (¡importante!)

Tu repo **ya está listo**, pero el `canonical` y el sitemap apuntaban a una URL
de ejemplo. Debes decir cuál es la tuya:

**Settings** → **Secrets and variables** → **Actions** → pestaña **Variables**
→ *New repository variable*:

| Nombre | Valor |
|---|---|
| `SITE_URL` | `https://TU_USUARIO.github.io/lipofungi` |
| `PUBLIC_NOINDEX` | *(déjalo vacío = modo privado)* |

Para que los cambios apliquen, ve a **Actions** → *Deploy a GitHub Pages* →
**Run workflow**.

---

## Verificar el modo privado

```bash
curl -s https://TU_USUARIO.github.io/lipofungi | grep -i "name=\"robots\""
```

Debe mostrar:

```html
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
```

Si muestra `index, follow` → el sitio **sí se está indexando**. Revisa que
`PUBLIC_NOINDEX` esté vacío o no definido.

### Pedir que Google la borre si ya fue indexada

Si en el pasado estuvo pública, `noindex` no basta (Google debe volver a
rastrearla). En https://search.google.com/search-console:

1. *Inspeccionar cualquier URL* → pega la de tu sitio
2. Pestaña *Indexación* → *Solicitar indexación*

Tarda días o semanas en procesarse.

---

## Cuando quieras lanzar al público

**1.** En *Variables*, cambia `PUBLIC_NOINDEX` a `false`

**2.** Edita `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://TU_USUARIO.github.io/lipofungi/sitemap-index.xml
```

(borra el bloque `Disallow: /` y descomenta la línea del sitemap)

**3.** Commit + push:

```bash
git add -A && git commit -m "Lanzar publicly" && git push
```

---

## Sobre la contraseña (Worker de Cloudflare)

La tienes lista en `_privado/`. Ver su README.

Resumen: edita las 3 constantes de `worker.js` y ejecuta `wrangler deploy`.
El sitio se sirve desde una URL `workers.dev` que **sí** pide usuario y
contraseña. GitHub Pages por sí solo no puede hacerlo.

---

## Comandos útiles

```bash
npm run dev              # desarrollo con recarga automatica
npm run build            # genera dist/
npm run preview          # previsualiza dist/
npm run astro -- --help  # ayuda de Astro
```

Cada vez que hagas `git push` a `main`, GitHub redespliega solo.
