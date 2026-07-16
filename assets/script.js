/* ============================================================
   Mateaș Andrei · Portfolio (Kinetic Studio variant)
   High-interaction engine: custom cursor, magnetic elements,
   spotlight, 3D tilt, text scramble. Vanilla JS, no deps.
   ============================================================ */
(function () {
    'use strict';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const $  = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    /* ---------- year ---------- */
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    /* ---------- load orchestration ---------- */
    if (reduce) {
        document.body.classList.add('is-loaded');
    } else {
        requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));
    }

    /* ---------- header / progress / to-top ---------- */
    const header = $('#header');
    const progress = $('#progress');
    const toTop = $('#toTop');
    const onScroll = () => {
        const s = window.scrollY;
        header.classList.toggle('is-scrolled', s > 20);
        if (toTop) toTop.classList.toggle('is-visible', s > 700);
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? (s / h) * 100 : 0;
        if (progress) progress.style.width = pct + '%';
        if (toTop) toTop.style.setProperty('--p', pct.toFixed(1) + '%');   // drives the ring
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

    /* ---------- mobile nav ---------- */
    const burger = $('#burger');
    const mnav = $('#mobileNav');
    if (burger) {
        const close = () => { burger.classList.remove('is-open'); mnav.classList.remove('is-open'); if (header) header.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); };
        burger.addEventListener('click', () => {
            const open = burger.classList.toggle('is-open');
            mnav.classList.toggle('is-open', open);
            if (header) header.classList.toggle('nav-open', open);
            burger.setAttribute('aria-expanded', String(open));
        });
        $$('a', mnav).forEach(a => a.addEventListener('click', close));
    }

    /* ---------- marquee: duplicate for seamless loop ---------- */
    const track = $('#marquee');
    if (track && !reduce) track.innerHTML += track.innerHTML;

    /* ---------- custom cursor + spotlight ---------- */
    const cursor = $('#cursor');
    const ring = $('#cursorRing');
    const spot = $('.spotlight');
    if (fine && !reduce && cursor && ring) {
        document.body.classList.add('has-cursor');
        let mx = innerWidth / 2, my = innerHeight / 3;
        let rx = mx, ry = my;
        let raf = null;
        const place = (el, x, y) => { el.style.transform = `translate3d(${ x }px, ${ y }px, 0) translate(-50%, -50%)`; };
        const onMove = () => {
            raf = null;
            place(cursor, mx, my);
            if (spot) spot.style.transform = `translate3d(${ mx }px, ${ my }px, 0)`;
        };
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            if (!raf) raf = requestAnimationFrame(onMove); // batch to one update per frame
        }, { passive: true });
        (function lerpRing() {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            place(ring, rx, ry);
            requestAnimationFrame(lerpRing);
        })();
        const hoverables = 'a, button, [data-magnetic]';
        document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverables)) ring.classList.add('is-hover'); });
        document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverables)) ring.classList.remove('is-hover'); });
    }

    /* ---------- magnetic elements ---------- */
    if (fine && !reduce) {
        $$('[data-magnetic]').forEach(el => {
            const strength = 0.32;
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                el.style.transform = `translate(${ dx * strength }px, ${ dy * strength }px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------- 3D tilt ---------- */
    if (fine && !reduce) {
        $$('[data-tilt]').forEach(el => {
            const max = 7;
            el.addEventListener('mousemove', (e) => {
                if (window.innerWidth <= 1020) { el.style.transform = ''; return; }  // no 3D tilt once the hero stacks
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                const rotY = (px - 0.5) * max * 2;
                const rotX = (0.5 - py) * max * 2;
                el.style.transform = `perspective(800px) rotateX(${ rotX }deg) rotateY(${ rotY }deg)`;
                el.style.setProperty('--gx', (px * 100) + '%');
                el.style.setProperty('--gy', (py * 100) + '%');
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* ---------- ambient light streaks (random angle / direction / timing) ---------- */
    const streakLayer = $('#streaks');
    if (streakLayer && !reduce) {
        const spawn = () => {
            if (document.body.classList.contains('lite')) return;   // off in lite mode
            const s = document.createElement('div');
            s.className = 'streak';
            const tail = 90 + Math.random() * 120;          // px tail length
            const goLeft = Math.random() < 0.5;             // direction
            const angle = goLeft ? (122 + Math.random() * 38) : (20 + Math.random() * 38);  // downward diagonal
            const dist = 240 + Math.random() * 280;          // px travelled
            const dur = 650 + Math.random() * 600;           // ms (quick)
            s.style.width = tail + 'px';
            s.style.left = (Math.random() * 100) + 'vw';
            s.style.top = (Math.random() * 55) + 'vh';
            streakLayer.appendChild(s);
            const anim = s.animate([
                { transform: `rotate(${ angle }deg) translateX(0)`, opacity: 0 },
                { opacity: .85, offset: .12 },
                { opacity: .85, offset: .72 },
                { transform: `rotate(${ angle }deg) translateX(${ dist }px)`, opacity: 0 }
            ], { duration: dur, easing: 'cubic-bezier(.25, .6, .3, 1)' });
            anim.onfinish = () => s.remove();
        };
        const loop = () => {
            spawn();
            if (Math.random() < 0.4) setTimeout(spawn, 120 + Math.random() * 260);   // occasional pair for density
            setTimeout(loop, 700 + Math.random() * 1700);
        };
        setTimeout(loop, 2000);

        // burst, reused by the contact-form success + the easter egg
        window.__meteorShower = (count) => { for (let i = 0; i < (count || 24); i++) setTimeout(spawn, i * 85 + Math.random() * 70); };

        // konami code → meteor shower + toast
        const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let ki = 0, toast = null;
        document.addEventListener('keydown', (e) => {
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            ki = (k === seq[ki]) ? ki + 1 : (k === seq[0] ? 1 : 0);
            if (ki === seq.length) {
                ki = 0;
                window.__meteorShower(44);
                if (!toast) { toast = document.createElement('div'); toast.className = 'egg-toast'; document.body.appendChild(toast); }
                toast.textContent = '🌠 Meteor shower unlocked';
                requestAnimationFrame(() => toast.classList.add('is-on'));
                clearTimeout(toast._h); toast._h = setTimeout(() => toast.classList.remove('is-on'), 3200);
            }
        });
    }

    /* ---------- text scramble (nav) ---------- */
    if (fine && !reduce) {
        const CHARS = '!<>-_\\/[]{}*&^%$#@';
        const scramblers = $$('[data-scramble]');
        /* Lock each link to its natural width and clip overflow, so wider glyphs
           are contained instead of pushing neighbours (no layout shift). */
        const lockWidths = () => {
            scramblers.forEach(el => {
                el.dataset.label = el.dataset.label || el.textContent.trim();
                el.style.display = 'inline-block';
                el.style.whiteSpace = 'nowrap';
                el.style.overflow = 'hidden';
                el.style.textAlign = 'center';
                el.style.width = 'auto';
                el.style.width = Math.ceil(el.getBoundingClientRect().width) + 'px';
            });
        };
        lockWidths();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockWidths);
        window.addEventListener('resize', lockWidths, { passive: true });

        scramblers.forEach(el => {
            const original = el.dataset.label || el.textContent.trim();
            let frame = null;
            el.addEventListener('mouseenter', () => {
                let i = 0;
                cancelAnimationFrame(frame);
                const step = () => {
                    el.textContent = original.split('').map((ch, idx) =>
                        idx < i ? original[idx] : CHARS[Math.floor(Math.random() * CHARS.length)]
                    ).join('');
                    i += 0.5;
                    if (i <= original.length) frame = requestAnimationFrame(step);
                    else el.textContent = original;
                };
                frame = requestAnimationFrame(step);
            });
            el.addEventListener('mouseleave', () => { cancelAnimationFrame(frame); el.textContent = original; });
        });
    }

    /* ---------- reveal on scroll ---------- */
    /* Once an element has revealed, drop the .reveal class entirely so its
       own hover transitions (xp rows, cards, witems) are not overridden
       by the reveal transition declaration. */
    const reveals = $$('.reveal');
    const finishReveal = (el, wait) => {
        setTimeout(() => {
            el.classList.remove('reveal', 'is-visible');
            el.style.transitionDelay = '';
        }, wait);
    };
    if (reduce || !('IntersectionObserver' in window)) {
        reveals.forEach(el => el.classList.remove('reveal'));
    } else {
        const io = new IntersectionObserver((es, o) => {
            es.forEach(e => {
                if (!e.isIntersecting) return;
                const el = e.target;
                el.classList.add('is-visible');
                o.unobserve(el);
                finishReveal(el, (parseFloat(el.style.transitionDelay) || 0) + 800);
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
        reveals.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
    }

    /* ---------- work accordion (both Work and Lab lists) ---------- */
    const items = $$('.witem');
    items.forEach(item => {
        const head = $('.witem__head', item);
        head.addEventListener('click', () => {
            const open = item.classList.toggle('is-open');
            head.setAttribute('aria-expanded', String(open));
        });
    });

    /* ---------- work filters (re-deal) ---------- */
    const filters = $$('.filter');
    const matches = (item, f) => f === 'all' || item.dataset.cat.split(' ').includes(f);
    const collapse = (item) => { item.classList.remove('is-open'); $('.witem__head', item).setAttribute('aria-expanded', 'false'); };

    const applyFilter = (f) => {
        if (reduce) {
            items.forEach(item => { collapse(item); item.classList.toggle('is-hidden', !matches(item, f)); });
            return;
        }
        items.forEach(item => { if (!item.classList.contains('is-hidden')) item.classList.add('witem--leaving'); });
        setTimeout(() => {
            let vis = 0;
            items.forEach(item => {
                const ok = matches(item, f);
                collapse(item);
                item.classList.remove('witem--leaving', 'witem--entering');
                item.classList.toggle('is-hidden', !ok);
                if (ok) {
                    item.style.setProperty('--d', (vis * 50) + 'ms');
                    void item.offsetWidth;
                    item.classList.add('witem--entering');
                    vis++;
                }
            });
        }, 180);
    };

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            applyFilter(btn.dataset.filter);
        });
    });

    /* ---------- scrollspy ---------- */
    const ids = ['about', 'experience', 'work', 'ai', 'lab', 'skills', 'contact'];
    const secs = ids.map(id => document.getElementById(id)).filter(Boolean);
    const links = $$('.nav__link');
    if ('IntersectionObserver' in window && secs.length) {
        const spy = new IntersectionObserver((es) => {
            es.forEach(e => {
                if (!e.isIntersecting) return;
                links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
            });
        }, { rootMargin: '-25% 0px -55% 0px' });
        secs.forEach(s => spy.observe(s));
    }

    /* ---------- floating dock / toolbar ---------- */
    let dockWake = function () {};
    let dockRipple = function () {};
    const dock = $('#dock');
    if (dock) {
        // accent switcher
        const ACCENTS = {
            vermilion: { a: '#ff4d2e', d: '#e03a1c', rgb: '255, 77, 46',  on: '#140805' },
            teal:      { a: '#16c79a', d: '#11a07c', rgb: '22, 199, 154', on: '#04130e' },
            lime:      { a: '#c8f135', d: '#a9cf26', rgb: '200, 241, 53', on: '#161a05' },
            cobalt:    { a: '#5b7cff', d: '#3f5fe0', rgb: '91, 124, 255', on: '#ffffff' }
        };
        const swatches = $$('.dock__swatch', dock);
        const applyAccent = (key) => {
            const a = ACCENTS[key];
            if (!a) return;
            const r = document.documentElement.style;
            r.setProperty('--accent', a.a);
            r.setProperty('--accent-d', a.d);
            r.setProperty('--accent-rgb', a.rgb);
            r.setProperty('--on-accent', a.on);
            swatches.forEach(s => s.classList.toggle('is-active', s.dataset.accent === key));
            try { localStorage.setItem('accent', key); } catch (e) { /* ignore */ }
        };
        swatches.forEach(s => s.addEventListener('click', () => {
            if (reduce || !document.startViewTransition) { applyAccent(s.dataset.accent); return; }
            // iris the new palette across the page from the clicked swatch
            const el = document.documentElement;
            const r = s.getBoundingClientRect();
            el.style.setProperty('--vt-x', (r.left + r.width / 2) + 'px');
            el.style.setProperty('--vt-y', (r.top + r.height / 2) + 'px');
            document.startViewTransition(() => applyAccent(s.dataset.accent));
        }));
        try { const sa = localStorage.getItem('accent'); if (sa && ACCENTS[sa]) applyAccent(sa); } catch (e) { /* ignore */ }

        // mobile: a single button opens the swatches as a vertical popout
        const accentBtn = $('#accentToggle');
        const accentPop = $('#accentPop');
        if (accentBtn && accentPop) {
            accentBtn.addEventListener('click', () => {
                const open = dock.classList.toggle('accent-open');
                accentBtn.setAttribute('aria-expanded', String(open));
                if (open) {   // anchor the popout directly above the accent button
                    const br = accentBtn.getBoundingClientRect();
                    const dr = dock.getBoundingClientRect();
                    accentPop.style.left = (br.left + br.width / 2 - dr.left) + 'px';
                }
            });
            swatches.forEach(s => s.addEventListener('click', () => dock.classList.remove('accent-open')));   // close after picking
            document.addEventListener('click', (e) => { if (!dock.contains(e.target)) dock.classList.remove('accent-open'); });
        }

        // light / dark theme
        const themeBtn = $('#themeToggle');
        const root = document.documentElement;
        const paintTheme = () => {
            const light = root.getAttribute('data-theme') === 'light';
            themeBtn.innerHTML = light ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
            themeBtn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
            themeBtn.setAttribute('data-tip', light ? 'Dark mode' : 'Light mode');
        };
        const swapTheme = (next) => {
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme2026', next); } catch (e) { /* ignore */ }
            paintTheme();
        };
        if (themeBtn) {
            paintTheme();
            themeBtn.addEventListener('click', () => {
                const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                themeBtn.classList.add('spin');
                setTimeout(() => themeBtn.classList.remove('spin'), 650);
                // iris-reveal the new theme from the toggle, dissolving the content itself
                if (reduce || !document.startViewTransition) { swapTheme(next); return; }
                const r = themeBtn.getBoundingClientRect();
                root.style.setProperty('--vt-x', (r.left + r.width / 2) + 'px');
                root.style.setProperty('--vt-y', (r.top + r.height / 2) + 'px');
                document.startViewTransition(() => swapTheme(next));
            });
        }

        // lite mode (kills cursor / spotlight / grain)
        const liteBtn = $('#liteToggle');
        const setLite = (on) => {
            document.body.classList.toggle('lite', on);
            liteBtn.classList.toggle('is-on', on);
            liteBtn.setAttribute('aria-pressed', String(on));
            try { localStorage.setItem('lite', on ? '1' : '0'); } catch (e) { /* ignore */ }
        };
        liteBtn.addEventListener('click', () => setLite(!document.body.classList.contains('lite')));
        try { if (localStorage.getItem('lite') === '1') setLite(true); } catch (e) { /* ignore */ }

        // copy email
        const copyBtn = $('#copyEmail');
        const copied = $('#dockCopied');
        copyBtn.addEventListener('click', () => {
            const done = () => { copied.classList.add('show'); setTimeout(() => copied.classList.remove('show'), 1400); };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText('mateasandrei.dev@gmail.com').then(done).catch(done);
            } else { done(); }
        });

        // local time (Târgu Mureș · Europe/Bucharest)
        const clock = $('#dockClock');
        if (clock) {
            const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short', timeZone: 'Europe/Bucharest' });
            const tick = () => {
                const p = fmt.formatToParts(new Date());
                const get = (t) => (p.find(x => x.type === t) || {}).value || '';
                clock.textContent = `${ get('hour') }:${ get('minute') } ${ get('timeZoneName') }`;
            };
            tick();
            setInterval(tick, 15000);
        }

        // collapsible toolbar + ripple feedback
        const dockFx = $('#dockFx');
        const controls = $('.dock__controls', dock);
        let collapseTimer = null;
        let dropTimer = null;
        const ripple = (cx, cy) => {
            if (reduce || !dockFx) return;
            const rect = dock.getBoundingClientRect();
            const r = document.createElement('span');
            r.className = 'dock__ripple';
            r.style.left = ((cx == null ? rect.left + rect.width / 2 : cx) - rect.left) + 'px';
            r.style.top = ((cy == null ? rect.top + rect.height / 2 : cy) - rect.top) + 'px';
            dockFx.appendChild(r);
            setTimeout(() => r.remove(), 650);
        };
        // drain order: direct controls, but the swatch group is flattened into its
        // individual swatches so each colour cascades on its own (not as one block)
        const group = $('.dock__group', dock);
        const GAP = '.55rem', SWGAP = '.4rem';
        const kids = [];
        if (controls) {
            Array.from(controls.children).forEach(ch => {
                if (ch === group) Array.from(ch.children).forEach(sw => kids.push({ el: sw, gap: SWGAP }));
                else kids.push({ el: ch, gap: GAP });
            });
        }
        kids.forEach(k => { k.w = k.el.offsetWidth; });        // natural widths (dock starts expanded)
        const firstSwatch = kids.findIndex(k => k.gap === SWGAP);
        const STAGGER = 85;
        const clearKid = (el) => { el.style.transition = ''; el.style.maxWidth = ''; el.style.marginLeft = ''; el.style.opacity = ''; el.style.transform = ''; el.style.overflow = ''; };
        const clearAll = () => { kids.forEach(k => clearKid(k.el)); if (group) { group.style.transition = ''; group.style.marginLeft = ''; group.style.overflow = ''; } };

        const collapseDock = () => {
            if (dock.classList.contains('collapsed')) return;
            dock.classList.remove('accent-open');
            dock.classList.add('collapsed');
            if (reduce) { clearAll(); dock.classList.add('show-time'); return; }
            dock.classList.add('cascading-out');
            const n = kids.length;
            // lock each item's real width so it can collapse cleanly (no dead zone)
            kids.forEach(k => { k.w = k.el.offsetWidth; k.el.style.transition = 'none'; k.el.style.overflow = 'hidden'; k.el.style.maxWidth = k.w + 'px'; });
            if (group) { group.style.transition = 'none'; group.style.overflow = 'hidden'; }
            void dock.offsetWidth;
            // drain right-to-left: every item (each swatch included) fades, drops AND
            // collapses its own width, so the bar reflows tighter with each one
            kids.forEach((k, i) => {
                const delay = (n - 1 - i) * STAGGER;
                k.el.style.transition = `max-width .5s var(--ease) ${delay}ms, margin .5s var(--ease) ${delay}ms, opacity .38s ease ${delay}ms, transform .42s var(--ease) ${delay}ms`;
                k.el.style.maxWidth = '0px';
                k.el.style.marginLeft = '-' + k.gap;        // absorb its flex gap as it collapses
                k.el.style.opacity = '0';
                k.el.style.transform = 'translateY(10px)';
            });
            if (group && firstSwatch >= 0) {                // tuck the group's own slot once its swatches drain
                const gd = (n - 1 - firstSwatch) * STAGGER;
                group.style.transition = `margin .5s var(--ease) ${gd}ms`;
                group.style.marginLeft = '-' + GAP;
            }
            clearTimeout(dropTimer);
            dropTimer = setTimeout(() => {
                dock.classList.remove('cascading-out');     // hand to CSS: snap any residual width to 0
                dock.classList.add('drop', 'show-time');    // only now reveal the clock + the water-drop ripple
                setTimeout(() => dock.classList.remove('drop'), 720);
            }, (n - 1) * STAGGER + 520);
        };
        const scheduleCollapse = () => { clearTimeout(collapseTimer); collapseTimer = setTimeout(collapseDock, 5000); };
        const expandDock = () => {
            clearTimeout(dropTimer);
            dock.classList.remove('collapsed', 'cascading-out', 'drop', 'show-time');
            if (reduce) { clearAll(); scheduleCollapse(); return; }
            const n = kids.length;
            // start every item from its collapsed state...
            kids.forEach(k => {
                k.el.style.transition = 'none'; k.el.style.overflow = 'hidden';
                k.el.style.maxWidth = '0px'; k.el.style.marginLeft = '-' + k.gap;
                k.el.style.opacity = '0'; k.el.style.transform = 'translateY(-10px)';
            });
            if (group) { group.style.transition = 'none'; group.style.overflow = 'hidden'; group.style.marginLeft = '-' + GAP; }
            void dock.offsetWidth;
            // ...then reveal left-to-right, each swatch on its own (twice as fast as the close)
            const OPEN = STAGGER / 2;
            kids.forEach((k, i) => {
                const delay = i * OPEN;
                k.el.style.transition = `max-width .25s var(--ease) ${delay}ms, margin .25s var(--ease) ${delay}ms, opacity .21s ease ${delay}ms, transform .23s var(--ease) ${delay}ms`;
                k.el.style.maxWidth = k.w + 'px';
                k.el.style.marginLeft = '0px';
                k.el.style.opacity = '1';
                k.el.style.transform = 'none';
            });
            if (group && firstSwatch >= 0) {
                const gd = firstSwatch * OPEN;
                group.style.transition = `margin .25s var(--ease) ${gd}ms`;
                group.style.marginLeft = '0px';
            }
            clearTimeout(dropTimer);
            dropTimer = setTimeout(clearAll, n * OPEN + 280);   // hand back to natural layout
            scheduleCollapse();
        };
        dockWake = expandDock;
        dockRipple = (cx, cy) => ripple(cx, cy);
        dock.addEventListener('click', (e) => {
            ripple(e.clientX, e.clientY);
            if (dock.classList.contains('collapsed')) expandDock();
            else scheduleCollapse();
        });
        // keep the toolbar open while hovered; resume the countdown when the cursor leaves
        dock.addEventListener('mouseenter', () => clearTimeout(collapseTimer));
        dock.addEventListener('mouseleave', () => { if (!dock.classList.contains('collapsed')) scheduleCollapse(); });
        scheduleCollapse();   // show all options, then auto-collapse after 5s
    }

    /* ---------- availability popup (docks into the toolbar chip) ---------- */
    const modal = $('#modal');
    const chip = $('#dockAvail');
    if (modal && chip) {
        const KEY = 'availPopup';
        const card = $('.modal__card', modal);
        let autoSeen = false;
        try { autoSeen = !!sessionStorage.getItem(KEY); } catch (e) { /* ignore */ }

        // slide fully off the right edge (own width + the bottom-right offset)
        const OFF = 'translateX(calc(100% + 2rem))';
        const MORPH = 'transform .55s cubic-bezier(.22,1,.36,1), opacity .35s ease';
        let closeTimer = null;

        const expand = () => {
            if (modal.classList.contains('is-open')) return;
            clearTimeout(closeTimer);
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            chip.classList.add('gone');
            if (reduce) { card.style.cssText = ''; return; }
            // start off the right edge, then slide in
            card.style.transition = 'none';
            card.style.transform = OFF;
            card.style.opacity = '0';
            void card.offsetWidth;
            card.style.transition = MORPH;
            card.style.transform = 'translateX(0)';
            card.style.opacity = '1';
        };

        const minimize = () => {
            if (!modal.classList.contains('is-open')) return;
            chip.classList.remove('gone');     // just bring the availability button back
            chip.classList.add('chip-pop');
            setTimeout(() => chip.classList.remove('chip-pop'), 500);
            const finish = () => {
                modal.classList.remove('is-open');
                modal.setAttribute('aria-hidden', 'true');
                card.style.transition = 'none';
                dockRipple();   // ripple the toolbar bg...
                if (dock && !reduce) {   // ...and pop the whole pill to signify the popup docked there
                    dock.classList.remove('drop');
                    void dock.offsetWidth;   // restart the animation cleanly
                    dock.classList.add('drop');
                    setTimeout(() => dock.classList.remove('drop'), 720);
                }
            };
            if (reduce) { finish(); return; }
            // slide back off the right edge, out of sight
            card.style.transition = MORPH;
            card.style.transform = OFF;
            card.style.opacity = '0';
            clearTimeout(closeTimer);
            closeTimer = setTimeout(finish, 560);
        };

        const toggle = () => (modal.classList.contains('is-open') ? minimize() : expand());

        chip.addEventListener('click', toggle);
        $$('[data-close]', modal).forEach(el => el.addEventListener('click', minimize));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') minimize(); });

        // first-visit auto open: exit-intent (desktop) + timed fallback, once per session
        const autoOpen = () => {
            if (autoSeen) return;
            autoSeen = true;
            try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
            expand();
        };
        if (fine) {
            document.addEventListener('mouseout', (e) => { if (!e.relatedTarget && e.clientY <= 4) autoOpen(); });
        }
        setTimeout(autoOpen, fine ? 9000 : 14000);
    }

    /* ---------- hero card morphs into a full-width detail panel on hover ---------- */
    {
        const heroGrid = $('.hero__grid');
        const heroCard = $('.hero__card');
        const heroDetail = $('#heroDetail');
        if (fine && heroGrid && heroCard && heroDetail) {
            const openDetail = () => { heroGrid.classList.add('detail-open'); heroDetail.setAttribute('aria-hidden', 'false'); };
            const closeDetail = () => { heroGrid.classList.remove('detail-open'); heroDetail.setAttribute('aria-hidden', 'true'); };
            // hovering the card opens it; stays open across the hero row (no flicker between
            // photo and panel), closes when the cursor leaves the row.
            heroCard.addEventListener('mouseenter', openDetail);
            heroGrid.addEventListener('mouseleave', closeDetail);
        }
    }

    /* ---------- custom tooltips (body-level, so the dock's overflow can't clip them) ---------- */
    if (fine) {
        const tip = document.createElement('div');
        tip.className = 'tip';
        tip.setAttribute('aria-hidden', 'true');
        document.body.appendChild(tip);
        let showT = null;
        const place = (el) => {
            const txt = el.getAttribute('data-tip');
            if (!txt) return;
            tip.textContent = txt;
            const r = el.getBoundingClientRect();
            tip.style.left = (r.left + r.width / 2) + 'px';
            tip.style.top = (r.top - 8) + 'px';
        };
        const show = (el) => { place(el); clearTimeout(showT); showT = setTimeout(() => tip.classList.add('is-on'), 280); };
        const hide = () => { clearTimeout(showT); tip.classList.remove('is-on'); };
        $$('[data-tip]').forEach(el => {
            el.addEventListener('mouseenter', () => show(el));
            el.addEventListener('mouseleave', hide);
            el.addEventListener('focus', () => show(el));
            el.addEventListener('blur', hide);
            el.addEventListener('click', hide);
        });
    }
})();

/* ============================================================
   Résumé modal: view the PDF, or explore the data with a matrix decode
   ============================================================ */
(function () {
    'use strict';
    const modal = document.getElementById('rezModal');
    if (!modal) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const explore = document.getElementById('rezExplore');
    const back = document.getElementById('rezBack');
    const menu = document.getElementById('rezMenu');
    const content = document.getElementById('rezContent');
    const cats = Array.from(menu.querySelectorAll('.rez__cat'));
    const panels = Array.from(content.querySelectorAll('.rez__panelc'));
    const CHARS = '!<>-_\\/[]{}=+*^?#01ABCXYZ';
    const GLITCH = '█▓▒░#@%&$';   // artifact glyphs mixed into the noise

    // matrix decode: resolve text left-to-right while the rest stays scrambled,
    // with random block artifacts, settled-char flicker, and accent glitch flashes
    const decode = (el, startDelay) => {
        const final = el.dataset.final != null ? el.dataset.final : (el.dataset.final = el.textContent);
        if (reduce) { el.textContent = final; return; }
        const speed = 4 + final.length / 32;
        let i = 0;
        const run = () => {
            i += speed;
            el.textContent = final.split('').map((ch, idx) => {
                if (ch === ' ') return ' ';
                if (idx < i) return Math.random() < 0.02 ? GLITCH[(Math.random() * GLITCH.length) | 0] : final[idx];
                return Math.random() < 0.16 ? GLITCH[(Math.random() * GLITCH.length) | 0] : CHARS[(Math.random() * CHARS.length) | 0];
            }).join('');
            el.classList.toggle('rez-glitch', Math.random() < 0.09);
            if (i < final.length) requestAnimationFrame(run);
            else { el.textContent = final; el.classList.remove('rez-glitch'); }
        };
        setTimeout(() => requestAnimationFrame(run), startDelay);
    };
    const revealPanel = (panel) => {
        panel.querySelectorAll('.rez__line').forEach((el, idx) => decode(el, idx * 14));
    };
    const showCat = (cat) => {
        cats.forEach(c => c.classList.toggle('is-active', c.dataset.cat === cat));
        content.scrollTop = 0;
        panels.forEach(p => {
            const on = p.dataset.panel === cat;
            p.classList.toggle('is-active', on);
            if (on) revealPanel(p);
        });
    };
    cats.forEach(c => c.addEventListener('click', () => showCat(c.dataset.cat)));

    // ongoing glitch artifacts: choice screen targets the heading + card titles,
    // the interactive view keeps glitching its header (title + PDF button)
    const choiceEls = [modal.querySelector('.rez__h'), ...modal.querySelectorAll('.rez__card b')].filter(Boolean);
    const dataEls = [modal.querySelector('.rez__title'), modal.querySelector('.rez__pdf span')].filter(Boolean);
    const footerEls = Array.from(modal.querySelectorAll('.rez__footer .rez__line'));
    let glitchTimer = null;
    const artifact = (el) => {
        const final = el.dataset.final;
        if (!final) return;
        let n = 0;
        const burst = () => {
            el.textContent = final.split('').map(ch => (ch !== ' ' && Math.random() < 0.22) ? GLITCH[(Math.random() * GLITCH.length) | 0] : ch).join('');
            if (++n < 4) requestAnimationFrame(burst); else el.textContent = final;
        };
        el.classList.add('rez-glitch');
        setTimeout(() => el.classList.remove('rez-glitch'), 110);
        requestAnimationFrame(burst);
    };
    const stopGlitch = () => { if (glitchTimer) { clearTimeout(glitchTimer); glitchTimer = null; } };
    const runGlitchOn = (els) => {
        stopGlitch();
        if (reduce || !els.length) return;
        const tick = () => { artifact(els[(Math.random() * els.length) | 0]); glitchTimer = setTimeout(tick, 850 + Math.random() * 1300); };
        glitchTimer = setTimeout(tick, 800);
    };

    // slower, ongoing glitch on the visible content lines of the active section
    let contentTimer = null;
    const stopContentGlitch = () => { if (contentTimer) { clearTimeout(contentTimer); contentTimer = null; } };
    const runContentGlitch = () => {
        stopContentGlitch();
        if (reduce) return;
        const tick = () => {
            const active = content.querySelector('.rez__panelc.is-active');
            const pool = (active ? Array.from(active.querySelectorAll('.rez__line')) : []).concat(footerEls);
            if (pool.length) artifact(pool[(Math.random() * pool.length) | 0]);
            contentTimer = setTimeout(tick, 2600 + Math.random() * 2400);
        };
        contentTimer = setTimeout(tick, 2600);
    };

    let lastFocused = null;
    // make everything except the modal inert (traps Tab + hides bg from screen readers)
    const setBgInert = (on) => {
        Array.from(document.body.children).forEach(el => {
            if (el === modal) return;
            if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
        });
    };
    const open = () => {
        lastFocused = document.activeElement;
        modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
        setBgInert(true);
        choiceEls.forEach((el, i) => decode(el, 80 + i * 90)); runGlitchOn(choiceEls);
        const f = modal.querySelector('.rez__x'); if (f) f.focus();   // move focus into the dialog
    };
    const close = () => {
        if (!modal.classList.contains('is-open')) return;
        modal.classList.remove('is-open', 'rez--data'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
        stopGlitch(); stopContentGlitch();
        setBgInert(false);
        if (lastFocused && lastFocused.focus) lastFocused.focus();   // return focus to the trigger
    };
    const toData = () => { modal.classList.add('rez--data'); cats.forEach((c, i) => decode(c, i * 12)); dataEls.forEach((el, i) => decode(el, i * 90)); footerEls.forEach((el, i) => decode(el, 150 + i * 60)); showCat('profile'); runGlitchOn(dataEls); runContentGlitch(); };
    const toChoice = () => { modal.classList.remove('rez--data'); stopContentGlitch(); runGlitchOn(choiceEls); };

    explore.addEventListener('click', toData);
    back.addEventListener('click', toChoice);
    modal.querySelectorAll('[data-rez-close]').forEach(el => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) close(); });
    // arrow / j-k navigation between categories while in the data view
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('is-open') || !modal.classList.contains('rez--data')) return;
        const k = e.key.toLowerCase();
        const dir = (e.key === 'ArrowDown' || k === 'j') ? 1 : (e.key === 'ArrowUp' || k === 'k') ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        const idx = cats.findIndex(c => c.classList.contains('is-active'));
        const next = (idx + dir + cats.length) % cats.length;
        showCat(cats[next].dataset.cat);
        cats[next].scrollIntoView({ block: 'nearest' });
    });

    // both résumé buttons (header + mobile nav) open the modal
    document.querySelectorAll('[data-resume]').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); open(); }));
})();

/* ============================================================
   Command palette (⌘K) — fuzzy jump + actions, reuses existing controls
   ============================================================ */
(function () {
    'use strict';
    const cmdk = document.getElementById('cmdk');
    const input = document.getElementById('cmdkInput');
    const list = document.getElementById('cmdkList');
    if (!cmdk || !input || !list) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const go = (sel) => () => { const el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
    const click = (sel) => () => { const el = document.querySelector(sel); if (el) el.click(); };
    const commands = [
        { icon: 'fa-circle-info', label: 'Go to About', hint: '01', run: go('#about') },
        { icon: 'fa-briefcase', label: 'Go to Experience', hint: '02', run: go('#experience') },
        { icon: 'fa-rocket', label: 'Go to Work', hint: '03', run: go('#work') },
        { icon: 'fa-robot', label: 'Go to AI', hint: '04', run: go('#ai') },
        { icon: 'fa-flask', label: 'Go to Lab', hint: '05', run: go('#lab') },
        { icon: 'fa-layer-group', label: 'Go to Skills', hint: '06', run: go('#skills') },
        { icon: 'fa-paper-plane', label: 'Go to Contact', hint: '07', run: go('#contact') },
        { icon: 'fa-envelope', label: 'Copy email address', hint: 'copy', run: click('#copyEmail') },
        { icon: 'fa-file-lines', label: 'Open résumé', hint: 'cv', run: click('[data-resume]') },
        { icon: 'fa-download', label: 'Download CV (PDF)', hint: 'pdf', run: () => { const a = document.createElement('a'); a.href = 'resume/Mateas-Andrei-CV-2026-Official.pdf'; a.download = 'Mateas-Emil-Andrei-CV.pdf'; document.body.appendChild(a); a.click(); a.remove(); } },
        { icon: 'fa-circle-half-stroke', label: 'Toggle light / dark theme', hint: 'theme', run: click('#themeToggle') },
        { icon: 'fa-bolt', label: 'Toggle lite mode', hint: 'lite', run: click('#liteToggle') },
        { icon: 'fa-droplet', label: 'Accent · Vermilion', hint: 'accent', run: click('[data-accent="vermilion"]') },
        { icon: 'fa-droplet', label: 'Accent · Teal', hint: 'accent', run: click('[data-accent="teal"]') },
        { icon: 'fa-droplet', label: 'Accent · Lime', hint: 'accent', run: click('[data-accent="lime"]') },
        { icon: 'fa-droplet', label: 'Accent · Cobalt', hint: 'accent', run: click('[data-accent="cobalt"]') },
        { icon: 'fa-brands fa-github', label: 'GitHub', hint: '↗', run: () => window.open('https://github.com/andrewmat32', '_blank', 'noopener') },
        { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', hint: '↗', run: () => window.open('https://www.linkedin.com/in/mateas-andrei', '_blank', 'noopener') }
    ];

    let filtered = commands.slice(), active = 0, lastFocused = null;
    const iconClass = (ic) => ic.indexOf('fa-brands') === 0 ? ic : ('fa-solid ' + ic);
    const render = () => {
        active = 0;
        if (!filtered.length) { list.innerHTML = '<li class="cmdk__empty">No matching commands</li>'; return; }
        list.innerHTML = filtered.map((c, i) =>
            '<li class="cmdk__item' + (i === 0 ? ' is-active' : '') + '" role="option" data-i="' + i + '"><i class="' + iconClass(c.icon) + '"></i><span class="cmdk__label">' + c.label + '</span><span class="cmdk__hint">' + c.hint + '</span></li>'
        ).join('');
    };
    const paintActive = () => list.querySelectorAll('.cmdk__item').forEach((el, i) => el.classList.toggle('is-active', i === active));
    const scrollActive = () => { const el = list.querySelector('.is-active'); if (el) el.scrollIntoView({ block: 'nearest' }); };
    const filter = () => {
        const q = input.value.trim().toLowerCase();
        filtered = q ? commands.filter(c => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)) : commands.slice();
        render();
    };
    const setBgInert = (on) => { Array.from(document.body.children).forEach(el => { if (el === cmdk) return; if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }); };
    const open = () => {
        lastFocused = document.activeElement;
        input.value = ''; filter();
        cmdk.classList.add('is-open'); cmdk.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; setBgInert(true);
        setTimeout(() => input.focus(), 30);
    };
    const close = () => {
        if (!cmdk.classList.contains('is-open')) return;
        cmdk.classList.remove('is-open'); cmdk.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; setBgInert(false);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
    };
    const exec = (i) => { const c = filtered[i]; if (!c) return; close(); setTimeout(() => c.run(), reduce ? 0 : 130); };

    input.addEventListener('input', filter);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, filtered.length - 1); paintActive(); scrollActive(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); paintActive(); scrollActive(); }
        else if (e.key === 'Enter') { e.preventDefault(); exec(active); }
    });
    list.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) exec(+li.dataset.i); });
    list.addEventListener('mousemove', (e) => { const li = e.target.closest('[data-i]'); if (li && +li.dataset.i !== active) { active = +li.dataset.i; paintActive(); } });
    cmdk.querySelectorAll('[data-cmdk-close]').forEach(el => el.addEventListener('click', close));
    const trigger = document.getElementById('cmdkBtn');
    if (trigger) trigger.addEventListener('click', open);
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk.classList.contains('is-open') ? close() : open(); }
        else if (e.key === 'Escape' && cmdk.classList.contains('is-open')) close();
    });
})();

/* ============================================================
   Contact form — Web3Forms (no backend) with mailto fallback + success burst
   ============================================================ */
(function () {
    'use strict';
    const form = document.getElementById('contactForm');
    const done = document.getElementById('cformDone');
    const status = document.getElementById('cformStatus');
    if (!form) return;
    const keyField = form.querySelector('[name="access_key"]');
    const configured = keyField && keyField.value && keyField.value !== 'YOUR_WEB3FORMS_ACCESS_KEY';
    const setStatus = (msg, err) => { if (!status) return; status.textContent = msg || ''; status.classList.toggle('is-err', !!err); };

    // artifact-decode the error text (matrix-style scramble → resolve)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GLITCH = '█▓▒░#@%&$!<>/=';
    const rnd = () => GLITCH[(Math.random() * GLITCH.length) | 0];
    function glitchIn(el, final) {
        if (reduce) { el.textContent = final; return; }
        cancelAnimationFrame(el._raf || 0);
        let i = 0;
        const speed = 1.4 + final.length / 16;
        const run = () => {
            i += speed;
            el.textContent = final.split('').map((ch, idx) => idx < i ? final[idx] : (ch === ' ' ? ' ' : rnd())).join('');
            if (i < final.length) el._raf = requestAnimationFrame(run); else el.textContent = final;
        };
        el.textContent = final.split('').map(ch => ch === ' ' ? ' ' : rnd()).join('');
        el._raf = requestAnimationFrame(run);
    }
    // brief artifact flicker (text), a few frames then restore
    function artifactBurst(el, final) {
        let n = 0;
        const run = () => {
            el.textContent = final.split('').map(ch => (ch !== ' ' && Math.random() < 0.28) ? rnd() : ch).join('');
            if (++n < 5) requestAnimationFrame(run); else el.textContent = final;
        };
        requestAnimationFrame(run);
    }
    function artifactPlaceholder(f, final) {
        let n = 0;
        const run = () => {
            f.setAttribute('placeholder', final.split('').map(ch => (ch !== ' ' && Math.random() < 0.3) ? rnd() : ch).join(''));
            if (++n < 5) requestAnimationFrame(run); else f.setAttribute('placeholder', final);
        };
        requestAnimationFrame(run);
    }
    // flicker the whole invalid field: label, placeholder, error + a chromatic split on the typed text
    function glitchField(f) {
        if (reduce) return;
        const wrap = f.closest('.cform__field'); if (!wrap) return;
        const err = document.getElementById('err-' + f.name);
        const label = wrap.querySelector('span:not(.cform__err)');
        if (err && err.dataset.msg) artifactBurst(err, err.dataset.msg);
        if (label && label.dataset.txt) artifactBurst(label, label.dataset.txt);
        if (f.value === '' && f.dataset.ph) artifactPlaceholder(f, f.dataset.ph);
        f.classList.add('is-glitch'); clearTimeout(f._g); f._g = setTimeout(() => f.classList.remove('is-glitch'), 180);
    }
    function stopGlitchLoop(f) { if (f._loop) { clearTimeout(f._loop); f._loop = null; } f.classList.remove('is-glitch'); }
    function startGlitchLoop(f) {
        stopGlitchLoop(f);
        if (reduce) return;
        const tick = () => { glitchField(f); f._loop = setTimeout(tick, 1400 + Math.random() * 2600); };
        f._loop = setTimeout(tick, 1500 + Math.random() * 2400);
    }

    // ----- inline field validation -----
    const rules = {
        name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name.',
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.',
        message: (v) => v.trim().length >= 10 ? '' : 'A little more detail, please (10+ characters).'
    };
    const fields = Object.keys(rules).map(n => form.querySelector('[name="' + n + '"]')).filter(Boolean);
    fields.forEach(f => {
        const wrap = f.closest('.cform__field');
        const label = wrap && wrap.querySelector('span');     // label span (before err is appended)
        if (label) label.dataset.txt = label.textContent;
        f.dataset.ph = f.getAttribute('placeholder') || '';
        const err = document.createElement('span');
        err.className = 'cform__err'; err.id = 'err-' + f.name;
        f.setAttribute('aria-describedby', err.id);
        (wrap || f.parentNode).appendChild(err);
        f.addEventListener('blur', () => check(f));
        f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });   // live-clear once flagged
    });
    function check(f) {
        const msg = rules[f.name] ? rules[f.name](f.value) : '';
        const err = document.getElementById('err-' + f.name);
        f.setAttribute('aria-invalid', msg ? 'true' : 'false');
        const wrap = f.closest('.cform__field'); if (wrap) wrap.classList.toggle('has-err', !!msg);
        if (err) {
            if (!msg) { cancelAnimationFrame(err._raf || 0); stopGlitchLoop(f); err.textContent = ''; err.dataset.msg = ''; }
            else if (err.dataset.msg !== msg) { err.dataset.msg = msg; glitchIn(err, msg); startGlitchLoop(f); }   // decode + ongoing random whole-field flicker
        }
        return !msg;
    }
    function validateAll() {
        let firstBad = null;
        fields.forEach(f => {
            if (check(f)) return;
            if (!firstBad) firstBad = f;
            const wrap = f.closest('.cform__field');   // shake + re-artifact invalid fields on submit
            const err = document.getElementById('err-' + f.name);
            if (err && err.dataset.msg) glitchIn(err, err.dataset.msg);
            glitchField(f);   // flicker the whole field on submit too
            if (wrap) { wrap.classList.remove('is-shaking'); void wrap.offsetWidth; wrap.classList.add('is-shaking'); setTimeout(() => wrap.classList.remove('is-shaking'), 500); }
        });
        if (firstBad) { firstBad.focus(); setStatus('Please fix the highlighted fields.', true); }
        return !firstBad;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (form.querySelector('[name="botcheck"]').value) return;     // honeypot tripped
        if (!validateAll()) return;
        setStatus('');
        const data = new FormData(form);

        if (!configured) {   // no key yet → open the user's mail client with the message
            const name = data.get('name') || '', email = data.get('email') || '', msg = data.get('message') || '';
            window.location.href = 'mailto:mateasandrei.dev@gmail.com'
                + '?subject=' + encodeURIComponent('Portfolio enquiry from ' + name)
                + '&body=' + encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
            setStatus('Opening your email app…');
            return;
        }

        form.classList.add('is-sending');
        setStatus('Sending…');
        let timedOut = false;
        const ctrl = new AbortController();
        const to = setTimeout(() => { timedOut = true; ctrl.abort(); }, 12000);
        try {
            const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { Accept: 'application/json' }, body: data, signal: ctrl.signal });
            const out = await res.json().catch(() => ({}));
            if (!res.ok || !out.success) throw new Error(out.message || ('HTTP ' + res.status));
            form.style.display = 'none';
            if (done) { done.removeAttribute('hidden'); done.classList.add('is-on'); }
            if (window.__meteorShower) window.__meteorShower(30);
        } catch (err) {
            setStatus(timedOut
                ? 'That took too long — check your connection and try again, or email me directly.'
                : 'Couldn\'t send right now — please try again, or email me directly.', true);
        } finally {
            clearTimeout(to);
            form.classList.remove('is-sending');
        }
    });
})();

/* ============================================================
   Click ripple — a small accent ring on every primary click/tap.
   Off under reduced-motion and in lite mode.
   ============================================================ */
(function () {
    'use strict';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layer = document.createElement('div');
    layer.className = 'ripple-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);

    const ring = document.getElementById('cursorRing');             // custom-cursor outer ring (desktop only)
    if (ring) ring.addEventListener('animationend', (ev) => {
        if (ev.animationName === 'ringEcho') ring.classList.remove('is-click');
    });

    window.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || !e.isPrimary) return;                 // primary click / first-touch only
        if (document.body.classList.contains('lite')) return;       // respect lite mode

        const r = document.createElement('span');
        r.className = 'ripple';
        r.style.left = e.clientX + 'px';
        r.style.top = e.clientY + 'px';
        layer.appendChild(r);
        r.addEventListener('animationend', () => r.remove(), { once: true });
        setTimeout(() => r.remove(), 800);                          // safety cleanup

        if (ring) {                                                 // pop the cursor ring outward in sync
            ring.classList.remove('is-click');
            void ring.offsetWidth;                                  // reflow so the pulse restarts on rapid clicks
            ring.classList.add('is-click');
        }
    }, { passive: true });
})();
