// About page: mission copy + pitch/contact block from content/site.json.
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const site = await fetchJSON('/content/site.json');
    const el = (id) => document.getElementById(id);

    if (el('mission-eyebrow')) el('mission-eyebrow').textContent = site.missionEyebrow;
    if (el('mission-title')) el('mission-title').textContent = site.missionTitle;
    if (el('mission-body')) el('mission-body').textContent = site.missionBody;
    if (el('pitch-title')) el('pitch-title').textContent = site.pitchTitle;
    if (el('pitch-body')) el('pitch-body').textContent = site.pitchBody;
    if (el('support-eyebrow')) el('support-eyebrow').textContent = site.supportEyebrow;
    if (el('support-title')) el('support-title').textContent = site.supportTitle;
    if (el('support-body')) el('support-body').textContent = site.supportBody;
    if (el('support-cta')) {
      el('support-cta').textContent = site.supportButtonLabel;
      el('support-cta').href = site.supportUrl || '#';
    }
  } catch (e) { console.error(e); }
});
