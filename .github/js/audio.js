class SoundController {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;

    this.masterGain = null;

    // Engine / Traffic Hum Nodes
    this.engineOsc = null;
    this.engineFilter = null;
    this.engineGain = null;
  }

  init() {
    if (this.isInitialized) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Output Volume
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(
      CONFIG.audio.masterVolume,
      this.ctx.currentTime
    );
    this.masterGain.connect(this.ctx.destination);

    // --- Engine Noise Synthesizer ---
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = "sawtooth";

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(
      CONFIG.audio.engineVolume,
      this.ctx.currentTime
    );

    this.engineOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
    this.isInitialized = true;
  }

  updateEngineSound(currentSpeedRatio) {
    if (!this.isInitialized) return;
    const now = this.ctx.currentTime;

    const targetFreq = 50 + currentSpeedRatio * 80;
    const targetCutoff = 100 + currentSpeedRatio * 250;

    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    this.engineFilter.frequency.setTargetAtTime(targetCutoff, now, 0.1);
  }

  playBellSound() {
    if (!this.isInitialized) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(2093, now); // C7
    osc2.frequency.setValueAtTime(2528, now); // D7#

    bellGain.gain.setValueAtTime(CONFIG.audio.bellVolume, now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(bellGain);
    osc2.connect(bellGain);
    bellGain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  playCrashSound() {
    if (!this.isInitialized) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + 0.4);

    const crashGain = this.ctx.createGain();
    crashGain.gain.setValueAtTime(CONFIG.audio.crashVolume, now);
    crashGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(crashGain);
    crashGain.connect(this.masterGain);

    noise.start(now);
  }
}
