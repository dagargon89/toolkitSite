// Toolkit Social — escenas 3D (Three.js)
// Mejora progresiva sobre la página: si WebGL no está disponible, cada escena se omite y queda
// el respaldo en SVG/CSS. Tres escenas, todas con la idea de la marca (piezas que se integran):
//   1. Hero: el engrane del logo en cuatro piezas (una por área) que se arman con el scroll,
//      entre partículas dispersas que se ordenan en órbitas y se apartan del cursor.
//   2. Desafíos: el engrane enciende y encaja las piezas de las áreas que intervienen.
//   3. Equipo: una red de nodos (las disciplinas) por la que circula el conocimiento.
// Con movimiento reducido no hay animación: cada escena se dibuja quieta y armada.
import * as THREE from './vendor/three.module.min.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
const HALF_PI = Math.PI / 2;
const clamp = (v) => Math.min(1, Math.max(0, v));
const easeOut = (t) => 1 - (1 - t) ** 3;
// Factor de suavizado por cuadro; con movimiento reducido, todo llega de inmediato
const k = (f) => (reduced.matches ? 1 : f);

// Engrane: caja del SVG (0–497) y su centro
const GEAR_SIZE = 497;
const GEAR_CENTER = 248.5;
const AREAS = ['consulting', 'data', 'studio', 'lab'];
// Dónde empieza el corte de cada pieza (grados, coordenadas SVG); cada una abarca 90°
const WEDGE_START = { consulting: 202.5, data: 292.5, studio: 22.5, lab: 112.5 };
// Hacia dónde sale cada pieza (y hacia arriba): su esquina y la bisectriz de su corte
const CORNER = { consulting: [-1, 1], data: [1, 1], studio: [1, -1], lab: [-1, -1] };
const BISECTOR = { consulting: [-0.383, 0.924], data: [0.924, 0.383], studio: [0.383, -0.924], lab: [-0.924, -0.383] };
// Luz propia mínima: mantiene el violeta de la marca aun en las caras en sombra
const BASE_GLOW = 0.22;
const VIOLETS = { consulting: 0x6a5de7, data: 0x7c78f2, studio: 0x5f52e0, lab: 0x8580f4 };

// Puntero compartido, en coordenadas de la ventana
const pointer = { x: -1e4, y: -1e4, active: false };
addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
}, { passive: true });
document.addEventListener('pointerleave', () => { pointer.active = false; });

// Bucle único: dibuja sólo las escenas a la vista. Con movimiento reducido se dibuja bajo pedido.
const scenes = [];
let raf = 0;
let lastTime = 0;

function loop(now) {
    raf = 0;
    const still = reduced.matches;
    const t = still ? 0 : now / 1000;
    const dt = Math.min(0.05, t - lastTime);
    lastTime = t;
    scenes.forEach((scene) => {
        if (scene.visible) scene.render(t, dt);
    });
    if (!still) raf = requestAnimationFrame(loop);
}

function invalidate() {
    if (!raf) raf = requestAnimationFrame(loop);
}

addEventListener('resize', invalidate);
reduced.addEventListener('change', invalidate);

function addScene(scene, canvas) {
    scene.visible = false;
    scenes.push(scene);
    new IntersectionObserver(([entry]) => {
        scene.visible = entry.isIntersecting;
        invalidate();
    }, { rootMargin: '10% 0px' }).observe(canvas);
}

// Lienzo + cámara. resize() ajusta el tamaño al del lienzo y dice si hay algo que dibujar.
function createStage(className, fov, distance) {
    const canvas = document.createElement('canvas');
    canvas.className = className;
    canvas.setAttribute('aria-hidden', 'true');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
    camera.position.z = distance;
    const viewHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(fov) / 2);
    let width = 0;
    let height = 0;

    return {
        canvas, renderer, scene, camera, viewHeight,
        get viewWidth() { return viewHeight * (width / height || 1); },
        get width() { return width; },
        get height() { return height; },
        resize() {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            if (!w || !h) return false;
            if (w !== width || h !== height) {
                width = w;
                height = h;
                renderer.setSize(w, h, false);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            }
            return true;
        },
        draw() {
            renderer.render(scene, camera);
            canvas.classList.add('is-ready');
        },
    };
}

function addLights(scene) {
    scene.add(new THREE.HemisphereLight(0xe4e2ff, 0x2a2466, 2.4));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(3, 5, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc2c8fa, 1.4);
    rim.position.set(-6, -3, 2);
    scene.add(rim);
}

// —— Geometría del engrane ——
// Se toma el mismo trazo del SVG (#gear-shape): contorno exterior y la burbuja de diálogo del
// centro. Cada pieza es el tramo de ambos contornos que cae dentro de su corte de 90°.

function parseContours(d) {
    const tokens = d.match(/[MLC]|-?\d*\.?\d+/gi) || [];
    const paths = [];
    let path = null;
    let command = '';
    let i = 0;
    const next = () => parseFloat(tokens[i++]);
    while (i < tokens.length) {
        if (/[MLC]/i.test(tokens[i])) command = tokens[i++].toUpperCase();
        if (command === 'M') {
            path = new THREE.Path();
            paths.push(path);
            path.moveTo(next(), next());
            command = 'L';
        } else if (command === 'L') {
            path.lineTo(next(), next());
        } else {
            path.bezierCurveTo(next(), next(), next(), next(), next(), next());
        }
    }
    return paths.map((p) => orientLoop(p.getPoints(8)));
}

const angleOf = (p) => Math.atan2(p.y - GEAR_CENTER, p.x - GEAR_CENTER);
const mod = (a, n) => ((a % n) + n) % n;

// Lazo abierto (sin repetir el primer punto) y recorrido en el sentido en que crece el ángulo
function orientLoop(points) {
    if (points[0].distanceTo(points[points.length - 1]) < 1e-6) points = points.slice(0, -1);
    let turn = 0;
    points.forEach((p, i) => {
        const delta = angleOf(points[(i + 1) % points.length]) - angleOf(p);
        turn += mod(delta + Math.PI, TAU) - Math.PI;
    });
    return turn < 0 ? points.reverse() : points;
}

// Tramo del lazo dentro del corte que empieza en `start` (radianes), con los puntos exactos del corte
function arcInWedge(points, start) {
    const n = points.length;
    const rel = points.map((p) => mod(angleOf(p) - start, TAU));
    const inside = rel.map((a) => a <= HALF_PI);

    // El tramo más largo de puntos consecutivos dentro del corte
    let best = { from: 0, length: 0 };
    for (let i = 0; i < n; i++) {
        if (!inside[i] || inside[(i - 1 + n) % n]) continue;
        let length = 0;
        while (inside[(i + length) % n] && length < n) length++;
        if (length > best.length) best = { from: i, length };
    }

    const cut = (a, b, t) => new THREE.Vector2().lerpVectors(points[a], points[b], t);
    const first = best.from;
    const before = (first - 1 + n) % n;
    const last = (first + best.length - 1) % n;
    const after = (last + 1) % n;
    const beforeAngle = rel[before] - TAU;

    const arc = [cut(before, first, -beforeAngle / (rel[first] - beforeAngle))];
    for (let j = 0; j < best.length; j++) arc.push(points[(first + j) % n]);
    arc.push(cut(last, after, (HALF_PI - rel[last]) / (rel[after] - rel[last])));
    return arc;
}

let gearGeometries = null;

function getGearGeometries() {
    if (gearGeometries) return gearGeometries;
    const d = document.getElementById('gear-shape')?.getAttribute('d');
    if (!d) return null;
    const [outer, hole] = parseContours(d);
    if (!outer || !hole) return null;

    const depth = 64;
    const bevel = 7;
    gearGeometries = {};
    AREAS.forEach((area) => {
        const start = THREE.MathUtils.degToRad(WEDGE_START[area]);
        const outline = [...arcInWedge(outer, start), ...arcInWedge(hole, start).reverse()]
            .map((p) => new THREE.Vector2(p.x - GEAR_CENTER, GEAR_CENTER - p.y));
        // El bisel entra en la figura (bevelOffset): las piezas no se enciman y la unión se lee
        const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
            depth,
            bevelEnabled: true,
            bevelThickness: bevel,
            bevelSize: bevel,
            bevelOffset: -bevel,
            bevelSegments: 4,
        });
        geometry.translate(0, 0, -depth / 2);
        gearGeometries[area] = geometry;
    });
    return gearGeometries;
}

function createGear() {
    const geometries = getGearGeometries();
    if (!geometries) return null;
    const group = new THREE.Group();
    const pieces = AREAS.map((area) => {
        const material = new THREE.MeshStandardMaterial({
            color: VIOLETS[area],
            emissive: 0x6a5de7,
            emissiveIntensity: BASE_GLOW,
            roughness: 0.36,
            metalness: 0.18,
        });
        const mesh = new THREE.Mesh(geometries[area], material);
        group.add(mesh);
        return { area, mesh, material };
    });
    return { group, pieces };
}

// —— Puntos redondos y suaves (partículas y nodos) ——

function createPoints(count, color) {
    const position = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const alpha = new Float32Array(count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1));
    const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
            uColor: { value: new THREE.Color(color) },
            uScale: { value: Math.min(devicePixelRatio || 1, 2) },
        },
        vertexShader: `
            attribute float aSize;
            attribute float aAlpha;
            uniform float uScale;
            varying float vAlpha;
            void main() {
                vAlpha = aAlpha;
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mv;
                gl_PointSize = aSize * uScale * (10.0 / -mv.z);
            }`,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            void main() {
                float d = length(gl_PointCoord - 0.5);
                gl_FragColor = vec4(uColor, smoothstep(0.5, 0.2, d) * vAlpha);
            }`,
    });
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return { points, position, size, alpha, geometry };
}

// —— 1. Hero ——

function initHero() {
    const stageEl = document.querySelector('.hero__stage');
    const holder = stageEl?.querySelector('.hero__gear');
    if (!holder) return;

    const gear = createGear();
    if (!gear) return;
    const stage = createStage('hero__canvas', 35, 10);
    stageEl.prepend(stage.canvas);
    addLights(stage.scene);
    stage.scene.add(gear.group);

    // Cada pieza guarda cómo se desarma: profundidad y giro propios
    const loose = [
        { z: 1.0, rx: 0.9, ry: -0.7, rz: 0.5 },
        { z: -0.8, rx: -0.6, ry: 0.9, rz: -0.6 },
        { z: 0.7, rx: 0.7, ry: 0.8, rz: 0.7 },
        { z: -1.0, rx: -0.8, ry: -0.6, rz: -0.5 },
    ];
    const hot = [0, 0, 0, 0];
    let hotArea = null;

    // Al señalar el nombre de un área, su pieza se adelanta y se enciende
    AREAS.forEach((area) => {
        const link = holder.querySelector(`.gear__area--${area} a`);
        if (!link) return;
        const set = (value) => () => { hotArea = value; invalidate(); };
        link.addEventListener('pointerenter', set(area));
        link.addEventListener('focus', set(area));
        link.addEventListener('pointerleave', set(null));
        link.addEventListener('blur', set(null));
    });

    // Partículas: parten dispersas por toda la pantalla; al armarse el engrane, la mayoría
    // se ordena en órbitas a su alrededor
    const count = innerWidth < 720 ? 420 : 1000;
    const dots = createPoints(count, 0xc2c8fa);
    stage.scene.add(dots.points);
    const seeds = Array.from({ length: count }, (_, i) => {
        const ring = i % 5 < 3 ? Math.floor(Math.random() * 4) : -1;
        dots.size[i] = 1.6 + Math.random() ** 2 * 3.6;
        dots.alpha[i] = 0.25 + Math.random() * 0.6;
        return {
            u: Math.random() - 0.5,
            v: Math.random() - 0.5,
            z: -3 + Math.random() * 3.5,
            phase: Math.random() * TAU,
            ring,
            radius: 0.68 + ring * 0.14 + (Math.random() - 0.5) * 0.025,
            angle: Math.random() * TAU,
            speed: (ring % 2 ? -1 : 1) * (0.05 + Math.random() * 0.03),
            ox: 0,
            oy: 0,
        };
    });

    const look = { x: 0, y: 0 };
    const orbit = new THREE.Vector3();

    addScene({
        render(t) {
            if (!stage.resize()) return;
            const canvasRect = stage.canvas.getBoundingClientRect();
            const holderRect = holder.getBoundingClientRect();
            const unit = stage.viewHeight / canvasRect.height;
            const viewW = stage.viewWidth;
            const viewH = stage.viewHeight;

            // El engrane ocupa el lugar de su caja en la página
            const size = holderRect.width * unit;
            const cx = (holderRect.left + holderRect.width / 2 - canvasRect.left - canvasRect.width / 2) * unit;
            const cy = -(holderRect.top + holderRect.height / 2 - canvasRect.top - canvasRect.height / 2) * unit;

            const progress = window.toolkitHero?.progress ?? 1;
            const assembled = easeOut(clamp(progress / 0.6));
            const apart = 1 - assembled;
            const ordered = easeOut(clamp((progress - 0.1) / 0.6));

            // Puntero normalizado a la pantalla (−1…1) para la inclinación
            const tx = pointer.active ? (pointer.x / innerWidth) * 2 - 1 : 0;
            const ty = pointer.active ? (pointer.y / innerHeight) * 2 - 1 : 0;
            look.x += (tx - look.x) * k(0.05);
            look.y += (ty - look.y) * k(0.05);

            const group = gear.group;
            group.position.set(cx, cy + Math.sin(t * 0.8) * 0.03 * size, 0);
            group.scale.setScalar((size * 0.92) / GEAR_SIZE);
            group.rotation.set(
                0.14 + look.y * 0.22 + apart * 0.45,
                -0.24 + look.x * 0.3 + Math.sin(t * 0.5) * 0.06 - apart * 0.8,
                apart * -0.6,
            );

            gear.pieces.forEach((piece, i) => {
                const [dx, dy] = CORNER[piece.area];
                const state = loose[i];
                hot[i] += ((piece.area === hotArea ? 1 : 0) - hot[i]) * k(0.14);
                piece.mesh.position.set(dx * 115 * apart, dy * 115 * apart, state.z * 150 * apart + hot[i] * 46);
                piece.mesh.rotation.set(state.rx * apart, state.ry * apart, state.rz * apart);
                piece.material.emissiveIntensity = BASE_GLOW + hot[i] * 0.55;
            });
            group.updateMatrixWorld();

            // Puntero en unidades de la escena (plano z = 0)
            const px = (pointer.x - canvasRect.left - canvasRect.width / 2) * unit;
            const py = -(pointer.y - canvasRect.top - canvasRect.height / 2) * unit;
            const reach = 1.15;

            seeds.forEach((seed, i) => {
                let x = seed.u * viewW * 1.25 + Math.sin(t * 0.3 + seed.phase) * 0.12;
                let y = seed.v * viewH * 1.25 + Math.cos(t * 0.24 + seed.phase) * 0.12;
                let z = seed.z;
                if (seed.ring >= 0) {
                    const angle = seed.angle + t * seed.speed;
                    orbit.set(Math.cos(angle) * seed.radius * GEAR_SIZE, Math.sin(angle) * seed.radius * GEAR_SIZE, 0)
                        .applyMatrix4(group.matrixWorld);
                    x += (orbit.x - x) * ordered;
                    y += (orbit.y - y) * ordered;
                    z += (orbit.z - z) * ordered;
                }

                // Las partículas se apartan del cursor y vuelven solas
                let pushX = 0;
                let pushY = 0;
                if (pointer.active) {
                    const ddx = x - px;
                    const ddy = y - py;
                    const dist = Math.hypot(ddx, ddy);
                    if (dist < reach && dist > 1e-4) {
                        const force = (1 - dist / reach) ** 2 * 0.55;
                        pushX = (ddx / dist) * force;
                        pushY = (ddy / dist) * force;
                    }
                }
                seed.ox += (pushX - seed.ox) * k(0.09);
                seed.oy += (pushY - seed.oy) * k(0.09);

                dots.position[i * 3] = x + seed.ox;
                dots.position[i * 3 + 1] = y + seed.oy;
                dots.position[i * 3 + 2] = z;
            });
            dots.geometry.attributes.position.needsUpdate = true;

            stage.draw();
            holder.classList.add('is-3d');
        },
    }, stage.canvas);
}

// —— 2. Desafíos ——

function initFit() {
    const root = document.querySelector('[data-challenges]');
    if (!root || !root.querySelector('.fit')) return;

    const gear = createGear();
    if (!gear) return;
    const stage = createStage('fit__canvas', 30, 10);
    addLights(stage.scene);
    stage.scene.add(gear.group);
    // El lienzo sobresale 8 % por lado de la caja del engrane (ver .fit__canvas)
    gear.group.scale.setScalar((stage.viewHeight / 1.16) * 0.82 / GEAR_SIZE);

    const dim = new THREE.Color(0x3a3573);
    const lit = AREAS.map((area) => new THREE.Color(VIOLETS[area]));
    const glow = [0, 0, 0, 0];
    let active = [];
    let changedAt = null;
    const look = { x: 0, y: 0 };

    const place = (panel) => {
        const fit = panel?.querySelector('.fit');
        if (!fit) return;
        fit.append(stage.canvas);
        active = AREAS.filter((area) => fit.classList.contains(`fit--${area}`));
        changedAt = null;
        invalidate();
    };

    root.addEventListener('challengechange', (event) => place(event.detail.panel));
    place(root.querySelector('.challenge-panel:not([hidden])'));

    addScene({
        render(t) {
            if (!stage.resize()) return;
            changedAt ??= t;

            // Inclinación según el cursor respecto del lienzo
            const rect = stage.canvas.getBoundingClientRect();
            const tx = pointer.active ? THREE.MathUtils.clamp((pointer.x - rect.left - rect.width / 2) / innerWidth * 2, -1, 1) : 0;
            const ty = pointer.active ? THREE.MathUtils.clamp((pointer.y - rect.top - rect.height / 2) / innerHeight * 2, -1, 1) : 0;
            look.x += (tx - look.x) * k(0.06);
            look.y += (ty - look.y) * k(0.06);
            gear.group.rotation.set(0.2 + look.y * 0.3, -0.28 + look.x * 0.45 + Math.sin(t * 0.6) * 0.1, 0);

            let order = 0;
            gear.pieces.forEach((piece, i) => {
                const on = active.includes(piece.area);
                // Las piezas que intervienen llegan desde afuera, una tras otra, y encajan
                const fly = on && !reduced.matches ? easeOut(clamp((t - changedAt - order * 0.09) / 0.65)) : 1;
                if (on) order++;
                glow[i] += ((on ? fly : 0) - glow[i]) * k(0.12);
                const [bx, by] = BISECTOR[piece.area];
                piece.mesh.position.set(bx * 120 * (1 - fly), by * 120 * (1 - fly), glow[i] * 26);
                piece.material.color.lerpColors(dim, lit[i], glow[i]);
                piece.material.emissiveIntensity = glow[i] * BASE_GLOW;
            });

            stage.draw();
        },
    }, stage.canvas);
}

// —— 3. Equipo ——

function initNetwork() {
    const team = document.querySelector('.team');
    if (!team) return;

    const stage = createStage('team__canvas', 40, 12);
    team.prepend(stage.canvas);
    const group = new THREE.Group();
    stage.scene.add(group);

    // Los primeros nodos son las disciplinas (más grandes); el resto, la red que las rodea
    const chips = [...team.querySelectorAll('.team__disciplines li')];
    const count = chips.length + (innerWidth < 720 ? 22 : 44);
    const nodes = Array.from({ length: count }, (_, i) => ({
        u: Math.random() - 0.5,
        v: Math.random() - 0.5,
        z: (Math.random() - 0.5) * 5,
        phase: Math.random() * TAU,
        major: i < chips.length,
        boost: 0,
        x: 0, y: 0, w: 0,
    }));

    // Cada nodo se une con sus dos vecinos más cercanos
    const aspect = Math.max(0.5, team.clientWidth / Math.max(1, team.clientHeight));
    const edges = [];
    const seen = new Set();
    nodes.forEach((node, i) => {
        nodes
            .map((other, j) => ({ j, d: Math.hypot((node.u - other.u) * aspect, node.v - other.v, (node.z - other.z) / 9) }))
            .filter(({ j }) => j !== i)
            .sort((a, b) => a.d - b.d)
            .slice(0, 2)
            .forEach(({ j }) => {
                const id = i < j ? `${i}-${j}` : `${j}-${i}`;
                if (seen.has(id)) return;
                seen.add(id);
                edges.push([i, j]);
            });
    });

    const linePositions = new Float32Array(edges.length * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: 0x7c78f2, transparent: true, opacity: 0.32 }));
    lines.frustumCulled = false;
    group.add(lines);

    const dots = createPoints(count, 0xc2c8fa);
    group.add(dots.points);

    // Pulsos que recorren las uniones: el conocimiento que se comparte
    const pulses = Array.from({ length: 14 }, () => ({ edge: Math.floor(Math.random() * edges.length), at: Math.random(), speed: 0.25 + Math.random() * 0.3 }));
    const sparks = createPoints(pulses.length, 0xffffff);
    sparks.size.fill(6);
    group.add(sparks.points);

    chips.forEach((chip, i) => {
        chip.addEventListener('pointerenter', () => { nodes[i].hover = true; invalidate(); });
        chip.addEventListener('pointerleave', () => { nodes[i].hover = false; invalidate(); });
    });

    const look = { x: 0, y: 0 };

    addScene({
        render(t, dt) {
            if (!stage.resize()) return;
            const viewW = stage.viewWidth;
            const viewH = stage.viewHeight;

            const tx = pointer.active ? (pointer.x / innerWidth) * 2 - 1 : 0;
            const ty = pointer.active ? (pointer.y / innerHeight) * 2 - 1 : 0;
            look.x += (tx - look.x) * k(0.04);
            look.y += (ty - look.y) * k(0.04);
            group.rotation.set(look.y * 0.08, Math.sin(t * 0.12) * 0.16 + look.x * 0.14, 0);

            nodes.forEach((node, i) => {
                node.x = node.u * viewW * 1.1 + Math.sin(t * 0.4 + node.phase) * 0.22;
                node.y = node.v * viewH * 1.05 + Math.cos(t * 0.33 + node.phase) * 0.22;
                node.w = node.z + Math.sin(t * 0.27 + node.phase) * 0.3;
                node.boost += ((node.hover ? 1 : 0) - node.boost) * k(0.12);
                dots.position.set([node.x, node.y, node.w], i * 3);
                dots.size[i] = (node.major ? 15 : 5.5) * (1 + node.boost * 1.5);
                dots.alpha[i] = Math.min(1, (node.major ? 0.85 : 0.5) + node.boost);
            });
            edges.forEach(([a, b], i) => {
                linePositions.set([nodes[a].x, nodes[a].y, nodes[a].w, nodes[b].x, nodes[b].y, nodes[b].w], i * 6);
            });
            pulses.forEach((pulse, i) => {
                pulse.at += dt * pulse.speed;
                if (pulse.at > 1) {
                    pulse.at = 0;
                    pulse.edge = Math.floor(Math.random() * edges.length);
                }
                const [a, b] = edges[pulse.edge];
                const from = nodes[a];
                const to = nodes[b];
                sparks.position.set([
                    from.x + (to.x - from.x) * pulse.at,
                    from.y + (to.y - from.y) * pulse.at,
                    from.w + (to.w - from.w) * pulse.at,
                ], i * 3);
                sparks.alpha[i] = Math.sin(pulse.at * Math.PI) * 0.9;
            });

            lineGeometry.attributes.position.needsUpdate = true;
            [dots, sparks].forEach(({ geometry }) => {
                geometry.attributes.position.needsUpdate = true;
                geometry.attributes.aSize.needsUpdate = true;
                geometry.attributes.aAlpha.needsUpdate = true;
            });

            stage.draw();
        },
    }, stage.canvas);
}

// Cada escena es independiente: si una falla (p. ej. sin WebGL), las demás y la página siguen
[initHero, initFit, initNetwork].forEach((init) => {
    try {
        init();
    } catch (error) {
        console.warn('Escena 3D no disponible:', error);
    }
});
