/* Kartikkumar Bagilavaidya — portfolio interactions */
(function () {
  'use strict';

  const sections = Array.from(document.querySelectorAll('.page-section'));
  const navLinks = Array.from(document.querySelectorAll('[data-page]'));
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryStatus = document.getElementById('gallery-status');
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const modalClose = document.querySelector('.modal-close');
  document.getElementById('year').textContent = new Date().getFullYear();

  function showPage(name) {
    const target = document.getElementById(name) || document.getElementById('home');
    sections.forEach(section => section.classList.toggle('active-section', section === target));
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.page === target.id));
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigate(event) {
    const name = event.currentTarget.dataset.page;
    if (!name) return;
    event.preventDefault();
    history.pushState({ page: name }, '', '#' + name);
    showPage(name);
    if (name === 'gallery') loadGallery();
  }

  navLinks.forEach(link => link.addEventListener('click', navigate));
  window.addEventListener('popstate', () => showPage(location.hash.replace('#', '') || 'home'));
  navToggle.addEventListener('click', event => {
    event.stopPropagation();
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.main-nav')) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  async function loadGallery() {
    if (galleryGrid.dataset.loaded === 'true') return;
    galleryStatus.textContent = 'Loading photographs…';

    try {
      // The manifest is generated automatically from img/gallery/.
      // This keeps the site fully static and compatible with GitHub Pages,
      // Cloudflare Pages, Netlify, Vercel, and other static hosts.
      const response = await fetch('gallery.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`gallery.json returned ${response.status}`);

      const files = await response.json();
      const names = Array.isArray(files)
        ? files
            .filter(name => typeof name === 'string')
            .filter(name => /\.(jpe?g|png|gif|webp|avif)$/i.test(name))
        : [];

      if (!names.length) throw new Error('No images found in gallery.json');

      renderGallery(names);
      galleryGrid.dataset.loaded = 'true';
      galleryStatus.textContent = `${names.length} images in the gallery.`;
    } catch (error) {
      console.error('Gallery loading error:', error);
      galleryStatus.innerHTML = 'The gallery manifest could not be loaded. Run <code>python3 tools/generate_gallery.py</code> once, then reload the page.';
    }
  }

  function renderGallery(names) {
    galleryGrid.innerHTML = '';
    names.forEach(name => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-item';
      const img = document.createElement('img');
      img.src = encodeURI(name);
      img.alt = 'Gallery photograph';
      img.loading = 'lazy';
      img.decoding = 'async';
      figure.appendChild(img);
      figure.addEventListener('click', () => openModal(img.src, img.alt));
      galleryGrid.appendChild(figure);
    });
  }

  function openModal(src, alt) {
    modalImg.src = src;
    modalImg.alt = alt || 'Gallery image';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });

  const initial = location.hash.replace('#', '') || 'home';
  showPage(initial);
  if (initial === 'gallery') loadGallery();
})();
