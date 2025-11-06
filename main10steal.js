import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Setup canvas renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// taruh di bawah kamera dan renderer
const controls = new OrbitControls(camera, renderer.domElement);

// Atur posisi kamera dan update kontrol
camera.position.set(0, 2, 5);
controls.update();

// Geometry
var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });

var material = [
    new THREE.MeshBasicMaterial({ color: 0xff0000}), // kanan
    new THREE.MeshBasicMaterial({ color: 0xfc0000}), // kiri
    new THREE.MeshBasicMaterial({ color: 0xff0020}), // atas
    new THREE.MeshBasicMaterial({ color: 0xff20f0}), // bawah
    new THREE.MeshBasicMaterial({ color: 0xffff0}), // depan
    new THREE.MeshBasicMaterial({ color: 0xff8000}), // blkg
]

var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const geometryC = new THREE.ConeGeometry( 1, 2, 5 );
const materialC = new THREE.MeshBasicMaterial( {color: 0xffff00} );
const cone = new THREE.Mesh(geometryC, materialC ); scene.add( cone );
scene.add(cone)

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

// Animation Loop
var time_prev = 0;
function animate(time) {
    var dt = time - time_prev;
    dt *= 0.1;

    cube.rotation.x += 0.01 * dt;
    cube.rotation.y += 0.01 * dt;

    requestAnimationFrame(animate);

    // Diperlukan jika enableDamping atau autoRotate diaktifkan
    controls.update();

    renderer.render(scene, camera);

    time_prev = time;
    //requestAnimationFrame(animate);
}
requestAnimationFrame(animate);