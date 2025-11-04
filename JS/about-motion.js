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

    gsap.set(section, { opacity: 0, y: 16 });
    items.forEach((item) => {
      gsap.set(item, { opacity: 0, y: 12 });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        once: true,
      },
    })
      .to(section, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      })
      .to(items, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'back.out(1.4)',
        stagger: 0.05,
      }, '-=0.2');
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

  const pluckTargets = document.querySelectorAll('.about-card, .code-token');

  pluckTargets.forEach((target) => {
    const playPluck = () => {
      gsap.to(target, {
        scale: 1.03,
        duration: 0.15,
        ease: 'back.out(2)',
      });
    };

    const resetPluck = () => {
      gsap.to(target, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    };

    target.addEventListener('mouseenter', playPluck);
    target.addEventListener('focusin', playPluck);
    target.addEventListener('mouseleave', resetPluck);
    target.addEventListener('focusout', resetPluck);
  });
})();
