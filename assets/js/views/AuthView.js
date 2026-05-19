export default class AuthView {
  constructor() {
    this.strengthLevels = [
      { min: 0, max: 0, cor: 'transparent', label: 'Digite uma senha', pct: '0%' },
      { min: 1, max: 1, cor: '#ef4444', label: 'Muito fraca', pct: '25%' },
      { min: 2, max: 2, cor: '#f59e0b', label: 'Fraca', pct: '50%' },
      { min: 3, max: 3, cor: '#3b82f6', label: 'Média', pct: '75%' },
      { min: 4, max: 4, cor: '#10b981', label: 'Forte ✓', pct: '100%' }
    ];
  }

  switchTab(tabName) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById('tela-' + tabName).classList.add('ativa');

    const mapa = { cadastro: 0, login: 1, '2fa': 2 };
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-tab')[mapa[tabName]].classList.add('active');
  }

  showAlert(id, tipo, mensagem) {
    const el = document.getElementById(id);
    el.className = `alert alert-${tipo} visivel`;
    el.innerHTML = `<span>${mensagem}</span>`;
  }

  hideAlert(id) {
    const el = document.getElementById(id);
    el.className = 'alert';
    el.innerHTML = '';
  }

  updatePasswordStrength(score, checks) {
    const barra = document.getElementById('strength-bar');
    const label = document.getElementById('strength-label');
    const nivel = this.strengthLevels[score];

    barra.style.width = nivel.pct;
    barra.style.background = nivel.cor;
    label.textContent = nivel.label;
    label.style.color = nivel.pct === '0%' ? 'var(--text-muted)' : nivel.cor;

    const mapKeys = { len: 'req-len', upper: 'req-upper', number: 'req-number', special: 'req-special' };
    for (const [key, isValid] of Object.entries(checks)) {
      const li = document.getElementById(mapKeys[key]);
      if (isValid) li.classList.add('ok');
      else li.classList.remove('ok');
    }
  }

  updateBruteForceDots(tentativas, maxTentativas) {
    const indicador = document.getElementById('attempts-indicator');
    const label = document.getElementById('attempts-label');
    const restantes = maxTentativas - tentativas;

    if (tentativas > 0) indicador.style.display = 'flex';
    else indicador.style.display = 'none';

    for (let i = 1; i <= maxTentativas; i++) {
      const dot = document.getElementById('dot-' + i);
      if (i <= tentativas) dot.classList.add('used');
      else dot.classList.remove('used');
    }
    label.textContent = `${restantes} tentativa(s) restante(s)`;
  }
}