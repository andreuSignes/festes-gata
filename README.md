# Festes de Gata — 2026

Programa web de las fiestas de **Gata de Gorgos**, del 26 de julio al 6 de agosto de 2026.

## Stack

- [Astro 7](https://astro.build) con salida estática
- HTML semántico y CSS vanilla; la portada no envía JavaScript al navegador
- Colecciones de contenido validadas con Zod
- GitHub Pages para alojamiento

## Desarrollo local

Requiere Node.js 22.12 o posterior.

```bash
npm install
npm run dev
```

Astro mostrará en la terminal la URL del servidor local.

## Comprobación y build

```bash
npm run check:content
npm run build
```

La primera orden comprueba los nombres, fechas y campos del programa. La segunda valida la
colección con Zod y genera el sitio estático en `dist/`.

## Deploy

GitHub Actions construye y publica el sitio automáticamente con cada push a `main`; también se
puede lanzar manualmente desde la pestaña **Actions**. Antes del primer despliegue hay que elegir
**Settings → Pages → Source → GitHub Actions** en el repositorio.

El sitio se publica en <https://andreuSignes.github.io/festes-gata/>. La imagen social provisional
es un SVG de marca; algunas plataformas sociales ofrecen mejor compatibilidad con PNG, que queda
pendiente para una futura mejora.

## Editar el programa

Los días están en `src/content/days/es/`, con un archivo JSON por fecha. El esquema está en
`src/content.config.ts` y la guía detallada de tipos de acto en `src/content/days/README.md`.

Para añadir un día:

1. Crea `src/content/days/es/AAAA-MM-DD.json` copiando la estructura de un día existente.
2. Haz coincidir el campo `date` con el nombre del archivo y completa `weekday`, `theme` y `events`.
3. Ejecuta `npm run check:content` y `npm run build` antes de enviar el cambio.

## Roadmap

La versión 1 publica únicamente el programa en castellano. La versión 2 añadirá internacionalización
y archivos de contenido separados para valenciano y castellano.
