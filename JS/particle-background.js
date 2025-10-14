// About page particle background
const initParticles = () => {
  const canvas = document.getElementById('bg');

  if (!canvas) {
    console.warn('Particle background: canvas with id "bg" not found.');
    return;
  }

  if (canvas.dataset.particlesAttached) {
    return;
  }

  canvas.dataset.particlesAttached = 'true';

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('Particle background: 2D context unavailable.');
    return;
  }

  console.info('Particle background initialized.');

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
    const targetCount = Math.min(200, Math.floor((width * height) / 12000));
    while (particles.length < targetCount) {
      particles.push(createParticle());
    }
    while (particles.length > targetCount) {
      particles.pop();
    }
  };

  const createParticle = () => {
    const depth = randomInRange(0.35, 1);
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      depth,
      radius: randomInRange(1.4, 3.8) * depth,
      alpha: randomInRange(0.35, 0.9) * depth,
      driftX: randomInRange(-0.06, 0.06) * depth,
      driftY: randomInRange(0.02, 0.16) * depth,
      pulseSpeed: randomInRange(0.001, 0.0035),
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

    const hueBase = (timestamp * 0.00006 * 360 + scrollProgress * 120) % 360;
    const hueSecondary = (hueBase + 120) % 360;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsla(${hueBase}, 58%, 16%, 0.32)`);
    gradient.addColorStop(0.5, `hsla(${(hueBase + 40) % 360}, 52%, 12%, 0.26)`);
    gradient.addColorStop(1, `hsla(${hueSecondary}, 62%, 14%, 0.34)`);
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

      const parallaxX = pointer.x * 30 * particle.depth + scrollProgress * 22 * (particle.depth - 0.5);
      const parallaxY = pointer.y * 24 * particle.depth + scrollProgress * 140 * (particle.depth - 0.4);

      const px = particle.x + parallaxX;
      const py = particle.y + parallaxY;

      const pulse = 0.6 + Math.sin(timestamp * particle.pulseSpeed + particle.pulseOffset) * 0.4;
      const radius = particle.radius * (1 + pointer.y * 0.18 + pulse * 0.35);
      const alpha = Math.max(0.18, particle.alpha * (0.75 + pulse * 0.35));

      const hue = (hueBase + pointer.x * 24 + particle.depth * 18) % 360;
      const lightness = 60 + pointer.y * 12 + particle.depth * 20;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${hue}, 78%, ${lightness}%, ${alpha})`;
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `hsla(${(hue + 12) % 360}, 88%, ${Math.min(95, lightness + 12)}%, ${alpha * 0.35})`;
      ctx.arc(px, py, radius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      if (particle.depth > 0.75) {
        const trailLength = 12 * particle.depth;
        const gradientTrail = ctx.createLinearGradient(px, py, px - particle.driftX * trailLength * 120, py - particle.driftY * trailLength * 120);
        gradientTrail.addColorStop(0, `hsla(${(hue + 22) % 360}, 85%, ${Math.min(82, lightness + 12)}%, ${alpha * 0.45})`);
        gradientTrail.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradientTrail;
        ctx.lineWidth = Math.max(0.4, radius * 0.65);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - particle.driftX * trailLength * 120, py - particle.driftY * trailLength * 120);
        ctx.stroke();
      }
    });

    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initParticles);
} else {
  initParticles();
}
