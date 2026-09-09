// Staff page: renders the founders from content/staff.json as a feature
// layout (not a directory grid — this is a two-person, founder-run team).
document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('founders-list');
  if (!listEl) return;

  try {
    const { staff } = await fetchJSON('/content/staff.json');
    if (!staff.length) {
      listEl.innerHTML = `<div class="empty-state">Add your team in the CMS (Staff collection).</div>`;
      return;
    }
    listEl.innerHTML = staff.map(p => `
      <div class="founder">
        <div class="founder__photo"><img src="${p.photo}" alt="${p.name}" loading="lazy"></div>
        <div>
          <div class="founder__name">${p.name}</div>
          <span class="founder__role">${p.role}</span>
          <p class="founder__bio">${p.bio}</p>
        </div>
      </div>
    `).join('');
  } catch (e) {
    listEl.innerHTML = `<div class="empty-state">Couldn't load the team right now.</div>`;
  }
});
