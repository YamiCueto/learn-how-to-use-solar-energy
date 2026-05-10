# Learn How to Use Solar Energy

Curso interactivo sobre energía solar — aplicación web educativa, sin dependencias, con soporte bilingüe (ES / EN) y seguimiento de progreso local.

## Vista general

La app guía al usuario a través de 6 módulos progresivos que cubren desde los fundamentos de la energía solar hasta el diseño y mantenimiento de sistemas fotovoltaicos. Los módulos 1–3 están activos; los módulos 4–6 están bloqueados hasta completar los anteriores.

```text
Módulo 1 — Introducción a la energía solar      ✅ activo
Módulo 2 — Cómo funcionan los paneles           ✅ activo
Módulo 3 — Circuitos DC                         ✅ activo
Módulo 4 — Corriente alterna e inversores       🔒 bloqueado
Módulo 5 — Diseño de sistemas                   🔒 bloqueado
Módulo 6 — Mantenimiento                        🔒 bloqueado
```

## Características

- **Sin frameworks** — HTML5, CSS3 con custom properties y vanilla JS (ES6+).
- **Bilingüe en tiempo real** — toggle EN / ES sin recargar la página; archivos JSON en `locales/`.
- **Progreso persistente** — guardado en `localStorage`; barra de progreso global en la navbar.
- **Diagramas interactivos** — Canvas API para circuitos DC y AC con componentes etiquetados.
- **Quiz modal** — preguntas con feedback inmediato, trap de foco y reintentos ilimitados.
- **Accesibilidad WCAG** — roles ARIA, manejo de foco, `.sr-only`, `prefers-reduced-motion`.
- **Responsive mobile-first** — sidebar para desktop, bottom nav para móvil (< 768 px).

## Estructura del proyecto

```text
learn-how-to-use-solar-energy/
├── index.html            # Página principal (hub del curso)
├── css/
│   ├── styles.css        # Design system global (tokens, componentes, layout)
│   └── module2.css       # Estilos específicos del Módulo 2
├── js/
│   ├── app.js            # Orquestación: navegación, progreso, i18n, quiz modal
│   ├── canvas.js         # Diagramas de circuitos DC / AC con Canvas API
│   └── i18n.js           # Sistema de localización asíncrono con caché
├── locales/
│   ├── en.json           # Cadenas en inglés (~400 claves)
│   └── es.json           # Cadenas en español (~400 claves)
└── pages/
    ├── module1.html      # Intro, timeline histórica, glosario, quiz
    ├── module2.html      # Celda PV, p-n junction, tipos de panel, parámetros
    ├── module3.html      # Circuitos DC
    ├── module4.html      # AC e inversores (bloqueado)
    ├── module5.html      # Diseño de sistemas (bloqueado)
    └── module6.html      # Mantenimiento (bloqueado)
```

## Cómo ejecutar

No requiere servidor para la mayoría de funcionalidades, pero la carga de archivos JSON de i18n necesita HTTP. La forma más sencilla:

```bash
# Con Python (viene en macOS / Linux / Windows)
python -m http.server 8080

# Con Node.js
npx serve .

# Con VS Code
# Instala la extensión "Live Server" y haz clic en "Go Live"
```

Abre `http://localhost:8080` en el navegador.

## API pública — `window.SolarLearn`

`app.js` expone una API global usada por las páginas de módulos:

| Método / propiedad | Descripción |
| --- | --- |
| `markModuleDone(n)` | Marca el módulo `n` como completado y actualiza la UI. |
| `isModuleDone(n)` | Devuelve `true` si el módulo `n` está completado. |
| `applyLang(lang)` | Cambia el idioma activo (`'es'` \| `'en'`). |
| `initQuizModal(data, btnId)` | Inicializa el quiz modal con las preguntas y el botón disparador. |
| `currentLang` | Getter — idioma activo en este momento. |

## Sistema de i18n

Las traducciones se cargan de forma asíncrona desde `locales/{lang}.json` y se cachean en memoria. Para añadir una clave nueva:

1. Agrega la clave en ambos archivos (`en.json` y `es.json`).
2. Añade el atributo `data-i18n="clave"` al elemento HTML.
3. Las páginas de módulos deben declarar `data-i18n-base=".."` en la etiqueta `<html>` para que las rutas sean relativas correctas.

## Design system

`styles.css` define los tokens de diseño como custom properties CSS:

| Token | Valor |
| --- | --- |
| `--color-amber` | `#EF9F27` — color primario |
| `--color-teal-*` | Familia teal — acentos secundarios |
| `--sp-*` | Sistema de espaciado en múltiplos de 4 px |
| `--radius-*` | Radios: `sm` 4 px → `full` 9999 px |
| `--text-*` | Escala tipográfica: `xs` 0.70 rem → `2xl` 2 rem |

## Flujo de progreso

```text
Usuario abre módulo → Lee contenido → Completa quiz
    → SolarLearn.markModuleDone(n)
    → Guarda en localStorage (solarlearn_progress)
    → Actualiza barra de progreso (aria-valuenow)
    → Desbloquea siguiente módulo si corresponde
```

## Tecnologías

- HTML5 semántico
- CSS3 (custom properties, flexbox, grid, `@media`)
- JavaScript ES6+ (IIFE, `async/await`, `CustomEvent`, `Canvas API`, `ResizeObserver`)
- [Tabler Icons](https://tabler.io/icons) vía CDN
- `localStorage` para persistencia

## Licencia

Proyecto educativo — sin licencia definida aún.
