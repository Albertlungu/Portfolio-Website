// === STL Viewer Script (ES Module) ===
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

(function () {
  function init() {
    const canvas = document.getElementById('stlViewer');
    const selector = document.getElementById('modelSelector');

    if (!canvas) {
      console.warn('STL canvas element not found.');
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(canvas.clientWidth, 1) / Math.max(canvas.clientHeight, 1),
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(canvas.clientWidth || 640, canvas.clientHeight || 480);
    renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;

    camera.position.set(0, 0, 100);
    controls.update();

    // STLLoader setup
    const loader = new STLLoader();
    let currentMesh = null;

    function clearCurrentMesh() {
      if (currentMesh) {
        scene.remove(currentMesh);
        currentMesh.geometry.dispose();
        if (Array.isArray(currentMesh.material)) {
          currentMesh.material.forEach((mat) => mat.dispose && mat.dispose());
        } else if (currentMesh.material && currentMesh.material.dispose) {
          currentMesh.material.dispose();
        }
        currentMesh = null;
      }
    }

    function loadSTLFromUrl(url) {
      if (!url) {
        return;
      }
      const encodedUrl = encodeURI(url);
      loader.load(
        encodedUrl,
        (geometry) => {
          clearCurrentMesh();
          const material = new THREE.MeshStandardMaterial({
            color: 0x8a8aff,
            metalness: 0.3,
            roughness: 0.4,
          });

          const mesh = new THREE.Mesh(geometry, material);
          geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          geometry.boundingBox.getCenter(center).multiplyScalar(-1);
          mesh.position.copy(center);

          scene.add(mesh);
          currentMesh = mesh;
        },
        undefined,
        (error) => {
          console.error('Error loading STL:', error);
        }
      );
    }

    if (selector) {
      selector.addEventListener('change', (event) => {
        loadSTLFromUrl(event.target.value);
      });
    }

    window.addEventListener('resize', () => {
      const width = canvas.clientWidth || 640;
      const height = canvas.clientHeight || 480;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    document.addEventListener('project:update', (event) => {
      const modelUrl = event?.detail?.modelUrl;
      if (modelUrl) {
        loadSTLFromUrl(modelUrl);
      }
    });

    document.addEventListener('project:modelChange', (event) => {
      const modelUrl = event?.detail?.modelUrl;
      if (modelUrl) {
        loadSTLFromUrl(modelUrl);
      }
    });

    if (selector && selector.value) {
      loadSTLFromUrl(selector.value);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();