import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

// Helper class
class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
        this.obj = obj;
        this.minProp = minProp;
        this.maxProp = maxProp;
        this.minDif = minDif;
    }
    get min() { return this.obj[this.minProp]; }
    set min(v) {
        this.obj[this.minProp] = v;
        this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
    }
    get max() { return this.obj[this.maxProp]; }
    set max(v) {
        this.obj[this.maxProp] = v;
        this.min = this.min;
    }
}

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene & Camera
const scene = new THREE.Scene();
// const camSize = 50;
// const camera = new THREE.OrthographicCamera(-camSize, camSize, camSize, -camSize, 0.1, 1000);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20); // [2] --> semakin kecil semakin besar
camera.lookAt(0, 0, 0);

// GUI
function updateCamera() { camera.updateProjectionMatrix(); }
const gui = new GUI();
gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
gui.add(minMaxGUIHelper, 'max', 0.1, 1000, 0.1).name('far').onChange(updateCamera);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.update();

// Geometry
let size = 40;
let geometry = new THREE.PlaneGeometry(size, size);
let material = new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide });
let mesh = new THREE.Mesh(geometry, material);
mesh.rotation.x = -Math.PI / 2;
scene.add(mesh);

let radius = 7;
let widthSegments = 12;
let heightSegments = 8;
geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
material = new THREE.MeshPhongMaterial({ color: '#FA8' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(-radius - 1, radius + 2, 0);
scene.add(mesh);

size = 4;
geometry = new THREE.BoxGeometry(size, size, size);
material = new THREE.MeshPhongMaterial({ color: '#8AC' });
mesh = new THREE.Mesh(geometry, material);
mesh.position.set(size + 1, size / 2, 0);
scene.add(mesh);


// 🌈 16.1. Ambient Light
var color = 0xFF00FF;
var intensity = 0.1;
var light = new THREE.AmbientLight(color, intensity);
scene.add(light);

// ☀️ 16.2. Hemisphere Light
// var skyColor = 0xB1E1FF;  // light blue
// var groundColor = 0xB97A20;  // brownish orange
var skyColor = 0xE1B1FF;
var groundColor = 0x85BAA1;
var intensity = 0.5;
var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);

// 💨 16.3. Directional Light
var color = 0xFFFFFF;
var intensity = 1;
var light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
var lightHelper = new THREE.DirectionalLightHelper(light);
scene.add(light);
scene.add(lightHelper);
scene.add(light.target);

// 💡 16.4. Point Light
var color = 0xFFFF00;
var intensity = 150;
var distance = 10;
var light = new THREE.PointLight(color, intensity, distance);
light.position.set(0, 3, 0);
var lightHelper = new THREE.PointLightHelper(light);
scene.add(light);
scene.add(lightHelper);

// 🔦 16.5. Spot Light
var color = 0xFF0000;
var intensity = 1500;
var distance = 300;
var angle = THREE.MathUtils.degToRad(35);
var penumbra = 0.9; // range 0 - 1; kaku - smooth
var light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
light.position.set(0, 20, 0);
light.target.position.set(0, 10, 0);
var lightHelper = new THREE.SpotLightHelper(light);
scene.add(light);
scene.add(light.target);
scene.add(lightHelper);

// Animation Loop
let time_prev = 0;
function animate(time) {
    let dt = time - time_prev;
    dt *= 0.1;

    renderer.render(scene, camera);
    time_prev = time;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);