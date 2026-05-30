export default class AuthController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupFormToggles();
    this.setupPasswordValidation();
    this.setupCadastroFlow();
    this.setupLoginFlow();
    this.setup2FAFlow();
  }

  setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tabName = e.currentTarget.getAttribute('data-tab');
        this.view.switchTab(tabName);
      });
    });

    document.querySelectorAll('.switch-link a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (e.target.innerText.includes('login')) {
          this.view.switchTab('login');
        } else if (e.target.innerText.includes('Criar')) {
          this.view.switchTab('cadastro');
        }
      });
    });
  }

  setupFormToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const wrapper = e.currentTarget.closest('.field-wrapper');
        const input = wrapper.querySelector('input');
        this.view.togglePassword(input, e.currentTarget);
      });
    });
  }

  setupPasswordValidation() {
    const campoSenha = document.getElementById('cad-senha');
    const campoConfirma = document.getElementById('cad-confirma');

    campoSenha.addEventListener('input', (e) => {
      const senha = e.target.value;
      const { score, checks } = this.model.validatePassword(senha);
      this.view.updatePasswordStrength(score, checks);

      if (campoConfirma.value.length > 0) {
        this.view.updatePasswordMatch(senha === campoConfirma.value, false);
      } else {
        this.view.updatePasswordMatch(false, true);
      }
    });

    campoConfirma.addEventListener('input', (e) => {
      const confirma = e.target.value;
      const senha = campoSenha.value;

      if (confirma.length === 0) {
        this.view.updatePasswordMatch(false, true);
      } else {
        this.view.updatePasswordMatch(senha === confirma, false);
      }
    });
  }

  setupCadastroFlow() {
    document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
      e.preventDefault();
      this.view.hideAlert('cadastro-alert');

      const nome = document.getElementById('cad-nome').value.trim();
      const email = document.getElementById('cad-email').value.trim();
      const senha = document.getElementById('cad-senha').value;
      const confirma = document.getElementById('cad-confirma').value;

      if (!nome || !email || !senha || !confirma) {
        this.view.showAlert('cadastro-alert', 'error', 'Preencha todos os campos obrigatórios.');
        return;
      }

      if (senha !== confirma) {
        this.view.showAlert('cadastro-alert', 'error', 'As senhas não coincidem.');
        return;
      }

      try {
        const response = await fetch('backend/cadastro.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (data.success) {
          this.view.showAlert('cadastro-alert', 'success', 'Conta pré-registrada! Verifique o código enviado.');
          window.emailEmVerificacao = email;
          setTimeout(() => {
            this.view.switchTab('2fa');
            document.getElementById('pin-0').focus();
          }, 1500);
        } else {
          this.view.showAlert('cadastro-alert', 'error', data.message || 'Erro ao criar conta.');
        }
      } catch (error) {
        this.view.showAlert('cadastro-alert', 'error', 'Falha na conexão com o servidor.');
      }
    });
  }

  setupLoginFlow() {
    document.getElementById('form-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (this.model.loginState.bloqueado) return;

      const email = document.getElementById('login-email').value.trim();
      const senha = document.getElementById('login-senha').value;

      if (!email || !senha) {
        this.view.showAlert('login-alert', 'error', 'Preencha e-mail e senha.');
        return;
      }

      try {
        const response = await fetch('backend/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (data.success) {
          this.view.showAlert('login-alert', 'success', 'Acesso autorizado! Redirecionando...');
          setTimeout(() => { 
            window.location.href = 'dashboard.html'; 
          }, 1000);
        } else {
          const state = this.model.registerLoginFailure();
          this.view.updateBruteForceDots(state.tentativas, state.maxTentativas);
          
          if (data.is_blocked || state.bloqueado) {
            this.view.showAlert('login-alert', 'error', data.message || 'ACESSO BLOQUEADO POR SEGURANÇA!');
          } else {
            this.view.showAlert('login-alert', 'error', data.message || 'Usuário ou senha incorretos.');
          }
        }
      } catch (error) {
        this.view.showAlert('login-alert', 'error', 'Falha na conexão com o servidor.');
      }
    });
  }

  setup2FAFlow() {
    const pinInputs = document.querySelectorAll('.pin-input');

    pinInputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(-1);

        if (e.target.value) {
          e.target.classList.add('filled');
          if (idx < pinInputs.length - 1) {
            pinInputs[idx + 1].focus();
          } else {
            this.enviarCodigoVerificacao();
          }
        } else {
          e.target.classList.remove('filled');
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && idx > 0) {
          pinInputs[idx - 1].focus();
          pinInputs[idx - 1].value = '';
          pinInputs[idx - 1].classList.remove('filled');
        }
      });
    });

    document.getElementById('btn-verificar').addEventListener('click', () => {
      this.enviarCodigoVerificacao();
    });
  }

  async enviarCodigoVerificacao() {
    this.view.hideAlert('alerta-2fa');
    const pinInputs = document.querySelectorAll('.pin-input');
    const codigoDigitado = Array.from(pinInputs).map(i => i.value).join('');

    if (codigoDigitado.length < 4) {
      this.view.showAlert('alerta-2fa', 'error', 'Digite os 4 dígitos.');
      return;
    }

    try {
      const response = await fetch('backend/verificar_2fa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: window.emailEmVerificacao || '',
          pin: codigoDigitado 
        })
      });

      const data = await response.json();

      if (data.success) {
        document.getElementById('estado-pin').style.display = 'none';
        
        const sucessoDiv = document.createElement('div');
        sucessoDiv.className = 'success-screen';
        sucessoDiv.innerHTML = `
          <div class="success-icon"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
          <h2 class="success-title">CONTA ATIVADA!</h2>
          <p class="success-msg">Redirecionando para o login...</p>
        `;
        document.getElementById('tela-2fa').appendChild(sucessoDiv);
        setTimeout(() => {
          sucessoDiv.remove();
          document.getElementById('estado-pin').style.display = 'block';
          
          pinInputs.forEach(inp => { inp.value = ''; inp.classList.remove('filled'); });
          
          this.view.switchTab('login');
          document.getElementById('login-email').value = window.emailEmVerificacao || '';
          document.getElementById('login-senha').focus();
        }, 3000);

      } else {
        this.view.showAlert('alerta-2fa', 'error', data.message || 'Código inválido.');
        pinInputs.forEach(inp => {
          inp.classList.add('error-shake');
          setTimeout(() => { inp.classList.remove('error-shake'); inp.value = ''; inp.classList.remove('filled'); }, 500);
        });
        pinInputs[0].focus();
      }

    } catch (error) {
      this.view.showAlert('alerta-2fa', 'error', 'Falha ao conectar com o servidor.');
    }
  }
}