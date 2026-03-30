// Prefija rutas de /public con el BASE_URL de Vite (soporta subdirectorio en GitHub Pages)
export const pub = path => import.meta.env.BASE_URL + path.replace(/^\//, '')
