// Color-exploration build: same bundling as build-preview.js, plus a live
// swatch picker that swaps the site's CSS custom properties in real time.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const scratch = process.argv[2];
if (!scratch) { console.error('usage: node build-preview-colors.js <scratch-dir>'); process.exit(1); }

const css = fs.readFileSync(path.join(root, 'css', 'style.css'), 'utf8');
const site = JSON.parse(fs.readFileSync(path.join(root, 'content', 'site.json'), 'utf8'));
const showsData = JSON.parse(fs.readFileSync(path.join(root, 'content', 'shows.json'), 'utf8'));
const staff = JSON.parse(fs.readFileSync(path.join(root, 'content', 'staff.json'), 'utf8'));

const fontB64 = fs.readFileSync(path.join(scratch, 'font.b64'), 'utf8').trim();
const logoB64 = fs.readFileSync(path.join(scratch, 'logo.b64'), 'utf8').trim();
const markB64 = fs.readFileSync(path.join(scratch, 'mark.b64'), 'utf8').trim();

const LOGO_URI = `data:image/png;base64,${logoB64}`;
const MARK_URI = `data:image/png;base64,${markB64}`;

const cssPatched = css.replace(
  /@font-face \{[\s\S]*?\}/,
  `@font-face {\n  font-family: 'Offset';\n  src: url('data:font/woff2;base64,${fontB64}') format('woff2');\n  font-weight: 400;\n  font-style: normal;\n  font-display: swap;\n}`
);

const shows = showsData.shows;
const current = shows.find(s => s.status === 'live') || shows[0];
const currentStatusLabel = { live: 'Now Playing', soon: 'Coming Soon', past: 'Recent Run' }[current.status] || 'Featured';
const marqueeNames = [...shows.map(s => s.title)];
const marqueeLooped = [...marqueeNames, ...marqueeNames, ...marqueeNames].map(n => `${n} <span>&bull;</span>`).join(' ');

function staffCard(p) {
  return `
      <div class="staff-card">
        <div class="staff-card__photo"><img src="${MARK_URI}" alt="${p.name}" loading="lazy"></div>
        <div class="staff-card__name">${p.name}</div>
        <span class="staff-card__role">${p.role}</span>
        <p class="staff-card__bio">${p.bio}</p>
      </div>`;
}

// Same 6 tokens as css/style.css's :root — swapping these values live re-skins
// every rule on the page since they all read from var(--token). Each variant
// stays in the same red/blue/navy/cream families as the real brand palette,
// just pushed bolder, softer, or deeper.
const palettes = [
  { key: 'original', name: 'Original', swatch: '#f9432b', tokens: { cream: '#f9f2e6', red: '#f9432b', blue: '#0393fd', mint: '#9ad8d8', skyblue: '#9bcbe4', navy: '#223948' } },
  { key: 'bold', name: 'Bold & Bright', swatch: '#ff3b1f', tokens: { cream: '#faf4ea', red: '#ff3b1f', blue: '#0077ff', mint: '#7fd4d4', skyblue: '#7ec3e3', navy: '#182c39' } },
  { key: 'soft', name: 'Soft & Warm', swatch: '#e2604b', tokens: { cream: '#f7ede0', red: '#e2604b', blue: '#4a90c2', mint: '#b8ddd3', skyblue: '#b7d3e0', navy: '#33475a' } },
  { key: 'deep', name: 'Deep & Moody', swatch: '#c62f1e', tokens: { cream: '#f2ead9', red: '#c62f1e', blue: '#045a9e', mint: '#6fa8a3', skyblue: '#5c8ba3', navy: '#16232c' } },
  { key: 'inverted', name: 'Navy Background', swatch: '#223948', tokens: { cream: '#223948', red: '#f9432b', blue: '#4db2ff', mint: '#9ad8d8', skyblue: '#9bcbe4', navy: '#f9f2e6' } },
];

// Two font pairings to compare live: the current brand fonts vs. the first
// draft pairing used before Offset/Courier Prime were supplied.
const fontSets = [
  { key: 'brand', name: 'Brand Fonts', sample: 'Offset + Courier Prime', tokens: { display: "'Offset', Impact, 'Arial Narrow', sans-serif", body: "'Courier Prime', 'Courier New', monospace", marker: "'Courier Prime', 'Courier New', monospace" } },
  { key: 'draft', name: 'First Draft', sample: 'Anton + Space Grotesk', tokens: { display: "'Anton', sans-serif", body: "'Space Grotesk', sans-serif", marker: "'Permanent Marker', cursive" } },
];

const html = `<title>Don't Quit Productions</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;700&family=Permanent+Marker&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
<style>
${cssPatched}

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
  font-weight: 700;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 3px solid var(--navy);
  transform: rotate(-3deg);
  box-shadow: 4px 4px 0 var(--navy);
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
.toast {
  position: fixed;
  left: 50%;
  bottom: 70px;
  transform: translateX(-50%) translateY(20px);
  background: var(--navy);
  color: var(--cream);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  z-index: 210;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}
.toast.is-shown { opacity: 1; transform: translateX(-50%) translateY(0); }
body { min-height: 100vh; transition: background 0.3s ease, color 0.3s ease; }
* { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease; }

.control-stack {
  position: fixed;
  bottom: 18px;
  left: 18px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.palette-picker, .font-picker {
  background: var(--cream);
  border: 3px solid var(--navy);
  border-radius: 18px;
  padding: 0.6rem 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 4px 4px 0 var(--navy);
}
.palette-picker__label, .font-picker__label {
  font-family: var(--font-marker);
  font-weight: 700;
  font-style: italic;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--navy);
  margin-right: 0.2rem;
  white-space: nowrap;
}
.palette-swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid var(--navy);
  cursor: pointer;
  padding: 0;
  position: relative;
  flex-shrink: 0;
}
.palette-swatch.is-active::after {
  content: "";
  position: absolute;
  inset: -6px;
  border: 2px solid var(--navy);
  border-radius: 50%;
}
.font-toggle {
  font-family: var(--font-body);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  font-size: 0.75rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  border: 2px solid var(--navy);
  background: transparent;
  color: var(--navy);
  cursor: pointer;
  white-space: nowrap;
}
.font-toggle.is-active { background: var(--navy); color: var(--cream); }
@media (max-width: 640px) {
  .palette-picker, .font-picker { flex-wrap: wrap; max-width: 220px; }
  .preview-badge { bottom: auto; top: 12px; right: 12px; }
}
</style>

<header class="site-header">
  <div class="wrap nav">
    <a class="nav__logo" onclick="goTo('home')"><img src="${LOGO_URI}" alt="Don't Quit Productions"></a>
    <button class="nav__toggle" aria-label="Toggle menu" onclick="document.querySelector('.nav__links').classList.toggle('is-open')"><span></span><span></span><span></span></button>
    <ul class="nav__links">
      <li><a data-page="home" class="is-active" onclick="goTo('home')">Home</a></li>
      <li><a data-page="productions" onclick="goTo('productions')">Productions</a></li>
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
        <button class="btn btn-outline" onclick="goTo('about')">Pitch a Show</button>
      </div>
    </div>
  </section>

  <div class="marquee">
    <div class="marquee__track">${marqueeLooped}</div>
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
            <div>📍 ${current.venue}</div>
            <div>🗓️ ${current.dates}</div>
          </div>
          <button class="btn btn-blue" onclick="previewNote()">Get Tickets</button>
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
      <div class="mission__stat">100%<p style="font-family:var(--font-body);font-size:1rem;color:var(--navy);">independent, artist-first, always looking for the next spectacular idea.</p></div>
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
</div>

<!-- ============ STAFF ============ -->
<div class="page-section" id="page-staff">
  <section class="page-hero">
    <div class="wrap">
      <span class="eyebrow">The people behind the shows</span>
      <h1>Staff</h1>
    </div>
  </section>
  <section style="padding-top:0;">
    <div class="wrap">
      <div class="staff-grid">${staff.staff.map(staffCard).join('')}
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
        <li><a onclick="goTo('about')">About / Contact</a></li>
        <li><a onclick="goTo('staff')">Staff</a></li>
      </ul>
    </div>
    <div class="footer-bottom">
      <span>Don't Quit Productions &bull; Since 2024</span>
      <span>&copy; <span id="footer-year"></span> Don't Quit Productions</span>
    </div>
  </div>
</footer>

<div class="control-stack">
  <div class="palette-picker" id="palette-picker">
    <span class="palette-picker__label">Colors</span>
  </div>
  <div class="font-picker" id="font-picker">
    <span class="font-picker__label">Fonts</span>
  </div>
</div>
<div class="preview-badge">Design Preview &middot; Not Live Yet</div>
<div class="toast" id="toast">This action goes live once the real site is deployed</div>

<script>
document.getElementById('footer-year').textContent = new Date().getFullYear();

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
        '<div class="show-card__meta"><div>📍 ' + s.venue + '</div><div>🗓️ ' + s.dates + '</div></div>' +
        '<div class="show-card__footer">' +
          '<span class="badge badge--' + s.status + '">' + (badgeLabel[s.status] || s.status) + '</span>' +
          '<button class="btn btn-blue" style="padding:0.5rem 1.1rem;font-size:0.8rem;" onclick="previewNote()">Tickets</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }).join('');
}

function setYear(y) { activeYear = y; renderShows(); }
renderShows();

// ---------- palette picker ----------
var palettes = ${JSON.stringify(palettes)};
var activePalette = 'original';

function applyPalette(key) {
  activePalette = key;
  var p = palettes.find(function(p){ return p.key === key; });
  Object.keys(p.tokens).forEach(function(tok){
    document.documentElement.style.setProperty('--' + tok, p.tokens[tok]);
  });
  document.querySelectorAll('.palette-swatch').forEach(function(el){
    el.classList.toggle('is-active', el.dataset.key === key);
  });
}

var picker = document.getElementById('palette-picker');
palettes.forEach(function(p){
  var btn = document.createElement('button');
  btn.className = 'palette-swatch' + (p.key === 'original' ? ' is-active' : '');
  btn.style.background = p.swatch;
  btn.title = p.name;
  btn.dataset.key = p.key;
  btn.onclick = function(){ applyPalette(p.key); };
  picker.appendChild(btn);
});

// ---------- font picker ----------
var fontSets = ${JSON.stringify(fontSets)};

function applyFontSet(key) {
  var f = fontSets.find(function(f){ return f.key === key; });
  document.documentElement.style.setProperty('--font-display', f.tokens.display);
  document.documentElement.style.setProperty('--font-body', f.tokens.body);
  document.documentElement.style.setProperty('--font-marker', f.tokens.marker);
  document.querySelectorAll('.font-toggle').forEach(function(el){
    el.classList.toggle('is-active', el.dataset.key === key);
  });
}

var fontPicker = document.getElementById('font-picker');
fontSets.forEach(function(f){
  var btn = document.createElement('button');
  btn.className = 'font-toggle' + (f.key === 'brand' ? ' is-active' : '');
  btn.textContent = f.name;
  btn.title = f.sample;
  btn.dataset.key = f.key;
  btn.onclick = function(){ applyFontSet(f.key); };
  fontPicker.appendChild(btn);
});
</script>
`;

fs.writeFileSync(path.join(scratch, 'dqp-preview-colors.html'), html);
console.log('wrote', path.join(scratch, 'dqp-preview-colors.html'), html.length, 'bytes');
