const { cn } = require('../../lib/utils');

class WarpBackground {
  constructor(options = {}) {
    this.perspective = options.perspective || 100;
    this.beamsPerSide = options.beamsPerSide || 3;
    this.beamSize = options.beamSize || 5;
    this.beamDelayMax = options.beamDelayMax || 3;
    this.beamDelayMin = options.beamDelayMin || 0;
    this.beamDuration = options.beamDuration || 3;
    this.gridColor = options.gridColor || 'var(--border)';
    this.container = null;
  }

  createBeam(width, x, delay, duration) {
    const hue = Math.floor(Math.random() * 360);
    const ar = Math.floor(Math.random() * 10) + 1;
    const beam = document.createElement('div');
    
    beam.style.setProperty('--x', `${x}`);
    beam.style.setProperty('--width', `${width}`);
    beam.style.setProperty('--aspect-ratio', `${ar}`);
    beam.style.setProperty('--background', `linear-gradient(hsl(${hue} 80% 60%), transparent)`);
    
    beam.className = 'beam absolute';
    beam.style.left = 'var(--x)';
    beam.style.top = '0';
    beam.style.aspectRatio = '1/var(--aspect-ratio)';
    beam.style.background = 'var(--background)';
    beam.style.width = 'var(--width)';
    
    // Animation
    beam.animate(
      [
        { transform: 'translateY(100cqmax) translateX(-50%)' },
        { transform: 'translateY(-100%) translateX(-50%)' }
      ],
      {
        duration: duration * 1000,
        delay: delay * 1000,
        iterations: Infinity,
        easing: 'linear'
      }
    );
    
    return beam;
  }

  generateBeams() {
    const beams = [];
    const cellsPerSide = Math.floor(100 / this.beamSize);
    const step = cellsPerSide / this.beamsPerSide;

    for (let i = 0; i < this.beamsPerSide; i++) {
      const x = Math.floor(i * step);
      const delay = Math.random() * (this.beamDelayMax - this.beamDelayMin) + this.beamDelayMin;
      beams.push({ x, delay });
    }
    return beams;
  }

  mount(container) {
    this.container = container;
    this.container.className = cn('relative rounded border p-20');
    
    const warpContainer = document.createElement('div');
    warpContainer.style.setProperty('--perspective', `${this.perspective}px`);
    warpContainer.style.setProperty('--grid-color', this.gridColor);
    warpContainer.style.setProperty('--beam-size', `${this.beamSize}%`);
    warpContainer.className = 'warp-container';

    ['top', 'bottom', 'left', 'right'].forEach(side => {
      const sideElement = document.createElement('div');
      sideElement.className = `warp-side warp-side-${side}`;
      
      const beams = this.generateBeams();
      beams.forEach(beam => {
        const beamElement = this.createBeam(
          `${this.beamSize}%`,
          `${beam.x * this.beamSize}%`,
          beam.delay,
          this.beamDuration
        );
        sideElement.appendChild(beamElement);
      });
      
      warpContainer.appendChild(sideElement);
    });

    this.container.appendChild(warpContainer);
  }
}

module.exports = { WarpBackground }; 