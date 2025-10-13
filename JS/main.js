document.addEventListener('DOMContentLoaded', () => {
  const linkElements = document.querySelectorAll('.links a');
  const textPanel = document.querySelector('.text-panel');
  const body = document.body;

  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
  const themeCursor = supportsFinePointer ? document.createElement('div') : null;
  if (themeCursor) {
    themeCursor.className = 'cursor-theme';
    document.body.appendChild(themeCursor);
  }

  const heroParallax = document.querySelector('.hero-parallax');
  const parallaxLayers = heroParallax ? Array.from(heroParallax.querySelectorAll('.parallax-layer')) : [];

  let parallaxMouseX = 0.5;
  let parallaxMouseY = 0.5;
  let parallaxFrame = null;

  const scheduleParallax = () => {
    if (!parallaxLayers.length) {
      return;
    }
    if (parallaxFrame) {
      return;
    }
    parallaxFrame = requestAnimationFrame(() => {
      parallaxFrame = null;
      const scrollFactor = Math.min(1, window.scrollY / (window.innerHeight || 1));
      parallaxLayers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth || '0');
        const translateX = (parallaxMouseX - 0.5) * depth * 90;
        const translateY = (parallaxMouseY - 0.5) * depth * 60 + scrollFactor * depth * 120;
        layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
      });
    });
  };

  if (parallaxLayers.length) {
    scheduleParallax();
    window.addEventListener('pointermove', (event) => {
      parallaxMouseX = event.clientX / window.innerWidth;
      parallaxMouseY = event.clientY / window.innerHeight;
      scheduleParallax();
    });

    window.addEventListener('scroll', scheduleParallax, { passive: true });
    window.addEventListener('resize', scheduleParallax);
  }

  const pointerIsFine = (event) => {
    return event.pointerType === 'mouse' || event.pointerType === 'pen' || event.pointerType === '';
  };

  const showThemeCursor = () => {
    if (!themeCursor) {
      return;
    }
    themeCursor.classList.add('cursor-theme--visible');
    body.classList.add('custom-cursor-active');
  };

  const hideThemeCursor = () => {
    if (!themeCursor) {
      return;
    }
    themeCursor.classList.remove('cursor-theme--visible', 'cursor-theme--link', 'cursor-theme--panel');
    body.classList.remove('custom-cursor-active');
  };

  const updateLinkGradient = (link, event) => {
    const rect = link.getBoundingClientRect();
    const position = ((event.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, position));
    link.style.setProperty('--hover-x', `${clamped}%`);
  };

  const updatePanelGlow = (event) => {
    if (!textPanel) {
      return;
    }
    const rect = textPanel.getBoundingClientRect();
    const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
    const relativeY = ((event.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(0, Math.min(100, relativeX));
    const clampedY = Math.max(0, Math.min(100, relativeY));
    textPanel.style.setProperty('--panel-hover-x', `${clampedX}%`);
    textPanel.style.setProperty('--panel-hover-y', `${clampedY}%`);
  };

  linkElements.forEach((link) => {
    link.addEventListener('pointerenter', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      updateLinkGradient(link, event);
      themeCursor?.classList.add('cursor-theme--link');
    });

    link.addEventListener('pointermove', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      updateLinkGradient(link, event);
      themeCursor && (themeCursor.style.left = `${event.clientX}px`);
      themeCursor && (themeCursor.style.top = `${event.clientY}px`);
    });

    link.addEventListener('pointerleave', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      link.style.setProperty('--hover-x', '50%');
      themeCursor?.classList.remove('cursor-theme--link');
    });
  });

  let radiusResetTimeout = null;

  if (textPanel) {
    const resetPanelRadius = () => {
      textPanel.style.removeProperty('--panel-radius-tl');
      textPanel.style.removeProperty('--panel-radius-tr');
      textPanel.style.removeProperty('--panel-radius-br');
      textPanel.style.removeProperty('--panel-radius-bl');
    };

    const clampValue = (value, min, max) => Math.max(min, Math.min(max, value));

    textPanel.addEventListener('pointerenter', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      if (radiusResetTimeout) {
        clearTimeout(radiusResetTimeout);
        radiusResetTimeout = null;
      }
      resetPanelRadius();
      updatePanelGlow(event);
      textPanel.classList.add('text-panel--interactive');
      themeCursor?.classList.add('cursor-theme--panel');
      themeCursor && (themeCursor.style.left = `${event.clientX}px`);
      themeCursor && (themeCursor.style.top = `${event.clientY}px`);
    });

    textPanel.addEventListener('pointermove', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      updatePanelGlow(event);
      themeCursor && (themeCursor.style.left = `${event.clientX}px`);
      themeCursor && (themeCursor.style.top = `${event.clientY}px`);
    });

    textPanel.addEventListener('pointerleave', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      textPanel.classList.remove('text-panel--interactive');
      themeCursor?.classList.remove('cursor-theme--panel');
      if (radiusResetTimeout) {
        clearTimeout(radiusResetTimeout);
      }

      const rect = textPanel.getBoundingClientRect();
      const leavePercentX = clampValue(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
      const leavePercentY = clampValue(((event.clientY - rect.top) / rect.height) * 100, 0, 100);
      textPanel.style.setProperty('--panel-hover-x', `${leavePercentX}%`);
      textPanel.style.setProperty('--panel-hover-y', `${leavePercentY}%`);

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const exitX = event.clientX - centerX;
      const exitY = event.clientY - centerY;
      const horizontalInfluence = clampValue(exitX / (rect.width / 2), -1, 1);
      const verticalInfluence = clampValue(exitY / (rect.height / 2), -1, 1);

      const computedStyles = getComputedStyle(textPanel);
      const baseRadius = parseFloat(computedStyles.getPropertyValue('--panel-radius-base')) || 28;
      const stretchLimit = 18;
      const minRadius = Math.max(6, baseRadius - stretchLimit);
      const clampRadius = (value) => clampValue(value, minRadius, baseRadius + stretchLimit);

      const horizontalAmount = Math.abs(horizontalInfluence) * stretchLimit;
      const verticalAmount = Math.abs(verticalInfluence) * stretchLimit;

      let tl = baseRadius;
      let tr = baseRadius;
      let br = baseRadius;
      let bl = baseRadius;

      if (horizontalInfluence > 0) {
        tr = clampRadius(baseRadius + horizontalAmount);
        br = clampRadius(baseRadius + horizontalAmount);
        tl = clampRadius(baseRadius - horizontalAmount * 0.6);
        bl = clampRadius(baseRadius - horizontalAmount * 0.6);
      } else if (horizontalInfluence < 0) {
        tl = clampRadius(baseRadius + horizontalAmount);
        bl = clampRadius(baseRadius + horizontalAmount);
        tr = clampRadius(baseRadius - horizontalAmount * 0.6);
        br = clampRadius(baseRadius - horizontalAmount * 0.6);
      }

      if (verticalInfluence > 0) {
        bl = clampRadius(bl + verticalAmount);
        br = clampRadius(br + verticalAmount);
        tl = clampRadius(tl - verticalAmount * 0.5);
        tr = clampRadius(tr - verticalAmount * 0.5);
      } else if (verticalInfluence < 0) {
        tl = clampRadius(tl + verticalAmount);
        tr = clampRadius(tr + verticalAmount);
        bl = clampRadius(bl - verticalAmount * 0.5);
        br = clampRadius(br - verticalAmount * 0.5);
      }

      textPanel.style.setProperty('--panel-radius-tl', `${tl}px`);
      textPanel.style.setProperty('--panel-radius-tr', `${tr}px`);
      textPanel.style.setProperty('--panel-radius-br', `${br}px`);
      textPanel.style.setProperty('--panel-radius-bl', `${bl}px`);

      radiusResetTimeout = setTimeout(() => {
        resetPanelRadius();
        radiusResetTimeout = null;
      }, 650);
    });
  }

  if (themeCursor) {
    window.addEventListener('pointermove', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      showThemeCursor();
      themeCursor.style.left = `${event.clientX}px`;
      themeCursor.style.top = `${event.clientY}px`;
    });

    window.addEventListener('pointerdown', () => {
      themeCursor?.classList.add('cursor-theme--pressed');
    });

    window.addEventListener('pointerup', () => {
      themeCursor?.classList.remove('cursor-theme--pressed');
    });

    document.addEventListener('pointerout', (event) => {
      if (!pointerIsFine(event) || event.relatedTarget) {
        return;
      }
      hideThemeCursor();
    });

    window.addEventListener('blur', hideThemeCursor);
  }
});
