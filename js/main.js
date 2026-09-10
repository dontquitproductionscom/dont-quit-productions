// Shared behavior across all pages: mobile nav toggle, footer year, and
// footer social links (rendered from content/site.json on every page).
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('is-open'));
  }

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  renderSocialLinks();
  renderStats();
});

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

// Line-icons for show meta (venue/date), used instead of emoji.
const ICON_PIN = '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-7.58 7-13a7 7 0 1 0-14 0c0 5.42 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>';
const ICON_CALENDAR = '<svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>';

const ICON_INSTAGRAM = '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.054-.058 1.37-.058 4.04 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.858.344 1.053.048 1.37.058 4.04.058 2.67 0 2.987-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.858.048-1.053.058-1.37.058-4.04 0-2.67-.01-2.986-.058-4.04-.045-.975-.207-1.504-.344-1.857a3.09 3.09 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.858-.344-1.053-.048-1.37-.058-4.04-.058zm0 4.595a5.603 5.603 0 1 1 0 11.206 5.603 5.603 0 0 1 0-11.206zm0 1.802a3.8 3.8 0 1 0 0 7.601 3.8 3.8 0 0 0 0-7.601zm5.85-1.802a1.309 1.309 0 1 1-2.618 0 1.309 1.309 0 0 1 2.618 0z"/></svg>';
const ICON_TIKTOK = '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>';
const ICON_YOUTUBE = '<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';

async function renderSocialLinks() {
  const el = document.getElementById('social-links');
  if (!el) return;
  try {
    const site = await fetchJSON('/content/site.json');
    const socials = [
      { key: 'instagram', label: 'Instagram', icon: ICON_INSTAGRAM },
      { key: 'tiktok', label: 'TikTok', icon: ICON_TIKTOK },
      { key: 'youtube', label: 'YouTube', icon: ICON_YOUTUBE },
    ].filter(s => site[s.key]);
    el.innerHTML = socials.map(s =>
      `<a href="${site[s.key]}" target="_blank" rel="noopener" aria-label="${s.label}">${s.icon}</a>`
    ).join('');
  } catch (e) { console.error(e); }
}

async function renderStats() {
  const statsEl = document.getElementById('mission-stats');
  const photoEl = document.getElementById('mission-photo');
  if (!statsEl && !photoEl) return;
  try {
    const site = await fetchJSON('/content/site.json');
    if (statsEl) {
      const stats = site.stats || [];
      statsEl.innerHTML = stats.map(s => `
        <div class="stat-tile">
          <div class="stat-tile__value">${s.value}</div>
          <div class="stat-tile__label">${s.label}</div>
        </div>
      `).join('');
    }
    if (photoEl && site.missionPhoto) {
      photoEl.src = site.missionPhoto;
    }
  } catch (e) { console.error(e); }
}
