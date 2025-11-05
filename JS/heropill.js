import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const FACE_COUNT = 3;
const ROTATION_PER_FACE = (Math.PI * 2) / FACE_COUNT;
const BASE_TILT_X = THREE.MathUtils.degToRad(0);
const IDLE_ROTATE_MAX = 0.06;
const IDLE_TILT_MAX = THREE.MathUtils.degToRad(1.2);
const IDLE_BOB_MAX = 0.04;

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
let textGroups = [];
let loadedFont = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

const overlayState = {
  index: 0,
};

function initScene(canvas) {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1f0e08, 0.02);
  clock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

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
  loadFontAndCreateText();
  capsuleGroup.rotation.x = BASE_TILT_X;
  updateOverlayFaces();
  animate();
}

function loadFontAndCreateText() {
  const fontLoader = new FontLoader();

  // Load Helvetiker font from Three.js examples
  fontLoader.load(
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    (font) => {
      loadedFont = font;
      createAllTextFaces();
      queueRerender();
    },
    undefined,
    (error) => {
      console.error('Error loading font:', error);
    }
  );
}

function createTextMesh(text, size = 0.3) {
  if (!loadedFont) return null;

  const textGeometry = new TextGeometry(text, {
    font: loadedFont,
    size: size,
    height: 0.08,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.01,
    bevelSegments: 5,
  });

  textGeometry.computeBoundingBox();
  const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);

  const textMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFEED9,
    roughness: 0.3,
    metalness: 0.1,
    emissive: 0xFFCCA0,
    emissiveIntensity: 0.2,
  });

  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.x = centerOffset;

  return textMesh;
}

function createTextLine(text, yPos, size = 0.25) {
  const textMesh = createTextMesh(text, size);
  if (!textMesh) return null;
  textMesh.position.y = yPos;
  return textMesh;
}

function createAllTextFaces() {
  // Clear existing text groups
  textGroups.forEach(group => capsuleGroup.remove(group));
  textGroups = [];

  const radius = 1.5; // Distance from center

  // Face 0: "Hey guys! I'm Albert Lungu" (0°) - Front facing
  const face0 = new THREE.Group();
  const line1 = createTextLine("Hey guys! I'm", 0.3, 0.28);
  const line2 = createTextLine("Albert Lungu", -0.3, 0.35);
  if (line1) face0.add(line1);
  if (line2) face0.add(line2);
  face0.position.set(0, 0, radius);
  face0.rotation.x = 0; // Rotate around X-axis since pill is horizontal
  textGroups.push(face0);
  capsuleGroup.add(face0);

  // Face 1: Description (120° around X-axis)
  const face1 = new THREE.Group();
  const desc1 = createTextLine("I'm a fullstack", 0.6, 0.22);
  const desc2 = createTextLine("developer exploring", 0.2, 0.22);
  const desc3 = createTextLine("game dev, web dev,", -0.2, 0.22);
  const desc4 = createTextLine("and app dev.", -0.6, 0.22);
  if (desc1) face1.add(desc1);
  if (desc2) face1.add(desc2);
  if (desc3) face1.add(desc3);
  if (desc4) face1.add(desc4);

  // Position on the cylinder surface at 120 degrees
  const angle1 = (Math.PI * 2) / 3; // 120 degrees
  face1.position.set(0, Math.sin(angle1) * radius, Math.cos(angle1) * radius);
  face1.rotation.x = angle1;
  textGroups.push(face1);
  capsuleGroup.add(face1);

  // Face 2: Links (240° around X-axis)
  const face2 = new THREE.Group();
  const link1 = createButtonMesh("See my projects!", 0.6);
  const link2 = createButtonMesh("About me", 0);
  const link3 = createButtonMesh("My Resume", -0.6);
  if (link1) face2.add(link1);
  if (link2) face2.add(link2);
  if (link3) face2.add(link3);

  // Position on the cylinder surface at 240 degrees
  const angle2 = (Math.PI * 4) / 3; // 240 degrees
  face2.position.set(0, Math.sin(angle2) * radius, Math.cos(angle2) * radius);
  face2.rotation.x = angle2;
  textGroups.push(face2);
  capsuleGroup.add(face2);
}

function createButtonMesh(text, yPos) {
  // Create button background
  const buttonGroup = new THREE.Group();

  const buttonGeometry = new THREE.BoxGeometry(2.2, 0.4, 0.1);
  const buttonMaterial = new THREE.MeshStandardMaterial({
    color: 0xFF9058,
    roughness: 0.4,
    metalness: 0.2,
    emissive: 0xFF8040,
    emissiveIntensity: 0.15,
  });

  const buttonBg = new THREE.Mesh(buttonGeometry, buttonMaterial);
  buttonGroup.add(buttonBg);

  // Add text on button
  const buttonText = createTextMesh(text, 0.18);
  if (buttonText) {
    buttonText.position.z = 0.06;
    buttonGroup.add(buttonText);
  }

  buttonGroup.position.y = yPos;

  // Store user data for click interaction
  buttonGroup.userData = {
    isButton: true,
    link: text === "See my projects!" ? "../HTML/projects_page.html"
        : text === "About me" ? "../HTML/about.html"
        : "#"
  };

  return buttonGroup;
}

function buildCapsule() {
  const capsuleRadius = 1.4;
  const capsuleLength = 7.5;

  const bodyGeometry = new THREE.CapsuleGeometry(capsuleRadius, capsuleLength, 28, 36);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa868,
    roughness: 0.28,
    metalness: 0.32,
    envMapIntensity: 0.6,
  });
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.rotation.z = Math.PI / 2;
  capsuleGroup.add(bodyMesh);

  const edgeGeometry = new THREE.RingGeometry(capsuleRadius - 0.05, capsuleRadius + 0.05, 48);
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.28, transparent: true });

  const capOffsets = [-(capsuleLength / 2), capsuleLength / 2];
  capOffsets.forEach((offset) => {
    const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.rotation.x = Math.PI / 2;
    edge.position.y = offset + Math.sign(offset) * capsuleRadius;
    capsuleGroup.add(edge);
  });

  const glowGeometry = new THREE.SphereGeometry(0.4, 18, 18);
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xfff4dd, transparent: true, opacity: 0.22 });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.set(0, 2.8, 0.6);
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

  capsuleGroup.rotation.x = currentRotation + idleRotate;
  capsuleGroup.rotation.y = BASE_TILT_X + idleTilt;
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

  const onClick = (event) => {
    if (!camera || !scene) return;

    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Check all button meshes in text groups
    const allButtons = [];
    textGroups.forEach(group => {
      group.traverse((child) => {
        if (child.userData && child.userData.isButton) {
          allButtons.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(allButtons, true);

    if (intersects.length > 0) {
      let button = intersects[0].object;
      // Traverse up to find the button group
      while (button && !button.userData.isButton) {
        button = button.parent;
      }

      if (button && button.userData.link && button.userData.link !== '#') {
        window.location.href = button.userData.link;
      }
    }
  };

  const registerWheel = (target) => target.addEventListener('wheel', onWheel, { passive: false });
  registerWheel(window);
  registerWheel(canvas);
  registerWheel(heroPillSection ?? window);

  window.addEventListener('keydown', onKey);
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd);
  canvas.addEventListener('click', onClick);
  canvas.setAttribute('tabindex', '0');
  canvas.style.cursor = 'pointer';
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