const initIntroGradient = () => {
  const root = document.documentElement;

  if (!root || !document.body.classList.contains('is-intro')) {
    return;
  }

  let startHue = 24;
  let lastTime = performance.now();

  const update = (now) => {
    const delta = now - lastTime;
    lastTime = now;

    startHue = (startHue + delta * 0.005) % 360;

    const hueSoft = (startHue + 10) % 360;
    const hueMid = (startHue + 30) % 360;
    const hueDeep = (startHue + 60) % 360;

    root.style.setProperty('--color-bg-soft', `hsl(${hueSoft}, 42%, 28%)`);
    root.style.setProperty('--color-bg-mid', `hsl(${hueMid}, 38%, 22%)`);
    root.style.setProperty('--color-bg-deep', `hsl(${hueDeep}, 34%, 16%)`);

    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntroGradient);
} else {
  initIntroGradient();
}
