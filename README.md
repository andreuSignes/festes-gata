# Festes de Gata — 2026

[![CI](https://github.com/andreuSignes/festes-gata/actions/workflows/ci.yml/badge.svg)](https://github.com/andreuSignes/festes-gata/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/andreuSignes/festes-gata/branch/main/graph/badge.svg)](https://codecov.io/gh/andreuSignes/festes-gata)
[![Node](https://img.shields.io/badge/Node.js-22.13-339933?style=flat&logo=nodedotjs&logoColor=339933)](https://nodejs.org)
[![Astro](https://img.shields.io/badge/Astro-7.1.3-BC52EE?style=flat&logo=astro&logoColor=BC52EE)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=flat&logo=typescript&logoColor=3178C6)](https://typescriptlang.org)
[![Vitest](https://img.shields.io/badge/Vitest-4.1.10-6E9F18?style=flat&logo=vitest&logoColor=6E9F18)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-1.49.0-45ba4b?style=flat&logo=playwright&logoColor=45ba4b)](https://playwright.dev)

Programa web de las fiestas de **Gata de Gorgos**, del 26 de julio al 6 de agosto de 2026.

## Stack

- [Astro 7](https://astro.build) con salida estática
- HTML semántico y CSS vanilla; la portada no envía JavaScript al navegador
- Colecciones de contenido validadas con Zod
- GitHub Pages para alojamiento

## Desarrollo local

Requiere Node.js 22.13 o posterior.

```bash
pnpm install
pnpm dev
```

Astro mostrará en la terminal la URL del servidor local.

## Comprobación y build

```bash
pnpm check:content
pnpm build
```

La primera orden comprueba los nombres, fechas y campos del programa. La segunda valida la
colección con Zod y genera el sitio estático en `dist/`.

## Tests

Este proyecto tiene tests unitarios (Vitest) y tests end-to-end (Playwright).

```sh
pnpm test              # Run unit tests (Vitest, non-watch)
pnpm run test:watch    # Run unit tests in watch mode
pnpm run check:content # Validate content files
pnpm exec playwright test  # Run e2e tests (requires build)
```

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
3. Ejecuta `pnpm check:content` y `pnpm build` antes de enviar el cambio.

## Roadmap

La versión 1 publica únicamente el programa en castellano. La versión 2 añadirá internacionalización
y archivos de contenido separados para valenciano y castellano.
