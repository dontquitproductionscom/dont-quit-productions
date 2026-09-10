// One-off build script: bundles the real site's CSS, fonts, images, and
// content JSON into a single self-contained HTML file for an Artifact preview
// (so it can be viewed/shared without deploying to Netlify).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const scratch = process.argv[2];
if (!scratch) { console.error('usage: node build-preview.js <scratch-dir>'); process.exit(1); }

const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
const site = JSON.parse(fs.readFileSync(path.join(root, 'content', 'site.json'), 'utf8'));
const showsData = JSON.parse(fs.readFileSync(path.join(root, 'content', 'shows.json'), 'utf8'));
const staff = JSON.parse(fs.readFileSync(path.join(root, 'content', 'staff.json'), 'utf8'));
const gallery = JSON.parse(fs.readFileSync(path.join(root, 'content', 'gallery.json'), 'utf8'));

const logoB64 = fs.readFileSync(path.join(scratch, 'logo.b64'), 'utf8').trim();
const markB64 = fs.readFileSync(path.join(scratch, 'mark.b64'), 'utf8').trim();

const LOGO_URI = `data:image/png;base64,${logoB64}`;
const MARK_URI = `data:image/png;base64,${markB64}`;

const shows = showsData.shows;
const current = shows.find(s => s.status === 'live') || shows[0];
const currentStatusLabel = { live: 'Now Playing', soon: 'Coming Soon', past: 'Recent Run' }[current.status] || 'Featured';
const marqueeNames = [...new Set(shows.map(s => s.title))];
const marqueeLooped = [...marqueeNames, ...marqueeNames, ...marqueeNames].map(n => `${n} <span>&bull;</span>`).join(' ');

const ICON_PIN = '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>';
const ICON_CALENDAR = '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>';
const ICON_INSTAGRAM = '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.054-.058 1.37-.058 4.04 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.858.344 1.053.048 1.37.058 4.04.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.858.048-1.053.058-1.37.058-4.04 0-2.67-.01-2.986-.058-4.04-.045-.975-.207-1.504-.344-1.857a3.09 3.09 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.858-.344-1.053-.048-1.37-.058-4.04-.058zm0 4.595a5.603 5.603 0 1 1 0 11.206 5.603 5.603 0 0 1 0-11.206zm0 1.802a3.8 3.8 0 1 0 0 7.601 3.8 3.8 0 0 0 0-7.601zm5.85-1.802a1.309 1.309 0 1 1-2.618 0 1.309 1.309 0 0 1 2.618 0z"/></svg>';
const ICON_TIKTOK = '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>';
const ICON_YOUTUBE = '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';

const socials = [
  { key: 'instagram', label: 'Instagram', icon: ICON_INSTAGRAM },
  { key: 'tiktok', label: 'TikTok', icon: ICON_TIKTOK },
  { key: 'youtube', label: 'YouTube', icon: ICON_YOUTUBE },
].filter(s => site[s.key]);
const socialLinksHTML = socials.map(s => `<a href="${site[s.key]}" target="_blank" rel="noopener" aria-label="${s.label}">${s.icon}</a>`).join('');

function founderCard(p) {
  return `
      <div class="founder">
        <div class="founder__photo"><img src="${MARK_URI}" alt="${p.name}" loading="lazy"></div>
        <div>
          <div class="founder__name">${p.name}</div>
          <span class="founder__role">${p.role}</span>
          <p class="founder__bio">${p.bio}</p>
        </div>
      </div>`;
}

function galleryItem(p) {
  return `
      <figure class="gallery-item">
        <div class="gallery-item__photo"><img src="${MARK_URI}" alt="${p.caption}" loading="lazy"></div>
        <figcaption class="gallery-item__caption">${p.caption}</figcaption>
      </figure>`;
}

const html = `<title>Don't Quit Productions</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&family=Permanent+Marker&display=swap" rel="stylesheet">
<style>
${css}

/* ---------- preview-only additions ---------- */
.page-section { display: none; }
.page-section.is-active { display: block; }
.nav__links a { cursor: pointer; }
.preview-badge {
  position: fixed;
  bottom: 18px;
  right: 18px;
  z-index: 200;
  background: var(--red);
  color: var(--cream);
  font-family: var(--font-marker);
  text-transform: uppercase;
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 3px solid var(--navy);
  transform: rotate(-3deg);
  box-shadow: 4px 4px 0 var(--navy);
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 70px;
  transform: translateX(-50%) translateY(20px);
  background: var(--cream);
  color: var(--navy);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  z-index: 210;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  border: 3px solid var(--navy);
}
.toast.is-shown { opacity: 1; transform: translateX(-50%) translateY(0); }
body { min-height: 100vh; }
</style>

<header class="site-header">
  <div class="wrap nav">
    <a class="nav__logo" onclick="goTo('home')"><img src="${LOGO_URI}" alt="Don't Quit Productions"></a>
    <button class="nav__toggle" aria-label="Toggle menu" onclick="document.querySelector('.nav__links').classList.toggle('is-open')"><span></span><span></span><span></span></button>
    <ul class="nav__links">
      <li><a data-page="home" class="is-active" onclick="goTo('home')">Home</a></li>
      <li><a data-page="productions" onclick="goTo('productions')">Productions</a></li>
      <li><a data-page="gallery" onclick="goTo('gallery')">Gallery</a></li>
      <li><a data-page="about" onclick="goTo('about')">About / Contact</a></li>
      <li><a data-page="staff" onclick="goTo('staff')">Staff</a></li>
    </ul>
  </div>
</header>

<!-- ============ HOME ============ -->
<div class="page-section is-active" id="page-home">
  <section class="hero">
    <div class="wrap">
      <span class="hero__eyebrow">${site.heroEyebrow}</span>
      <h1>${site.heroTitle}</h1>
      <p class="hero__sub">${site.heroSub}</p>
      <div class="hero__ctas">
        <button class="btn btn-red" onclick="goTo('productions')">See Current Shows</button>
        <button class="btn btn-mint" onclick="goTo('about')">Pitch a Show</button>
      </div>
    </div>
  </section>

  <div class="marquee">
    <div class="marquee__track" id="marquee-track">${marqueeLooped}</div>
  </div>

  <section>
    <div class="wrap">
      <div class="section-head">
        <div>
          <span class="eyebrow">On stage now</span>
          <h2>Current Production</h2>
        </div>
      </div>
      <div class="spotlight">
        <div class="spotlight__poster"><img src="${MARK_URI}" alt="${current.title}"></div>
        <div>
          <span class="spotlight__status">${currentStatusLabel}</span>
          <h3 class="spotlight__title">${current.title}</h3>
          <p>${current.tagline}</p>
          <div class="spotlight__meta">
            <div>${ICON_PIN} ${current.venue}</div>
            <div>${ICON_CALENDAR} ${current.dates}</div>
          </div>
          ${current.status !== 'past' ? '<button class="btn btn-blue" onclick="previewNote()">Get Tickets</button>' : ''}
          <button class="btn btn-outline" onclick="goTo('productions')">All Productions</button>
        </div>
      </div>
    </div>
  </section>

  <section class="section--navy">
    <div class="wrap mission">
      <div>
        <span class="eyebrow">${site.missionEyebrow}</span>
        <h2>${site.missionTitle}</h2>
        <p class="mt-2">${site.missionBody}</p>
        <button class="btn btn-blue" onclick="goTo('about')">More About Us</button>
      </div>
      <div>
        <div class="mission__stat">100%</div>
        <p>independent, artist-first, and always looking for the next spectacular idea.</p>
      </div>
    </div>
  </section>
</div>

<!-- ============ PRODUCTIONS ============ -->
<div class="page-section" id="page-productions">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow">Every show, every year</span>
      <h1>Productions</h1>
      <p>Current runs, upcoming shows, and everything we've staged since 2024.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="wrap">
      <div class="year-tabs" id="year-tabs"></div>
      <div class="show-grid" id="show-grid"></div>
    </div>
  </section>
</div>

<!-- ============ GALLERY ============ -->
<div class="page-section" id="page-gallery">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow">Behind the scenes</span>
      <h1>Gallery</h1>
      <p>Moments from our shows, rehearsals, and everything in between.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="wrap">
      <div class="gallery-grid">${gallery.photos.map(galleryItem).join('')}
      </div>
    </div>
  </section>
</div>

<!-- ============ ABOUT ============ -->
<div class="page-section" id="page-about">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow">Who we are</span>
      <h1>About Us</h1>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="wrap mission">
      <div>
        <span class="eyebrow">${site.missionEyebrow}</span>
        <h2>${site.missionTitle}</h2>
        <p class="mt-2">${site.missionBody}</p>
      </div>
      <div class="mission__stat">100%<p style="font-family:var(--font-body);font-size:1rem;color:var(--cream);">independent, artist-first, always looking for the next spectacular idea.</p></div>
    </div>
  </section>
  <section class="section--navy">
    <div class="wrap">
      <div class="pitch-box">
        <h3>${site.pitchTitle}</h3>
        <p>${site.pitchBody}</p>
        <form class="contact-form" onsubmit="previewNote(); return false;">
          <div class="field-row">
            <div><label for="p-name">Name</label><input id="p-name" type="text" required></div>
            <div><label for="p-email">Email</label><input id="p-email" type="email" required></div>
          </div>
          <div>
            <label for="p-type">Type of show</label>
            <select id="p-type"><option>Improv</option><option>Sketch</option><option>Variety</option><option>Film</option><option>Other</option></select>
          </div>
          <div>
            <label for="p-message">Tell us about it</label>
            <textarea id="p-message" required placeholder="Give us the pitch, even if it's just a seed of an idea."></textarea>
          </div>
          <button type="submit" class="btn btn-red">Send Pitch</button>
        </form>
      </div>
    </div>
  </section>
  <section>
    <div class="wrap">
      <div class="pitch-box pitch-box--support">
        <span class="eyebrow">${site.supportEyebrow}</span>
        <h3>${site.supportTitle}</h3>
        <p>${site.supportBody}</p>
        <button class="btn btn-red" onclick="previewNote()">${site.supportButtonLabel}</button>
      </div>
    </div>
  </section>
</div>

<!-- ============ FOUNDERS ============ -->
<div class="page-section" id="page-staff">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow">Founder-run, artist-first</span>
      <h1>Staff</h1>
      <p>Two people, one mission: give independent artists a stage they wouldn't otherwise get.</p>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="wrap">
      <div class="founders">${staff.staff.map(founderCard).join('')}
      </div>
    </div>
  </section>
</div>

<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <h2>Got a show in you? Let's make it happen.</h2>
      <ul class="footer-links">
        <li><a onclick="goTo('home')">Home</a></li>
        <li><a onclick="goTo('productions')">Productions</a></li>
        <li><a onclick="goTo('gallery')">Gallery</a></li>
        <li><a onclick="goTo('about')">About / Contact</a></li>
        <li><a onclick="goTo('staff')">Staff</a></li>
      </ul>
    </div>
    <div class="footer-bottom">
      <span>Don't Quit Productions &bull; Since 2024</span>
      <div class="footer-links">${socialLinksHTML}</div>
      <span>&copy; <span id="footer-year"></span> Don't Quit Productions</span>
    </div>
  </div>
</footer>

<div class="preview-badge">Design Preview &middot; Not Live Yet</div>
<div class="toast" id="toast">This action goes live once the real site is deployed</div>

<script>
document.getElementById('footer-year').textContent = new Date().getFullYear();

(function() {
  var track = document.getElementById('marquee-track');
  if (!track) return;
  function setSpeed() {
    var PIXELS_PER_SECOND = 70;
    var duration = Math.max(20, track.scrollWidth / PIXELS_PER_SECOND);
    track.style.animationDuration = duration + 's';
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setSpeed);
  } else {
    setSpeed();
  }
})();

function goTo(page) {
  document.querySelectorAll('.page-section').forEach(function(el){ el.classList.remove('is-active'); });
  document.getElementById('page-' + page).classList.add('is-active');
  document.querySelectorAll('.nav__links a').forEach(function(a){ a.classList.toggle('is-active', a.dataset.page === page); });
  document.querySelector('.nav__links').classList.remove('is-open');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

let toastTimer;
function previewNote() {
  const t = document.getElementById('toast');
  t.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('is-shown'); }, 2200);
}

var shows = ${JSON.stringify(shows)};
var activeYear = 'All';
var years = ['All'].concat(Array.from(new Set(shows.map(function(s){ return s.year; }))).sort(function(a,b){ return b - a; }));
var badgeLabel = { live: 'Now Playing', soon: 'Coming Soon', past: 'Past Run' };
var iconPin = '${ICON_PIN}';
var iconCalendar = '${ICON_CALENDAR}';

function renderShows() {
  document.getElementById('year-tabs').innerHTML = years.map(function(y){
    return '<button class="filter-tab ' + (y === activeYear ? 'is-active' : '') + '" onclick="setYear(\\'' + y + '\\')">' + y + '</button>';
  }).join('');

  var filtered = activeYear === 'All' ? shows : shows.filter(function(s){ return s.year === activeYear; });
  var grid = document.getElementById('show-grid');
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state">No shows added for ' + activeYear + ' yet.</div>';
    return;
  }
  grid.innerHTML = filtered.map(function(s){
    return '<article class="show-card">' +
      '<div class="show-card__poster"><img src="${MARK_URI}" alt="' + s.title + ' poster" loading="lazy"></div>' +
      '<div class="show-card__body">' +
        '<h3 class="show-card__title">' + s.title + '</h3>' +
        '<p class="show-card__tagline">' + s.tagline + '</p>' +
        '<div class="show-card__meta"><div>' + iconPin + ' ' + s.venue + '</div><div>' + iconCalendar + ' ' + s.dates + '</div></div>' +
        '<div class="show-card__footer">' +
          '<span class="badge badge--' + s.status + '">' + (badgeLabel[s.status] || s.status) + '</span>' +
          (s.status !== 'past' ? '<button class="btn btn-blue" style="padding:0.5rem 1.1rem;font-size:0.8rem;" onclick="previewNote()">Tickets</button>' : '') +
        '</div>' +
      '</div>' +
    '</article>';
  }).join('');
}

function setYear(y) { activeYear = y; renderShows(); }
renderShows();
</script>
`;

fs.writeFileSync(path.join(scratch, 'dqp-preview.html'), html);
console.log('wrote', path.join(scratch, 'dqp-preview.html'), html.length, 'bytes');
