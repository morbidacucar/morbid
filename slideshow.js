document.addEventListener('DOMContentLoaded', () => {
  const galleryImgs = Array.from(document.querySelectorAll('.gallery-grid img, .project figure img'));
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) { console.warn('Lightbox element not found'); return; }
  const lbImg = lightbox.querySelector('.lightbox-content img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  let current = 0;
  const items = galleryImgs.map((img) => {
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt') || '';
    // Prefer the nearest section header (h2) as the title, fallback to figcaption, then alt
    let caption = '';
    const section = img.closest('section');
    if (section) {
      const h = section.querySelector('h2');
      if (h) caption = h.textContent.trim();
    }
    if (!caption) {
      const fig = img.closest('figure');
      const fc = fig && fig.querySelector('figcaption');
      if (fc) caption = fc.textContent.trim();
    }
    if (!caption) caption = alt;
    return { src, alt, caption };
  });

  if (items.length === 0) { console.warn('No gallery images found for slideshow'); }

  const thumbsContainer = lightbox.querySelector('.lightbox-thumbs');
  let thumbs = [];

  function buildThumbs() {
    if (!thumbsContainer) return;
    thumbsContainer.innerHTML = '';
    items.forEach((it, idx) => {
      const btn = document.createElement('button');
      btn.className = 'thumb';
      btn.type = 'button';
      btn.dataset.index = idx;

      const tn = document.createElement('img');
      tn.src = it.src;
      tn.alt = it.alt || `thumb ${idx+1}`;
      btn.appendChild(tn);

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = it.caption || it.alt || `Piece ${idx+1}`;
      btn.appendChild(title);

      btn.addEventListener('click', (e) => {
        open(Number(btn.dataset.index));
      });

      thumbsContainer.appendChild(btn);
    });
    thumbs = Array.from(thumbsContainer.querySelectorAll('.thumb'));
  }

  function open(index) {
    if (!items.length) return;
    current = index % items.length;
    if (current < 0) current += items.length;
    const it = items[current] || {};
    if (lbImg) lbImg.src = it.src || '';
    if (lbImg) lbImg.alt = it.alt || '';
    if (lbCaption) lbCaption.textContent = it.caption || it.alt || '';
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // highlight active thumb
    if (thumbs.length) {
      thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
      // ensure active thumb visible
      const active = thumbs[current];
      if (active && typeof active.scrollIntoView === 'function') active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }

  function close() {
    lightbox.setAttribute('aria-hidden', 'true');
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  function showNext() { open((current + 1) % items.length); }
  function showPrev() { open((current - 1 + items.length) % items.length); }

  galleryImgs.forEach((img, i) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => { open(i); });
  });

  buildThumbs();

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // click outside image closes
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    }
  });
});
