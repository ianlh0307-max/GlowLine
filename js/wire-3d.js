import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function showFallback(mount) {
  mount.innerHTML = '';
  const msg = document.createElement('div');
  msg.className = 'wire3d-fallback';
  msg.textContent = "Your browser can't display the interactive 3D model. See the product photos above for a look at the wrap.";
  mount.appendChild(msg);
}

/* Wraps a spiral curve around an arbitrary 3D path using Frenet frames,
   so the coil follows the same gentle bend as the cable it wraps. */
class HelixAroundPath extends THREE.Curve {
  constructor(basePath, radius, turns, frames) {
    super();
    this.basePath = basePath;
    this.radius = radius;
    this.turns = turns;
    this.frames = frames;
  }
  getPoint(t, target = new THREE.Vector3()) {
    const pos = this.basePath.getPointAt(t);
    const count = this.frames.normals.length;
    const idx = Math.min(count - 1, Math.floor(t * (count - 1)));
    const normal = this.frames.normals[idx];
    const binormal = this.frames.binormals[idx];
    const angle = t * this.turns * Math.PI * 2;
    return target
      .copy(pos)
      .addScaledVector(normal, Math.cos(angle) * this.radius)
      .addScaledVector(binormal, Math.sin(angle) * this.radius);
  }
}

function init(mount) {
  const hint = mount.querySelector('.wire3d-hint');
  const resetBtn = mount.querySelector('.wire3d-reset');
  const loading = mount.querySelector('.wire3d-loading');
  const canvasWrap = mount.querySelector('.wire3d-canvas-wrap');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14152f);
  scene.fog = new THREE.Fog(0x14152f, 9, 20);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const defaultPos = new THREE.Vector3(0.6, 1.6, 8.4);
  camera.position.copy(defaultPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  canvasWrap.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 4.5;
  controls.maxDistance = 14;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.target.set(0, 0, 0);
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  /* Lighting — kept dim so the emissive coil reads as glowing, not lit */
  scene.add(new THREE.AmbientLight(0x2a2c5e, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.7);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6290c3, 0.4);
  rim.position.set(-5, -2, -4);
  scene.add(rim);
  const glowLight = new THREE.PointLight(0xbaff29, 7, 10, 2);
  glowLight.position.set(0, 0.4, 1.2);
  scene.add(glowLight);

  /* Base cable path: a gentle S-curve */
  const basePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5.6, 0.55, 0),
    new THREE.Vector3(-2.8, -0.25, 0.45),
    new THREE.Vector3(0, 0.35, -0.3),
    new THREE.Vector3(2.8, -0.2, 0.35),
    new THREE.Vector3(5.6, 0.3, 0),
  ]);
  basePath.curveType = 'catmullrom';
  basePath.tension = 0.5;

  const frames = basePath.computeFrenetFrames(220, false);

  const wireRadius = 0.22;
  const wireGeo = new THREE.TubeGeometry(basePath, 220, wireRadius, 20, false);
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x9aa0ab, roughness: 0.55, metalness: 0.2 });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireMesh);

  const spiralRadius = wireRadius + 0.07;
  const helix = new HelixAroundPath(basePath, spiralRadius, 12, frames);
  const spiralGeo = new THREE.TubeGeometry(helix, 1400, 0.075, 10, false);
  const spiralMat = new THREE.MeshStandardMaterial({
    color: 0xbaff29,
    emissive: 0xbaff29,
    emissiveIntensity: 2.6,
    roughness: 0.32,
    metalness: 0,
  });
  const spiralMesh = new THREE.Mesh(spiralGeo, spiralMat);
  scene.add(spiralMesh);

  /* Soft additive glow halo around the spiral, two layers for falloff */
  const haloGeo = new THREE.TubeGeometry(helix, 1400, 0.14, 8, false);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xbaff29,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  scene.add(haloMesh);

  const haloGeo2 = new THREE.TubeGeometry(helix, 1400, 0.24, 8, false);
  const haloMat2 = new THREE.MeshBasicMaterial({
    color: 0xbaff29,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const haloMesh2 = new THREE.Mesh(haloGeo2, haloMat2);
  scene.add(haloMesh2);

  const group = new THREE.Group();
  group.add(wireMesh, spiralMesh, haloMesh, haloMesh2);
  scene.add(group);

  function resize() {
    const w = canvasWrap.clientWidth;
    const h = canvasWrap.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvasWrap);
  resize();

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      controls.autoRotate = true;
      camera.position.copy(defaultPos);
      controls.target.set(0, 0, 0);
      controls.update();
    });
  }

  let firstFrame = true;
  let running = true;
  const io = new IntersectionObserver((entries) => {
    running = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  io.observe(mount);

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    controls.update();
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      if (loading) loading.classList.add('is-hidden');
      if (hint) hint.classList.add('is-visible');
    }
  }
  animate();
}

const mount = document.getElementById('wire3d-canvas');
if (mount) {
  try {
    init(mount);
  } catch (err) {
    console.error('GlowLine 3D viewer failed to load:', err);
    showFallback(mount);
  }
}
