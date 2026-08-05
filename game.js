class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = CONFIG.width;
    this.canvas.height = CONFIG.height;

    this.sound = new SoundController();
    this.particles = new ParticleSystem();

    this.isRunning = false;
    this.score = 0;
    this.speed = CONFIG.baseSpeed;
    this.roadOffset = 0;
    this.screenShake = 0;

    this.player = null;
    this.obstacles = [];
    this.spawnTimer = 0;
    this.keys = {};

    this.scoreEl = document.getElementById("score-val");
    this.speedEl = document.getElementById("speed-val");
    this.startCard = document.getElementById("start-card");
    this.gameOverCard = document.getElementById("gameover-card");
    this.finalScoreText = document.getElementById("final-score-text");

    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key] = true;
      if (!this.sound.isInitialized) this.sound.init();
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });

    document.getElementById("start-btn").addEventListener("click", () => {
      this.sound.init();
      this.start();
    });

    document.getElementById("restart-btn").addEventListener("click", () => {
      this.start();
    });
  }

  start() {
    this.player = new Player(this.canvas.width, this.canvas.height);
    this.obstacles = [];
    this.particles.clear();

    this.score = 0;
    this.speed = CONFIG.baseSpeed;
    this.spawnTimer = 0;
    this.screenShake = 0;
    this.isRunning = true;

    this.startCard.classList.add("hidden");
    this.gameOverCard.classList.add("hidden");

    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  gameOver() {
    this.isRunning = false;
    this.sound.playCrashSound();

    this.particles.explode(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2
    );
    this.screenShake = 20;

    this.draw();

    setTimeout(() => {
      this.finalScoreText.innerText = `Final Score: ${Math.floor(this.score)}`;
      this.gameOverCard.classList.remove("hidden");
    }, 800);
  }

  spawnObstacles() {
    this.spawnTimer++;
    const spawnInterval = Math.max(30, Math.floor(1000 / (this.speed * 10)));

    if (this.spawnTimer > spawnInterval) {
      this.obstacles.push(new Obstacle(this.canvas.width, this.speed));
      this.spawnTimer = 0;
    }
  }

  update() {
    if (this.speed < CONFIG.maxSpeed) {
      this.speed += CONFIG.speedIncRate;
    }

    const speedRatio =
      (this.speed - CONFIG.baseSpeed) / (CONFIG.maxSpeed - CONFIG.baseSpeed);

    this.sound.updateEngineSound(speedRatio);

    this.score += this.speed * 0.1;
    this.scoreEl.innerText = Math.floor(this.score).toString().padStart(4, "0");
    this.speedEl.innerText = `${Math.floor(this.speed * 3)} MPH`;

    this.roadOffset = (this.roadOffset + this.speed) % 40;

    this.player.update(this.keys);
    this.particles.emitDust(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height - 5,
      this.speed
    );
    this.particles.emitSpeedLine(
      this.canvas.width,
      this.canvas.height,
      speedRatio
    );
    this.particles.update();

    this.spawnObstacles();

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(this.speed);

      if (!obs.passed && obs.y > this.player.y + this.player.height) {
        obs.passed = true;
        this.sound.playBellSound();
      }

      if (
        this.player.x < obs.x + obs.width &&
        this.player.x + this.player.width > obs.x &&
        this.player.y < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y
      ) {
        this.gameOver();
        return;
      }

      if (obs.y > this.canvas.height + 150) {
        this.obstacles.splice(i, 1);
      }
    }

    if (this.screenShake > 0) this.screenShake *= 0.9;
  }

  draw() {
    this.ctx.save();

    if (this.screenShake > 0.5) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(shakeX, shakeY);
    }

    // Asphalt Road
    this.ctx.fillStyle = "#222225";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Sidewalks
    this.ctx.fillStyle = "#444448";
    this.ctx.fillRect(0, 0, 40, this.canvas.height);
    this.ctx.fillRect(this.canvas.width - 40, 0, 40, this.canvas.height);

    // Green NYC Bike Lanes
    this.ctx.fillStyle = "rgba(0, 180, 120, 0.25)";
    this.ctx.fillRect(40, 0, 80, this.canvas.height);

    // Dashed Lane Lines
    this.ctx.strokeStyle = "#ffcc00";
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([20, 20]);
    this.ctx.lineDashOffset = -this.roadOffset;

    const laneWidth = (this.canvas.width - 80) / CONFIG.laneCount;
    for (let i = 1; i < CONFIG.laneCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(40 + i * laneWidth, -40);
      this.ctx.lineTo(40 + i * laneWidth, this.canvas.height + 40);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);

    // Entities & Effects
    this.obstacles.forEach((obs) => obs.draw(this.ctx));
    if (this.isRunning) this.player.draw(this.ctx);
    this.particles.draw(this.ctx);

    this.ctx.restore();
  }

  loop(timestamp) {
    if (!this.isRunning) return;

    this.update();
    this.draw();

    requestAnimationFrame((ts) => this.loop(ts));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new Game();
});
