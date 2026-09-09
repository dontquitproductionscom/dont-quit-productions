// Productions page: year tab filter + show grid, all driven by content/shows.json.
document.addEventListener('DOMContentLoaded', async () => {
  const tabsEl = document.getElementById('year-tabs');
  const gridEl = document.getElementById('show-grid');
  if (!tabsEl || !gridEl) return;

  let shows = [];
  try {
    ({ shows } = await fetchJSON('/content/shows.json'));
  } catch (e) {
    gridEl.innerHTML = `<div class="empty-state">Couldn't load productions right now.</div>`;
    return;
  }

  const years = ['All', ...Array.from(new Set(shows.map(s => s.year))).sort((a, b) => b - a)];

  const badgeLabel = { live: 'Now Playing', soon: 'Coming Soon', past: 'Past Run' };

  function render(year) {
    const filtered = year === 'All' ? shows : shows.filter(s => s.year === year);

    tabsEl.innerHTML = years.map(y =>
      `<button class="filter-tab ${y === year ? 'is-active' : ''}" data-year="${y}">${y}</button>`
    ).join('');

    if (!filtered.length) {
      gridEl.innerHTML = `<div class="empty-state">No shows added for ${year} yet. Add one in the CMS.</div>`;
      return;
    }

    gridEl.innerHTML = filtered.map(s => `
      <article class="show-card">
        <div class="show-card__poster"><img src="${s.poster}" alt="${s.title} poster" loading="lazy"></div>
        <div class="show-card__body">
          <h3 class="show-card__title">${s.title}</h3>
          <p class="show-card__tagline">${s.tagline}</p>
          <div class="show-card__meta">
            <div>${ICON_PIN} ${s.venue}</div>
            <div>${ICON_CALENDAR} ${s.dates}</div>
          </div>
          <div class="show-card__footer">
            <span class="badge badge--${s.status}">${badgeLabel[s.status] || s.status}</span>
            ${s.status !== 'past' ? `<a class="btn btn-blue" href="${s.ticketUrl}" style="padding:0.5rem 1.1rem;font-size:0.8rem;">Tickets</a>` : ''}
          </div>
        </div>
      </article>
    `).join('');
  }

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tab');
    if (btn) render(btn.dataset.year);
  });

  render('All');
});
