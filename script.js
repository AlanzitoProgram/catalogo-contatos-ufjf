const state = {
  contacts: [],
  filtered: [],
  view: localStorage.getItem('catalogo:view') || 'cards',
  favorites: new Set(JSON.parse(localStorage.getItem('catalogo:favorites') || '[]')),
};

const $ = (id) => document.getElementById(id);
const els = {
  search: $('searchInput'), clear: $('clearSearch'), sector: $('sectorFilter'), onlyPhone: $('onlyPhone'),
  onlyEmail: $('onlyEmail'), onlySite: $('onlySite'), onlyFavorites: $('onlyFavorites'), cards: $('cards'),
  tableWrap: $('tableWrap'), tableBody: $('tableBody'), empty: $('emptyState'), resultCount: $('resultCount'),
  statContacts: $('statContacts'), statPhones: $('statPhones'), statEmails: $('statEmails'), statSites: $('statSites'),
  toast: $('toast'), viewCards: $('viewCards'), viewTable: $('viewTable'), theme: $('themeToggle'), exportCsv: $('exportCsv')
};

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function searchable(c) {
  return normalize([c.setor, c.subsetor, c.site, ...c.emails, ...c.telefones.map(t => `${t.label} ${t.digits}`)].join(' '));
}
function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove('show'), 1800);
}
async function copyText(text, label = 'Copiado!') {
  try { await navigator.clipboard.writeText(text); showToast(label); }
  catch { showToast('Não foi possível copiar automaticamente.'); }
}
function saveFavorites() { localStorage.setItem('catalogo:favorites', JSON.stringify([...state.favorites])); }
function toggleFavorite(id) {
  const key = String(id);
  state.favorites.has(key) ? state.favorites.delete(key) : state.favorites.add(key);
  saveFavorites(); render();
}
function phoneLinks(phone) {
  const isMobile = phone.digits && phone.digits.length >= 13 && phone.digits.substring(4,5) === '9';
  const tel = `<a href="tel:+${phone.digits}">${phone.label}</a>`;
  const whats = isMobile ? `<a class="btn small secondary" target="_blank" rel="noopener" href="https://wa.me/${phone.digits}">WhatsApp</a>` : '';
  return { tel, whats };
}
function contactHtml(c) {
  const phones = c.telefones.map(p => {
    const links = phoneLinks(p);
    return `<div class="contact-item"><span>📞 ${links.tel}</span><button class="copy" data-copy="${p.label}" data-label="Telefone copiado">Copiar</button></div>`;
  }).join('');
  const emails = c.emails.map(e => `<div class="contact-item"><span>✉️ <a href="mailto:${e}">${e}</a></span><button class="copy" data-copy="${e}" data-label="E-mail copiado">Copiar</button></div>`).join('');
  if (!phones && !emails) return '<span class="badge">Sem telefone/e-mail cadastrado</span>';
  return phones + emails;
}
function actionsHtml(c) {
  const site = c.site ? `<a class="btn small secondary" target="_blank" rel="noopener" href="${c.site}">Abrir site</a>` : '';
  const firstPhone = c.telefones[0];
  const whats = firstPhone ? phoneLinks(firstPhone).whats : '';
  const email = c.emails[0] ? `<a class="btn small secondary" href="mailto:${c.emails[0]}">Enviar e-mail</a>` : '';
  return [site, whats, email].filter(Boolean).join('');
}
function renderCards(list) {
  els.cards.innerHTML = list.map(c => `
    <article class="card">
      <div class="card-header">
        <div><h2>${escapeHtml(c.setor || 'Sem setor')}</h2><p class="subsetor">${escapeHtml(c.subsetor || 'Sem subsetor')}</p></div>
        <button class="favorite ${state.favorites.has(String(c.id)) ? 'is-favorite' : ''}" title="Favoritar" data-favorite="${c.id}">★</button>
      </div>
      <div class="contact-list">${contactHtml(c)}</div>
      <div class="actions">${actionsHtml(c)}</div>
    </article>`).join('');
}
function renderTable(list) {
  els.tableBody.innerHTML = list.map(c => `
    <tr>
      <td>${escapeHtml(c.setor || '')}</td><td>${escapeHtml(c.subsetor || '')}</td>
      <td>${c.site ? `<a href="${c.site}" target="_blank" rel="noopener">Acessar</a>` : '-'}</td>
      <td>${contactHtml(c)}</td>
      <td><button class="favorite ${state.favorites.has(String(c.id)) ? 'is-favorite' : ''}" data-favorite="${c.id}">★</button></td>
    </tr>`).join('');
}
function escapeHtml(text) {
  const div = document.createElement('div'); div.textContent = text; return div.innerHTML;
}
function applyFilters() {
  const query = normalize(els.search.value);
  const sector = els.sector.value;
  state.filtered = state.contacts.filter(c => {
    if (query && !searchable(c).includes(query)) return false;
    if (sector && c.setor !== sector) return false;
    if (els.onlyPhone.checked && !c.telefones.length) return false;
    if (els.onlyEmail.checked && !c.emails.length) return false;
    if (els.onlySite.checked && !c.site) return false;
    if (els.onlyFavorites.checked && !state.favorites.has(String(c.id))) return false;
    return true;
  });
}
function render() {
  applyFilters();
  els.resultCount.textContent = state.filtered.length;
  els.empty.classList.toggle('hidden', state.filtered.length > 0);
  els.cards.classList.toggle('hidden', state.view !== 'cards');
  els.tableWrap.classList.toggle('hidden', state.view !== 'table');
  els.viewCards.classList.toggle('active', state.view === 'cards');
  els.viewTable.classList.toggle('active', state.view === 'table');
  renderCards(state.filtered); renderTable(state.filtered);
}
function populateSectorFilter() {
  const sectors = [...new Set(state.contacts.map(c => c.setor).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  els.sector.insertAdjacentHTML('beforeend', sectors.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join(''));
}
function updateStats() {
  els.statContacts.textContent = state.contacts.length;
  els.statPhones.textContent = state.contacts.reduce((sum,c)=>sum+c.telefones.length,0);
  els.statEmails.textContent = state.contacts.reduce((sum,c)=>sum+c.emails.length,0);
  els.statSites.textContent = state.contacts.filter(c=>c.site).length;
}
function exportCsv() {
  const rows = [['Setor','Subsetor','Site','Telefones','Emails'], ...state.filtered.map(c => [c.setor, c.subsetor, c.site, c.telefones.map(p=>p.label).join(' | '), c.emails.join(' | ')])];
  const csv = rows.map(r => r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(';')).join('\n');
  const blob = new Blob(['\ufeff' + csv], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'catalogo-contatos-ufjf.csv'; a.click(); URL.revokeObjectURL(url);
}
function setupEvents() {
  [els.search, els.sector, els.onlyPhone, els.onlyEmail, els.onlySite, els.onlyFavorites].forEach(el => el.addEventListener('input', render));
  els.clear.addEventListener('click', () => { els.search.value=''; els.sector.value=''; els.onlyPhone.checked=false; els.onlyEmail.checked=false; els.onlySite.checked=false; els.onlyFavorites.checked=false; render(); });
  els.viewCards.addEventListener('click', () => { state.view='cards'; localStorage.setItem('catalogo:view','cards'); render(); });
  els.viewTable.addEventListener('click', () => { state.view='table'; localStorage.setItem('catalogo:view','table'); render(); });
  els.exportCsv.addEventListener('click', exportCsv);
  document.body.addEventListener('click', (e) => {
    const copy = e.target.closest('[data-copy]'); if (copy) copyText(copy.dataset.copy, copy.dataset.label || 'Copiado');
    const fav = e.target.closest('[data-favorite]'); if (fav) toggleFavorite(fav.dataset.favorite);
  });
  els.theme.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = current; localStorage.setItem('catalogo:theme', current);
  });
}
async function init() {
  document.documentElement.dataset.theme = localStorage.getItem('catalogo:theme') || 'light';
  const response = await fetch('data/contatos.json');
  state.contacts = await response.json();
  populateSectorFilter(); updateStats(); setupEvents(); render();
}
init().catch(err => { console.error(err); showToast('Erro ao carregar os contatos.'); });
