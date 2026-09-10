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
    if (!shows.length) return;

    const spotlight = document.getElementById('spotlight');
    const headingEl = document.getElementById('spotlight-heading');
    if (!spotlight) return;

    const liveShows = shows.filter(s => effectiveStatus(s) === 'live');

    if (liveShows.length > 1) {
      // More than one show running at once — switch to a grid of cards
      // instead of the single big spotlight, and pluralize the heading.
      if (headingEl) headingEl.textContent = 'Current Productions';
      spotlight.className = 'show-grid';
      spotlight.innerHTML = liveShows.map(renderShowCard).join('');
    } else {
      if (headingEl) headingEl.textContent = 'Current Production';
      spotlight.className = 'spotlight';
      const current = liveShows[0] || shows[0];
      const status = effectiveStatus(current);
      const statusLabel = { live: "Now Playing", soon: "Coming Soon", past: "Recent Run" }[status] || "Featured";

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
          ${status !== 'past' && current.ticketUrl ? `<a class="btn btn-blue" href="${current.ticketUrl}">Get Tickets</a>` : ''}
          ${status !== 'past' && current.trailerUrl ? `<a class="btn btn-mint" href="${current.trailerUrl}" target="_blank" rel="noopener">Watch Trailer</a>` : ''}
          <a class="btn btn-outline" href="/productions.html">All Productions</a>
        </div>
      `;
    }

    const marquee = document.getElementById('marquee-track');
    if (marquee) {
      const names = [...new Set(shows.map(s => s.title))];
      // Shows added around the same time (e.g. multiple runs of similar
      // titles) tend to sit next to each other in the CMS list, so shuffle
      // before looping to spread similar-sounding titles apart in the ticker.
      for (let i = names.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [names[i], names[j]] = [names[j], names[i]];
      }
      const looped = [...names, ...names, ...names];
      marquee.innerHTML = looped.map(n => `${n} <span>&bull;</span>`).join(' ');

      // Keep a constant scroll speed no matter how many shows are in the
      // ticker — duration scales with content width instead of being fixed,
      // so it doesn't speed up every time a new show gets added. Wait for
      // the display font to finish loading first, otherwise this measures
      // the wider fallback-font text and picks the wrong duration.
      const setMarqueeSpeed = () => {
        const PIXELS_PER_SECOND = 85;
        const duration = Math.max(20, marquee.scrollWidth / PIXELS_PER_SECOND);
        marquee.style.animationDuration = `${duration}s`;
      };
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(setMarqueeSpeed);
      } else {
        setMarqueeSpeed();
      }
    }
  } catch (e) { console.error(e); }
});
