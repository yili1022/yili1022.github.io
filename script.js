document.getElementById('year').textContent = new Date().getFullYear();

// Dark mode
const root = document.documentElement;
try {
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
} catch (e) {}
document.getElementById('theme-toggle').addEventListener('click', () => {
  const dark = root.getAttribute('data-theme') === 'dark' ||
    (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  const next = dark ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
});

// Category filter
const works = document.querySelectorAll('.work');
// If data-img is set, use the real image as the thumbnail
works.forEach(w => {
  if (w.dataset.img) {
    w.querySelector('.thumb').style.backgroundImage = `url("${w.dataset.img}")`;
  }
});
document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    works.forEach(w => { w.hidden = !(f === 'all' || w.dataset.cat === f); });
  });
});

// Lightbox
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
works.forEach(w => {
  w.addEventListener('click', () => {
    const img = w.dataset.img;
    const thumb = w.querySelector('.thumb');
    lbImg.style.backgroundImage = img ? `url("${img}")` : getComputedStyle(thumb).backgroundImage;
    document.getElementById('lb-title').textContent = w.dataset.title;
    document.getElementById('lb-desc').textContent = w.dataset.desc;
    lb.hidden = false;
  });
});
const closeLb = () => { lb.hidden = true; };
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('close')) closeLb(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
