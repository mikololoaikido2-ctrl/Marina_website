/* ============================================================
   MARINA MIKHAEL — site-wide interactivity
   - Sticky header on scroll
   - Mobile menu toggle
   - Smooth-scroll for in-page anchors (offset for sticky header)
   - IntersectionObserver-driven reveal animations
   - Active-link highlighting for multi-page nav
   - Contact form handler (mailto fallback)
   - FAQ accordion (progressive enhancement for <details>)
   ============================================================ */
(function () {
    'use strict';

    const header      = document.querySelector('.site-header');
    const navToggle   = document.getElementById('navToggle');
    const mobileMenu  = document.getElementById('mobileMenu');
    const menuClose   = document.getElementById('menuClose');
    const scrim       = document.getElementById('scrim');

    let scrimHideTimer = null;

    // -------- Sticky header state --------
    const onScroll = () => {
        if (!header) return;
        if (window.scrollY > 24) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // -------- Mobile menu --------
    const openMenu = () => {
        if (!mobileMenu || !scrim || !navToggle) return;
        if (scrimHideTimer) { clearTimeout(scrimHideTimer); scrimHideTimer = null; }
        mobileMenu.classList.add('is-open');
        scrim.hidden = false;
        requestAnimationFrame(() => scrim.classList.add('is-open'));
        navToggle.classList.add('is-open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Close menu');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        if (!mobileMenu || !scrim || !navToggle) return;
        mobileMenu.classList.remove('is-open');
        scrim.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (scrimHideTimer) clearTimeout(scrimHideTimer);
        scrimHideTimer = setTimeout(() => {
            scrim.hidden = true;
            scrimHideTimer = null;
        }, 400);
    };

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            if (mobileMenu.classList.contains('is-open')) closeMenu();
            else openMenu();
        });
    }
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    if (scrim)     scrim.addEventListener('click', closeMenu);
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('is-open')) closeMenu();
    });

    // -------- Smooth scroll with sticky-header offset --------
    const headerHeight = () => (header ? header.offsetHeight : 0);
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href === '#top') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() + 1;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    // -------- Reveal animations --------
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }

    // -------- Active nav link for multi-page site --------
    // Map current path → one of: home | about | services | contact
    const path = (window.location.pathname || '').toLowerCase();
    const pageKey = (() => {
        const file = path.split('/').pop() || 'index.html';
        if (file === '' || file === 'index.html' || file === '/' || path.endsWith('/')) return 'home';
        if (file.startsWith('about'))    return 'about';
        if (file.startsWith('services')) return 'services';
        if (file.startsWith('contact'))  return 'contact';
        return 'home';
    })();

    const navMap = {
        home:     'index.html',
        about:    'about.html',
        services: 'services.html',
        contact:  'contact.html'
    };

    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        const target = navMap[pageKey];
        if (href === target || (pageKey === 'home' && (href === '' || href === '#top' || href === 'index.html'))) {
            a.classList.add('is-current');
            a.setAttribute('aria-current', 'page');
        }
    });

    // -------- Contact form (mailto fallback) --------
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!status) return;

            const name    = (form.elements.namedItem('name')    || {}).value || '';
            const email   = (form.elements.namedItem('email')   || {}).value || '';
            const service = (form.elements.namedItem('service') || {}).value || '';
            const message = (form.elements.namedItem('message') || {}).value || '';

            // basic validation
            if (!name.trim() || !email.trim() || !message.trim()) {
                status.textContent = 'Please fill in your name, email, and message before sending.';
                status.className = 'form-status is-error';
                return;
            }
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!emailOk) {
                status.textContent = 'Please enter a valid email address.';
                status.className = 'form-status is-error';
                return;
            }

            const subject = `Consultation enquiry — ${service || 'General'} (from ${name})`;
            const body    =
`Hi Marina,

${message}

— ${name}
${email}`;

            const mailto = `mailto:marina.mikhael2026@hotmail.com`
                + `?subject=${encodeURIComponent(subject)}`
                + `&body=${encodeURIComponent(body)}`;

            status.textContent = 'Opening your email client… If nothing happens, please email marina.mikhael2026@hotmail.com directly.';
            status.className = 'form-status is-success';

            // small delay so the success message paints before the mail client opens
            setTimeout(() => {
                window.location.href = mailto;
            }, 100);
        });
    }
})();
