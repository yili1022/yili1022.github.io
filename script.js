/* ============================================================
   Yi Li — portfolio

   To add a project: copy one object in PROJECTS below.
   - cat:   one of the keys in CATS
   - media: images and/or videos, shown in the viewer.
            { type: 'image', src: 'images/x.jpg', alt: '...' }
            { type: 'video', src: 'videos/x.mp4', poster: 'images/x.jpg' }
            Leave media empty to show a title card for now.
   ============================================================ */

const CATS = {
  brand: 'Branding',
  ui: 'UI/UX',
  packaging: 'Packaging',
  book: 'Book design',
  poster: 'Poster design',
};

const PROJECTS = [
  {
    id: 'dim-yum',
    title: 'Dim Yum',
    cat: 'brand',
    year: '2026',
    tags: ['Brand identity', 'Logo animation'],
    desc: 'Logo animation for Dim Yum, a brand built around dim sum, yumcha and cocktails.',
    media: [{ type: 'video', src: 'videos/dimyum.mp4', poster: 'images/dimyum-poster.jpg' }],
  },
  {
    id: 'anchor-gin',
    title: 'Anchor Gin',
    cat: 'packaging',
    year: '2026',
    tags: ['Packaging design', 'Brand identity', 'Label system'],
    desc: 'A conceptual craft gin brand inspired by the maritime history of Brooklyn’s waterfront and the anchor as a symbol of stability, navigation, and identity.',
    media: [],
  },
  {
    id: 'poland-spring',
    title: 'Poland Spring',
    cat: 'packaging',
    year: '2026',
    tags: ['Packaging redesign', 'Brand identity', 'Sustainable system'],
    desc: 'A redesign of Poland Spring as a modern, environmentally conscious water brand, using a refined, minimal packaging system.',
    media: [],
  },
  {
    id: 'panettone',
    title: 'Panettone',
    cat: 'packaging',
    year: '2026',
    tags: ['Packaging design', 'Seasonal identity', 'Structural exploration'],
    desc: 'A contemporary reinterpretation of a traditional Italian holiday dessert, presented through a refined, structured packaging system.',
    media: [],
  },
  {
    id: 'ten-principles',
    title: 'Ten Principles of Good Design',
    cat: 'poster',
    year: '2026',
    tags: ['Poster design', 'Typography', 'Animation'],
    desc: 'A typographic poster series on Dieter Rams’ ten principles of good design, set entirely in Helvetica. An animated version was also produced.',
    media: [],
  },
];

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
  };

  /* ---------- Theme: paper or ink ---------- */
  const invertBtn = $('#invert');
  function applyTheme(t, save) {
    root.dataset.theme = t;
    invertBtn.setAttribute('aria-pressed', String(t === 'ink'));
    const m = $('meta[name="theme-color"]');
    if (m) m.content = t === 'ink' ? '#2230E0' : '#E8EAEE';
    if (save) store.set('theme', t);
  }
  applyTheme(store.get('theme') === 'ink' ? 'ink' : 'paper', false);
  invertBtn.addEventListener('click', () => applyTheme(root.dataset.theme === 'ink' ? 'paper' : 'ink', true));

  /* ---------- Header rule + footer year ---------- */
  const header = $('.top');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Hero: parametric monoline lettering ---------- */
  const svg = $('#lettering');
  const glyphs = $('#glyphs');
  const dots = $$('.dot', svg);
  const rw = $('#rw');
  const rs = $('#rs');
  const termBtn = $('#term');
  const termName = $('#term-name');
  const TERMS = [
    { name: 'Round', cap: 'round', join: 'round' },
    { name: 'Square', cap: 'square', join: 'miter' },
    { name: 'Flat', cap: 'butt', join: 'miter' },
  ];
  let term = 0;
  let w = 26, wT = 26;     // stroke weight (current, target)
  let sl = 0, slT = 0;     // slant in degrees (current, target)
  let interacted = false;  // the idle breathing stops after the first interaction
  let drawn = false;
  let heroVisible = true;
  let lastW = null, lastS = null, lastTerm = null;

  function applyTerm() {
    const t = TERMS[term];
    glyphs.setAttribute('stroke-linecap', t.cap);
    glyphs.setAttribute('stroke-linejoin', t.join);
    termName.textContent = t.name;
  }
  function render() {
    if (w === lastW && sl === lastS && term === lastTerm) return;
    lastW = w; lastS = sl; lastTerm = term;
    glyphs.style.strokeWidth = w.toFixed(1);
    glyphs.setAttribute('transform', `translate(0 330) skewX(${(-sl).toFixed(2)}) translate(0 -330)`);
    dots.forEach(d => {
      const cx = +d.dataset.cx, cy = +d.dataset.cy;
      d.setAttribute('d', term === 2 ? `M${cx} ${(cy - w / 2).toFixed(1)} v${w.toFixed(1)}` : `M${cx} ${cy} v0.01`);
    });
    rw.textContent = Math.round(w);
    rs.textContent = `${Math.round(sl)}°`;
  }

  addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect();
    if (e.clientY < r.top - 80 || e.clientY > r.bottom + 80) return;
    const rx = clamp((e.clientX - r.left) / r.width, 0, 1);
    const ry = clamp((e.clientY - r.top) / r.height, 0, 1);
    wT = 8 + rx * 50;
    slT = (0.5 - ry) * 28;
    interacted = true;
  }, { passive: true });

  svg.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight') wT = clamp(wT + 4, 8, 58);
    else if (k === 'ArrowLeft') wT = clamp(wT - 4, 8, 58);
    else if (k === 'ArrowUp') slT = clamp(slT + 2, -14, 14);
    else if (k === 'ArrowDown') slT = clamp(slT - 2, -14, 14);
    else return;
    e.preventDefault();
    interacted = true;
  });

  termBtn.addEventListener('click', () => { term = (term + 1) % TERMS.length; applyTerm(); });
  applyTerm();

  new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; }).observe(svg);

  function frame(t) {
    if (heroVisible) {
      if (!interacted && drawn && !reduce) {
        wT = 28 + Math.sin(t / 1100) * 16;
        slT = Math.sin(t / 1900) * 6;
      }
      w = reduce ? wT : lerp(w, wT, 0.14);
      sl = reduce ? slT : lerp(sl, slT, 0.14);
      render();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // draw-on at load
  if (reduce) {
    svg.classList.add('drawn');
    drawn = true;
  } else {
    setTimeout(() => svg.classList.add('drawn'), 150);
    setTimeout(() => { drawn = true; }, 2600);
  }

  /* ---------- Work: horizontal rail + ruler ---------- */
  const rail = $('#rail');
  const n = PROJECTS.length;

  function mediaMarkup(p) {
    const m = p.media && p.media[0];
    if (!m) return `<div class="cover"><span>${esc(p.title)}</span></div>`;
    if (m.type === 'video') {
      return `<video src="${esc(m.src)}"${m.poster ? ` poster="${esc(m.poster)}"` : ''} muted loop playsinline preload="metadata" draggable="false" aria-hidden="true"></video>`;
    }
    return `<img src="${esc(m.src)}" alt="${esc(m.alt || p.title)}" loading="lazy" draggable="false">`;
  }

  rail.innerHTML = PROJECTS.map((p, i) => {
    const hasMedia = p.media && p.media.length > 0;
    const media = hasMedia
      ? `<button type="button" class="p-media" data-open="${i}" aria-label="View ${esc(p.title)} larger">${mediaMarkup(p)}</button>`
      : `<div class="p-media">${mediaMarkup(p)}</div>`;
    return `<article class="plate" id="p-${esc(p.id)}">
      ${media}
      <div class="p-cap">
        <h3>${esc(p.title)}</h3>
        <p class="p-meta">${esc(CATS[p.cat])}, ${esc(p.year)}</p>
        <p class="p-tags">${p.tags.map(esc).join(', ')}</p>
        <p class="p-desc">${esc(p.desc)}</p>
      </div>
    </article>`;
  }).join('');

  const plates = $$('.plate', rail);
  const ruler = $('#ruler');
  const ticksEl = $('#ticks');
  const handle = $('#handle');
  const now = $('#ruler-now');
  const prevBtn = $('#r-prev');
  const nextBtn = $('#r-next');
  ruler.style.setProperty('--n', n);

  ticksEl.innerHTML = PROJECTS.map((p, i) =>
    `<button type="button" class="tick${i === n - 1 ? ' last' : ''}" style="left:${n > 1 ? (i / (n - 1)) * 100 : 0}%" data-go="${i}" aria-label="Go to ${esc(p.title)}"><span>${esc(p.title)}</span></button>`
  ).join('');
  const tickEls = $$('.tick', ticksEl);

  const padLeft = () => parseFloat(getComputedStyle(rail).paddingLeft) || 0;
  const maxScroll = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
  const targetOf = i => clamp(plates[i].offsetLeft - padLeft(), 0, maxScroll());

  function fraction() {
    const x = rail.scrollLeft, m = maxScroll();
    if (m <= 0) return 0;
    if (x >= m - 2) return n - 1;
    const t = plates.map((_, i) => targetOf(i));
    for (let i = 0; i < n - 1; i++) {
      if (x >= t[i] && x < t[i + 1]) return i + (x - t[i]) / (t[i + 1] - t[i]);
    }
    return x < t[0] ? 0 : n - 1;
  }

  let railTick = false;
  function updateRuler() {
    railTick = false;
    const f = fraction();
    const active = Math.round(f);
    handle.style.left = `${n > 1 ? (f / (n - 1)) * 100 : 0}%`;
    tickEls.forEach((t, i) => {
      if (i === active) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
    });
    now.textContent = PROJECTS[active].title;
    prevBtn.disabled = active <= 0;
    nextBtn.disabled = active >= n - 1;
  }
  rail.addEventListener('scroll', () => {
    if (!railTick) { railTick = true; requestAnimationFrame(updateRuler); }
  }, { passive: true });
  addEventListener('resize', updateRuler);
  updateRuler();

  function go(i) {
    rail.scrollTo({ left: targetOf(clamp(i, 0, n - 1)), behavior: reduce ? 'auto' : 'smooth' });
  }
  prevBtn.addEventListener('click', () => go(Math.round(fraction()) - 1));
  nextBtn.addEventListener('click', () => go(Math.round(fraction()) + 1));
  ticksEl.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) go(+b.dataset.go);
  });

  // drag to scroll with a mouse
  let down = false, startX = 0, startL = 0, moved = 0;
  rail.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; startX = e.clientX; startL = rail.scrollLeft; moved = 0;
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 4) { rail.classList.add('dragging'); rail.scrollLeft = startL - dx; }
  });
  addEventListener('pointerup', () => { down = false; rail.classList.remove('dragging'); });
  rail.addEventListener('click', e => {
    if (moved > 4) { e.preventDefault(); e.stopPropagation(); moved = 0; }
  }, true);

  // videos play only while mostly in view
  if (!reduce) {
    const vio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const v = en.target;
        if (en.isIntersecting) v.play().catch(() => {}); else v.pause();
      });
    }, { root: rail, threshold: 0.6 });
    $$('.plate video', rail).forEach(v => vio.observe(v));
  }

  /* ---------- Viewer ---------- */
  const viewer = $('#viewer');
  const stage = $('#v-stage');
  let vi = -1, vm = 0, lastFocus = null, closing = false;

  const setHash = h => {
    try { history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search); } catch (e) { /* ignore */ }
  };

  function showMedia() {
    const p = PROJECTS[vi];
    const m = p.media[vm];
    stage.innerHTML = '';
    let el;
    if (m.type === 'video') {
      el = document.createElement('video');
      el.src = m.src;
      if (m.poster) el.poster = m.poster;
      el.autoplay = true; el.loop = true; el.muted = true; el.controls = true; el.playsInline = true;
    } else {
      el = new Image();
      el.src = m.src;
      el.alt = m.alt || p.title;
    }
    stage.appendChild(el);
    const multi = p.media.length > 1;
    $('#v-pager').hidden = !multi;
    $('#v-count').textContent = `${vm + 1} of ${p.media.length}`;
  }

  function openViewer(i, x, y) {
    vi = i; vm = 0;
    lastFocus = document.activeElement;
    $('#v-title').textContent = PROJECTS[i].title;
    $('#v-desc').textContent = PROJECTS[i].desc;
    showMedia();
    viewer.hidden = false;
    root.classList.add('lock');
    if (!reduce) {
      const r = Math.hypot(innerWidth, innerHeight);
      viewer.animate(
        [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }],
        { duration: 700, easing: 'cubic-bezier(.65,0,.35,1)' }
      );
    }
    $('#v-close').focus({ preventScroll: true });
    setHash(PROJECTS[i].id);
  }

  function closeViewer() {
    if (viewer.hidden || closing) return;
    closing = true;
    const finish = anim => {
      if (anim) anim.cancel();
      viewer.hidden = true;
      stage.innerHTML = '';
      root.classList.remove('lock');
      closing = false;
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      setHash('');
    };
    if (reduce) { finish(); return; }
    const a = viewer.animate(
      [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }],
      { duration: 500, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }
    );
    a.onfinish = () => finish(a);
  }

  function stepMedia(d) {
    const len = PROJECTS[vi].media.length;
    if (len < 2) return;
    vm = (vm + d + len) % len;
    showMedia();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const x = e.detail ? e.clientX : r.left + r.width / 2;
    const y = e.detail ? e.clientY : r.top + r.height / 2;
    openViewer(+b.dataset.open, x, y);
  });
  $('#v-close').addEventListener('click', closeViewer);
  $('#v-prev').addEventListener('click', () => stepMedia(-1));
  $('#v-next').addEventListener('click', () => stepMedia(1));

  document.addEventListener('keydown', e => {
    if (viewer.hidden) return;
    if (e.key === 'Escape') { closeViewer(); return; }
    if (e.target.tagName !== 'VIDEO') {
      if (e.key === 'ArrowRight') stepMedia(1);
      if (e.key === 'ArrowLeft') stepMedia(-1);
    }
    if (e.key === 'Tab') {
      const f = $$('button, a[href], video[controls]', viewer).filter(el => el.getClientRects().length);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // open a project directly from a link like #dim-yum
  const fromHash = decodeURIComponent(location.hash.slice(1));
  const hi = PROJECTS.findIndex(p => p.id === fromHash && p.media.length);
  if (hi >= 0) openViewer(hi, innerWidth / 2, innerHeight / 2);

  /* ---------- Contact ---------- */
  const toast = $('#toast');
  let toastTimer;
  function say(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }
  $('#copy-mail').addEventListener('click', async () => {
    const mail = 'yli183@sva.edu';
    try {
      await navigator.clipboard.writeText(mail);
      say('Email copied');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = mail; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { /* ignore */ }
      ta.remove();
      say(ok ? 'Email copied' : mail);
    }
  });
})();
