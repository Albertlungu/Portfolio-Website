document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const linkElements = document.querySelectorAll('.links a');
  const textPanel = document.querySelector('.text-panel');

  const pointerIsFine = (event) => {
    return event.pointerType === 'mouse' || event.pointerType === 'pen' || event.pointerType === '';
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
      if (customCursor) {
        customCursor.classList.add('custom-cursor--link');
      }
    });

    link.addEventListener('pointermove', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      updateLinkGradient(link, event);
    });

    link.addEventListener('pointerleave', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      link.style.setProperty('--hover-x', '50%');
      if (customCursor) {
        customCursor.classList.remove('custom-cursor--link');
      }
    });
  });

  const supportsFinePointer = window.matchMedia('(pointer: fine)').matches;
  let customCursor = null;
  let cursorVisible = false;
  let radiusResetTimeout = null;

  if (supportsFinePointer) {
    customCursor = document.createElement('div');
    customCursor.className = 'custom-cursor';
    body.appendChild(customCursor);
  }

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
      if (customCursor) {
        customCursor.classList.add('custom-cursor--panel');
      }
    });

    textPanel.addEventListener('pointermove', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      updatePanelGlow(event);
    });

    textPanel.addEventListener('pointerleave', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      textPanel.classList.remove('text-panel--interactive');
      if (customCursor) {
        customCursor.classList.remove('custom-cursor--panel');
      }
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

  const showCursor = () => {
    if (!customCursor || cursorVisible) {
      return;
    }
    customCursor.classList.add('custom-cursor--visible');
    body.classList.add('custom-cursor-active');
    cursorVisible = true;
  };

  const hideCursor = () => {
    if (!customCursor) {
      return;
    }
    customCursor.classList.remove('custom-cursor--visible', 'custom-cursor--link', 'custom-cursor--pressed');
    cursorVisible = false;
  };

  if (customCursor) {
    window.addEventListener('pointermove', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }

      showCursor();
      customCursor.style.left = `${event.clientX}px`;
      customCursor.style.top = `${event.clientY}px`;
    });

    window.addEventListener('pointerdown', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      customCursor.classList.add('custom-cursor--pressed');
    });

    window.addEventListener('pointerup', (event) => {
      if (!pointerIsFine(event)) {
        return;
      }
      customCursor.classList.remove('custom-cursor--pressed');
    });

    document.addEventListener('pointerout', (event) => {
      if (!pointerIsFine(event) || event.relatedTarget) {
        return;
      }
      hideCursor();
    });

    window.addEventListener('blur', () => {
      hideCursor();
    });
  }
});
