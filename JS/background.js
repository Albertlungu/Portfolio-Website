// // === Background Blob Animation ===
// import * as THREE from 'three';

// const canvas = document.getElementById('bg');
// if (!canvas) {
//   console.warn('Background canvas with id "bg" not found.');
// } else {
//   const scene = new THREE.Scene();
//   const camera = new THREE.PerspectiveCamera(
//     75,
//     window.innerWidth / window.innerHeight,
//     0.1,
//     1000
//   );

//   const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight, false);

//   const pointLight = new THREE.PointLight(0x8888ff, 2);
//   pointLight.position.set(2, 3, 4);
//   scene.add(pointLight);

//   const ambientLight = new THREE.AmbientLight(0x404040, 2);
//   scene.add(ambientLight);

//   const blobs = [];

//   const createSphere = (radius, color, metalness = 0.55, roughness = 0.3) => {
//     const geometry = new THREE.SphereGeometry(radius, 48, 48);
//     const material = new THREE.MeshStandardMaterial({
//       color,
//       metalness,
//       roughness,
//     });
//     const mesh = new THREE.Mesh(geometry, material);
//     scene.add(mesh);
//     blobs.push(mesh);
//     return mesh;
//   };

//   const coreBlob = createSphere(1.8, 0x242652, 0.62, 0.28);
//   coreBlob.position.set(0, 0, 0);

//   const companionConfigs = [
//     { radius: 0.75, color: 0x32356e, base: new THREE.Vector3(1.8, 0.6, -0.5), speed: 0.004 },
//     { radius: 0.55, color: 0x3c407c, base: new THREE.Vector3(-1.6, -0.4, 0.9), speed: -0.0035 },
//     { radius: 0.65, color: 0x2d2f60, base: new THREE.Vector3(0.9, -1.2, -0.7), speed: 0.003 },
//     { radius: 0.45, color: 0x404285, base: new THREE.Vector3(-0.2, 1.4, 0.7), speed: -0.0025 },
//   ];

//   const companions = companionConfigs.map((cfg) => {
//     const mesh = createSphere(cfg.radius, cfg.color, 0.58, 0.32);
//     mesh.position.copy(cfg.base);
//     return { mesh, base: cfg.base.clone(), speed: cfg.speed, angle: Math.random() * Math.PI * 2 };
//   });

//   camera.position.set(0, 0, 5.2);
//   camera.lookAt(0, 0, 0);

//   const clock = new THREE.Clock();

//   const animate = () => {
//     const elapsed = clock.getElapsedTime();
//     coreBlob.rotation.x = 0.25 + Math.sin(elapsed * 0.35) * 0.12;
//     coreBlob.rotation.y = 0.4 + Math.cos(elapsed * 0.28) * 0.1;
//     coreBlob.position.x = Math.sin(elapsed * 0.18) * 0.35;
//     coreBlob.position.y = Math.cos(elapsed * 0.22) * 0.28;

//     companions.forEach((companion, index) => {
//       companion.angle += companion.speed;
//       const sway = 0.22 + index * 0.04;
//       const verticalSway = 0.18 + index * 0.03;
//       const xTarget = companion.base.x + Math.cos(companion.angle) * sway;
//       const yTarget = companion.base.y + Math.sin(companion.angle * 1.1) * verticalSway;
//       companion.mesh.position.x += (xTarget - companion.mesh.position.x) * 0.06;
//       companion.mesh.position.y += (yTarget - companion.mesh.position.y) * 0.06;
//       companion.mesh.rotation.x += 0.003 + index * 0.0008;
//       companion.mesh.rotation.y += 0.002 + index * 0.0006;
//     });

//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
//   };

//   animate();

//   const handleResize = () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight, false);
//   };

//   window.addEventListener('resize', handleResize);
// }