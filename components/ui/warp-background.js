const { cn } = require('../../lib/utils');

class WarpBackground {
  constructor({
    perspective = 100,
    beamsPerSide = 3,
    beamSize = 5,
    beamDelayMax = 3,
    beamDelayMin = 0,
    beamDuration = 3,
    gridColor = 'hsl(var(--border))'
  } = {}) {
    this.perspective = perspective;
    this.beamsPerSide = beamsPerSide;
    this.beamSize = beamSize;
    this.beamDelayMax = beamDelayMax;
    this.beamDelayMin = beamDelayMin;
    this.beamDuration = beamDuration;
    this.gridColor = gridColor;
  }

  createBeam(width, x, delay, duration) {
    const hue = Math.floor(Math.random() * 360);
    const ar = Math.floor(Math.random() * 10) + 1;
    
    const beam = document.createElement('div');
    beam.style.setProperty('--x', `${x}`);
    beam.style.setProperty('--width', `${width}`);
    beam.style.setProperty('--aspect-ratio', `${ar}`);
    beam.style.setProperty('--background', `linear-gradient(hsl(${hue} 80% 60%), transparent)`);
    
    beam.className = 'absolute left-[var(--x)] top-0 beam';
    beam.style.aspectRatio = `1/${ar}`;
    beam.style.background = `linear-gradient(hsl(${hue} 80% 60%), transparent)`;
    beam.style.width = width;
    beam.style.transform = 'translateX(-50%)';
    
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
    const wrapper = document.createElement('div');
    wrapper.className = cn('relative rounded border p-20');
    
    const innerWrapper = document.createElement('div');
    innerWrapper.style.setProperty('--perspective', `${this.perspective}px`);
    innerWrapper.style.setProperty('--grid-color', this.gridColor);
    innerWrapper.style.setProperty('--beam-size', `${this.beamSize}%`);
    innerWrapper.className = 'pointer-events-none absolute left-0 top-0 size-full overflow-hidden [clip-path:inset(0)] [container-type:size] [perspective:var(--perspective)] [transform-style:preserve-3d]';

    const sides = ['top', 'bottom', 'left', 'right'];
    const sideElements = {};

    sides.forEach(side => {
      const sideEl = document.createElement('div');
      sideEl.className = `absolute ${side}-side [transform-style:preserve-3d] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size]`;

      switch(side) {
        case 'top':
          sideEl.style.transform = 'rotateX(-90deg)';
          sideEl.style.transformOrigin = '50% 0%';
          sideEl.style.width = '100cqi';
          sideEl.style.height = '100cqmax';
          break;
        case 'bottom':
          sideEl.style.transform = 'rotateX(-90deg)';
          sideEl.style.transformOrigin = '50% 0%';
          sideEl.style.width = '100cqi';
          sideEl.style.height = '100cqmax';
          sideEl.style.top = '100%';
          break;
        case 'left':
          sideEl.style.transform = 'rotate(90deg) rotateX(-90deg)';
          sideEl.style.transformOrigin = '0% 0%';
          sideEl.style.width = '100cqh';
          sideEl.style.height = '100cqmax';
          break;
        case 'right':
          sideEl.style.transform = 'rotate(-90deg) rotateX(-90deg)';
          sideEl.style.transformOrigin = '100% 0%';
          sideEl.style.width = '100cqh';
          sideEl.style.height = '100cqmax';
          sideEl.style.right = '0';
          break;
      }

      const beams = this.generateBeams();
      beams.forEach((beam, index) => {
        const beamEl = this.createBeam(
          `${this.beamSize}%`,
          `${beam.x * this.beamSize}%`,
          beam.delay,
          this.beamDuration
        );
        sideEl.appendChild(beamEl);
      });

      sideElements[side] = sideEl;
      innerWrapper.appendChild(sideEl);
    });

    const content = document.createElement('div');
    content.className = 'relative';
    content.innerHTML = container.innerHTML;
    container.innerHTML = '';

    wrapper.appendChild(innerWrapper);
    wrapper.appendChild(content);
    container.appendChild(wrapper);
  }
}

module.exports = WarpBackground; 