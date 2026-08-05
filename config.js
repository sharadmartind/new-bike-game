const CONFIG = {
  // Canvas dimensions
  width: 480,
  height: 720,
  laneCount: 4,

  // Speed variables
  baseSpeed: 5,
  maxSpeed: 18,
  speedIncRate: 0.002,

  // Audio Gain Controls (0.0 to 1.0)
  audio: {
    masterVolume: 0.3,
    engineVolume: 0.15,
    bellVolume: 0.4,
    crashVolume: 0.6,
  },

  // Particle Multipliers
  particles: {
    dustRate: 2,
    speedLines: 25,
    debrisCount: 60,
  },
};
