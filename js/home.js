// Home page: hero copy, marquee, and the current-show spotlight.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const site = await fetchJSON('/content/site.json');
    const el = (id) => document.getElementById(id);

    if (el('hero-eyebrow')) el('hero-eyebrow').textContent = site.heroEyebrow;
    if (el('hero-title')) el('hero-title').innerHTML = site.heroTitle;
    if (el('hero-sub')) el('hero-sub').textContent = site.heroSub;
    if (el('mission-eyebrow')) el('mission-eyebrow').textContent = site.missionEyebrow;
    if (el('mission-title')) el('mission-title').textContent = site.missionTitle;
    if (el('mission-body')) el('mission-body').textContent = site.missionBody;
  } catch (e) { console.error(e); }

  try {
    const { shows } = await fetchJSON('/content/shows.json');
    const current = shows.find(s => s.status === 'live') || shows[0];
    if (!current) return;

    const spotlight = document.getElementById('spotlight');
    if (!spotlight) return;

    const statusLabel = { live: "Now Playing", soon: "Coming Soon", past: "Recent Run" }[current.status] || "Featured";

    spotlight.innerHTML = `
      <div class="spotlight__poster"><img src="${current.poster}" alt="${current.title} poster"></div>
      <div>
        <span class="spotlight__status">${statusLabel}</span>
        <h3 class="spotlight__title">${current.title}</h3>
        <p>${current.tagline}</p>
        <div class="spotlight__meta">
          <div>${ICON_PIN} ${current.venue}</div>
          <div>${ICON_CALENDAR} ${current.dates}</div>
        </div>
        ${current.status !== 'past' ? `<a class="btn btn-blue" href="${current.ticketUrl}">Get Tickets</a>` : ''}
        <a class="btn btn-outline" href="/productions.html">All Productions</a>
      </div>
    `;

    const marquee = document.getElementById('marquee-track');
    if (marquee) {
      const names = [...new Set(shows.map(s => s.title))];
      const looped = [...names, ...names, ...names];
      marquee.innerHTML = looped.map(n => `${n} <span>&bull;</span>`).join(' ');
    }
  } catch (e) { console.error(e); }
});
