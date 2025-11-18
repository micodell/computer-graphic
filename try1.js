
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 50);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

// Lights
var color = 0xFFFFFF;
var intensity = 2;
var light = new THREE.AmbientLight(color, intensity);
scene.add(light);

// Plane
let size = 40;
let geometry = new THREE.PlaneGeometry(size, size);
let material = new THREE.MeshPhongMaterial({
  color: 0x668888,
  side: THREE.DoubleSide,
});
let plane = new THREE.Mesh(geometry, material);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Load FBX
let mixer;
let actions = {};
let currentAction;

const loader = new FBXLoader();
loader.setPath("./resources/");
loader.load("Minji.fbx", (fbx) => {
  fbx.scale.setScalar(0.1);
  scene.add(fbx);
  mixer = new THREE.AnimationMixer(fbx);
  const capoeira = mixer.clipAction(fbx.animations[0]);
  actions["capoeira"] = capoeira;
});

loader.load("Warrior Idle.fbx", (idle) => {
  const idleAction = mixer.clipAction(idle.animations[0]);
  actions["idle"] = idleAction;
  playAction("idle");
});

function playAction(name) {
  if (currentAction === actions[name]) return;

  if (currentAction) {
    currentAction.fadeOut(0.3);
  }

  currentAction = actions[name];
  currentAction.reset().fadeIn(0.3).play();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "1") playAction("idle");
  if (e.key === "2") playAction("capoeira");
});

// Animate
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}
animate();
