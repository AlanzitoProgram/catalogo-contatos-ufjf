const state = {
  contatos: [],
  query: '',
  setor: ''
};

const els = {
  cards: document.querySelector('#cards'),
  search: document.querySelector('#searchInput'),
  sector: document.querySelector('#sectorFilter'),
  clear: document.querySelector('#clearBtn'),
  count: document.querySelector('#resultCount'),
  total: document.querySelector('#totalContatos')
};

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const escapeHTML = (value) => String(value || '').replace(/[&<>'"]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
}[char]));

function splitField(value) {
  return String(value || '')
    .split(/\s*\|\s*|\s*;\s*/)
    .map(item => item.trim())
    .filter(Boolean);
}

function linkifyEmails(value) {
  const emails = splitField(value);
  if (!emails.length) return '<span>Não informado</span>';
  return emails.map(email => `<a href="mailto:${escapeHTML(email)}">${escapeHTML(email)}</a>`).join('<br>');
}

function linkifyPhones(value) {
  const phones = splitField(value);
  if (!phones.length) return '<span>Não informado</span>';
  return phones.map(phone => {
    const digits = phone.replace(/\D/g, '');
    const href = digits.length >= 8 ? `tel:+55${digits.replace(/^55/, '')}` : '#';
    return href === '#' ? escapeHTML(phone) : `<a href="${href}">${escapeHTML(phone)}</a>`;
  }).join('<br>');
}

function formatSite(site) {
  if (!site) return '<span>Não informado</span>';
  const safe = escapeHTML(site);
  return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
}

function populateSectors() {
  const sectors = [...new Set(state.contatos.map(c => c.setor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  els.sector.innerHTML = '<option value="">Todos os setores</option>' + sectors.map(setor => `<option value="${escapeHTML(setor)}">${escapeHTML(setor)}</option>`).join('');
}

function filteredContacts() {
  const q = normalize(state.query);
  return state.contatos.filter(contato => {
    const matchesSector = !state.setor || contato.setor === state.setor;
    const haystack = normalize(`${contato.setor} ${contato.subsetor} ${contato.site} ${contato.telefones} ${contato.emails}`);
    const matchesQuery = !q || haystack.includes(q);
    return matchesSector && matchesQuery;
  });
}

function render() {
  const contatos = filteredContacts();
  els.count.textContent = contatos.length;
  if (!contatos.length) {
    els.cards.innerHTML = '<div class="empty">Nenhum contato encontrado. Tente buscar por outro termo ou limpar os filtros.</div>';
    return;
  }
  els.cards.innerHTML = contatos.map(contato => `
    <article class="card">
      <div>
        <h2>${escapeHTML(contato.setor || 'Sem setor')}</h2>
        <p class="subsetor">${escapeHTML(contato.subsetor || 'Sem subsetor informado')}</p>
      </div>
      <div class="info">
        <div><span class="label">Telefone</span>${linkifyPhones(contato.telefones)}</div>
        <div><span class="label">E-mail</span>${linkifyEmails(contato.emails)}</div>
        <div><span class="label">Site</span>${formatSite(contato.site)}</div>
      </div>
    </article>
  `).join('');
}

async function init() {
  try {
    const response = await fetch('data/contatos.json');
    if (!response.ok) throw new Error('Não foi possível carregar data/contatos.json');
    state.contatos = await response.json();
    els.total.textContent = state.contatos.length;
    populateSectors();
    render();
  } catch (error) {
    els.cards.innerHTML = `<div class="empty">Erro ao carregar contatos: ${escapeHTML(error.message)}</div>`;
  }
}

els.search.addEventListener('input', event => { state.query = event.target.value; render(); });
els.sector.addEventListener('change', event => { state.setor = event.target.value; render(); });
els.clear.addEventListener('click', () => {
  state.query = '';
  state.setor = '';
  els.search.value = '';
  els.sector.value = '';
  render();
});

init();
