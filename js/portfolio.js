// ─── Portfolio page: cards, filters, modal ────────────────────────────────

let allProjects = [];
let currentSlide = 0;
let currentMedia = [];

const grid       = document.getElementById('project-grid');
const filterBar  = document.getElementById('filter-bar');
const overlay    = document.getElementById('modal-overlay');
const modalImg    = document.getElementById('modal-img');
const modalIframe = document.getElementById('modal-iframe');
const modalPrev  = document.getElementById('modal-prev');
const modalNext  = document.getElementById('modal-next');
const modalCount = document.getElementById('modal-count');
const modalTitle = document.getElementById('modal-title');
const modalDesc  = document.getElementById('modal-desc');
const modalTags  = document.getElementById('modal-tags');
const modalTools = document.getElementById('modal-tools');
const modalLink  = document.getElementById('modal-link');

// ─── Load ─────────────────────────────────────────────────────────────────
const PROJECTS_URL = new URL('projects.json', location.href).href;

if (location.protocol === 'file:') {
  grid.innerHTML = '<p style="color:var(--text-muted);padding:24px 0">Open the site via a local server (e.g. <code>python -m http.server</code>) — <code>fetch()</code> is blocked on <code>file://</code>.</p>';
} else {
  fetch(PROJECTS_URL)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${PROJECTS_URL}`);
      return r.json();
    })
    .then(projects => {
      allProjects = projects;
      renderCards(projects);
      buildFilters(projects);
      handleHash();
    })
    .catch(err => {
      console.error('[portfolio] Failed to load projects.json:', err);
      grid.innerHTML = `<p style="color:var(--text-muted);padding:24px 0">Could not load projects — check the console for details.</p>`;
    });
}

// ─── Cards ────────────────────────────────────────────────────────────────
function renderCards(projects) {
  grid.innerHTML = projects.map(p => {
    const tags = p.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');
    return `
      <article class="card" data-id="${p.id}" data-tags='${JSON.stringify(p.tags)}'>
        <img class="card-thumb" src="${p.thumbnail}" alt="${p.title}" loading="lazy">
        <div class="card-body">
          <h3 class="card-title">${p.title}</h3>
          <p class="card-desc">${p.shortDescription}</p>
          <div class="tag-row">${tags}</div>
        </div>
      </article>`;
  }).join('');

  grid.querySelectorAll('.card').forEach(el => {
    el.addEventListener('click', () => openModal(el.dataset.id));
  });
}

// ─── Filters ──────────────────────────────────────────────────────────────
function buildFilters(projects) {
  const tags = ['All', ...new Set(projects.flatMap(p => p.tags))];
  filterBar.innerHTML = tags.map(t =>
    `<button class="filter-btn${t === 'All' ? ' active' : ''}" data-tag="${t}">${t}</button>`
  ).join('');

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tag = btn.dataset.tag;
    grid.querySelectorAll('.card').forEach(card => {
      const cardTags = JSON.parse(card.dataset.tags);
      card.classList.toggle('hidden', tag !== 'All' && !cardTags.includes(tag));
    });
  });
}

// ─── Modal open/close ─────────────────────────────────────────────────────
function openModal(id) {
  const p = allProjects.find(x => x.id === id);
  if (!p) return;

  currentMedia = p.media || [];
  currentSlide = 0;

  // slideshow
  updateSlide();
  const single = currentMedia.length <= 1;
  modalPrev.style.display = single ? 'none' : 'flex';
  modalNext.style.display = single ? 'none' : 'flex';
  modalCount.style.display = single ? 'none' : 'block';

  // text
  modalTitle.textContent = p.title;
  modalDesc.innerHTML    = p.fullDescription
    .split('\n\n')
    .map(chunk => `<p>${chunk}</p>`)
    .join('');
  modalTags.innerHTML    = p.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');
  modalTools.innerHTML   = p.tools.map(t => `<span class="tool-chip">${t}</span>`).join('');

  if (p.link && p.link !== '#') {
    modalLink.href = p.link;
    modalLink.style.display = 'inline-flex';
  } else {
    modalLink.style.display = 'none';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  history.replaceState(null, '', `#${id}`);
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  modalIframe.src = '';
  history.replaceState(null, '', location.pathname);
}

// ─── Slideshow ────────────────────────────────────────────────────────────
function extractYouTubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

function updateSlide() {
  if (!currentMedia.length) return;
  const item = currentMedia[currentSlide];
  const isYT = typeof item === 'object' && item.type === 'youtube';

  if (isYT) {
    modalIframe.src = `https://www.youtube.com/embed/${extractYouTubeId(item.url)}?rel=0`;
    modalIframe.style.display = 'block';
    modalImg.style.display    = 'none';
  } else {
    modalIframe.src           = '';
    modalImg.src              = typeof item === 'string' ? item : item.url;
    modalImg.style.display    = 'block';
    modalIframe.style.display = 'none';
  }

  modalCount.textContent = `${currentSlide + 1} / ${currentMedia.length}`;
}

modalPrev.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + currentMedia.length) % currentMedia.length;
  updateSlide();
});
modalNext.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % currentMedia.length;
  updateSlide();
});

// ─── Close triggers ───────────────────────────────────────────────────────
document.getElementById('modal-close').addEventListener('click', closeModal);

overlay.addEventListener('click', e => {
  if (e.target === overlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (!overlay.classList.contains('open')) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft')  { currentSlide = (currentSlide - 1 + currentMedia.length) % currentMedia.length; updateSlide(); }
  if (e.key === 'ArrowRight') { currentSlide = (currentSlide + 1) % currentMedia.length; updateSlide(); }
});

// ─── Deep-link via hash ───────────────────────────────────────────────────
function handleHash() {
  const id = location.hash.slice(1);
  if (id) openModal(id);
}
