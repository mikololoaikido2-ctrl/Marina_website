/* ==========================================================================
   TERMX - MATRIX DIGITAL CODE RAIN CANVAS ENGINE
   Renders matrix canvas background rain & full screen modal mode
   ========================================================================== */

class MatrixEngine {
  constructor() {
    this.bgCanvas = document.getElementById('bgCanvas');
    this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;
    this.modalCanvas = null;
    this.modalCtx = null;

    this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*§µλπΨΩ∆FUNC_VARS';
    this.fontSize = 14;
    this.drops = [];
    this.animId = null;
    this.activeModal = false;
  }

  init() {
    if (!this.bgCanvas || !this.bgCtx) return;

    this.resizeBg();
    window.addEventListener('resize', () => this.resizeBg());
    this.startBgLoop();
  }

  resizeBg() {
    if (!this.bgCanvas) return;
    this.bgCanvas.width = window.innerWidth;
    this.bgCanvas.height = window.innerHeight;
    const columns = Math.floor(this.bgCanvas.width / this.fontSize);
    this.drops = Array(columns).fill(1);
  }

  startBgLoop() {
    const draw = () => {
      // Draw semi-transparent overlay for trailing effect
      this.bgCtx.fillStyle = 'rgba(10, 12, 16, 0.08)';
      this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

      const isMatrixTheme = document.body.classList.contains('theme-matrix');
      this.bgCtx.fillStyle = isMatrixTheme ? '#00ff66' : 'rgba(0, 240, 255, 0.35)';
      this.bgCtx.font = `${this.fontSize}px Fira Code, monospace`;

      for (let i = 0; i < this.drops.length; i++) {
        const char = this.characters[Math.floor(Math.random() * this.characters.length)];
        const x = i * this.fontSize;
        const y = this.drops[i] * this.fontSize;

        this.bgCtx.fillText(char, x, y);

        if (y > this.bgCanvas.height && Math.random() > 0.975) {
          this.drops[i] = 0;
        }
        this.drops[i]++;
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  startModalMode() {
    const modal = document.getElementById('gameModal');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');

    if (!modal || !modalBody) return;

    modalTitle.textContent = "MATRIX DIGITAL RAIN RUNTIME";
    modalBody.innerHTML = '<canvas id="matrixModalCanvas" style="width:100%; height:100%; display:block;"></canvas>';
    modal.classList.remove('hidden');

    this.modalCanvas = document.getElementById('matrixModalCanvas');
    this.modalCtx = this.modalCanvas.getContext('2d');
    this.modalCanvas.width = modalBody.clientWidth;
    this.modalCanvas.height = modalBody.clientHeight;

    const columns = Math.floor(this.modalCanvas.width / this.fontSize);
    const modalDrops = Array(columns).fill(1);
    this.activeModal = true;

    const renderModal = () => {
      if (!this.activeModal) return;

      this.modalCtx.fillStyle = 'rgba(3, 8, 4, 0.1)';
      this.modalCtx.fillRect(0, 0, this.modalCanvas.width, this.modalCanvas.height);

      this.modalCtx.fillStyle = '#00ff66';
      this.modalCtx.font = `${this.fontSize}px Fira Code, monospace`;

      for (let i = 0; i < modalDrops.length; i++) {
        const char = this.characters[Math.floor(Math.random() * this.characters.length)];
        const x = i * this.fontSize;
        const y = modalDrops[i] * this.fontSize;

        this.modalCtx.fillText(char, x, y);

        if (y > this.modalCanvas.height && Math.random() > 0.975) {
          modalDrops[i] = 0;
        }
        modalDrops[i]++;
      }
      this.animId = requestAnimationFrame(renderModal);
    };
    renderModal();
  }

  stopModalMode() {
    this.activeModal = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

window.matrixEngine = new MatrixEngine();
document.addEventListener('DOMContentLoaded', () => window.matrixEngine.init());
