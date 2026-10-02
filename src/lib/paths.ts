/**
 * Prefijo base del sitio (GitHub Pages publica en un subdirectorio).
 * Astro expone BASE_URL y lo inyecta en el HTML final, asi que las rutas
 * quedan como "/lipofungi/logos/..." al compilar.
 */
const BASE = import.meta.env.BASE_URL || '/';

/** Une el path base con una ruta del sitio, evitando barras duplicadas. */
export function asset(path: string): string {
  const clean = path.replace(/^\/+/, '');
  // BASE ya termina en "/" (p. ej. "/lipofungi/"), se lo quitamos para unir.
  return `${BASE.replace(/\/+$/, '')}/${clean}`;
}
