// Gallery page: hero copy from content/site.json (the photo feed itself is
// the Behold Instagram embed, set directly in gallery.html).
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const site = await fetchJSON('/content/site.json');
    const el = (id) => document.getElementById(id);

    if (el('gallery-eyebrow')) el('gallery-eyebrow').textContent = site.galleryEyebrow;
    if (el('gallery-title')) el('gallery-title').textContent = site.galleryTitle;
    if (el('gallery-intro')) el('gallery-intro').textContent = site.galleryIntro;
  } catch (e) { console.error(e); }
});
