export default class AuthModel {
  constructor() {
    this.regexRules = {
      len: /.{8,}/,
      upper: /[A-Z]/,
      number: /[0-9]/,
      special: /[^A-Za-z0-9]/
    };

    this.loginState = {
      tentativas: 0,
      maxTentativas: 3,
      bloqueado: false
    };
  }

  validatePassword(password) {
    let score = 0;
    const checks = {};
    for (const [key, regex] of Object.entries(this.regexRules)) {
      checks[key] = regex.test(password);
      if (checks[key]) score++;
    }
    return { score, checks };
  }

  registerLoginFailure() {
    this.loginState.tentativas++;
    if (this.loginState.tentativas >= this.loginState.maxTentativas) {
      this.loginState.bloqueado = true;
    }
    return this.loginState;
  }

  resetLoginState() {
    this.loginState.tentativas = 0;
    this.loginState.bloqueado = false;
  }
}