// Leonida Trophy Guide — checklist, tracker and roadmap for the 55 GTA VI PS5 trophies.
// Static and offline: it fetches only its own data files (trophies.json, roadmap.json),
// saves progress in localStorage, and makes no network request at run time.

const STORAGE_KEY = 'gta6-trophy-guide-progress-v1';
const POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };
const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  completion: 'Completion',
};

const state = {
  trophies: [],
  roadmap: null,
  earned: new Set(),
  search: '',
  kind: 'all',
  grade: 'all',
  hideEarned: false,
  spoilerSafe: true,
  openId: null,
  view: 'checklist',
};

const $ = (id) => document.getElementById(id);

function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.earned].sort((a, b) => a - b)));
}

function gradePoints() {
  let total = 0;
  for (const id of state.earned) {
    const t = state.trophies.find((x) => x.id === id);
    if (t) total += POINTS[t.grade] ?? 0;
  }
  return total;
}

function trophyById(id) {
  return state.trophies.find((t) => t.id === id);
}

function isMasked(t) {
  return state.spoilerSafe && t.hidden && !state.earned.has(t.id);
}

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.kind !== 'all' && t.kind !== state.kind && !(state.kind === 'missable' && t.missable)) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.hideEarned && state.earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function gradeCounts() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of state.trophies) {
    totals[t.grade] += 1;
    if (state.earned.has(t.id)) counts[t.grade] += 1;
  }
  return { counts, totals };
}

function renderProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length;
  $('progressText').textContent = `${earned} of ${total} earned`;
  $('progressPoints').textContent = `${gradePoints()} points`;
  $('progressFill').style.width = total ? `${(earned / total) * 100}%` : '0%';
  const { counts, totals } = gradeCounts();
  $('progressGrades').textContent =
    `Platinum ${counts.platinum}/${totals.platinum} · Gold ${counts.gold}/${totals.gold} · ` +
    `Silver ${counts.silver}/${totals.silver} · Bronze ${counts.bronze}/${totals.bronze}`;
}

function renderMissableBanner() {
  const missing = state.trophies.filter((t) => t.missable && !state.earned.has(t.id));
  const banner = $('missableBanner');
  if (missing.length === 0) {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  $('missableNames').textContent = missing.map((t) => t.name).join(' · ');
}

function cardElement(t) {
  const card = document.createElement('article');
  card.className = 'card';
  if (state.earned.has(t.id)) card.classList.add('earned');
  if (t.missable) card.classList.add('missable');

  const masked = isMasked(t);
  const title = masked ? 'Hidden trophy — earn it to reveal' : t.name;
  const desc = masked ? 'This story trophy stays hidden until you earn it.' : t.description;

  const toggle = document.createElement('label');
  toggle.className = 'earn-toggle';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) state.earned.add(t.id);
    else state.earned.delete(t.id);
    saveEarned();
    renderAll();
  });
  toggle.append(box, document.createTextNode(state.earned.has(t.id) ? 'Earned' : 'Not earned yet'));
  card.append(toggle);

  const badge = document.createElement('span');
  badge.className = `grade grade-${t.grade}`;
  badge.textContent = t.grade;
  card.append(badge);

  const heading = document.createElement('h3');
  heading.textContent = title;
  if (masked) heading.classList.add('spoiler-mask');
  card.append(heading);

  const description = document.createElement('p');
  description.className = 'desc';
  description.textContent = desc;
  card.append(description);

  const meta = document.createElement('p');
  meta.className = 'meta';
  if (!(t.missable && t.kind === 'missable')) {
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
    meta.append(kindTag);
  }
  if (t.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-tag';
    hiddenTag.textContent = 'Hidden';
    meta.append(hiddenTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable-tag';
    missTag.textContent = 'Missable';
    meta.append(missTag);
  }
  if (t.count) {
    const countTag = document.createElement('span');
    countTag.className = 'tag';
    countTag.textContent = `Count: ${t.count}`;
    meta.append(countTag);
  }
  const diffTag = document.createElement('span');
  diffTag.className = 'tag';
  diffTag.textContent = `Difficulty ${t.difficulty}/5 · ${t.time}`;
  meta.append(diffTag);
  card.append(meta);

  const guideBtn = document.createElement('button');
  guideBtn.type = 'button';
  guideBtn.className = 'guide-link';
  guideBtn.textContent = 'Read the guide';
  guideBtn.addEventListener('click', () => openDetail(t.id));
  card.append(guideBtn);

  return card;
}

function renderCards() {
  const list = visibleTrophies();
  const container = $('cards');
  container.replaceChildren();
  for (const t of list) container.append(cardElement(t));
  $('resultCount').textContent = `${list.length} of ${state.trophies.length} shown`;
  $('emptyNote').hidden = list.length !== 0;
}

function renderRoadmap() {
  const r = state.roadmap;
  if (!r) return;
  $('roadmapHours').textContent = `Total: about ${r.total_hours} hours from a fresh save to the Platinum.`;
  $('cheatsWarning').textContent = r.warning;
  $('saveTip').textContent = r.save_tip;
  const wrap = $('stages');
  wrap.replaceChildren();
  for (const stage of r.stages) {
    const box = document.createElement('section');
    box.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.stage}: ${stage.name}`;
    box.append(h);
    const hours = document.createElement('p');
    hours.className = 'stage-hours';
    hours.textContent = stage.hours;
    box.append(hours);
    const detail = document.createElement('p');
    detail.textContent = stage.detail;
    box.append(detail);
    const chips = document.createElement('div');
    chips.className = 'trophy-chips';
    for (const id of stage.trophies) {
      const t = trophyById(id);
      if (!t) continue;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      if (state.earned.has(id)) chip.classList.add('earned');
      chip.textContent = isMasked(t) ? `Hidden (${t.grade})` : t.name;
      chip.addEventListener('click', () => openDetail(id));
      chips.append(chip);
    }
    box.append(chips);
    wrap.append(box);
  }
}

function openDetail(id) {
  const t = trophyById(id);
  if (!t) return;
  state.openId = id;
  const panel = $('detailPanel');
  panel.replaceChildren();
  panel.hidden = false;

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'close';
  close.textContent = 'Close';
  close.addEventListener('click', () => {
    panel.hidden = true;
    state.openId = null;
  });
  panel.append(close);

  const h = document.createElement('h2');
  h.textContent = isMasked(t) ? `Hidden trophy (${t.grade})` : t.name;
  panel.append(h);

  const desc = document.createElement('p');
  desc.textContent = isMasked(t) ? 'This story trophy stays hidden until you earn it.' : t.description;
  panel.append(desc);

  if (t.missable && t.missable_note) {
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = `Missable: ${t.missable_note}`;
    panel.append(note);
  }

  const intro = document.createElement('p');
  intro.textContent = t.guide;
  panel.append(intro);

  const stepsTitle = document.createElement('h3');
  stepsTitle.textContent = 'Steps';
  panel.append(stepsTitle);
  const steps = document.createElement('ol');
  for (const step of t.steps) {
    const li = document.createElement('li');
    li.textContent = step;
    steps.append(li);
  }
  panel.append(steps);

  const source = document.createElement('p');
  source.className = 'source-line';
  source.append(document.createTextNode(`Source: ${t.source} — `));
  const link = document.createElement('a');
  link.href = t.source_url;
  link.textContent = t.source_url;
  link.target = '_blank';
  link.rel = 'noopener';
  source.append(link);
  panel.append(source);

  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderAll() {
  renderProgress();
  renderMissableBanner();
  renderCards();
  renderRoadmap();
  if (state.openId) openDetail(state.openId);
}

function setView(view) {
  state.view = view;
  $('tabChecklist').classList.toggle('active', view === 'checklist');
  $('tabRoadmap').classList.toggle('active', view === 'roadmap');
  $('tabChecklist').setAttribute('aria-selected', String(view === 'checklist'));
  $('tabRoadmap').setAttribute('aria-selected', String(view === 'roadmap'));
  $('checklistView').hidden = view !== 'checklist';
  $('roadmapView').hidden = view !== 'roadmap';
}

function applyParams() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'roadmap') setView('roadmap');
  const kind = params.get('kind');
  if (kind && (kind === 'missable' || kind in KIND_LABELS)) {
    state.kind = kind;
    $('kindFilter').value = kind;
  }
  const grade = params.get('grade');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) {
    state.grade = grade;
    $('gradeFilter').value = grade;
  }
  const spoiler = params.get('spoiler');
  if (spoiler === 'off') {
    state.spoilerSafe = false;
    $('spoilerToggle').checked = false;
  }
  const open = params.get('open');
  if (open) state.openId = Number(open);
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ earned: [...state.earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no list of trophy ids');
    const next = new Set();
    for (const id of ids) {
      if (Number.isInteger(id) && trophyById(id)) next.add(id);
    }
    state.earned = next;
    saveEarned();
    renderAll();
  } catch (err) {
    window.alert(`Could not import that file: ${err.message}`);
  }
}

async function init() {
  const [trophyData, roadmapData] = await Promise.all([
    fetch('data/trophies.json').then((r) => r.json()),
    fetch('data/roadmap.json').then((r) => r.json()),
  ]);
  state.trophies = trophyData.trophies;
  state.roadmap = roadmapData;
  state.earned = loadEarned();

  $('search').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderCards();
  });
  $('kindFilter').addEventListener('change', (e) => {
    state.kind = e.target.value;
    renderCards();
  });
  $('gradeFilter').addEventListener('change', (e) => {
    state.grade = e.target.value;
    renderCards();
  });
  $('hideEarned').addEventListener('change', (e) => {
    state.hideEarned = e.target.checked;
    renderCards();
  });
  $('spoilerToggle').addEventListener('change', (e) => {
    state.spoilerSafe = e.target.checked;
    renderAll();
  });
  $('tabChecklist').addEventListener('click', () => setView('checklist'));
  $('tabRoadmap').addEventListener('click', () => setView('roadmap'));
  $('missableJump').addEventListener('click', () => {
    state.kind = 'missable';
    $('kindFilter').value = 'missable';
    setView('checklist');
    renderCards();
    $('cards').scrollIntoView({ behavior: 'smooth' });
  });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', (e) => {
    if (e.target.files[0]) importProgress(e.target.files[0]);
    e.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies?')) {
      state.earned = new Set();
      saveEarned();
      renderAll();
    }
  });

  applyParams();
  renderAll();
  window.__shotReady = true;
}

init().catch((err) => {
  document.body.insertAdjacentHTML('beforeend', `<p style="color:#ff5a5a;padding:20px">Failed to load the guide data: ${err.message}</p>`);
});
