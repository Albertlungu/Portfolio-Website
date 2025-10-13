import * as THREE from 'three';

const FACE_COUNT = 3;
const ROTATION_PER_FACE = (Math.PI * 2) / FACE_COUNT;
const BASE_TILT_X = THREE.MathUtils.degToRad(14);
const IDLE_ROTATE_MAX = 0.12;
const IDLE_TILT_MAX = THREE.MathUtils.degToRad(2.4);
const IDLE_BOB_MAX = 0.08;

const overlayFaces = Array.from(document.querySelectorAll('.pill-overlay__face'));
const heroPillSection = document.getElementById('heroPill');
const instructionEl = heroPillSection?.querySelector('.pill-instruction');
const shadowEl = heroPillSection?.querySelector('.pill-shadow');

let renderer;
let scene;
let camera;
let capsuleGroup;
let baseRotation = 0;
let targetRotation = 0;
let currentRotation = 0;
let animationFrame;
let scrollLock = false;
let interacted = false;
let clock;
let rerenderQueued = false;

const overlayState = {
  index: 0,
};

function initScene(canvas) {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1f0e08, 0.02);
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x000000, 0);

  const ambient = new THREE.AmbientLight(0xffdccc, 0.78);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffa366, 0.98);
  keyLight.position.set(6, 8, 10);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x5fb9ff, 0.62);
  rimLight.position.set(-8, -4, -6);
  scene.add(rimLight);

  capsuleGroup = new THREE.Group();
  scene.add(capsuleGroup);

  buildCapsule();
  capsuleGroup.rotation.x = BASE_TILT_X;
  updateOverlayFaces();
  animate();
}

function buildCapsule() {
  const capsuleRadius = 1.8;
  const capsuleLength = 6.2;

  const bodyGeometry = new THREE.CapsuleGeometry(capsuleRadius, capsuleLength, 28, 36);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa868,
    roughness: 0.28,
    metalness: 0.32,
    envMapIntensity: 0.6,
  });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  capsuleGroup.add(bodyMesh);

  const edgeGeometry = new THREE.RingGeometry(capsuleRadius - 0.05, capsuleRadius + 0.05, 48);
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.28, transparent: true });

  const capOffsets = [-(capsuleLength / 2), capsuleLength / 2];
  capOffsets.forEach((offset) => {
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.rotation.y = Math.PI / 2;
    edge.position.x = offset + Math.sign(offset) * capsuleRadius;
    capsuleGroup.add(edge);
  });

  const glowGeometry = new THREE.SphereGeometry(0.5, 18, 18);
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xfff4dd, transparent: true, opacity: 0.22 });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.set(2.2, 0.5, 0.6);
  capsuleGroup.add(glow);
}

function animate() {
  animationFrame = requestAnimationFrame(animate);

  const elapsed = clock?.getElapsedTime() ?? 0;

  currentRotation = THREE.MathUtils.damp(currentRotation, targetRotation, 12, 0.035);
  const focusFactor = heroInFocus() ? 1 : 0.3;
  const idleRotate = Math.sin(elapsed * 0.35) * IDLE_ROTATE_MAX * focusFactor;
  const idleTilt = Math.sin(elapsed * 0.45) * IDLE_TILT_MAX * focusFactor;
  const idleBob = Math.sin(elapsed * 0.6) * IDLE_BOB_MAX * focusFactor;

  capsuleGroup.rotation.y = currentRotation + idleRotate;
  capsuleGroup.rotation.x = BASE_TILT_X + idleTilt;
  capsuleGroup.rotation.z = idleTilt * 0.4;
  capsuleGroup.position.y = idleBob;

  if (camera) {
    camera.lookAt(capsuleGroup.position);
  }

  renderer.render(scene, camera);
  rerenderQueued = false;

  if (shadowEl) {
    const isMoving = Math.abs(targetRotation - currentRotation) > 0.004 || Math.abs(idleRotate) > 0.02;
    shadowEl.classList.toggle('pill-shadow--static', !isMoving);
  }
}

function updateOverlayFaces() {
  overlayFaces.forEach((face, index) => {
    face.classList.toggle('pill-overlay__face--active', index === overlayState.index);
  });
  if (shadowEl) {
    const shadowStates = [
      { scale: 1, offset: 0 },
      { scale: 0.94, offset: 6 },
      { scale: 0.9, offset: 12 },
    ];
    const { scale, offset } = shadowStates[overlayState.index] ?? shadowStates[0];
    shadowEl.style.setProperty('--shadow-scale', `${scale}`);
    shadowEl.style.setProperty('--shadow-offset', `${offset}px`);
  }
  if (!interacted && heroPillSection) {
    heroPillSection.classList.add('hero-pill--interacted');
    interacted = true;
  }
  if (instructionEl) {
    instructionEl.classList.toggle('pill-instruction--hidden', interacted);
  }
}

function rotatePill(direction) {
  const total = FACE_COUNT;
  overlayState.index = (overlayState.index + direction + total) % total;
  baseRotation += direction * ROTATION_PER_FACE;
  targetRotation = baseRotation;
  updateOverlayFaces();
  queueRerender();
}

function heroInFocus() {
  if (!heroPillSection) {
    return false;
  }
  const rect = heroPillSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < viewportHeight * 0.7 && rect.bottom > viewportHeight * 0.3;
}

function handleResize() {
  if (!renderer || !camera) {
    return;
  }
  const canvas = renderer.domElement;
  const { clientWidth, clientHeight } = canvas;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  camera.updateMatrix();
  camera.updateMatrixWorld(true);
  renderer.setSize(clientWidth, clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  queueRerender();
}

function bindInteractions(canvas) {
  const onWheel = (event) => {
    if (scrollLock || !heroInFocus()) {
      return;
    }
    const { deltaY } = event;
    if (Math.abs(deltaY) < 18) {
      return;
    }
    scrollLock = true;
    rotatePill(deltaY > 0 ? 1 : -1);
    setTimeout(() => {
      scrollLock = false;
    }, 800);
    event.preventDefault();
  };

  const onKey = (event) => {
    if (!heroInFocus()) {
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'PageDown') {
      rotatePill(1);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      rotatePill(-1);
      event.preventDefault();
    }
  };

  const touchState = { startX: null };
  const onTouchStart = (event) => {
    if (event.touches.length !== 1) {
      return;
    }
    touchState.startX = event.touches[0].clientX;
  };
  const onTouchEnd = (event) => {
    if (touchState.startX === null || !heroInFocus()) {
      return;
    }
    const endX = event.changedTouches[0]?.clientX ?? touchState.startX;
    const diff = touchState.startX - endX;
    if (Math.abs(diff) > 36) {
      rotatePill(diff > 0 ? 1 : -1);
    }
    touchState.startX = null;
  };

  const registerWheel = (target) => target.addEventListener('wheel', onWheel, { passive: false });
  registerWheel(window);
  registerWheel(canvas);
  registerWheel(heroPillSection ?? window);

  window.addEventListener('keydown', onKey);
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  canvas.setAttribute('tabindex', '0');
}

function queueRerender() {
  if (rerenderQueued) {
    return;
  }
  rerenderQueued = true;
  requestAnimationFrame(() => {
    rerenderQueued = false;
    if (renderer && camera && scene) {
      renderer.render(scene, camera);
    }
  });
}

function mountHeroPill() {
  const canvas = document.getElementById('heroPillCanvas');
  if (!canvas || !overlayFaces.length) {
    return;
  }
  initScene(canvas);
  bindInteractions(canvas);
  window.addEventListener('resize', () => {
    handleResize();
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }
  });
}

mountHeroPill();

export function cleanupHeroPill() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  if (renderer) {
    renderer.dispose();
  }
  window.removeEventListener('resize', handleResize);
}