/* ==========================================================================
   TERMX - CLI SNAKE ARCADE GAME ENGINE
   Playable Snake mini-game rendered in canvas overlay
   ========================================================================== */

class SnakeGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gridSize = 20;
    this.tileCountX = 20;
    this.tileCountY = 20;
    this.snake = [];
    this.food = { x: 5, y: 5 };
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.gameInterval = null;
    this.active = false;
  }

  start() {
    const modal = document.getElementById('gameModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    if (!modal || !modalBody) return;

    modalTitle.textContent = "TERMX SNAKE ARCADE (Arrow Keys to move)";
    modalBody.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-center; height:100%; padding:20px;">
        <div style="margin-bottom:10px; font-weight:700; color:var(--accent-cyan);" id="snakeScore">SCORE: 0</div>
        <canvas id="snakeCanvas" width="400" height="400" style="background:#0a0c10; border:2px solid var(--accent-cyan); border-radius:8px;"></canvas>
      </div>
    `;
    modal.classList.remove('hidden');

    this.canvas = document.getElementById('snakeCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.spawnFood();
    this.active = true;

    this.keyHandler = (e) => this.handleKeyDown(e);
    window.addEventListener('keydown', this.keyHandler);

    if (this.gameInterval) clearInterval(this.gameInterval);
    this.gameInterval = setInterval(() => this.loop(), 100);
  }

  spawnFood() {
    this.food = {
      x: Math.floor(Math.random() * this.tileCountX),
      y: Math.floor(Math.random() * this.tileCountY)
    };
  }

  handleKeyDown(e) {
    if (!this.active) return;
    if (e.key === 'ArrowUp' && this.dy !== 1) { this.dx = 0; this.dy = -1; e.preventDefault(); }
    if (e.key === 'ArrowDown' && this.dy !== -1) { this.dx = 0; this.dy = 1; e.preventDefault(); }
    if (e.key === 'ArrowLeft' && this.dx !== 1) { this.dx = -1; this.dy = 0; e.preventDefault(); }
    if (e.key === 'ArrowRight' && this.dx !== -1) { this.dx = 1; this.dy = 0; e.preventDefault(); }
  }

  loop() {
    if (!this.active) return;

    // Move Snake Head
    const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

    // Wall Collision
    if (head.x < 0 || head.x >= this.tileCountX || head.y < 0 || head.y >= this.tileCountY) {
      this.gameOver();
      return;
    }

    // Self Collision
    for (let segment of this.snake) {
      if (segment.x === head.x && segment.y === head.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // Eat Food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      const scoreEl = document.getElementById('snakeScore');
      if (scoreEl) scoreEl.textContent = `SCORE: ${this.score}`;
      window.termAudio.playBell();
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    // Background Grid
    this.ctx.fillStyle = '#0a0c10';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Food
    this.ctx.fillStyle = '#ff0055';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#ff0055';
    this.ctx.fillRect(this.food.x * this.gridSize + 2, this.food.y * this.gridSize + 2, this.gridSize - 4, this.gridSize - 4);

    // Draw Snake
    this.ctx.shadowColor = '#00f0ff';
    this.snake.forEach((part, index) => {
      this.ctx.fillStyle = index === 0 ? '#00f0ff' : '#00ff66';
      this.ctx.fillRect(part.x * this.gridSize + 1, part.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
    });

    this.ctx.shadowBlur = 0;
  }

  gameOver() {
    this.active = false;
    clearInterval(this.gameInterval);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ff0055';
    this.ctx.font = '20px Fira Code, monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2 - 10);
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = '14px Fira Code, monospace';
    this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
  }

  stop() {
    this.active = false;
    if (this.gameInterval) clearInterval(this.gameInterval);
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
  }
}

window.snakeGame = new SnakeGame();
