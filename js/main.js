// ─── Social footer links (sourced from config.js) ────────────────────────
document.querySelectorAll('.footer-icon[aria-label="GitHub"]')
  .forEach(a => a.href = SITE_CONFIG.social.github);
document.querySelectorAll('.footer-icon[aria-label="LinkedIn"]')
  .forEach(a => a.href = SITE_CONFIG.social.linkedin);

// ─── Active nav link ─────────────────────────────────────────────────────
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
})();

// ─── Featured cards (home page only) ─────────────────────────────────────
const featuredGrid = document.getElementById('featured-grid');
if (featuredGrid) {
  const PROJECTS_URL = new URL('projects.json', location.href).href;
  fetch(PROJECTS_URL)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${PROJECTS_URL}`);
      return r.json();
    })
    .then(projects => {
      const featured = projects.filter(p => p.featured);
      featuredGrid.innerHTML = featured.map(p => cardHTML(p)).join('');
      featuredGrid.querySelectorAll('.card').forEach((el, i) => {
        el.addEventListener('click', () => {
          location.href = `portfolio.html#${featured[i].id}`;
        });
      });
    })
    .catch(err => {
      console.error('[main] Failed to load projects.json:', err);
      featuredGrid.innerHTML = `<p style="color:var(--text-muted)">Could not load projects — check the console for details.</p>`;
    });
}

function cardHTML(p, isHome) {
  const tags = p.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');
  return `
    <article class="card" data-id="${p.id}">
      <img class="card-thumb" src="${p.thumbnail}" alt="${p.title}" loading="lazy">
      <div class="card-body">
        <h3 class="card-title">${p.title}</h3>
        <p class="card-desc">${p.shortDescription}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}
