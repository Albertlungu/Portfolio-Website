const initIntroGradient = () => {
  const root = document.documentElement;

  if (!root || !document.body.classList.contains('is-intro')) {
    return;
  }

  const baseHue = 26;
  const soften = 8;

  const applyPalette = () => {
    root.style.setProperty('--color-bg-soft', `hsl(${baseHue + soften}, 52%, 30%)`);
    root.style.setProperty('--color-bg-mid', `hsl(${baseHue + soften / 2}, 46%, 24%)`);
    root.style.setProperty('--color-bg-deep', `hsl(${baseHue}, 42%, 18%)`);
  };

  applyPalette();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntroGradient);
} else {
  initIntroGradient();
}
