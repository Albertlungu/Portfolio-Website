const canvas = document.getElementById('bg');

if (!canvas) {
  console.warn('Canvas with id "bg" not found for about page background.');
} else {
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
        const { innerWidth, innerHeight } = window;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = innerWidth * ratio;
        canvas.height = innerHeight * ratio;
        canvas.style.width = `${innerWidth}px`;
        canvas.style.height = `${innerHeight}px`;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    const createBlob = (index) => {
        const baseRadius = 220 + Math.random() * 160;
        return {
            index,
            baseRadius,
            x: Math.random(),
            y: Math.random(),
            offsetX: Math.random() * Math.PI * 2,
            offsetY: Math.random() * Math.PI * 2,
            hue: 28 + Math.random() * 50,
            saturation: 60 + Math.random() * 20,
        };
    };

    const blobs = Array.from({ length: 6 }, (_, index) => createBlob(index));

    const pointerTarget = { x: 0, y: 0 };
    const pointerCurrent = { x: 0, y: 0 };
    let scrollProgress = 0;

    const updateScrollProgress = () => {
        const doc = document.documentElement;
        const scrollable = Math.max(doc.scrollHeight - window.innerHeight, 1);
        scrollProgress = doc.scrollTop / scrollable;
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    if (window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('pointermove', (event) => {
            pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
            pointerTarget.y = (event.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    const lerp = (current, target, factor) => current + (target - current) * factor;

    const render = () => {
        pointerCurrent.x = lerp(pointerCurrent.x, pointerTarget.x, 0.08);
        pointerCurrent.y = lerp(pointerCurrent.y, pointerTarget.y, 0.08);

        const { innerWidth: width, innerHeight: height } = window;

        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(12, 6, 4, 0.12)';
        ctx.fillRect(0, 0, width, height);

        const time = performance.now() * 0.00028;

        blobs.forEach((blob, index) => {
            const xWave = Math.sin(time * (1.1 + index * 0.05) + blob.offsetX);
            const yWave = Math.cos(time * (1.2 + index * 0.04) + blob.offsetY);

            const pointerInfluence = 1 + pointerCurrent.x * 0.18 + pointerCurrent.y * 0.12;
            const scrollYOffset = scrollProgress * height * 0.45 * (index % 2 === 0 ? 1 : -1);

            const centerX = width * (blob.x + xWave * 0.08 + pointerCurrent.x * 0.04);
            const centerY = height * (blob.y + yWave * 0.06 + pointerCurrent.y * 0.04) + scrollYOffset;

            const radius = blob.baseRadius * (0.8 + Math.sin(time * 1.6 + index) * 0.08) * pointerInfluence;
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.08, centerX, centerY, radius);

            const hueShift = blob.hue + pointerCurrent.x * 16 + scrollProgress * 28;
            const saturation = Math.min(blob.saturation + scrollProgress * 24, 95);

            gradient.addColorStop(0, `hsla(${hueShift}, ${saturation}%, 78%, 0.58)`);
            gradient.addColorStop(0.38, `hsla(${hueShift + 12}, ${saturation}%, 70%, 0.34)`);
            gradient.addColorStop(0.78, `hsla(${hueShift + 28}, ${saturation - 12}%, 48%, 0.18)`);
            gradient.addColorStop(1, 'hsla(210, 100%, 10%, 0)');

            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            const glintRadius = radius * 0.28;
            const glintGradient = ctx.createRadialGradient(
                centerX - pointerCurrent.x * 80,
                centerY - pointerCurrent.y * 60,
                glintRadius * 0.05,
                centerX - pointerCurrent.x * 80,
                centerY - pointerCurrent.y * 60,
                glintRadius
            );
            glintGradient.addColorStop(0, `hsla(${hueShift + 6}, ${saturation}%, 92%, 0.38)`);
            glintGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.fillStyle = glintGradient;
            ctx.arc(centerX, centerY, glintRadius, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(render);
    };

    render();
}
