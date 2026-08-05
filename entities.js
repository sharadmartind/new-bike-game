class Player {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 24;
    this.height = 48;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - 120;
    this.speed = 7;
    this.vx = 0;
    this.vy = 0;
  }

  update(keys) {
    this.vx = 0;
    this.vy = 0;

    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) this.vx = -this.speed;
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) this.vx = this.speed;
    if (keys["ArrowUp"] || keys["w"] || keys["W"]) this.vy = -this.speed * 0.5;
    if (keys["ArrowDown"] || keys["s"] || keys["S"]) this.vy = this.speed * 0.5;

    this.x += this.vx;
    this.y += this.vy;

    const minX = 40;
    const maxX = this.canvasWidth - 40 - this.width;
    const minY = 100;
    const maxY = this.canvasHeight - 60;

    if (this.x < minX) this.x = minX;
    if (this.x > maxX) this.x = maxX;
    if (this.y < minY) this.y = minY;
    if (this.y > maxY) this.y = maxY;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    ctx.ellipse(2, 4, 10, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = "#111";
    ctx.fillRect(-2, -22, 4, 10);
    ctx.fillRect(-2, 12, 4, 10);

    // Frame
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(0, 15);
    ctx.stroke();

    // Handlebars
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -12);
    ctx.lineTo(10, -12);
    ctx.stroke();

    // Courier
    ctx.fillStyle = "#ff3366";
    ctx.fillRect(-8, -2, 16, 12);

    ctx.fillStyle = "#00ffcc";
    ctx.beginPath();
    ctx.arc(0, -5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class Obstacle {
  constructor(canvasWidth, gameSpeed) {
    this.types = ["taxi", "bus", "van", "cone", "pothole"];
    this.type = this.types[Math.floor(Math.random() * this.types.length)];

    this.canvasWidth = canvasWidth;
    this.passed = false;

    switch (this.type) {
      case "bus":
        this.width = 44;
        this.height = 110;
        this.color = "#3366cc";
        break;
      case "taxi":
        this.width = 36;
        this.height = 68;
        this.color = "#ffcc00";
        break;
      case "van":
        this.width = 38;
        this.height = 75;
        this.color = "#eeeeee";
        break;
      case "cone":
        this.width = 18;
        this.height = 18;
        this.color = "#ff6600";
        break;
      case "pothole":
        this.width = 30;
        this.height = 22;
        this.color = "#111111";
        break;
    }

    const laneWidth = (canvasWidth - 80) / CONFIG.laneCount;
    const lane = Math.floor(Math.random() * CONFIG.laneCount);
    this.x = 40 + lane * laneWidth + (laneWidth / 2 - this.width / 2);
    this.y = -this.height - 20;

    this.speedOffset =
      this.type === "pothole" || this.type === "cone" ? 0 : Math.random() * 1.5;
  }

  update(gameSpeed) {
    this.y += gameSpeed - this.speedOffset;
  }

  draw(ctx) {
    ctx.save();

    if (this.type === "pothole") {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (this.type === "cone") {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(this.x + 3, this.y + 3, this.width, this.height);

      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      ctx.fillStyle = "#222";
      ctx.fillRect(this.x + 4, this.y + 12, this.width - 8, 12);
      ctx.fillRect(this.x + 4, this.y + this.height - 15, this.width - 8, 8);

      if (this.type === "taxi") {
        ctx.fillStyle = "#000";
        ctx.fillRect(
          this.x + this.width / 2 - 6,
          this.y + this.height / 2 - 4,
          12,
          8
        );
        ctx.fillStyle = "#fff";
        ctx.font = "8px sans-serif";
        ctx.fillText(
          "NYC",
          this.x + this.width / 2 - 7,
          this.y + this.height / 2 + 3
        );
      }

      if (this.type === "bus") {
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(this.x, this.y + 2, this.width, 4);
      }
    }

    ctx.restore();
  }
}
