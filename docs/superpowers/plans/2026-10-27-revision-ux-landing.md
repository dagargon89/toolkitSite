# Revisión UX/UI de la landing — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Objetivo:** aplicar las recomendaciones de la revisión UX/UI que mejoran jerarquía, formulario y legibilidad, sin romper la identidad ni el texto aprobado del cliente.

**Arquitectura:** sitio estático de una página, sin build: `index.html` + `css/landing.css` (tokens en `:root`) + `js/landing.js` (vanilla, `defer`). Cada tarea toca HTML/CSS/JS en su sitio y se verifica en el navegador de vista previa.

**Stack:** HTML, CSS (variables, `clamp()`, `:has()`, container queries), JavaScript sin dependencias, Instrument Sans (Google Fonts).

**Especificación:** `C:\Users\Admin\Downloads\Toolkit_Social_Revision_UX_UI_Landing_v1.md` (revisión externa v1.0, 27 oct 2026), contrastada con `docs/estrategia-rediseno.md` (decisiones vigentes) y `Toolkit_Social_Contenido_Landing_Page_v2.md` (texto del cliente).

## Restricciones globales

- El texto es el del v2 del cliente, literal. Cualquier cambio de copy está en el Bloque B y requiere aprobación.
- Sin dependencias nuevas ni paso de build. No volver a cargar Tailwind ni librerías.
- Una sola familia: Instrument Sans. Colores y tamaños sólo desde los tokens de `:root` (`--ink`, `--violet-strong`, `--fs-*`…).
- Nada de testimonios, cifras ni ejemplos de clientes inventados.
- Toda animación nueva va dentro de `@media (prefers-reduced-motion: no-preference)`.
- Sin tarjetas con sombra ni píldoras (regla de `docs/estrategia-rediseno.md` §3).
- Commits en español con prefijo convencional (`feat:`, `fix:`, `docs:`) y la línea `Co-Authored-By` vigente.

## Cómo se verifica

No hay suite de pruebas: cada tarea se prueba en la vista previa (`.claude/launch.json` → `landing`, `http://localhost:8137`, sin caché) con un fragmento JS que devuelve `true` cuando el cambio está bien. Se corre **antes** del cambio (debe dar `false`) y **después** (debe dar `true`). Anchos de prueba: 1366×900 (escritorio) y 375×812 (móvil), además de los de la tarea final.

## Ya resuelto: no hay que tocarlo

La revisión se hizo sobre capturas anteriores al commit `5375478`. Estos puntos ya cumplen y sólo entran en el QA final:
`scroll-margin-top` (`css/landing.css:83-85`), foco visible (`:77-81`), menú móvil con Esc, orden de campos del formulario, campo condicional correo/WhatsApp con validación, honeypot, botón deshabilitado durante el envío, selector de desafíos con tabs, teclado, panel, áreas y preselección, filas pulsables con flecha y fondo (`css/landing.css:839-900`), engrane del formulario fuera de las casillas, un solo H1, metadatos y JSON-LD, y etiquetas de áreas del hero que ya son enlaces a cada área.

**Fuera del plan, a propósito:** reducir o rediseñar el engrane grande del hero. Es el momento central de la identidad (se arma al cargar) y ya vincula sus cuatro etiquetas a las áreas. Si el cliente pide cambiarlo, se planifica aparte.

## Puntos de revisión

1. **«No estoy seguro/a» y la preselección:** al pulsar «Hablemos de esto» en Desafíos, esa casilla debe quedar desmarcada y las dos áreas marcadas. Lo prueba la Tarea 2.
2. **Ancho de 320 px:** el pie con cuatro enlaces y las cinco casillas de apoyo no deben provocar scroll horizontal. Lo prueban las Tareas 2, 4 y 6.
3. **Doble clic en «Enviar» con un endpoint lento:** debe salir una sola petición. Lo prueba la Tarea 2.
4. **Sin JavaScript:** las casillas de apoyo y, si se aprueba B5, los `<details>` de Áreas deben funcionar sin JS. Lo prueba la Tarea 6.
5. **Reordenación (B3):** dos secciones seguidas nunca comparten fondo y todas las anclas del menú siguen llegando. Lo prueba la Tarea B3.

---

# Bloque A — Se puede hacer ya (no cambia el texto del cliente)

### Tarea 1: Jerarquía tipográfica (H1 y titular de Nosotros)

**Archivos:**
- Modificar: `css/landing.css:319-324` (`.hero__title`)
- Modificar: `css/landing.css:583-589` (`.about__title`)

**Decisión:** el H1 baja de 70 px a 58 px como máximo (−17 %, dentro del rango 56–68 de la revisión). El titular de Nosotros baja de 58 px a 44 px para dejar de competir con el H1 sin quedar por debajo del H2 general (`--fs-xl`, 42 px). Los mínimos móviles no cambian.

- [ ] **Paso 1: Verificación (debe dar `false`), a 1366×900**

```js
scrollTo(0, 0);
const px = s => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
px('.hero__title') === 58 && px('.about__title') === 44
  && document.querySelector('.hero__actions').getBoundingClientRect().bottom <= 768
```

- [ ] **Paso 2: Cambiar los `clamp()`**

`.hero__title` → `font-size: clamp(2.25rem, 1.2rem + 3.1vw, 3.625rem);`
`.about__title` → `font-size: clamp(1.875rem, 1.2rem + 2vw, 2.75rem);`

- [ ] **Paso 3: Repetir la verificación a 1366×900 (debe dar `true`). A 375×812, comprobar que el H1 sigue en 36 px y que no hay scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`).**

- [ ] **Paso 4: Commit**

```bash
git add css/landing.css
git commit -m "fix: Reducir el H1 y el titular de Nosotros para ordenar la jerarquía"
```

---

### Tarea 2: Formulario compacto (sin engrane, «No estoy seguro/a», pista y estado de envío)

**Archivos:**
- Modificar: `index.html:555-578` (fieldset «Tipo de apoyo»)
- Modificar: `index.html:580-584` (textarea)
- Modificar: `css/landing.css:1343-1445` (bloque `.picker*`)
- Modificar: `js/landing.js:125-131` (clic en piezas) y `:154-170` (envío)

**Interfaces:**
- Produce: casilla `#f-apoyo-nose` (`name="apoyo"`, `value="No estoy seguro/a"`) y contenedor `.picker__opts`. B5 (preselección desde Áreas) depende de que todas las casillas sigan con `name="apoyo"`.

**Decisiones:**
- Se elimina el engrane del formulario: el `<svg class="picker__svg">`, las reglas `.picker__gear`, `.picker__svg`, `.picker__rest`, `.picker__piece*`, `.picker__opt--*`, `@keyframes picker-in` y el manejador de clic en piezas.
- Las casillas van en `<div class="picker__opts">` con este orden: Consulting, Data & Tech, Lab, Studio, No estoy seguro/a. CSS: `display: grid; grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr)); gap: 0.5rem 1.5rem;`. Se conserva `.picker__opt { font-size: 0.9375rem; }`.
- Pista del fieldset: «Puedes elegir más de una.»
- Exclusión mutua en `initContactForm()`: si se marca `#f-apoyo-nose`, se desmarcan las otras; si se marca un área, se desmarca `#f-apoyo-nose`. Se mantiene el valor por defecto de `js/landing.js:145`: sin casillas marcadas se envía «No estoy seguro/a».
- Textarea: `placeholder="¿Qué necesitas mejorar, desarrollar o resolver?"`. La etiqueta visible no cambia.
- Estado de envío: mientras dura el `fetch`, el botón muestra «Enviando…» y `aria-busy="true"`; en `finally` recupera su texto original y se quita `aria-busy`. El texto del botón **no** cambia aquí (ver B1).

- [ ] **Paso 1: Verificación (debe dar `false`)**

```js
const f = document.querySelector('.contact-form');
const nose = f.querySelector('#f-apoyo-nose');
!f.querySelector('.picker__svg') && !!nose
  && f.querySelector('#f-desafio').placeholder === '¿Qué necesitas mejorar, desarrollar o resolver?'
```

- [ ] **Paso 2: Cambiar el HTML del fieldset y del textarea según las decisiones**

- [ ] **Paso 3: Sustituir el bloque `.picker*` del CSS por `.picker__opts` y actualizar su comentario**

- [ ] **Paso 4: En `js/landing.js`, quitar el clic en piezas y añadir la exclusión mutua y el estado «Enviando…»**

- [ ] **Paso 5: Repetir la verificación del paso 1 (debe dar `true`) y correr las de comportamiento (cada una debe dar `true`)**

```js
// Exclusión mutua
const f = document.querySelector('.contact-form');
const box = id => f.querySelector('#' + id);
box('f-apoyo-lab').click(); box('f-apoyo-nose').click();
const a = box('f-apoyo-nose').checked && !box('f-apoyo-lab').checked;
box('f-apoyo-studio').click();
a && !box('f-apoyo-nose').checked && box('f-apoyo-studio').checked
```

```js
// Preselección desde Desafíos (Punto de revisión 1)
const f = document.querySelector('.contact-form');
f.querySelector('#f-apoyo-nose').checked = true;
document.querySelector('#panel-1 [data-apoyo]').click();
!f.querySelector('#f-apoyo-nose').checked
  && f.querySelector('#f-apoyo-data').checked && f.querySelector('#f-apoyo-studio').checked
```

```js
// Estado de envío y doble clic (Punto de revisión 3): fetch simulado de 500 ms
const f = document.querySelector('.contact-form');
f.dataset.endpoint = '/__prueba';
let calls = 0;
window.fetch = () => { calls++; return new Promise(r => setTimeout(() => r(new Response('{}')), 500)); };
f.nombre.value = 'Prueba'; f.querySelector('#f-contacto').value = 'a@b.mx';
f.desafio.value = 'x'; f.consentimiento.checked = true;
const btn = f.querySelector('button[type="submit"]');
btn.click(); btn.click();
const during = btn.textContent.trim() === 'Enviando…' && btn.getAttribute('aria-busy') === 'true';
await new Promise(r => setTimeout(r, 700));
during && calls === 1 && btn.textContent.trim() === 'Hablemos de tu proyecto' && !btn.hasAttribute('aria-busy')
```

Después recargar la página para quitar el `fetch` simulado. A 320 px, comprobar que no hay scroll horizontal y que las cinco casillas se leen completas.

- [ ] **Paso 6: Commit**

```bash
git add index.html css/landing.css js/landing.js
git commit -m "feat: Compactar el formulario: sin engrane, opción «No estoy seguro/a» y estado de envío"
```

---

### Tarea 3: Equipo como retícula uniforme

**Archivos:**
- Modificar: `css/landing.css:624` (comentario) y `:660-678` (`.team__disciplines`)

**Decisión:** las siete disciplinas pasan a una retícula del mismo tamaño y ancho tipográfico, sin píldoras: `display: grid; grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr)); gap: 0.75rem 2rem; font-size: var(--fs-lg); font-stretch: 100%;`. Cada `li` lleva un filete superior `1px solid rgb(194 200 250 / 0.3)` y `padding-top: 0.5rem`. Se borran las siete reglas `li:nth-child(n) { font-stretch }`. El HTML no cambia.

- [ ] **Paso 1: Verificación (debe dar `false`)**

```js
const lis = [...document.querySelectorAll('.team__disciplines li')].map(getComputedStyle);
new Set(lis.map(s => s.fontStretch)).size === 1 && new Set(lis.map(s => s.fontSize)).size === 1
  && getComputedStyle(document.querySelector('.team__disciplines')).display === 'grid'
```

- [ ] **Paso 2: Sustituir las reglas de `.team__disciplines` y su comentario**

- [ ] **Paso 3: Repetir la verificación (debe dar `true`) a 1366 y a 375**

- [ ] **Paso 4: Commit**

```bash
git add css/landing.css
git commit -m "feat: Mostrar las disciplinas del equipo en una retícula uniforme"
```

---

### Tarea 4: Enlaces de contacto y soluciones en el pie

**Archivos:**
- Modificar: `index.html:613-615` (`.site-footer__links`)

**Decisión:** el orden de los enlaces es Soluciones (`#soluciones`), Correo (`mailto:genesisrodriguez@toolkitsocialconsulting.com`), WhatsApp (`https://wa.me/526567608980`, `target="_blank" rel="noopener"`) y Aviso de privacidad, que ya existe. El CSS actual del pie no cambia.

- [ ] **Paso 1: Verificación (debe dar `false`)**

```js
const hrefs = [...document.querySelectorAll('.site-footer__links a')].map(a => a.getAttribute('href'));
JSON.stringify(hrefs) === JSON.stringify(['#soluciones',
  'mailto:genesisrodriguez@toolkitsocialconsulting.com', 'https://wa.me/526567608980', '#aviso-privacidad'])
```

- [ ] **Paso 2: Añadir los tres `<li>` antes del aviso de privacidad**

- [ ] **Paso 3: Repetir la verificación (debe dar `true`); a 320 px, sin scroll horizontal**

- [ ] **Paso 4: Commit**

```bash
git add index.html
git commit -m "feat: Añadir soluciones, correo y WhatsApp al pie"
```

---

# Bloque B — Viable, pero requiere aprobación del cliente

Cada tarea se ejecuta **sólo** si el cliente aprueba la decisión que la encabeza. Son independientes entre sí, salvo B5, que depende de la Tarea 2.

### Tarea B1: Botón final «Enviar mi consulta»
**Decisión del cliente:** reemplazar «Hablemos de tu proyecto», que es texto literal del v2.
- Modificar `index.html:601`, el texto restaurado en el `finally` de la Tarea 2 y la regla de botones en `docs/estrategia-rediseno.md` §4.
- Verificación: `document.querySelector('.contact-form button[type=submit]').textContent.trim() === 'Enviar mi consulta'`.
- Commit: `feat: Cambiar el botón del formulario a «Enviar mi consulta»`.

### Tarea B2: Texto breve de Nosotros
**Decisión del cliente:** sustituir el texto v2 por la versión de la revisión, que sería el texto literal aprobado.
- Modificar `index.html:127-142`:
  - `.about__parts`: «Distintas disciplinas.»
  - `.about__whole`: «Una misma forma de trabajar.»
  - `.about__lead`: «Somos una red interdisciplinaria que reúne especialistas en investigación, estrategia, datos, tecnología, finanzas y diseño.»
  - `.about__cols`: un solo `<p>` con «Combinamos estas capacidades según las necesidades de cada proyecto. Porque antes de proponer una solución, nos interesa comprender el problema, su contexto y a las personas involucradas.»
- Se conserva el CSS. Verificar a 375 px que la segunda columna no queda vacía ni desalineada.
- Commit: `feat: Acortar el texto de Nosotros`.

### Tarea B3: Reordenar las secciones
**Decisión del cliente:** pasar del orden del v2 al orden centrado en el cliente.
- **Nuevo orden de `<main>`:** `#inicio` → `#desafios` → `#soluciones` → `#como-trabajamos` → `#nosotros` → `#sectores` → `#contacto`. Se mueven bloques enteros de `index.html:124-497`.
- **Fondos alternos:**
  - `#como-trabajamos` pierde `section--lavender`.
  - `#nosotros` gana `section--lavender`, con la franja tinta del equipo dentro.
  - Resultado: violeta, blanco, lavanda, blanco, lavanda+tinta, blanco, tinta.
- **Menú (`index.html:63-69`):** Soluciones · Cómo trabajamos · Nosotros · Sectores · Contacto.
- **Verificación (debe dar `true`):**

```js
const ids = [...document.querySelectorAll('main > section')].map(s => s.id);
const bg = [...document.querySelectorAll('main > section')].map(s => getComputedStyle(s).backgroundColor);
JSON.stringify(ids) === JSON.stringify(['inicio','desafios','soluciones','como-trabajamos','nosotros','sectores','contacto'])
  && bg.every((c, i) => i === 0 || c !== bg[i - 1])
  && [...document.querySelectorAll('#site-nav a')].every(a => document.querySelector(a.getAttribute('href')))
```

- Además, pulsar cada enlace del menú y comprobar que el título de la sección queda visible bajo el header.
- Actualizar `docs/estrategia-rediseno.md` §3 (bloque de arquitectura).
- Commit: `feat: Reordenar la página: desafíos y soluciones antes de Nosotros`.

### Tarea B4: «Cómo trabajamos» en cuatro columnas
**Decisión del cliente:** sustituir la escalera tipográfica.
- **CSS (`css/landing.css:1070-1125`):** reemplazar el bloque por `.steps { grid-template-columns: repeat(4, minmax(0, 1fr)); }` a partir de 64rem, y una columna por debajo. `.step` pasa a flujo vertical: número, verbo y descripción.
- **Tamaños:**
  - `.step h3`: `font-size: var(--fs-lg)` (27 px, dentro del rango H3 24–28).
  - Se borran `--stair` y las reglas `nth-child` de `margin-left`.
- **Verificación a 1366 (debe dar `true`):** `new Set([...document.querySelectorAll('.step')].map(s => s.offsetTop)).size === 1`. A 375 deben salir 4 valores crecientes.
- Commit: `feat: Mostrar el proceso en cuatro columnas`.

### Tarea B5: Áreas con servicios plegables y CTA contextual
**Decisión del cliente:** mostrar los servicios plegados.
- **Depende de la Tarea 2:** casillas con `name="apoyo"`.
- **HTML de cada `.area` (`index.html:181-271`):**
  - Envolver `.area__list` en `<details class="area__more"><summary>Ver servicios</summary>…</details>`.
  - Después, añadir `<a class="area__cta" href="#contacto" data-apoyo="Consulting">Consultar este servicio</a>`. El valor de `data-apoyo` es exactamente el `value` de la casilla del área (`Data &amp; Tech` en HTML).
- **JS:**
  - Sacar el bloque de preselección de `initChallenges()` (`js/landing.js:77-85`) a una función nueva `initPreselect(): void`.
  - Esa función recorre `document.querySelectorAll('[data-apoyo]')` y la llama `DOMContentLoaded`.
  - Mismo comportamiento: marca las áreas de la lista y desmarca las demás, incluida `#f-apoyo-nose`.
- **CSS:** `summary` con cursor y flecha que gira con `[open]` (con reduced motion, sin transición). `.area__cta` con el mismo estilo que `.link-light`, adaptado a fondo lavanda.
- **Verificación (debe dar `true`):**

```js
document.querySelector('#area-lab .area__cta').click();
const f = document.querySelector('.contact-form');
f.querySelector('#f-apoyo-lab').checked && !f.querySelector('#f-apoyo-consulting').checked
  && document.querySelectorAll('.area__more').length === 4
```

- Comprobar con JS desactivado que `<details>` abre y cierra.
- Commit: `feat: Plegar los servicios de cada área y añadir su consulta directa`.

### Tarea B6: Quitar los engranes pequeños de Áreas
**Decisión del cliente:** el engrane se queda sólo en el hero y en Desafíos, como firma de marca.
- Borrar los cuatro `<svg class="area__gear">` (`index.html:183-186`, `:207-210`, `:230-233`, `:253-256`).
- Borrar del CSS `.area__gear*`, las variables `#area-* { --x; --y }` y la animación `piece-nudge` (`css/landing.css:729-750`, `:794-812`).
- Si la diseñadora entrega iconos por área, ocupan el lugar del `<svg>` con `aria-hidden="true"`.
- Verificación: `!document.querySelector('.area__gear')`.
- Commit: `feat: Reservar el engrane para el hero y Desafíos`.

### Tarea B7: Sectores con ejemplo y nuevo cierre
**Decisión y contenido del cliente:** un ejemplo real de necesidad por sector, sin inventarlo.
- **Ejemplos:** cada `.sector` (`index.html:473-492`) gana un `<dd class="sector__example">` con el ejemplo del cliente. CSS: `font-size: var(--fs-xs)`, color `--graphite`, `margin-top: 0.5rem`.
- **Cierre (si se aprueba):** `.sectors__close` (`index.html:494-495`) pasa a «¿Tu organización no encaja en estas categorías? <a href="#contacto">Cuéntanos qué necesitas</a>.»
- Commit: `feat: Añadir un ejemplo por sector`.

---

# Bloque C — Bloqueado por terceros (P0 antes de publicar)

### Tarea C1: Endpoint real del formulario
**Necesita:** dónde se aloja el sitio y qué correo recibe las consultas.
- Poner la URL en `data-endpoint` (`index.html:528`).
- **Contrato que debe aceptar el servidor:**
  - `POST` con JSON `{nombre, organizacion, medio, contacto, apoyo, desafio, consentimiento}`.
  - Responde con un código 2xx si todo va bien.
  - Valida los datos en el servidor y limita la frecuencia de envíos.
  - Si está en otro dominio, necesita CORS.
- Si el endpoint es de otro dominio, actualizar `docs/estrategia-rediseno.md` §5.
- **Verificación:** un envío real llega al buzón, con el éxito y el error visibles en la página. Una petición con `web` relleno no llega.

### Tarea C2: Aviso de privacidad
**Necesita:** el texto LFPDPPP de Toolkit Social.
- Sustituir el contenido del `<dialog id="aviso-privacidad">` (`index.html:621-628`) y borrar `.privacy__pending` (`css/landing.css:1529-1535`).
- Verificación: el enlace del formulario y el del pie abren el aviso con el texto real, y Esc lo cierra.

### Tarea C3: Logo oficial «Toolkit Social»
**Necesita:** los archivos de la diseñadora, de preferencia SVG.
- Reemplazar `img/logo/toolkit-horizontal-reducido-{color,blanco}.png` (`index.html:54`, `:611`), con los `width`/`height` reales del archivo nuevo.
- Regenerar `img/og-image.png` (1200×630, logo blanco sobre tinta).
- Verificación: el logo se ve nítido con zoom al 200 % y el header mantiene `--header-h` (4.5rem).

---

### Tarea 6: QA final y documentación

**Archivos:**
- Modificar: `docs/estrategia-rediseno.md`. Registrar las decisiones revertidas (engrane del formulario, lista de disciplinas, pie con canales) y las que se aplicaron del Bloque B.

- [ ] **Paso 1: Comprobar que no hay scroll horizontal en todos los anchos**

En 320, 375, 430, 768 y 1366 px, esta verificación debe dar `true`:

```js
document.documentElement.scrollWidth <= innerWidth
```

- [ ] **Paso 2: Recorrer la página con el teclado**

  - Tab por toda la página: el foco debe verse siempre.
  - En el menú móvil, Esc lo cierra.
  - En Desafíos, las flechas y Home/End cambian de pestaña.
  - El formulario se puede llenar y enviar sin ratón.

- [ ] **Paso 3: Probar sin JavaScript**

  - Las casillas de apoyo funcionan.
  - Si se aplicó B5, los `<details>` abren y cierran.
  - Desafíos muestra todos los pares problema/respuesta.

- [ ] **Paso 4: Correr Lighthouse en Chrome DevTools, móvil y escritorio**

Accesibilidad ≥ 95, sin errores de contraste. Anotar el rendimiento.

- [ ] **Paso 5: Probar los enlaces de contacto**

Los enlaces `mailto:`, `tel:` y `wa.me` abren su destino.

- [ ] **Paso 6: Actualizar la estrategia y hacer commit**

```bash
git add docs/estrategia-rediseno.md
git commit -m "docs: Registrar en la estrategia los cambios de la revisión UX"
```
