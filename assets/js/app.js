import AuthModel from './models/AuthModel.js';
import AuthView from './views/AuthView.js';
import AuthController from './controllers/AuthController.js';

document.addEventListener('DOMContentLoaded', () => {
  const model = new AuthModel();
  const view = new AuthView();
  const controller = new AuthController(model, view);
});