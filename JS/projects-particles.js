const initProjectsParticles = () => {
  const canvas = document.getElementById('bg');

  if (!canvas) {
    console.warn('Projects particles: canvas with id "bg" not found.');
    return;
  }

  if (canvas.dataset.projectsParticlesAttached) {
    return;
  }

  canvas.dataset.projectsParticlesAttached = 'true';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('Projects particles: 2D context unavailable.');
    return;
  }

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  const particles = [];
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
  let scrollProgress = 0;
  let lastTimestamp = 0;

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    adjustParticleCount();
  };

  const adjustParticleCount = () => {
    const targetCount = Math.min(220, Math.floor((width * height) / 11000));
    while (particles.length < targetCount) {
      particles.push(createParticle());
    }
    while (particles.length > targetCount) {
      particles.pop();
    }
  };

  const createParticle = () => {
    const depth = randomInRange(0.4, 1.05);
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      depth,
      radius: randomInRange(1.2, 3.2) * depth,
      alpha: randomInRange(0.3, 0.85) * depth,
      driftX: randomInRange(-0.05, 0.05) * depth,
      driftY: randomInRange(0.02, 0.14) * depth,
      pulseSpeed: randomInRange(0.0012, 0.0036),
      pulseOffset: Math.random() * Math.PI * 2,
    };
  };

  const updateScrollProgress = () => {
    const doc = document.documentElement;
    const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
    scrollProgress = doc.scrollTop / scrollable;
  };

  const updatePointer = (event) => {
    pointer.targetX = (event.clientX / width - 0.5) * 2;
    pointer.targetY = (event.clientY / height - 0.5) * 2;
    pointer.active = true;
  };

  const clearPointer = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    pointer.active = false;
  };

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('pointermove', updatePointer);
  window.addEventListener('pointerleave', clearPointer);

  resizeCanvas();
  updateScrollProgress();

  const draw = (timestamp = 0) => {
    const delta = Math.min((timestamp - lastTimestamp) / 16.67, 1.2);
    lastTimestamp = timestamp;

    pointer.x += ((pointer.active ? pointer.targetX : 0) - pointer.x) * 0.08 * delta;
    pointer.y += ((pointer.active ? pointer.targetY : 0) - pointer.y) * 0.08 * delta;

    const hueBase = 26 + Math.sin(timestamp * 0.00016) * 6;
    const hueSecondary = 38 + Math.cos(timestamp * 0.00018) * 8;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsla(${hueBase}, 60%, 18%, 0.34)`);
    gradient.addColorStop(0.5, `hsla(${hueBase + 8}, 56%, 15%, 0.28)`);
    gradient.addColorStop(1, `hsla(${hueSecondary}, 58%, 14%, 0.32)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((particle) => {
      particle.x += particle.driftX * delta * 60;
      particle.y += particle.driftY * delta * 60;

      if (particle.x < -50) particle.x = width + 50;
      if (particle.x > width + 50) particle.x = -50;
      if (particle.y < -50) particle.y = height + 50;
      if (particle.y > height + 50) particle.y = -50;

      const parallaxX = pointer.x * 28 * particle.depth + scrollProgress * 18 * (particle.depth - 0.5);
      const parallaxY = pointer.y * 24 * particle.depth + scrollProgress * 110 * (particle.depth - 0.4);

      const px = particle.x + parallaxX;
      const py = particle.y + parallaxY;

      const pulse = 0.6 + Math.sin(timestamp * particle.pulseSpeed + particle.pulseOffset) * 0.4;
      const radius = particle.radius * (1 + pointer.y * 0.16 + pulse * 0.3);
      const alpha = Math.max(0.16, particle.alpha * (0.72 + pulse * 0.3));

      const hue = hueBase + pointer.x * 10 + particle.depth * 18;
      const lightness = 60 + pointer.y * 10 + particle.depth * 18;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 74%, ${lightness}%, ${alpha})`;
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();

      if (particle.depth > 0.7) {
        ctx.beginPath();
        ctx.fillStyle = `hsla(${(hue + 16) % 360}, 84%, ${Math.min(92, lightness + 10)}%, ${alpha * 0.35})`;
        ctx.arc(px, py, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsParticles);
} else {
  initProjectsParticles();
}
