
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
const bg = new THREE.TextureLoader();
scene.background = bg.load( './resources/njz-powerpuff-wp.jpeg' );

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 20, -50);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

// Lights
var color = 0xFFFFFF;
var intensity = 2;
var light = new THREE.AmbientLight(color, intensity);
scene.add(light);

// Point Light
intensity = 150;
color = 0xFFFF00;
var distance = 200;
light = new THREE.PointLight(color, intensity, distance);
light.position.set(0, 0, 0);
light.castShadow = true;
scene.add(light);

// Hemisphere Light - pencahayaan terhadap tanah dan langit
var skyColor = 0xB1E1FF;  // light blue
var groundColor = 0xB97A20;  // brownish orange
intensity = 2;
light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);

// Ambient Light
var color = 0xFFFFFF;
var intensity = 1;
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
// plane.position.x = -20;
scene.add(plane);

// Load GLTF and FBX
let modelH, modelJ;
let mixers = [];
let actions = {};
let currentAction;

const loader = new GLTFLoader();
loader.setPath("./resources/haerin/");
loader.load("haerin.gltf", (gltf) => {
  modelH = gltf.scene;
  modelH.scale.setScalar(8);
  modelH.position.x = 0;
  scene.add(modelH);
  const mixerH = new THREE.AnimationMixer(modelH);
  mixers.push(mixerH);
  const action = mixerH.clipAction(gltf.animations[0]);
  action.play();
});

const loader2 = new FBXLoader();
loader2.setPath("./resources/");
loader2.load("Minji.fbx", (fbx) => {
  modelJ = fbx;
  modelJ.scale.setScalar(0.08);
  modelJ.position.x = 0;
  scene.add(modelJ);
  const mixerJ = new THREE.AnimationMixer(modelJ);
  mixers.push(mixerJ);
  if (fbx.animations.length > 0) {
      const action = mixerJ.clipAction(fbx.animations[0]);
      action.play();
  }
});



function playAction(name) {
  if (!actions[name]) return;

  if (currentAction === actions[name]) return;

  if (currentAction) {
    currentAction.fadeOut(0.3);
  }

  currentAction = actions[name];
  currentAction.reset().fadeIn(0.3).play();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "1") {
      if (modelJ) modelJ.visible = true;
      if (modelH) modelH.visible = false;
  }
  if (e.key === "2") {
      if (modelJ) modelJ.visible = false;
      if (modelH) modelH.visible = true;
  }
});

// Animate
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // if (modelH) {
  //   modelH.rotation.y -= 0.05;
  // }

  // if (mixer) mixer.update(delta);
  for (const mixer of mixers) {
      mixer.update(delta);
  }

  renderer.render(scene, camera);
}
animate();
