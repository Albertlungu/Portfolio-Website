(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger) {
    console.warn('GSAP or ScrollTrigger not available for about-motion.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const sections = document.querySelectorAll('[data-animate]');

  const applyDayNightPalette = () => {
    const now = new Date();
    const hours = now.getHours();
    const isNight = hours >= 18 || hours < 6;
    document.body.dataset.themeVariant = isNight ? 'night' : 'day';
  };

  applyDayNightPalette();
  setInterval(applyDayNightPalette, 1000 * 60 * 10);

  sections.forEach((section) => {
    const items = section.querySelectorAll('[data-animate-item]');

    gsap.set(section, { opacity: 0, y: 32 });
    items.forEach((item, index) => {
      const direction = index % 2 === 0 ? -48 : 48;
      gsap.set(item, { opacity: 0, x: direction, y: 0 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 82%',
        once: true,
      },
    })
      .to(section, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      })
      .to(items, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.08,
      }, '-=0.38');
  });

  document.querySelectorAll('[data-syntax]').forEach((group) => {
    const tokens = group.querySelectorAll('.syntax-target, .code-token');

    gsap.set(tokens, { opacity: 0.8 });

    const hoverIn = () => {
      gsap.to(tokens, {
        opacity: 1,
        duration: 0.4,
        ease: 'power1.out',
        stagger: {
          each: 0.07,
          from: 'random',
        },
      });
    };

    const hoverOut = () => {
      gsap.to(tokens, {
        opacity: 0.85,
        duration: 0.4,
        ease: 'power1.out',
      });
    };

    group.addEventListener('mouseenter', hoverIn);
    group.addEventListener('focusin', hoverIn);
    group.addEventListener('mouseleave', hoverOut);
    group.addEventListener('focusout', hoverOut);
  });

  const pluckTargets = document.querySelectorAll('.about-section, .about-card, .about-media, .code-token');

  pluckTargets.forEach((target) => {
    const hoverTl = gsap.timeline({ paused: true });

    hoverTl.to(target, {
      keyframes: [
        { scale: 1.05, rotation: 0.6, duration: 0.18, ease: 'power3.out' },
        { scale: 1.02, rotation: -0.3, duration: 0.12, ease: 'power3.inOut' },
      ],
    });

    const playPluck = () => {
      hoverTl.restart();
    };

    const resetPluck = () => {
      gsap.to(target, {
        scale: 1,
        rotation: 0,
        duration: 0.22,
        ease: 'elastic.out(1, 0.6)',
      });
    };

    target.addEventListener('mouseenter', playPluck);
    target.addEventListener('focusin', playPluck);
    target.addEventListener('mouseleave', resetPluck);
    target.addEventListener('focusout', resetPluck);
  });
})();
