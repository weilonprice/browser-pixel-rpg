// Main Entry Point

import { Game } from './engine/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.__GAME__ = game; // Accessible for debugging & inspections
  game.start();
});
