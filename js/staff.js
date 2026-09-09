// Staff page: renders the team grid from content/staff.json.
document.addEventListener('DOMContentLoaded', async () => {
  const gridEl = document.getElementById('staff-grid');
  if (!gridEl) return;

  try {
    const { staff } = await fetchJSON('/content/staff.json');
    if (!staff.length) {
      gridEl.innerHTML = `<div class="empty-state">Add your team in the CMS (Staff collection).</div>`;
      return;
    }
    gridEl.innerHTML = staff.map(p => `
      <div class="staff-card">
        <div class="staff-card__photo"><img src="${p.photo}" alt="${p.name}" loading="lazy"></div>
        <div class="staff-card__name">${p.name}</div>
        <span class="staff-card__role">${p.role}</span>
        <p class="staff-card__bio">${p.bio}</p>
      </div>
    `).join('');
  } catch (e) {
    gridEl.innerHTML = `<div class="empty-state">Couldn't load the team right now.</div>`;
  }
});
