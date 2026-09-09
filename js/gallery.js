// Gallery page: renders the photo grid from content/gallery.json.
document.addEventListener('DOMContentLoaded', async () => {
  const gridEl = document.getElementById('gallery-grid');
  if (!gridEl) return;

  try {
    const { photos } = await fetchJSON('/content/gallery.json');
    if (!photos.length) {
      gridEl.innerHTML = `<div class="empty-state">Add your first photo in the CMS — Gallery collection.</div>`;
      return;
    }
    gridEl.innerHTML = photos.map(p => `
      <figure class="gallery-item">
        <div class="gallery-item__photo"><img src="${p.image}" alt="${p.caption}" loading="lazy"></div>
        <figcaption class="gallery-item__caption">${p.caption}</figcaption>
      </figure>
    `).join('');
  } catch (e) {
    gridEl.innerHTML = `<div class="empty-state">Couldn't load the gallery right now.</div>`;
  }
});
