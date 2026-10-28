// Toolkit Social — landing v2
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initChallenges();
    initPrivacy();
    initContactForm();
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

    // "Hablemos de esto" preselecciona en el formulario las áreas que intervienen
    root.querySelectorAll('[data-apoyo]').forEach((link) => {
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
            setStatus('No se pudo enviar el mensaje. Escríbenos a genesisrodriguez@toolkitsocialconsulting.com o por WhatsApp al +52 656 760 8980.', true);
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
