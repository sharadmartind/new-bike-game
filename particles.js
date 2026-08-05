class Particle {
  constructor(x, y, vx, vy, color, size, life, type = "dust") {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.type = type;
    this.markedForDeletion = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    if (this.type === "debris") {
      this.vx *= 0.95;
      this.vy *= 0.95;
      this.size *= 0.97;
    }

    if (this.life <= 0) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.save();
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.globalAlpha = alpha;

    if (this.type === "speedline") {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.size;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y + this.vy * 3);
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].markedForDeletion) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    this.particles.forEach((p) => p.draw(ctx));
  }

  emitDust(x, y, speed) {
    for (let i = 0; i < CONFIG.particles.dustRate; i++) {
      const vx = (Math.random() - 0.5) * 1.5;
      const vy = speed * 0.3 + Math.random() * 2;
      const size = Math.random() * 3 + 1;
      const life = Math.random() * 20 + 10;
      const color = Math.random() > 0.5 ? "#999999" : "#cccccc";

      this.particles.push(
        new Particle(x, y, vx, vy, color, size, life, "dust"),
      );
    }
  }

  emitSpeedLine(canvasWidth, canvasHeight, speedRatio) {
    if (Math.random() > speedRatio) return;

    const isLeft = Math.random() > 0.5;
    const margin = 40;
    const x = isLeft
      ? Math.random() * margin
      : canvasWidth - Math.random() * margin;
    const y = -20;
    const vy = 15 + speedRatio * 25;
    const size = Math.random() * 1.5 + 0.5;
    const life = 25;

    this.particles.push(
      new Particle(
        x,
        y,
        0,
        vy,
        "rgba(255, 255, 255, 0.6)",
        size,
        life,
        "speedline",
      ),
    );
  }

  explode(x, y) {
    const colors = ["#ff3366", "#ffcc00", "#00ffcc", "#ffffff", "#333333"];
    for (let i = 0; i < CONFIG.particles.debrisCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const force = Math.random() * 12 + 2;
      const vx = Math.cos(angle) * force;
      const vy = Math.sin(angle) * force;
      const size = Math.random() * 6 + 3;
      const life = Math.random() * 40 + 20;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push(
        new Particle(x, y, vx, vy, color, size, life, "debris"),
      );
    }
  }

  clear() {
    this.particles = [];
  }
}
