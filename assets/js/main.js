/* ==========================================================================
   IEIC — interactions
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad2 = n => String(n).padStart(2, '0');

  const WA_NUMBER = '8801637527956';
  const waLink = msg => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const animate = hasGsap && !reduced;
  if (animate) document.documentElement.classList.add('anim');

  /* ---------------------------------------------------------------- data */
  const DESTINATIONS = [
    { name: 'Australia', img: 'sydney-dusk', visa: 'Visitor Visa · Subclass 600', tag: 'Visit. Explore. Experience.', places: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Great Barrier Reef'] },
    { name: 'New Zealand', img: 'nz-signpost', visa: 'Visit Visa · Schooling Visa', tag: 'A journey like no other.', places: ['Auckland', 'Queenstown', 'Rotorua', 'Wellington', 'Milford Sound', 'Mt. Cook'] },
    { name: 'Canada', img: 'canada-lake', visa: 'Visitor Visa · Study Permit', tag: 'Your journey starts here.', places: ['Tourist', 'Family visit', 'Business visit', 'Schooling'] },
    { name: 'United Kingdom', img: 'big-ben', visa: 'Visit Visa', tag: 'Explore. Experience. Create memories.', places: ['London', 'Family & friends', 'Tourism', 'Business visit'] },
    { name: 'Japan', img: 'japan-fuji', visa: 'Visitor Visa', tag: 'A journey you’ll never forget.', places: ['Modern cities', 'Traditional culture', 'Mount Fuji', 'Amazing food'] },
    { name: 'South Korea', img: 'korea-palace', visa: 'Visit Visa', tag: 'Tradition meets innovation.', places: ['Seoul', 'N Seoul Tower', 'Gyeongbokgung Palace', 'Myeongdong'] },
    { name: 'Schengen', img: 'hallstatt', visa: 'Visit Visa · 27 countries', tag: 'Explore. Experience. Europe.', places: ['France', 'Italy', 'Netherlands', 'Germany', 'Spain', '+22 more'] },
  ];

  // line-art landmarks, one per destination (same order). Each is drawn in a 200 x 300 box, ground at y = 300.
  const LANDMARKS = [
    { country: 'Australia', name: 'Sydney Opera House', place: 'Sydney, Australia',
      fact: 'Its white sails have crowned Sydney Harbour since 1973 — a UNESCO World Heritage site and the first photo of almost every Australia trip.',
      d: ['M14 300 C22 236 58 196 100 184 C86 218 82 262 84 300', 'M72 300 C82 244 114 210 150 202 C138 232 134 268 136 300', 'M126 300 C134 258 158 232 186 226 C177 250 175 276 176 300', 'M38 300 C40 276 30 258 18 250 C16 268 18 286 22 300', 'M6 300 H194'] },
    { country: 'New Zealand', name: 'Aoraki / Mount Cook', place: 'South Island, New Zealand',
      fact: 'New Zealand’s highest peak at 3,724 m, mirrored in glacier-blue lakes — a country whose landscapes are a classroom and a holiday in one.',
      d: ['M4 300 L62 196 L82 222 L112 150 L150 226 L166 208 L196 300', 'M96 182 L106 196 L114 184 L122 198 L130 186', 'M52 214 L62 224 L70 214', 'M30 300 V282 M23 290 L30 272 L37 290', 'M176 300 V284 M170 291 L176 276 L182 291'] },
    { country: 'Canada', name: 'CN Tower', place: 'Toronto, Canada',
      fact: 'At 553 m it defines the Toronto skyline — with a glass floor for the brave, and a whole country of lakes and mountains beyond it.',
      d: ['M92 300 L97 146 M108 300 L103 146', 'M80 146 Q100 128 120 146 Q100 162 80 146 Z', 'M92 135 L94 112 H106 L108 135', 'M100 112 V34', 'M40 300 V250 H62 V300', 'M136 300 V236 H160 V300 M148 236 V222'] },
    { country: 'United Kingdom', name: 'Big Ben', place: 'London, United Kingdom',
      fact: 'The great clock of the Elizabeth Tower has kept London on time since 1859, beside the Thames and Westminster Bridge.',
      d: ['M74 300 V96 H126 V300', 'M82 124 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0', 'M100 124 V111 M100 124 L109 130', 'M68 96 H132 M80 96 V74 H120 V96', 'M80 74 L100 22 L120 74', 'M74 158 H126 M88 168 V300 M100 168 V300 M112 168 V300'] },
    { country: 'Japan', name: 'Mount Fuji', place: 'Honshu, Japan',
      fact: 'Japan’s highest mountain at 3,776 m — at its best in cherry-blossom season, framed by a red pagoda or a torii gate.',
      d: ['M2 300 L70 152 Q100 138 130 152 L198 300', 'M58 178 L72 194 L86 174 L100 194 L114 174 L128 194 L142 178', 'M76 300 V246 M124 300 V246', 'M62 244 Q100 232 138 244', 'M70 258 H130'] },
    { country: 'South Korea', name: 'N Seoul Tower', place: 'Seoul, South Korea',
      fact: 'Rising from Namsan Mountain with a 360° view of Seoul — royal palaces on one side, neon-lit Myeongdong on the other.',
      d: ['M4 300 Q100 232 196 300', 'M95 263 L98 150 M105 263 L102 150', 'M84 150 H116 L111 128 H89 Z', 'M92 128 L94 114 H106 L108 128', 'M100 114 V40', 'M94 86 H106 M96 68 H104'] },
    { country: 'Schengen', name: 'Eiffel Tower', place: 'Paris, France · Schengen area',
      fact: 'Built for the 1889 World’s Fair. One Schengen visa takes you from Paris on to Rome, Amsterdam, Berlin and Barcelona.',
      d: ['M58 300 Q94 226 97 62', 'M142 300 Q106 226 103 62', 'M97 62 H103 M100 62 V30', 'M70 244 H130 M83 184 H117', 'M78 300 Q100 256 122 300', 'M74 244 L92 184 M126 244 L108 184 M84 244 L100 198 L116 244'] },
  ];
  const lmArt = i => (LANDMARKS[i] ? LANDMARKS[i].d.map(d => `<path d="${d}"/>`).join('') : '');

  const POSTERS = [
    ['visitor-visa', 'Visitor Visa Made Simple', 'Visitor Visa'],
    ['australia-visit-1', 'Australia Visit Visa', 'Australia'],
    ['nz-schooling-1', 'New Zealand Schooling Visa', 'Schooling'],
    ['schengen', 'Schengen Visit Visa', 'Europe'],
    ['japan-visitor', 'Japan Visitor Visa', 'Japan'],
    ['korea-visit-3', 'Korea Visit Visa', 'South Korea'],
    ['canada-visitor', 'Discover Canada', 'Canada'],
    ['greenpark-school', 'Greenpark School, Tauranga', 'Authorised Education Agent'],
    ['uk-visit', 'UK Visit Visa', 'United Kingdom'],
    ['australia-approvals', 'Australia Visitor Visa Approvals', 'Recent Success'],
    ['nz-visit-5', 'Your Journey to New Zealand', 'New Zealand'],
    ['canada-schooling', 'Canada Schooling Visa', 'Schooling'],
    ['japan-korea', 'Japan & South Korea', 'Visa Consultancy'],
    ['australia-tips', 'Australia Visa Tips', 'Visa Tips'],
    ['nz-child-world', 'Your Child’s World Can Be Bigger', 'New Zealand Schooling'],
    ['korea-visit-2', 'South Korea Visit Visa', 'South Korea'],
    ['nz-approvals', 'New Zealand Visit Visa Approvals', 'Recent Success'],
    ['australia-explore', 'Explore Australia', 'Australia'],
    ['nz-schooling-3', 'New Zealand Schooling Visa', 'Schooling'],
    ['korea-kvac-update', 'South Korea: Now Through KVAC', 'Important Update'],
    ['nz-visit-2', 'New Zealand Visit Visa', 'New Zealand'],
    ['australia-visit-2', 'Australia: A World of Opportunities', 'Australia'],
    ['nz-schooling-2', 'Study Today, Lead Tomorrow', 'New Zealand Schooling'],
    ['korea-visit-1', 'Experience Korea', 'South Korea'],
    ['nz-visit-4', 'Explore. Experience. Remember.', 'New Zealand'],
    ['nz-visit-3', 'Visit. Explore. New Zealand.', 'New Zealand'],
    ['nz-visit-1', 'Explore. Relax. Experience.', 'New Zealand'],
  ].map(([file, title, tag]) => ({ file, title, tag }));

  /* --------------------------------------------------- WhatsApp links */
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa); });

  /* ------------------------------------------------- build: destinations */
  const destTrack = $('#destTrack');
  DESTINATIONS.forEach((d, i) => {
    const el = document.createElement('a');
    el.className = 'dcard';
    el.href = waLink(`Hello IEIC! I am interested in ${d.name} (${d.visa}). Please guide me.`);
    el.target = '_blank'; el.rel = 'noopener';
    el.dataset.cursor = 'Ask';
    el.innerHTML = `
      <div class="dcard__img"><img src="assets/img/photos/${d.img}.jpg" alt="${d.name}" loading="lazy"></div>
      <div class="dcard__top"><span>${pad2(i + 1)} / ${pad2(DESTINATIONS.length)}</span><span>${d.visa}</span></div>
      <div class="dcard__stamp" aria-hidden="true"><svg viewBox="0 0 200 304">${lmArt(i)}</svg></div>
      <div class="dcard__body">
        <h3>${d.name}</h3>
        <p class="dcard__tag">${d.tag}</p>
        <div class="dcard__more"><div><div class="dcard__places">${d.places.map(p => `<i>${p}</i>`).join('')}</div></div></div>
        <div class="dcard__cta"><span>Ask about ${d.name}</span><svg><use href="#i-arrow"/></svg></div>
      </div>`;
    destTrack.appendChild(el);
  });

  /* ------------------------------------------------- build: landmark skyline */
  const sky = (() => {
    const svg = $('#skySvg'); if (!svg) return null;
    const TOP = 70;                                   // room above the landmarks for the flight arc
    svg.setAttribute('viewBox', '0 0 1400 424');
    svg.innerHTML = `
      <path class="sky__arc" id="skyArc" d="M-20 92 Q700 -52 1420 92"/>
      <path class="sky__ground" d="M0 ${300 + TOP} H1400"/>
      ${LANDMARKS.map((l, i) => `
        <g class="lm" data-i="${i}" transform="translate(${i * 200} ${TOP})" tabindex="0" role="button" aria-label="${l.name}, ${l.place}">
          <rect width="200" height="350" y="-10"/>
          <g class="lm__art">${lmArt(i)}</g>
          <circle class="lm__dot" cx="100" cy="300" r="4"/>
          <text x="100" y="332">${l.country}</text>
        </g>`).join('')}
      <g class="sky__plane" id="skyPlane"><use href="#i-plane" width="34" height="34" x="-17" y="-17"/></g>`;

    const groups = $$('.lm', svg), arc = $('#skyArc'), plane = $('#skyPlane'), scroller = $('#skyScroll');
    const arcLen = arc.getTotalLength();
    const tabs = $('#lmTabs');
    tabs.innerHTML = LANDMARKS.map((l, i) => `<button role="tab" data-i="${i}">${l.country}</button>`).join('');
    const tabBtns = $$('button', tabs);
    const info = $('#lmInfo');
    let active = -1, picked = false;

    const fill = i => {
      const l = LANDMARKS[i], d = DESTINATIONS[i];
      $('#lmNo').textContent = pad2(i + 1);
      $('#lmIcon').innerHTML = lmArt(i);
      $('#lmPlace').textContent = l.place;
      $('#lmName').textContent = l.name;
      $('#lmFact').textContent = l.fact;
      $('#lmVisa').textContent = d.visa;
      $('#lmCtaText').textContent = `Take me to ${l.country === 'Schengen' ? 'Europe' : l.country}`;
      $('#lmCta').href = waLink(`Hello IEIC! I would love to see the ${l.name}. Please guide me about ${d.name} (${d.visa}).`);
    };
    const select = (i, byUser) => {
      if (byUser) picked = true;
      if (i === active) return;
      active = i;
      groups.forEach((g, k) => g.classList.toggle('is-active', k === i));
      tabBtns.forEach((b, k) => b.classList.toggle('is-active', k === i));
      if (animate && info.dataset.ready) {
        gsap.timeline()
          .to('.lm-info__main > *, .lm-info__id svg', { y: -14, opacity: 0, duration: .2, stagger: .03, ease: 'power2.in', overwrite: true })
          .add(() => fill(i))
          .fromTo('.lm-info__main > *, .lm-info__id svg', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .06, ease: 'power3.out' });
        gsap.fromTo('.lm-info__id', { rotate: -25 }, { rotate: 0, duration: .9, ease: 'elastic.out(1,0.5)' });
      } else fill(i);
      info.dataset.ready = '1';
      if (byUser && scroller.scrollWidth > scroller.clientWidth) {
        const k = svg.getBoundingClientRect().width / 1400;
        scroller.scrollTo({ left: (i * 200 + 100) * k - scroller.clientWidth / 2, behavior: 'smooth' });
      }
    };
    const setPlane = p => {
      const a = arc.getPointAtLength(clamp(p, 0, 1) * arcLen), b = arc.getPointAtLength(clamp(p + .01, 0, 1.01) * arcLen);
      plane.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 45})`);
    };

    groups.forEach((g, i) => {
      g.addEventListener('click', () => select(i, true));
      g.addEventListener('mouseenter', () => { if (finePointer) select(i, true); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i, true); } });
    });
    tabBtns.forEach((b, i) => b.addEventListener('click', () => select(i, true)));
    select(0); setPlane(.04);
    return { groups, select, setPlane, isPicked: () => picked };
  })();

  /* number the process cards */
  $$('.flow__card').forEach((c, i) => c.setAttribute('data-n', pad2(i + 1)));

  /* ---------------------------------------------------------- text split */
  function splitWords(el, wordClass = 'w', innerClass = 'wi') {
    const out = [];
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = wordClass;
            if (innerClass) { const i = document.createElement('span'); i.className = innerClass; i.textContent = part; w.appendChild(i); out.push(i); }
            else { w.textContent = part; out.push(w); }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.trim());
    walk(el);
    return out;
  }

  /* ------------------------------------------------------- smooth scroll */
  let lenis = null;
  if (animate && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToTarget = target => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else (typeof target === 'string' ? $(target) : target)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };
  $$('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id.length < 2 || a.hasAttribute('data-wa')) return;
    a.addEventListener('click', e => {
      if (!$(id)) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(id);
    });
  });

  /* ------------------------------------------------------------- nav/menu */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu'), fab = $('#fab'), progress = $('#progress');
  function closeMenu() {
    menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); nav.classList.remove('is-menu');
    burger.setAttribute('aria-expanded', 'false'); lenis?.start();
  }
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    if (!open) return closeMenu();
    menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true'); nav.classList.remove('is-hidden'); nav.classList.add('is-menu'); lenis?.stop();
  });

  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!menu.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
    fab.classList.toggle('is-on', y > innerHeight * 0.8 && y < max - 140);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // active link highlight
  const navLinks = $$('.nav__links a');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(l => { const s = $(l.getAttribute('href')); if (s) io.observe(s); });
    io.observe($('#hero'));
  }

  /* --------------------------------------------------------------- cursor */
  if (finePointer && !reduced) {
    const cur = $('#cursor'), label = $('#cursorLabel');
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    const loop = () => { cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener('mouseover', e => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, summary, label, input');
      cur.classList.toggle('is-label', !!lab);
      cur.classList.toggle('is-link', !lab && !!link);
      if (lab) label.textContent = lab.dataset.cursor;
    });

    // magnetic buttons
    $$('[data-magnetic]').forEach(el => {
      const k = parseFloat(el.dataset.magneticStrength || '0.35');
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * k, y = (e.clientY - r.top - r.height / 2) * k;
        hasGsap ? gsap.to(el, { x, y, duration: .5, ease: 'power3.out' }) : (el.style.transform = `translate(${x}px,${y}px)`);
      });
      el.addEventListener('mouseleave', () => {
        hasGsap ? gsap.to(el, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1,0.4)' }) : (el.style.transform = '');
      });
    });

    // 3D tilt
    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', px * 100 + '%'); el.style.setProperty('--my', py * 100 + '%');
        gsap.to(el, { rotateY: (px - .5) * 14, rotateX: (.5 - py) * 12, duration: .5, ease: 'power2.out', transformPerspective: 1000 });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 1, ease: 'elastic.out(1,0.5)' }));
    });

    // spotlight cards
    $$('.spot').forEach(el => el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px'); el.style.setProperty('--my', e.clientY - r.top + 'px');
    }));

    // services — floating image follows the cursor
    const float = $('#svcFloat'), floatImg = $('img', float), list = $('#svcList');
    if (hasGsap) {
      const xTo = gsap.quickTo(float, 'x', { duration: .6, ease: 'power3' }), yTo = gsap.quickTo(float, 'y', { duration: .6, ease: 'power3' });
      let lastX = 0;
      list.addEventListener('mousemove', e => {
        xTo(Math.min(e.clientX + 170, innerWidth - 170)); yTo(clamp(e.clientY, 210, innerHeight - 210));
        gsap.to(float, { rotate: clamp((e.clientX - lastX) * 0.6, -12, 12), duration: .5 });
        lastX = e.clientX;
      });
      $$('.svc__row', list).forEach(row => row.addEventListener('mouseenter', () => { floatImg.src = row.dataset.img; }));
      list.addEventListener('mouseenter', () => gsap.to(float, { opacity: 1, scale: 1, duration: .5, ease: 'power3.out' }));
      list.addEventListener('mouseleave', () => gsap.to(float, { opacity: 0, scale: .6, duration: .4, ease: 'power3.in' }));
    }

    // hero collage mouse parallax
    const collage = $('#collage');
    if (hasGsap && collage) {
      const layers = $$('[data-depth]', collage).map(el => ({
        d: parseFloat(el.dataset.depth),
        x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3' }),
      }));
      $('#hero').addEventListener('mousemove', e => {
        const dx = e.clientX - innerWidth / 2, dy = e.clientY - innerHeight / 2;
        layers.forEach(l => { l.x(-dx * l.d); l.y(-dy * l.d); });
      });
    }
  }

  /* ------------------------------------------- footer wordmark reacts to the pointer */
  (() => {
    const word = $('#footWord'); if (!word) return;
    const letters = $$('b', word);
    let px = 0, py = 0, sx = 0, sy = 0, inside = false, raf = 0;
    const frame = () => {
      sx += (px - sx) * .16; sy += (py - sy) * .16;          // the light trails the cursor slightly
      letters.forEach(l => {
        const r = l.getBoundingClientRect(), w = r.width;
        const dx = sx - (r.left + w / 2), d = Math.hypot(dx, (sy - (r.top + r.height / 2)) * .6);
        const f = inside ? clamp(1 - d / (w * 1.25), 0, 1) : 0;
        l.style.setProperty('--f', f.toFixed(3));
        l.style.setProperty('--tilt', (inside ? clamp(dx / w, -1, 1) * -4 * f : 0).toFixed(2));
        l.style.setProperty('--lx', (inside ? sx - r.left : -999) + 'px');
        l.style.setProperty('--ly', (inside ? sy - r.top : -999) + 'px');
      });
      raf = inside || Math.abs(px - sx) > .5 ? requestAnimationFrame(frame) : 0;
    };
    const move = e => { px = e.clientX; py = e.clientY; if (!inside) { inside = true; sx = px; sy = py; } if (!raf) raf = requestAnimationFrame(frame); };
    word.addEventListener('pointermove', move);
    word.addEventListener('pointerdown', move);
    const leave = () => { inside = false; if (!raf) raf = requestAnimationFrame(frame); };
    word.addEventListener('pointerleave', leave);
    word.addEventListener('pointercancel', leave);
    // click / tap: the letters jump in a wave
    word.addEventListener('click', () => {
      if (!animate) return;
      gsap.fromTo(letters, { y: 0 }, { keyframes: [{ y: '-9%', duration: .28, ease: 'power2.out' }, { y: 0, duration: .7, ease: 'bounce.out' }], stagger: .08, overwrite: true, clearProps: 'transform' });
    });
  })();

  /* --------------------------------------------------------------- video */
  // Films load only when they come near the viewport, play only while visible,
  // and stay as still posters for reduced-motion or data-saver visitors.
  const lazyVideo = (() => {
    const vids = $$('video[data-src]');
    const still = reduced || (navigator.connection && navigator.connection.saveData);
    if (still || !('IntersectionObserver' in window)) return { still: true };
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.getAttribute('src')) v.src = (v.dataset.srcMobile && innerWidth < 760) ? v.dataset.srcMobile : v.dataset.src;
        if (!v.dataset.userPaused) v.play().catch(() => {});
      } else v.pause();
    }), { rootMargin: '300px 0px' });
    vids.forEach(v => io.observe(v));
    return { still: false };
  })();

  /* ------------------------------------------------------------ showreel */
  const reel = (() => {
    const video = $('#reelVideo'); if (!video) return null;
    const SCENES = [
      { t: 0, country: 'Australia', place: 'Sydney Opera House' },
      { t: 1.46, country: 'New Zealand', place: 'Aoraki / Mount Cook' },
      { t: 2.79, country: 'Canada', place: 'Moraine Lake, Banff' },
      { t: 4.25, country: 'United Kingdom', place: 'Big Ben, London' },
      { t: 5.79, country: 'Japan', place: 'Mount Fuji' },
      { t: 7.08, country: 'South Korea', place: 'Gyeongbokgung Palace, Seoul' },
      { t: 8.46, country: 'Europe', place: 'Hallstatt · Schengen area' },
    ];
    const DUR = 10, bars = $('#reelBars'), toggle = $('#reelToggle');
    const elNo = $('#reelNo'), elCountry = $('#reelCountry'), elPlace = $('#reelPlace');
    SCENES.forEach((s, i) => {
      const b = document.createElement('button');
      b.style.flex = `${(SCENES[i + 1] ? SCENES[i + 1].t : DUR) - s.t} 1 0`;
      b.setAttribute('aria-label', `Jump to ${s.country}`);
      b.innerHTML = `<i></i><span>${s.country}</span>`;
      b.addEventListener('click', () => { if (video.readyState) video.currentTime = s.t + .03; video.play().catch(() => {}); });
      bars.appendChild(b);
    });
    const btns = $$('button', bars);
    let cur = -1;
    const show = i => {
      if (i === cur) return; cur = i;
      const s = SCENES[i];
      btns.forEach((b, k) => b.classList.toggle('is-on', k === i));
      elNo.textContent = pad2(i + 1);
      if (animate) {
        gsap.fromTo([elCountry, elPlace], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .55, stagger: .06, ease: 'power3.out', overwrite: true, onStart: () => { elCountry.textContent = s.country; elPlace.textContent = s.place; } });
      } else { elCountry.textContent = s.country; elPlace.textContent = s.place; }
    };
    const tick = () => {
      const t = video.currentTime || 0;
      let i = SCENES.length - 1; while (i > 0 && t < SCENES[i].t) i--;
      show(i);
      btns.forEach((b, k) => {
        const a = SCENES[k].t, z = SCENES[k + 1] ? SCENES[k + 1].t : DUR;
        b.style.setProperty('--p', clamp((t - a) / (z - a), 0, 1).toFixed(3));
      });
      if (!video.paused) requestAnimationFrame(tick);
    };
    video.addEventListener('play', () => { toggle.classList.remove('is-paused'); toggle.setAttribute('aria-label', 'Pause video'); requestAnimationFrame(tick); });
    video.addEventListener('pause', () => { toggle.classList.add('is-paused'); toggle.setAttribute('aria-label', 'Play video'); });
    video.addEventListener('seeked', tick);
    toggle.addEventListener('click', () => {
      if (!video.getAttribute('src')) video.src = (innerWidth < 760) ? video.dataset.srcMobile : video.dataset.src;
      if (video.paused) { delete video.dataset.userPaused; video.play().catch(() => {}); } else { video.dataset.userPaused = '1'; video.pause(); }
    });
    if (lazyVideo.still) toggle.classList.add('is-paused');
    show(0);
    return { frame: $('#reelFrame') };
  })();

  /* ----------------------------------------------------------------- tabs */
  $$('.tabs').forEach(tabs => {
    const btns = $$('.tabs__nav button', tabs), pill = $('.tabs__pill', tabs);
    const movePill = b => { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft - 5}px)`; };
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => x.classList.toggle('is-active', x === b));
      $$('.tabs__panel', tabs).forEach(p => {
        const on = p.dataset.panel === b.dataset.tab;
        p.classList.toggle('is-active', on);
        if (on && animate) gsap.from($$('li', p), { y: 22, opacity: 0, duration: .6, stagger: .06, ease: 'power3.out' });
      });
      movePill(b);
      if (hasGsap) ScrollTrigger.refresh();
    }));
    const init = () => movePill($('.is-active', tabs));
    init(); window.addEventListener('resize', init); document.fonts?.ready.then(init);
  });

  /* ------------------------------------------------------------ accordion */
  $$('.acc details').forEach(d => {
    const sum = $('summary', d), body = $('div', d);
    sum.addEventListener('click', e => {
      if (!animate) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, duration: .45, ease: 'power3.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      } else {
        $$('.acc details[open]').forEach(o => { if (o !== d) { const b = $('div', o); gsap.to(b, { height: 0, duration: .4, ease: 'power3.inOut', onComplete: () => { o.open = false; gsap.set(b, { clearProps: 'height' }); } }); } });
        d.open = true;
        gsap.fromTo(body, { height: 0 }, { height: 'auto', duration: .55, ease: 'power3.out', onComplete: () => { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
      }
    });
  });

  /* -------------------------------------------------------------- enquiry */
  (() => {
    const form = $('#enqForm'); if (!form) return;
    const name = $('#enqName'), paxOut = $('#enqPax');
    let pax = 1;
    const flip = (el, text) => {
      if (el.textContent === text) return;
      if (!animate) { el.textContent = text; return; }
      gsap.to(el, { yPercent: -60, opacity: 0, duration: .18, ease: 'power2.in', onComplete: () => { el.textContent = text; gsap.fromTo(el, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .35, ease: 'power3.out' }); } });
    };
    const sync = () => {
      const svc = form.service.value, destEl = $('input[name="dest"]:checked', form);
      flip($('#passService'), svc);
      flip($('#passDest'), destEl.value);
      flip($('#passCode'), destEl.dataset.code);
      const li = DESTINATIONS.findIndex(d => destEl.value.startsWith(d.name) || (d.name === 'Schengen' && destEl.value.includes('Schengen')));
      if ($('#passLm').dataset.i !== String(li)) {
        $('#passLm').dataset.i = li; $('#passLm').innerHTML = lmArt(li);
        if (animate && li >= 0) gsap.fromTo('#passLm path', { strokeDasharray: '1 1.5', strokeDashoffset: 1.05 }, { strokeDashoffset: 0, duration: 1.2, stagger: .08, ease: 'power2.out' });
      }
      $('#passName').textContent = name.value.trim() || 'Your name';
      $('#passPax').textContent = pad2(pax); paxOut.textContent = pax;
    };
    form.addEventListener('change', sync);
    name.addEventListener('input', sync);
    $$('[data-step]', form).forEach(b => b.addEventListener('click', () => { pax = clamp(pax + Number(b.dataset.step), 1, 12); sync(); }));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const destEl = $('input[name="dest"]:checked', form);
      const lines = ['Hello IEIC! I would like your help.', '', `Service: ${form.service.value}`, `Destination: ${destEl.value}`, `Travellers: ${pax}`];
      if (name.value.trim()) lines.push(`Name: ${name.value.trim()}`);
      window.open(waLink(lines.join('\n')), '_blank', 'noopener');
    });
    sync();
  })();

  /* ------------------------------------------------------------- lightbox */
  const lightbox = (() => {
    const lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap');
    let idx = 0;
    const show = i => {
      idx = (i + POSTERS.length) % POSTERS.length;
      const p = POSTERS[idx];
      img.classList.remove('is-in');
      const next = new Image();
      next.onload = () => { img.src = next.src; img.alt = p.title; requestAnimationFrame(() => img.classList.add('is-in')); };
      next.src = `assets/img/posters/${p.file}.jpg`;
      cap.textContent = `${p.title} — ${p.tag}  ·  ${pad2(idx + 1)} / ${POSTERS.length}`;
    };
    const open = i => { show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); lenis?.stop(); };
    const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lenis?.start(); };
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(idx - 1));
    $('#lbNext').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb__fig')) close(); });
    window.addEventListener('keydown', e => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
    $$('[data-poster]').forEach(b => b.addEventListener('click', () => open(POSTERS.findIndex(p => p.file === b.dataset.poster))));
    return { open };
  })();

  /* --------------------------------------------------- spinning wheel */
  (() => {
    const stage = $('#wheelStage'), wheel = $('#wheel'); if (!stage) return;
    const N = POSTERS.length, STEP = 360 / N;
    const elTitle = $('#wheelTitle'), elTag = $('#wheelTag'), elIdx = $('#wheelIdx');
    $('#wheelTotal').textContent = N;

    const cards = POSTERS.map((p, i) => {
      const c = document.createElement('div');
      c.className = 'wcard';
      c.innerHTML = `<img src="assets/img/posters/${p.file}-thumb.jpg" alt="${p.title}" loading="lazy" draggable="false">`;
      wheel.appendChild(c);
      return c;
    });

    let R = 1200, rot = 0, target = 0, active = -1, inView = false, dragging = false, moved = 0, idleAt = 0, hover = false;

    const layout = () => {
      const short = innerHeight < 520;        // phone held sideways
      const cw = short ? 132 : innerWidth < 640 ? 168 : innerWidth < 1100 ? 210 : innerWidth < 1700 ? 250 : innerWidth < 2300 ? 290 : 340;
      const ch = cw * 1.25;
      // radius chosen so the cards' inner (narrower) edge never overlaps its neighbour
      R = ((cw + (innerWidth < 640 ? 10 : 16)) * N) / (2 * Math.PI) + ch;
      const half = Math.min(innerWidth / 2, R * 0.92);
      const sag = R - Math.sqrt(R * R - half * half);
      stage.style.setProperty('--R', R + 'px');
      stage.style.setProperty('--cw', cw + 'px');
      stage.style.setProperty('--stage-h', Math.round(40 + ch + Math.min(sag, 300) + 40) + 'px');
      cards.forEach((c, i) => { c.style.transform = `rotate(${i * STEP}deg) translateY(${-R}px)`; });
    };

    const setActive = i => {
      if (i === active) return;
      active = i;
      cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
      const p = POSTERS[i];
      elIdx.textContent = pad2(i + 1); elTag.textContent = p.tag;
      if (animate) gsap.fromTo(elTitle, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out', onStart: () => { elTitle.textContent = p.title; } });
      else elTitle.textContent = p.title;
    };

    const snap = () => { target = Math.round(target / STEP) * STEP; };
    const goTo = i => {
      // shortest way round
      const cur = Math.round(-target / STEP);
      let diff = ((i - cur) % N + N) % N; if (diff > N / 2) diff -= N;
      target = -(cur + diff) * STEP; idleAt = performance.now();
    };

    const tick = now => {
      if (inView) {
        if (!dragging && !hover && !reduced && now - idleAt > 2600) target -= 0.018;   // gentle auto spin
        rot += (target - rot) * 0.085;
        wheel.style.transform = `rotate(${rot}deg)`;
        setActive(((Math.round(-rot / STEP) % N) + N) % N);
      }
      requestAnimationFrame(tick);
    };

    // drag
    let startX = 0, startT = 0, lastX = 0, vel = 0;
    stage.addEventListener('pointerdown', e => {
      dragging = true; moved = 0; startX = lastX = e.clientX; startT = target; vel = 0;
      stage.classList.add('is-drag');
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      vel = e.clientX - lastX; lastX = e.clientX;
      target = startT + (dx / R) * (180 / Math.PI) * 1.15;
    });
    const end = e => {
      if (!dragging) return;
      dragging = false; stage.classList.remove('is-drag'); idleAt = performance.now();
      if (moved < 6) {                       // a click, not a drag
        const card = e.target.closest?.('.wcard');
        if (card) { const i = cards.indexOf(card); i === active ? lightbox.open(i) : goTo(i); }
        return;
      }
      target += (vel / R) * (180 / Math.PI) * 9;   // throw
      snap();
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    stage.addEventListener('mouseenter', () => { hover = finePointer; });
    stage.addEventListener('mouseleave', () => { hover = false; idleAt = performance.now(); });

    $('#wheelPrev').addEventListener('click', () => { snap(); target += STEP; idleAt = performance.now() + 2500; });
    $('#wheelNext').addEventListener('click', () => { snap(); target -= STEP; idleAt = performance.now() + 2500; });
    stage.setAttribute('tabindex', '0');
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { snap(); target += STEP; } if (e.key === 'ArrowRight') { snap(); target -= STEP; }
      if (e.key === 'Enter') lightbox.open(active);
      idleAt = performance.now() + 2500;
    });

    new IntersectionObserver(es => { inView = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(stage);
    window.addEventListener('resize', layout);
    layout(); setActive(0); requestAnimationFrame(tick);

    // the page scroll also turns the wheel a little
    if (animate) ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onUpdate: s => { if (!dragging) target -= s.getVelocity() / 9000; } });
  })();

  /* --------------------------------------------------------- marquee */
  (() => {
    const track = $('[data-marquee]'); if (!track) return;
    const parent = track.parentElement;
    parent.appendChild(track.cloneNode(true)).setAttribute('aria-hidden', 'true');
    parent.appendChild(track.cloneNode(true)).setAttribute('aria-hidden', 'true');
    if (reduced) return;
    const tracks = $$('.marquee__track', parent);
    let x = 0, dir = -1, speed = 1, lastS = window.scrollY;
    const step = () => {
      const w = tracks[0].offsetWidth;
      const s = window.scrollY, dv = s - lastS; lastS = s;
      if (dv !== 0) dir = dv > 0 ? -1 : 1;
      speed += (1 + Math.min(Math.abs(dv), 60) * 0.25 - speed) * 0.1;   // scroll makes it rush
      x += dir * speed * 1.1;
      if (x <= -w) x += w; if (x > 0) x -= w;
      tracks.forEach(t => { t.style.transform = `translate3d(${x}px,0,0)`; });
      requestAnimationFrame(step);
    };
    step();
  })();

  /* ====================================================================
     Scroll + intro animation (GSAP)
     ==================================================================== */
  const pre = $('#preloader');
  const killPreloader = () => { pre.style.display = 'none'; };

  if (!animate) {
    killPreloader();
    $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });   // mobile address-bar show/hide must not re-measure pins
  gsap.defaults({ ease: 'power3.out' });

  /* ---- destinations: pinned horizontal scroll (desktop) ----
     created first: triggers further down the page must be measured after this pin's spacing exists */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = destTrack;
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.dest', start: 'top top', end: () => '+=' + dist(), pin: '.dest__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => { $('#destBar').style.transform = `scaleX(${s.progress})`; },
      },
    });
    $$('.dcard', track).forEach(card => {
      gsap.fromTo($('.dcard__img', card), { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($('.dcard__body', card), { y: 60, opacity: 0, duration: .9, scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 88%' } });
    });
  });
  mm.add('(max-width: 900px)', () => {
    gsap.from('.dcard', { y: 60, opacity: 0, duration: 1, stagger: .1, scrollTrigger: { trigger: '.dest__track', start: 'top 80%' } });
  });

  /* ---- hero intro (plays after the preloader) ---- */
  const heroWords = splitWords($('[data-hero-split]'));
  gsap.set(heroWords, { yPercent: 115 });
  gsap.set('[data-hero-fade], .hero__eyebrow', { opacity: 0, y: 24 });
  gsap.set('.hc', { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.set('.hc img', { scale: 1.5 });
  gsap.set('.chip, .badge', { opacity: 0, scale: .7 });
  gsap.set(nav, { yPercent: -160 });

  const intro = gsap.timeline({ paused: true });
  intro
    .to(heroWords, { yPercent: 0, duration: 1.25, stagger: .09, ease: 'power4.out' }, 0)
    .to('.hero__eyebrow', { opacity: 1, y: 0, duration: .9 }, .1)
    .to('.hc', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, stagger: .14, ease: 'power4.inOut' }, .05)
    .to('.hc img', { scale: 1, duration: 2, stagger: .14, ease: 'power3.out' }, .05)
    .set('.hc', { clearProps: 'clipPath' }, 1.9)
    .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1, stagger: .1 }, .55)
    .to(nav, { yPercent: 0, duration: 1.1, ease: 'power4.out', clearProps: 'transform' }, .5)
    .to('.chip, .badge', { opacity: 1, scale: 1, duration: .9, stagger: .12, ease: 'back.out(1.8)' }, 1.05);

  /* ---- preloader: the plane from the logo flies in and lands on its own spot ---- */
  (() => {
    const bar = $('#preBar'), count = $('#preCount'), mark = $('#preMark'), plane = $('#prePlane'), ring = $('#preRing'), logo = $('#preLogo');
    const heroImg = $('.hc--main img');
    const imgReady = heroImg.complete ? Promise.resolve() : new Promise(r => { heroImg.onload = heroImg.onerror = r; setTimeout(r, 3500); });
    lenis?.stop();
    window.scrollTo(0, 0);

    // flight path: a cubic bezier in px, relative to the plane's resting place (0,0).
    // It enters from the upper left, swoops under the logo and climbs in along the logo's own trail.
    const HEADING = 33;                                  // the plane artwork points ~33deg above the horizon
    const k = logo.offsetWidth / 130, vw = innerWidth, vh = innerHeight;
    const P = [[-vw * .62 - 80, -vh * .2], [-vw * .08, vh * .52], [-190 * k, 123 * k], [0, 0]];
    const bez = (t, i) => { const u = 1 - t; return u * u * u * P[0][i] + 3 * u * u * t * P[1][i] + 3 * u * t * t * P[2][i] + t * t * t * P[3][i]; };
    const tan = (t, i) => { const u = 1 - t; return 3 * u * u * (P[1][i] - P[0][i]) + 6 * u * t * (P[2][i] - P[1][i]) + 3 * t * t * (P[3][i] - P[2][i]); };
    const fly = { t: 0 }, load = { v: 0 };
    const place = () => {
      const t = fly.t, x = bez(t, 0), y = bez(t, 1);
      const rot = Math.atan2(tan(t, 1), tan(t, 0)) * 180 / Math.PI + HEADING;
      gsap.set(plane, { x, y, rotation: rot * (1 - Math.pow(t, 6)), scale: 1 + 1.9 * Math.pow(1 - t, 1.6), opacity: Math.min(1, t * 9) });
      plane.style.filter = `drop-shadow(0 0 ${Math.round(16 * (1 - t))}px rgba(130,195,255,${(.9 * (1 - t)).toFixed(2)}))`;
    };
    place();
    gsap.set(mark, { opacity: 0, scale: .9 });

    const tl = gsap.timeline();
    tl.to(mark, { opacity: .3, scale: 1, duration: .7, ease: 'power2.out' }, 0)
      .to(load, {
        v: 100, duration: 2.3, ease: 'power2.inOut',
        onUpdate: () => {
          count.textContent = Math.round(load.v);
          bar.style.transform = `scaleX(${load.v / 100})`;
          mark.style.opacity = .3 + .7 * Math.pow(load.v / 100, 2);     // the mark "charges up" as the plane approaches
        },
      }, 0)
      .to(fly, { t: 1, duration: 2.15, ease: 'sine.out', onUpdate: place }, .15)
      // touchdown
      .set(plane, { x: 0, y: 0, rotation: 0, opacity: 1 }, 2.3)
      .fromTo(plane, { scale: 1.22 }, { scale: 1, duration: .55, ease: 'back.out(3)', immediateRender: false }, 2.3)
      .fromTo(ring, { scale: .2, opacity: .9 }, { scale: 2.4, opacity: 0, duration: .8, ease: 'power2.out', immediateRender: false }, 2.3)
      .fromTo(logo, { scale: 1 }, { scale: 1.05, duration: .22, ease: 'power2.out', yoyo: true, repeat: 1, immediateRender: false }, 2.3)
      .add(() => { plane.style.filter = ''; }, 2.3)
      .add(() => imgReady.then(() => {
        gsap.timeline({ onComplete: () => { killPreloader(); lenis?.start(); ScrollTrigger.refresh(); } })
          .to('.preloader__inner', { opacity: 0, y: -30, duration: .5, ease: 'power2.in' })
          .to('.preloader__panel', { yPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '-=.1')
          .add(() => intro.play(), '-=.75');
      }), 2.95);
  })();

  /* ---- generic reveals ---- */
  $$('[data-split]').forEach(el => {
    const words = splitWords(el);
    gsap.from(words, { yPercent: 115, duration: 1.1, stagger: .055, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });

  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: els => {
      // after a long jump (nav link, back-to-top) dozens of elements enter at once:
      // show the ones already scrolled past immediately, and stagger only what is on screen
      const seen = els.filter(el => el.getBoundingClientRect().bottom > 0), passed = els.filter(el => !seen.includes(el));
      if (passed.length) gsap.set(passed, { opacity: 1, y: 0 });
      gsap.fromTo(seen, { opacity: 0, y: 46 }, { opacity: 1, y: 0, duration: 1, stagger: Math.min(.09, .5 / seen.length), overwrite: true });
    },
  });
  gsap.set('[data-reveal]', { opacity: 0 });

  $$('.reveal-img').forEach(el => {
    const img = $('img, video', el);
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut' })
      .fromTo(img, { scale: 1.45 }, { scale: 1.12, duration: 1.9, ease: 'power3.out' }, 0);
  });

  // parallax — yPercent drift through the viewport
  $$('[data-parallax]').forEach(el => {
    const v = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -v }, { yPercent: v, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.hc__in').forEach(el => {
    gsap.to(el, { yPercent: parseFloat(el.dataset.speed) / 3, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to(el.parentElement, { yPercent: parseFloat(el.dataset.speed) * 1.4, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
  gsap.to('.hero__copy', { yPercent: -8, opacity: .25, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'center center', end: 'bottom top', scrub: true } });

  // hero dashed route draws itself
  gsap.fromTo('#heroRoute', { strokeDashoffset: 600 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 } });

  // statement — words light up as you scroll
  $$('[data-scrub-words]').forEach(el => {
    const words = splitWords(el, 'sw', null);
    gsap.to(words, { opacity: 1, stagger: .08, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: .6 } });
  });

  // counters
  $$('[data-count]').forEach(el => {
    const o = { v: 0 }, end = Number(el.dataset.count);
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
  });

  /* ---- showreel: a rounded card that opens up to fill the screen ---- */
  if (reel) {
    // the card opens first; captions and controls only fade in once it is (almost) full-bleed
    const open = (from, st) => gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#reel', scrub: .6, invalidateOnRefresh: true, ...st } })
      .fromTo(reel.frame, { '--ix': from[0], '--iy': from[1], '--ir': from[2] }, { '--ix': '0%', '--iy': '0%', '--ir': '0px', duration: 1 }, 0)
      .fromTo(reel.frame, { '--ui': 0 }, { '--ui': 1, duration: .16 }, .84);
    mm.add('(min-width: 901px)', () => { open(['21%', '19%', '44px'], { start: 'top 75%', end: () => '+=' + innerHeight * 1.45 }); });
    mm.add('(max-width: 900px)', () => { open(['9%', '7%', '34px'], { start: 'top 85%', end: 'top 14%' }); });
  }

  /* ---- landmark skyline sketches itself ---- */
  if (sky) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#sky', start: 'top 82%', end: 'top 8%', scrub: .8,
        onUpdate: s => { sky.setPlane(.04 + s.progress * .92); if (!sky.isPicked()) sky.select(clamp(Math.floor((s.progress * tl.duration() - .25) / .7), 0, LANDMARKS.length - 1)); },
      },
    });
    sky.groups.forEach((g, i) => {
      const paths = $$('.lm__art path', g);
      paths.forEach(pth => pth.setAttribute('pathLength', '1'));
      gsap.set(paths, { strokeDasharray: '1 1.5', strokeDashoffset: 1.05 });
      tl.to(paths, { strokeDashoffset: 0, duration: 1, stagger: .08, ease: 'none' }, i * .7)
        .from($$('text, .lm__dot', g), { opacity: 0, duration: .3 }, i * .7 + .5);
    });
  }

  /* ---- process timeline ---- */
  (() => {
    const flow = $('#flow'), fill = $('#flowFill'), plane = $('#flowPlane');
    ScrollTrigger.create({
      trigger: flow, start: 'top 62%', end: 'bottom 62%', scrub: .5,
      onUpdate: s => { fill.style.transform = `scaleY(${s.progress})`; plane.style.top = s.progress * 100 + '%'; },
    });
    $$('.flow__step', flow).forEach((step, i) => {
      const fromLeft = innerWidth > 900 && i % 2 === 0;
      gsap.from($('.flow__card', step), { x: innerWidth > 900 ? (fromLeft ? -70 : 70) : 40, opacity: 0, rotate: fromLeft ? -3 : 3, duration: 1.1, scrollTrigger: { trigger: step, start: 'top 80%' } });
    });
  })();

  /* ---- stamps slam in ---- */
  $$('[data-stamp]').forEach(el => {
    gsap.fromTo(el, { scale: 2.6, opacity: 0, rotate: 14 }, { scale: 1, opacity: 1, rotate: -7, duration: .5, ease: 'power4.in', scrollTrigger: { trigger: el, start: 'top 82%' } });
  });

  /* ---- checklist ticks ---- */
  gsap.from('#checklist li', { x: -30, opacity: 0, duration: .8, stagger: .08, scrollTrigger: { trigger: '#checklist', start: 'top 82%' } });
  gsap.from('#checklist .ck', { scale: 0, rotate: -90, duration: .7, stagger: .08, ease: 'back.out(2.4)', delay: .15, scrollTrigger: { trigger: '#checklist', start: 'top 82%' } });

  /* ---- boarding pass flies in ---- */
  gsap.from('#pass', { rotateZ: 8, rotateY: -28, y: 80, opacity: 0, duration: 1.4, ease: 'power4.out', transformPerspective: 1200, scrollTrigger: { trigger: '#pass', start: 'top 85%' } });
  gsap.fromTo('.pass__plane', { left: '8%' }, { left: '92%', ease: 'none', scrollTrigger: { trigger: '#pass', start: 'top 90%', end: 'bottom 30%', scrub: 1 } });

  /* ---- section corner "curtain" scale ---- */
  $$('.process, .contact').forEach(el => {
    gsap.from(el, { scale: .94, transformOrigin: '50% 0%', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 35%', scrub: true } });
  });

  /* ---- footer word ---- */
  gsap.from('.fw', { yPercent: 45, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

  // keep trigger positions honest: order by page position, and re-measure whenever the page height changes
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  if ('ResizeObserver' in window) {
    let lastH = document.documentElement.scrollHeight, timer;
    new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 4) return;
      lastH = h; clearTimeout(timer);
      timer = setTimeout(() => { ScrollTrigger.refresh(); lastH = document.documentElement.scrollHeight; }, 300);
    }).observe(document.body);
  }
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
