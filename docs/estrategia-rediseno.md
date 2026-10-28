# Toolkit Social — Estrategia de rediseño (landing v2)

**Fecha:** 12 oct 2026 (actualizado el mismo día: logos, og:image y rediseño de todas las secciones; 27 oct 2026: cambios de la revisión UX externa, ver `docs/superpowers/plans/2026-10-27-revision-ux-landing.md`) · **Fuentes:** `Toolkit_Social_Contenido_Landing_Page_v2.md/.pdf` (idénticos), `Examples/toolkit_identidad_1_page-0001.jpg.png` (manual de identidad), `Examples/restructura.md` (propuesta anterior), sitio actual (`index.html`, `pages/*`).

---

## 1. Diagnóstico: el sitio actual responde a un brief que ya no existe

El sitio actual se construyó sobre `restructura.md` (la "Estructura Madre"). El documento v2 del cliente lo sustituye. Las diferencias no son de estilo, son de modelo:

| Tema | Sitio actual | Lo que pide el cliente (v2) | Acción |
|---|---|---|---|
| Arquitectura | Multipágina: home + 7 páginas en `pages/` | **Una sola página** | Hecho: `index.html` de una página; `pages/` eliminado |
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
| Header (fondo blanco) | `toolkit-horizontal-reducido-color.png` (sin lema) |
| Footer (fondo tinta) | `toolkit-horizontal-reducido-blanco.png` (sin lema) |
| Favicon y `logo` del JSON-LD | `toolkit-isotipo-color.png` |
| Imagen para redes (`img/og-image.png`, 1200×630) | horizontal blanco sobre tinta |
| Hero | engrane trazado a SVG desde el isotipo, inline |

Versión reducida: a 40 px de alto el lema "SOCIAL CONSULTING" no se lee, así que header y footer usan `toolkit-horizontal-reducido-*.png`, generadas desde la horizontal sin el lema y con la palabra centrada respecto al engrane (**a validar con el cliente**).

La imagen para redes va sobre tinta y no sobre violeta porque el "Kit" del logo blanco es violeta y se perdería.

### Tipografía

Montserrat es genérica y no se parece al wordmark (geométrico, terminaciones suaves, "K" amplia). Propuesta: **una sola familia variable, Instrument Sans** (Google Fonts, ejes de peso 400–700 y ancho 75–100).
- Titulares: 600, ancho 100, interlineado 1.05, tracking ligeramente negativo.
- Cuerpo: 400, 17–18 px, interlineado 1.6, medida ≤ 68 caracteres.
- Escala (razón 1.25): 14 · 17 · 21 · 27 · 33 · 42 · 52 · 66, con `clamp()` en móvil. Desde la revisión UX (27 oct), el H1 del hero tiene un máximo de 58 px y el titular de Quiénes somos de 44 px, para que no compitan.
- Sin mayúsculas sostenidas en etiquetas; sentence case en todo (coincide con el texto del cliente).
- El eje de ancho tiene significado (ver §3, "Lenguaje común"): ancho 75 = problema, separado; ancho 100 = solución, integrado.

Alternativa si el cliente prefiere la fuente del logo: confirmar cuál es (parece DM Sans/Lexend) y usarla en titulares.

---

## 3. Arquitectura de la página

Orden del documento v2, con anclas para la navegación sugerida:

```
[Header fijo] logo original · Nosotros · Soluciones · Cómo trabajamos · Sectores · [Contacto]
─────────────────────────────────────────────────────────────
#inicio        HERO  (fondo violeta, engrane que se arma)
#nosotros      Quiénes somos (blanco)  +  Equipo (franja tinta)
#soluciones    4 áreas de especialización (lavanda)
#desafios      ¿Qué desafío necesitas resolver?  (blanco, selector de problemas)
#como-trabajamos  4 pasos (lavanda)
#sectores      4 sectores + texto de cierre (blanco)
#contacto      Texto + canales + formulario  (fondo tinta)
[Footer] logo · aviso de privacidad · ©
```

"Equipo" no tiene entrada en el menú del cliente, así que vive dentro de `#nosotros` (es el mismo tema: quiénes somos / cómo nos organizamos).

### Lenguaje común entre secciones

Tres recursos se repiten a lo largo de la página y el visitante los aprende sin explicación:

1. **Ancho tipográfico = separado → integrado.** Instrument Sans condensada (ancho 75) para el problema o lo suelto; ancho completo (100) para la solución o lo unido. Se usa en el titular del hero, el titular de Quiénes somos y los problemas y respuestas de Desafíos. Desde la revisión UX, la lista de disciplinas del Equipo ya no lo usa.
2. **Cada pieza del engrane es un área, siempre en la misma posición:** Consulting arriba-izquierda, Data & Tech arriba-derecha, Lab abajo-izquierda, Studio abajo-derecha. El engrane aparece en el hero (se arma solo), en Áreas (la pieza de cada una) y en Desafíos (se encienden las del problema). Desde la revisión UX, ya no aparece en el formulario de Contacto. Forma y recortes viven una sola vez en el SVG del hero (`#gear-shape`, `#cut-*`) y las demás instancias los reutilizan con `<use>`.
3. **Movimiento:** una sola animación automática (la carga del hero). Todo lo demás se mueve sólo en respuesta a una acción (señalar un área, llegar desde un enlace, elegir un problema, marcar una casilla) y nada se anima con `prefers-reduced-motion`.

Sin tarjetas con sombra, sin filetes de periódico, sin píldoras: las secciones se separan por color de fondo y espacio.

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

Animación única de carga (≈ 2 s): las piezas encajan (0.55–1.45 s), el engrane completo cubre las uniones y la segunda frase entra con un barrido. Con `prefers-reduced-motion` se muestra armado y estático. Es la única animación automática de la página.

**Quiénes somos + Equipo** — el titular repite el recurso del hero: "Distintas disciplinas." condensada, "Una misma intención: encontrar mejores soluciones." a ancho completo. Debajo, el primer párrafo grande a la izquierda y los otros dos apilados a la derecha. Equipo va en una franja tinta. Desde la revisión UX, las 7 disciplinas forman una retícula uniforme: mismo tamaño (27 px), ancho completo y un filete fino encima de cada una. Sustituye a la lista que se abría de condensada a ancha, que el revisor leía como una nube irregular.

```
┌────────────────────────────────────────────────────────────┐
│ Distintas disciplinas.                       ← condensada  │
│ Una misma intención: encontrar mejores soluciones. ← ancha │
│ Somos una plataforma… (grande)   │ Creemos que…            │
│                                  │ Trabajamos desde…       │
├──────────────── franja tinta ──────────────────────────────┤
│ Una red de talentos…            Toolkit Social se construye│
│ Integramos experiencia en:                                 │
│ Sociología  Evaluación de proyectos  Análisis de datos …   │
│ Conformamos equipos…            Creemos en el talento…     │
└────────────────────────────────────────────────────────────┘
```
La frase "Integramos experiencia en sociología, evaluación…" pasa a "Integramos experiencia en:" + lista (**a validar con el cliente**; el resto del texto es literal).

**Áreas de especialización** — sin tarjetas. Rejilla 2×2 sobre lavanda (1 columna en móvil) que repite la posición de las piezas: cada área lleva un engrane pequeño (4rem) con su pieza en tinta y las otras en lavanda claro. "Toolkit" en peso normal y el nombre del área en negrita (el `h3` conserva "Toolkit Consulting" completo). Subtítulos en `violet-deep` (5.4:1 sobre lavanda; `violet-strong` daba 4.1:1). Lista completa de servicios visible, sin acordeones. Al llegar desde el hero (`:target`), la pieza del área sale un instante y vuelve. Sin numeración (no es una secuencia).

```
  ⚙◤ Toolkit Consulting          ⚙◥ Toolkit Data & Tech
  Estrategia, investigación…     Información y tecnología…
  – Diagnósticos…                – Organización…
  ⚙◣ Toolkit Lab                 ⚙◢ Toolkit Studio
```

**¿Qué desafío necesitas resolver?** — la pieza funcional y donde se demuestra la tesis (un problema = varias disciplinas). Seis problemas como tabs verticales accesibles (flechas, Home/End). Los problemas van en condensada, más grandes; el elegido en tinta, negrita y entre comillas « » con la de apertura colgada al margen. La respuesta va a ancho completo junto a un engrane con las piezas de las áreas que intervienen en tinta; al cambiar de problema, esas piezas llegan desde afuera y encajan. Debajo: "Intervienen Data & Tech y Studio" (enlaces) y "Hablemos de esto", que lleva a contacto con **las dos áreas** preseleccionadas.

```
  «Tenemos información, pero no       Consulting   Data & Tech
   sabemos cómo aprovecharla.»              ⚙  (piezas encendidas)
  Nuestros procesos son lentos…       Lab          Studio
  Necesitamos diseñar, fortalecer…    Organizamos, analizamos y…
  …                                   Intervienen Data & Tech y Studio
                                      [Hablemos de esto]
```
En móvil cada respuesta aparece bajo su pregunta, con su engrane (14rem). Sin JS, todos los problemas se muestran con su engrane y su respuesta.

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

**Cómo trabajamos** — escalera tipográfica. Hay secuencia real, así que la numeración 01–04 es legítima, pero el número es una marca pequeña: mandan los verbos (Comprendemos, Diseñamos, Implementamos, Fortalecemos) en grande. En escritorio cada verbo entra un escalón más (diagonal de avance) y las descripciones forman una columna recta a la derecha. Debajo de 64rem, sin escalera: número, verbo y descripción debajo. Sin engrane aquí, a propósito: sus piezas significan áreas, no pasos.

```
  01 Comprendemos                     Escuchamos tus necesidades…
       02 Diseñamos                   Integramos las capacidades…
            03 Implementamos          Desarrollamos soluciones…
                 04 Fortalecemos      Documentamos…
```

**Sectores** — rejilla 2×2 sin filetes (1 columna en móvil). El nombre del sector va grande (27 px, negrita) para que cada visitante se reconozca; la descripción debajo. El cierre "Cada proyecto es distinto." se destaca en grande como puente al contacto; el resto de la frase sigue en tamaño de lectura (mismo párrafo, texto literal).

**Contacto** — fondo `ink`. Columna izquierda (fija al hacer scroll en escritorio): titular, texto y los tres canales como enlaces grandes separados por espacio (correo `mailto:`, WhatsApp `https://wa.me/526567608980`, llamadas `tel:+526568208353`). Columna derecha: formulario sobre fondo blanco.

**Tipo de apoyo** (revisión UX):
- Cinco casillas en rejilla, sin engrane: las cuatro áreas y «No estoy seguro/a».
- «No estoy seguro/a» excluye a las áreas, y marcar un área la desmarca.
- La descripción tiene la pista «¿Qué necesitas mejorar, desarrollar o resolver?».
- Mientras se envía, el botón muestra «Enviando…».

El footer enlaza Soluciones, correo, WhatsApp y el aviso de privacidad.

### Formulario (según v2)

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre | texto | sí |
| Organización | texto | no |
| Medio de contacto | radio correo / WhatsApp + campo correspondiente | sí |
| Tipo de apoyo | casillas Consulting · Data & Tech · Lab · Studio (**varias**) + «No estoy seguro/a» (excluyente). Sin ninguna marcada se envía "No estoy seguro/a". Se envía como lista: "Consulting, Lab" | no (default "No estoy seguro/a") |
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
- ~~Tailwind por CDN~~ — hecho: la página usa CSS propio con variables (`css/landing.css`) y ya no carga Tailwind.
- ~~Quitar Material Icons~~ — hecho: la página no los carga.
- ~~Quitar la imagen de Unsplash del hero~~ — hecho: el hero usa el engrane de la marca.
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
2. ~~Tokens~~ — hecho, como variables CSS en `css/landing.css` (sin Tailwind).
3. ~~Reescribir `index.html` con el texto v2~~ — hecho.
4. ~~Hero~~ — hecho: engrane que se arma, animación única, reduced motion.
5. ~~Rediseño por secciones~~ — hecho: Quiénes somos, Áreas, Desafíos, Cómo trabajamos, Sectores y Contacto (§3).
6. ~~Selector de problemas~~ — hecho (`js/landing.js`), con preselección de las dos áreas en el formulario.
7. Formulario: **backend real + aviso de privacidad; probar envío real.** Pendiente. Hoy, sin `data-endpoint`, el envío abre el correo del visitante con el mensaje armado.
8. ~~Retirar `pages/`~~ — hecho. Si había enlaces externos a esas páginas, redirigirlos a `/#soluciones` en el servidor.
9. Revisión final: móvil (360 px), teclado, contraste, Lighthouse. Cada sección ya se revisó en escritorio y a 375 px; falta la pasada completa con Lighthouse.

---

## 7. Pendientes para el cliente

1. ~~Logo original~~ — recibido en PNG. Opcional: el SVG oficial, para mayor nitidez.
2. **Backend del formulario**: ¿a qué correo llegan los mensajes y dónde se aloja el sitio?
3. **Aviso de privacidad**: ¿existe ya un texto?
4. **Mapeo problema → áreas** de la tabla de §3: validar. Ahora también decide qué piezas se encienden en Desafíos y qué áreas llegan marcadas al formulario.
5. **Fuente**: ¿aprueban Instrument Sans o quieren la del logotipo?
6. ~~¿Se borran las páginas de `pages/`?~~ — borradas (siguen en el historial de git).
7. **Engrane**: validar el reparto de áreas en las piezas (Consulting arriba-izquierda, Data & Tech arriba-derecha, Lab abajo-izquierda, Studio abajo-derecha). Se usa en hero, Áreas y Desafíos.
8. **Equipo**: aprobar que "Integramos experiencia en sociología, evaluación…" se muestre como "Integramos experiencia en:" + lista de las 7 disciplinas.
9. **Tipo de apoyo**: el v2 lo define como una sola opción; el formulario permite elegir varias. Confirmar.
10. **Logo reducido** (sin lema) en header y footer: aprobar, o enviar la versión reducida oficial si existe.
11. **Desafíos**: se añadió la línea de ayuda "Elige el que más se parezca al tuyo." bajo el titular (no está en el v2). Aprobar.
