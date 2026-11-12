// Toolkit Social — landing v3 (nueva.html; las escenas 3D viven en js/scene.js)
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeroGear();
    initAreas();
    initChallenges();
    initPreselect();
    initPrivacy();
    initContactForm();
    initReveal();
    initSteps();
});

// Menú móvil
function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            setOpen(false);
            toggle.focus();
        }
    });
}

// Hero: mientras el escenario está fijo, el avance del scroll junta las piezas del engrane
// (0–60 %) y luego muestra las áreas (60–80 %). Se suaviza por cuadro para no copiar los saltos
// de la rueda, y sólo corre mientras falta llegar. Sin movimiento, el CSS lo deja armado.
function initHeroGear() {
    const hero = document.querySelector('.hero');
    const stage = hero?.querySelector('.hero__stage');
    const gear = hero?.querySelector('.hero__gear');
    if (!stage || !gear) return;

    const motion = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 36rem)');
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const ease = (t) => 1 - (1 - t) ** 3;
    const props = ['--spread', '--turn', '--whole', '--labels'];
    let target = 0;
    let current = 0;
    let frame = 0;

    // js/scene.js lee de aquí el avance para la escena 3D (1 = armado)
    const state = (window.toolkitHero = { progress: 1 });

    const render = (progress) => {
        state.progress = progress;
        stage.style.setProperty('--progress', progress.toFixed(3));
        const assembled = ease(clamp(progress / 0.6));
        const labels = clamp((progress - 0.6) / 0.2);
        gear.style.setProperty('--spread', ((1 - assembled) * 70).toFixed(2));
        gear.style.setProperty('--turn', ((1 - assembled) * 12).toFixed(2));
        gear.style.setProperty('--whole', clamp((assembled - 0.97) / 0.03).toFixed(3));
        gear.style.setProperty('--labels', labels.toFixed(3));
        gear.classList.toggle('is-labeled', labels > 0.5);
    };

    const tick = () => {
        current += (target - current) * 0.12;
        if (Math.abs(target - current) < 0.0005) current = target;
        render(current);
        frame = current === target ? 0 : requestAnimationFrame(tick);
    };

    const measure = () => {
        if (!motion.matches) return;
        const range = hero.offsetHeight - stage.offsetHeight;
        const scrolled = parseFloat(getComputedStyle(stage).top) - hero.getBoundingClientRect().top;
        target = range > 0 ? clamp(scrolled / range) : 1;
        if (!frame) frame = requestAnimationFrame(tick);
    };

    const setup = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        if (!motion.matches) {
            state.progress = 1;
            stage.style.removeProperty('--progress');
            props.forEach((prop) => gear.style.removeProperty(prop));
            gear.classList.remove('is-labeled');
            return;
        }
        measure();
        current = target;
        render(current);
    };

    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', measure);
    motion.addEventListener('change', setup);
    setup();
}

// Selector "¿Qué desafío necesitas resolver?" (patrón tabs vertical)
function initChallenges() {
    const root = document.querySelector('[data-challenges]');
    if (!root) return;

    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

    const select = (index, focus) => {
        tabs.forEach((tab, i) => {
            const active = i === index;
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            panels[i].hidden = !active;
        });
        if (focus) tabs[index].focus();
        // La escena 3D mueve su engrane al panel elegido
        root.dispatchEvent(new CustomEvent('challengechange', { detail: { panel: panels[index] } }));
    };

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(i, false));
        tab.addEventListener('keydown', (event) => {
            const last = tabs.length - 1;
            const keys = {
                ArrowDown: i === last ? 0 : i + 1,
                ArrowRight: i === last ? 0 : i + 1,
                ArrowUp: i === 0 ? last : i - 1,
                ArrowLeft: i === 0 ? last : i - 1,
                Home: 0,
                End: last,
            };
            if (event.key in keys) {
                event.preventDefault();
                select(keys[event.key], true);
            }
        });
    });

    select(0, false);
}

// Áreas: cada tarjeta se voltea con su botón (táctil y teclado); con cursor, también al señalarla (CSS).
// El foco pasa al botón de la cara visible.
function initAreas() {
    document.querySelectorAll('.area').forEach((area) => {
        const flip = area.querySelector('.area__flip');
        const unflip = area.querySelector('.area__unflip');
        if (!flip || !unflip) return;

        const setFlipped = (flipped) => {
            area.classList.toggle('is-flipped', flipped);
            flip.setAttribute('aria-expanded', String(flipped));
            (flipped ? unflip : flip).focus();
        };

        flip.addEventListener('click', () => setFlipped(true));
        unflip.addEventListener('click', () => setFlipped(false));
    });
}

// "Hablemos de esto" (Desafíos) y "Consultar este servicio" (Áreas) preseleccionan sus áreas en el formulario
function initPreselect() {
    document.querySelectorAll('[data-apoyo]').forEach((link) => {
        link.addEventListener('click', () => {
            const areas = link.dataset.apoyo.split(',');
            document.querySelectorAll('.contact-form input[name="apoyo"]').forEach((box) => {
                box.checked = areas.includes(box.value);
            });
        });
    });
}

// Aviso de privacidad
function initPrivacy() {
    const dialog = document.getElementById('aviso-privacidad');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    document.querySelectorAll('[data-open-privacy]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            dialog.showModal();
        });
    });
}

// Formulario de contacto
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const status = form.querySelector('.form-status');
    const contactInput = form.querySelector('#f-contacto');
    const contactLabel = form.querySelector('[data-contact-label]');

    const contactModes = {
        correo: { label: 'Correo electrónico', type: 'email', autocomplete: 'email' },
        whatsapp: { label: 'Número de WhatsApp', type: 'tel', autocomplete: 'tel' },
    };

    form.querySelectorAll('input[name="medio"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            const mode = contactModes[radio.value];
            contactLabel.textContent = mode.label;
            contactInput.type = mode.type;
            contactInput.autocomplete = mode.autocomplete;
            clearError(contactInput);
        });
    });

    // "No estoy seguro/a" excluye a las áreas, y marcar un área la desmarca
    const unsure = form.querySelector('#f-apoyo-nose');
    form.querySelectorAll('input[name="apoyo"]').forEach((box) => {
        box.addEventListener('change', () => {
            if (!box.checked) return;
            form.querySelectorAll('input[name="apoyo"]').forEach((other) => {
                if (other !== box && (box === unsure || other === unsure)) other.checked = false;
            });
        });
    });

    form.addEventListener('input', (event) => clearError(event.target));

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        setStatus('');

        if (form.elements.web.value) return; // honeypot
        if (!validate()) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        data.apoyo = formData.getAll('apoyo').join(', ') || 'No estoy seguro/a';

        const endpoint = form.dataset.endpoint;
        if (!endpoint || !data.access_key) {
            openMailDraft(data);
            setStatus('Abrimos tu aplicación de correo con el mensaje listo. Envíalo para completar el contacto.');
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const label = button.textContent;
        button.disabled = true;
        button.textContent = 'Enviando…';
        button.setAttribute('aria-busy', 'true');
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(buildPayload(data)),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success) throw new Error(response.status);
            form.reset();
            const medio = data.medio === 'whatsapp' ? 'WhatsApp' : 'correo';
            setStatus(`Recibimos tu mensaje. Te contactaremos por ${medio} en los próximos días.`);
        } catch {
            setStatus('No se pudo enviar el mensaje. Escríbenos a genesis@toolkitsocial.com o por WhatsApp al +52 656 760 8980.', true);
        } finally {
            button.disabled = false;
            button.textContent = label;
            button.removeAttribute('aria-busy');
        }
    });

    function validate() {
        const checks = [
            [form.elements.nombre, (el) => el.value.trim() !== '', 'Escribe tu nombre.'],
            [contactInput, (el) => el.value.trim() !== '', () => form.elements.medio.value === 'whatsapp'
                ? 'Escribe tu número de WhatsApp.'
                : 'Escribe tu correo electrónico.'],
            [contactInput, (el) => el.type !== 'email' || el.validity.valid, 'Revisa el correo: debe tener la forma nombre@dominio.com.'],
            [contactInput, (el) => el.type !== 'tel' || el.value.replace(/\D/g, '').length >= 10, 'Revisa el número: debe tener al menos 10 dígitos.'],
            [form.elements.desafio, (el) => el.value.trim() !== '', 'Cuéntanos brevemente tu desafío.'],
            [form.elements.consentimiento, (el) => el.checked, 'Para enviar el mensaje, acepta el aviso de privacidad.'],
        ];

        let firstInvalid = null;
        const failed = new Set();
        checks.forEach(([el, isValid, message]) => {
            if (failed.has(el) || isValid(el)) return;
            failed.add(el);
            showError(el, typeof message === 'function' ? message() : message);
            firstInvalid ??= el;
        });

        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    }

    function showError(el, message) {
        const error = document.getElementById(`${el.id}-error`);
        el.setAttribute('aria-invalid', 'true');
        if (error) {
            error.textContent = message;
            el.setAttribute('aria-describedby', error.id);
        }
    }

    function clearError(el) {
        if (!el.id) return;
        const error = document.getElementById(`${el.id}-error`);
        el.removeAttribute('aria-invalid');
        if (error) error.textContent = '';
    }

    function setStatus(message, isError = false) {
        status.textContent = message;
        status.classList.toggle('is-error', isError);
    }

    // Campos del mensaje con etiquetas legibles: Web3Forms los usa tal cual en el correo
    function messageFields(data) {
        return {
            'Nombre': data.nombre,
            'Organización': data.organizacion || '—',
            'Medio de contacto': `${data.medio === 'whatsapp' ? 'WhatsApp' : 'Correo'}: ${data.contacto}`,
            'Tipo de apoyo': data.apoyo,
            'Desafío': data.desafio,
            'Aviso de privacidad': 'Aceptado',
        };
    }

    function subjectFor(data) {
        return `Contacto desde el sitio: ${data.nombre}`;
    }

    // Formato de Web3Forms; replyto permite responder directo cuando el contacto es por correo
    function buildPayload(data) {
        const payload = {
            access_key: data.access_key,
            from_name: data.from_name,
            subject: subjectFor(data),
            ...messageFields(data),
        };
        if (data.medio === 'correo') payload.replyto = data.contacto;
        return payload;
    }

    function openMailDraft(data) {
        const body = Object.entries(messageFields(data)).map(([label, value]) => `${label}: ${value}`).join('\n');
        window.location.href = `mailto:genesis@toolkitsocial.com?subject=${encodeURIComponent(subjectFor(data))}&body=${encodeURIComponent(body)}`;
    }
}

// Aparición al entrar en pantalla: marca los bloques con [data-reveal] (el CSS los oculta sólo
// con JS y movimiento) y les pone .is-in cuando asoman. --i escalona a los hermanos.
function initReveal() {
    const targets = document.querySelectorAll([
        '.about__title', '.about__body', '.team__head', '.team__lead-in', '.team__disciplines', '.team__cols',
        '.section__title', '.challenges__hint', '.challenges', '.area', '.step', '.sector', '.sectors__close',
        '.contact-form',
    ].join(','));

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -10% 0px' });

    targets.forEach((el) => {
        const group = el.matches('.area, .step, .sector') ? [...el.parentElement.children].indexOf(el) : 0;
        el.style.setProperty('--i', group);
        el.dataset.reveal = '';
        observer.observe(el);
    });
}

// Cómo trabajamos: un punto recorre el hilo que une los cuatro pasos según el avance del scroll.
// Cada paso alcanzado recibe .is-reached (se llena su nodo y arranca su escena). El punto va de
// nodo en nodo, así que sirve igual con el hilo horizontal (escritorio) o vertical (móvil).
function initSteps() {
    const list = document.querySelector('.steps');
    if (!list) return;
    const steps = [...list.querySelectorAll('.step')];
    const nodes = steps.map((step) => step.querySelector('.step__node'));
    if (steps.length < 2 || nodes.includes(null)) return;

    const dot = document.createElement('li');
    dot.className = 'steps__dot';
    dot.setAttribute('aria-hidden', 'true');
    list.append(dot);

    let frame = 0;
    const update = () => {
        frame = 0;
        const box = list.getBoundingClientRect();
        const view = innerHeight;
        if (box.bottom < -view || box.top > view * 2) return;

        // Con offset* y no con getBoundingClientRect: no los altera la animación de aparición
        const centers = nodes.map((node) => {
            let x = node.offsetWidth / 2;
            let y = node.offsetHeight / 2;
            for (let el = node; el && el !== list; el = el.offsetParent) {
                x += el.offsetLeft;
                y += el.offsetTop;
            }
            return [x, y];
        });

        let at;
        if (Math.abs(centers[1][0] - centers[0][0]) < 1) {
            // Hilo vertical: el punto sigue la mitad de la pantalla, de nodo en nodo
            const y = view * 0.5 - box.top;
            const next = centers.findIndex(([, nodeY]) => nodeY > y);
            if (next === 0) at = 0;
            else if (next < 0) at = nodes.length - 1;
            else at = next - 1 + (y - centers[next - 1][1]) / (centers[next][1] - centers[next - 1][1]);
        } else {
            // Hilo horizontal: 0 cuando la lista asoma por abajo; 1 poco antes de que salga por arriba
            at = Math.min(1, Math.max(0, (view * 0.8 - box.top) / (box.height + view * 0.3))) * (nodes.length - 1);
        }
        const from = Math.min(nodes.length - 2, Math.floor(at));
        const mix = (axis) => centers[from][axis] + (centers[from + 1][axis] - centers[from][axis]) * (at - from);
        dot.style.transform = `translate(${mix(0).toFixed(1)}px, ${mix(1).toFixed(1)}px)`;
        steps.forEach((step, i) => step.classList.toggle('is-reached', at >= i - 0.02));
    };
    const schedule = () => {
        if (!frame) frame = requestAnimationFrame(update);
    };

    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    update();
}
