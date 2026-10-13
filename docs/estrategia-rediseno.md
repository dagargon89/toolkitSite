# Toolkit Social — Estrategia de rediseño (landing v2)

**Fecha:** 12 oct 2026 (actualizado el mismo día: logos, og:image, hero) · **Fuentes:** `Toolkit_Social_Contenido_Landing_Page_v2.md/.pdf` (idénticos), `Examples/toolkit_identidad_1_page-0001.jpg.png` (manual de identidad), `Examples/restructura.md` (propuesta anterior), sitio actual (`index.html`, `pages/*`).

---

## 1. Diagnóstico: el sitio actual responde a un brief que ya no existe

El sitio actual se construyó sobre `restructura.md` (la "Estructura Madre"). El documento v2 del cliente lo sustituye. Las diferencias no son de estilo, son de modelo:

| Tema | Sitio actual | Lo que pide el cliente (v2) | Acción |
|---|---|---|---|
| Arquitectura | Multipágina: home + 7 páginas en `pages/` | **Una sola página** | Reescribir `index.html`; retirar `pages/` |
| Oferta | 5 ramas (Consultoría, Laboratorio, Datos, Comunicación, Formación) | **4 áreas**: Consulting, Data & Tech, Lab, Studio | Nueva sección de áreas; Formación desaparece como rama |
| Tono | "Infraestructura de colaboración", "Estructura Madre", reflexivo | Comercial, claro, orientado a problemas | Usar el texto v2 literal |
| Prueba social | `pages/proyectos.html` con "Proyecto Renacer" | **Sin testimonios, cifras ni clientes no validados** | Eliminar |
| Logo | SVG dibujado a mano (no es el logo; le falta la burbuja de diálogo) | **Logotipo original** | Hecho: variantes oficiales en `img/logo/` |
| Contacto | Footer con enlaces | Formulario mínimo + correo, WhatsApp, llamadas | Sección de contacto real |
| Navegación | Estructura ▾ · Cultura · Proyectos | Inicio · Nosotros · Soluciones · Cómo trabajamos · Sectores · Contacto | Anclas a secciones |

Conclusión: no es un "cambio de piel". Es reconstruir `index.html` con el contenido v2 y conservar sólo la base técnica (Tailwind config de color, `main.js` del menú móvil).

---

## 2. Identidad: lo que el manual dice y cómo usarlo

**Concepto de marca (manual):** un engrane = los servicios especializados que, juntos, dan atención integral; dentro, una **burbuja de diálogo** = enfoque humano y personalizado. Personalidad: *profesionalismo técnico · enfoque humano-colaborativo · estabilidad y flexibilidad*.

Esto encaja exactamente con el titular v2: *"Los problemas no vienen separados por disciplinas. Las soluciones tampoco deberían."* — el engrane son las 4 áreas trabajando juntas. Ese es el hilo conceptual de todo el diseño.

### Paleta (conciliada)

El v2 y el manual difieren ligeramente. Se usa el v2 como base y el manual como apoyo:

| Token | Hex | Origen | Uso |
|---|---|---|---|
| `ink` (Morado profundo) | `#25204F` | v2 | Texto principal, superficies oscuras (contacto, footer), engrane y botón del hero |
| `ink-deep` | `#1A1640` | derivado | Hover del botón tinta en el hero |
| `violet` | `#7C78F2` | v2 (≈ `#7a78ee` del manual) | Marca, tipografía grande, ilustración. **No para texto pequeño sobre blanco** (contraste 3.6:1) |
| `violet-strong` | `#6A5DE7` | manual | Fondo del hero; fondo de botones con texto blanco (4.8:1, pasa AA) y enlaces |
| `lavender` | `#EDEBFA` | v2 | Fondo de secciones alternas |
| `lavender-line` | `#C2C8FA` | manual | Bordes, separadores, estados seleccionados |
| `graphite` | `#4F4F4F` | manual | Texto secundario |
| `white` | `#FFFFFF` | ambos | Fondo base |

Sin degradados decorativos. El hero usa el plano violeta del manual como color sólido.

### Logotipo (recibido)

Las 12 variantes oficiales están en `img/logo/` como PNG con fondo transparente: horizontal, vertical, solo texto e isotipo, cada una en color, gris y blanco (`toolkit-<forma>-<color>.png`).

| Uso | Archivo |
|---|---|
| Header (fondo blanco) | `toolkit-horizontal-color.png` |
| Footer (fondo tinta) | `toolkit-horizontal-blanco.png` |
| Favicon y `logo` del JSON-LD | `toolkit-isotipo-color.png` |
| Imagen para redes (`img/og-image.png`, 1200×630) | horizontal blanco sobre tinta |
| Hero | engrane trazado a SVG desde el isotipo, inline |

La imagen para redes va sobre tinta y no sobre violeta porque el "Kit" del logo blanco es violeta y se perdería.

### Tipografía

Montserrat es genérica y no se parece al wordmark (geométrico, terminaciones suaves, "K" amplia). Propuesta: **una sola familia variable, Instrument Sans** (Google Fonts, ejes de peso 400–700 y ancho 75–100).
- Titulares: 600, ancho 100, interlineado 1.05, tracking ligeramente negativo.
- Cuerpo: 400, 17–18 px, interlineado 1.6, medida ≤ 68 caracteres.
- Escala (razón 1.25): 14 · 17 · 21 · 27 · 33 · 42 · 52 · 66 (hero, `clamp()` en móvil).
- Sin mayúsculas sostenidas en etiquetas; sentence case en todo (coincide con el texto del cliente).

Alternativa si el cliente prefiere la fuente del logo: confirmar cuál es (parece DM Sans/Lexend) y usarla en titulares.

---

## 3. Arquitectura de la página

Orden del documento v2, con anclas para la navegación sugerida:

```
[Header fijo] logo original · Nosotros · Soluciones · Cómo trabajamos · Sectores · [Contacto]
─────────────────────────────────────────────────────────────
#inicio        HERO  (fondo ink)
#nosotros      Quiénes somos  +  Equipo (al final de la misma zona)
#soluciones    4 áreas de especialización
               ¿Qué desafío necesitas resolver?  (selector de problemas)
#como-trabajamos  4 pasos
#sectores      4 sectores + texto de cierre
#contacto      Texto + canales + formulario  (fondo ink)
[Footer] logo · canales · aviso de privacidad · ©
```

"Equipo" no tiene entrada en el menú del cliente, así que vive dentro de `#nosotros` (es el mismo tema: quiénes somos / cómo nos organizamos).

### Wireframes

**Hero** — el momento memorable: **el engrane del logo se arma**. El engrane oficial (trazado a SVG desde el PNG) se divide en cuatro piezas, una por área, con los cortes en los valles entre dientes para que cada pieza lleve dos. Al cargar, las piezas están separadas mientras se lee el problema; encajan, se forma el logo con la burbuja al centro y entonces aparece la solución. El logo cuenta el titular: separado → integrado.

```
┌──────────────────────────────────────────────────────────┐
│ Los problemas no vienen         Consulting   Data & Tech │  ← condensada (wdth 75), tinta
│ separados por disciplinas.            ⚙  (4 piezas)      │
│ Las soluciones                                           │  ← ancho completo, 700, blanco
│ tampoco deberían.               Lab               Studio │
│                                                          │
│ Reunimos investigación, estrategia, datos…  (≤ 60 ch)    │
│ [Cuéntanos tu desafío]  Conoce nuestras soluciones       │
└──────────────────────────────────────────────────────────┘
        fondo: plano violeta del manual (#6A5DE7)
```
- **Fondo:** `violet-strong` (#6A5DE7), el plano violeta que el manual usa detrás del logo. Sustituye al fondo tinta, que caía en el patrón genérico "oscuro + un acento".
- **Tipografía:** el eje de ancho de Instrument Sans es parte del recurso. Problema en ancho 75, color tinta; solución en ancho 100, peso 700, blanco.
- **Engrane:** color tinta. Las cuatro áreas rodean el engrane como enlaces a su bloque (`#area-consulting`, `#area-data`, `#area-lab`, `#area-studio`). Al señalar una con cursor o teclado, su pieza se separa. Reparto: Consulting arriba-izquierda, Data & Tech arriba-derecha, Lab abajo-izquierda, Studio abajo-derecha (**a validar con el cliente**; no viene del manual).
- **Botones sobre violeta:** principal con fondo tinta (hover `ink-deep` #1A1640); secundario blanco con subrayado tinta. Foco visible en blanco.
- **Móvil:** el engrane va arriba a 14rem para que el titular quede en la primera pantalla.
- **Contraste:** blanco sobre #6A5DE7 = 4.8:1 (AA). Tinta sobre #6A5DE7 = 3.1:1, válido sólo para texto grande; no usarlo en texto de cuerpo.

Animación única de carga (≈ 2 s): las piezas encajan (0.55–1.45 s), el engrane completo cubre las uniones y la segunda frase entra con un barrido. Con `prefers-reduced-motion` se muestra armado y estático. No hay más animaciones de entrada en el resto de la página.

**Áreas de especialización** — cuatro bloques en rejilla 2×2 (1 col en móvil). No son tarjetas idénticas con sombra: cada bloque lleva una franja superior con el nombre y el subtítulo, y la lista completa de servicios visible (el cliente la pidió completa; no esconderla en acordeones en desktop). Sin numeración (no es una secuencia).

```
┌ Toolkit Consulting ─────────┐┌ Toolkit Data & Tech ───────┐
│ Estrategia, investigación…  ││ Información y tecnología…  │
│ Acompañamos el diseño…      ││ Transformamos datos…       │
│ – Diagnósticos…             ││ – Organización…            │
└─────────────────────────────┘└────────────────────────────┘
┌ Toolkit Lab ────────────────┐┌ Toolkit Studio ────────────┐
```

**¿Qué desafío necesitas resolver?** — la pieza funcional. Seis problemas como lista seleccionable (botones). Al elegir uno se muestra la respuesta, se resaltan las áreas que intervienen y aparece "Hablemos de esto", que lleva a contacto con el tipo de apoyo ya preseleccionado en el formulario. Refuerza el mensaje (un problema = varias disciplinas) y reduce fricción al contactar.

```
  Tenemos información, pero no sabemos…  ●    │ Organizamos, analizamos y transformamos…
  Nuestros procesos son lentos…               │ Áreas: [Data & Tech] [Studio]
  Necesitamos diseñar, fortalecer…            │ Hablemos de esto
  …                                           │
```
Mapeo propuesto (**a validar con el cliente**, no está en el v2):

| Problema | Áreas |
|---|---|
| Información sin aprovechar | Data & Tech, Studio |
| Procesos lentos o fragmentados | Data & Tech, Consulting |
| Diseñar, fortalecer o evaluar un proyecto | Consulting, Lab |
| Comprender personas y territorios | Lab, Consulting |
| Comunicar mejor resultados | Studio, Data & Tech |
| Idea → proyecto viable | Consulting, Lab |

Sin JS, la sección degrada a una lista de pares problema/respuesta (contenido completo y rastreable).

**Cómo trabajamos** — aquí sí hay secuencia real, así que la numeración 01–04 es legítima. Línea horizontal con cuatro paradas en desktop, vertical en móvil.

**Sectores** — lista de cuatro filas (sector a la izquierda, descripción a la derecha), no tarjetas. Texto de cierre debajo.

**Contacto** — fondo `ink`. Columna izquierda: titular, texto y los tres canales como enlaces grandes (correo `mailto:`, WhatsApp `https://wa.me/526567608980`, llamadas `tel:+526568208353`). Columna derecha: formulario.

### Formulario (según v2)

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre | texto | sí |
| Organización | texto | no |
| Medio de contacto | radio correo / WhatsApp + campo correspondiente | sí |
| Tipo de apoyo | Consulting · Data & Tech · Lab · Studio · No estoy seguro/a | sí (default "No estoy seguro/a") |
| Descripción breve del desafío | textarea | sí |
| Consentimiento + enlace a aviso de privacidad | checkbox | sí |

Botón: **Hablemos de tu proyecto**. Confirmación: "Recibimos tu mensaje. Te contactaremos por [correo/WhatsApp] en los próximos días." Error: decir qué campo falta y cómo corregirlo, en el campo.

---

## 4. Contenido: reglas

- Copiar el texto v2 **tal cual**. La sección 09 del documento no se publica.
- Los encabezados "01 / Portada", "02 / Quiénes somos" son del documento, no de la página: no se usan como etiquetas visibles.
- Eliminar todo lo heredado de `restructura.md`: "Estructura Madre", "Infraestructura de colaboración", "Cultura", "Formación e incidencia", "Proyecto Renacer", y el `<title>` actual.
- No inventar cifras, logos de clientes ni testimonios.
- Botones con el nombre exacto del v2: "Cuéntanos tu desafío", "Conoce nuestras soluciones", "Hablemos de tu proyecto".

---

## 5. Buenas prácticas técnicas

**Producción**
- Tailwind por CDN (`cdn.tailwindcss.com`) no es para producción: compilar con Tailwind CLI o pasar a CSS propio (la página es pequeña; CSS propio con variables es viable y más ligero).
- Quitar Material Icons (una fuente completa para 5 flechas) → SVG inline.
- Quitar la imagen de Unsplash del hero (dependencia externa sin relación con la marca).
- Logo: PNG oficiales con `width`/`height` declarados; favicon con el isotipo (hecho). Si llega el SVG oficial, sustituir los PNG del header y footer.

**Accesibilidad**
- Contraste: texto pequeño nunca en `#7C78F2` sobre blanco; botones `#6A5DE7` con texto blanco.
- Foco visible en todos los controles; menú móvil con `aria-expanded` y cierre con Esc.
- `scroll-margin-top` en secciones para que el header fijo no tape los títulos.
- Selector de problemas con `role="tablist"`/`aria-selected` o `aria-pressed`, navegable con teclado.
- `lang="es-MX"`, jerarquía H1 único → H2 por sección → H3 por área.

**SEO / compartir**
- `<title>`: "Toolkit Social — Consultoría interdisciplinaria". Meta description con el texto del hero.
- Dominio: `https://toolkitsocial.com/`. `<link rel="canonical">` y `og:url` apuntan a él.
- Open Graph: `og:image` absoluta (`https://toolkitsocial.com/img/og-image.png`, 1200×630, logo blanco sobre tinta) y `twitter:card` `summary_large_image` (hecho). Al publicar, probar en el Sharing Debugger de Facebook y el Post Inspector de LinkedIn.
- JSON-LD `Organization` sólo con datos reales: nombre, `url`, `logo`, correo y teléfonos (hecho).

**Formulario y datos personales (México)**
- Backend real: endpoint PHP propio o servicio (Formspree, Netlify Forms, etc.). **Probar recepción antes de publicar**, como pide el v2.
- Aviso de privacidad (LFPDPPP): página o modal propio; el checkbox debe enlazarlo.
- Protección anti-spam sin CAPTCHA visible: campo honeypot + límite de envíos.

---

## 6. Plan de ejecución

1. **Confirmar con el cliente** (ver §7).
2. Tokens: actualizar `js/tailwind-config.js` (o CSS variables) con la paleta y la fuente.
3. Reescribir `index.html` sección por sección con el texto v2.
4. Hero: composición tipográfica + animación única + reduced motion.
5. Selector de problemas (`js/main.js`) con preselección del formulario.
6. Formulario + backend + aviso de privacidad; probar envío real.
7. Retirar `pages/`; si hay enlaces externos a ellas, redirigir a `/#soluciones`.
8. Revisión: móvil (360 px), teclado, contraste, Lighthouse.

---

## 7. Pendientes para el cliente

1. ~~Logo original~~ — recibido en PNG. Opcional: el SVG oficial, para mayor nitidez.
2. **Backend del formulario**: ¿a qué correo llegan los mensajes y dónde se aloja el sitio?
3. **Aviso de privacidad**: ¿existe ya un texto?
4. **Mapeo problema → áreas** de la tabla de §3: validar.
5. **Fuente**: ¿aprueban Instrument Sans o quieren la del logotipo?
6. ¿Se borran las páginas de `pages/` o se conservan fuera de la navegación?
7. **Hero**: validar el reparto de áreas en las piezas del engrane (§3).
