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

  function render(year) {
    const filtered = year === 'All' ? shows : shows.filter(s => s.year === year);

    tabsEl.innerHTML = years.map(y =>
      `<button class="filter-tab ${y === year ? 'is-active' : ''}" data-year="${y}">${y}</button>`
    ).join('');

    if (!filtered.length) {
      gridEl.innerHTML = `<div class="empty-state">No shows added for ${year} yet. Add one in the CMS.</div>`;
      return;
    }

    gridEl.innerHTML = filtered.map(renderShowCard).join('');
  }

  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tab');
    if (btn) render(btn.dataset.year);
  });

  render('All');
});
