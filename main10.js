import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


//Setup canvas render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//Setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Opsional: menambahkan efek "damping" (kelembaman) agar lebih halus


//Geometry
const objects = [];

// sun
var rad = 10, widthSegment = 12, heightSegment = 3;
var sun_geometry = new THREE.SphereGeometry(rad, widthSegment, heightSegment);
var sun_material = new THREE.MeshBasicMaterial({color: 0xffff00});
var sun = new THREE.Mesh(sun_geometry, sun_material);
scene.add(sun);
objects.push(sun);
// earth
var rad = 3, widthSegment = 12, heightSegment = 3;
var earth_geometry = new THREE.SphereGeometry(rad, widthSegment, heightSegment);
var earth_material = new THREE.MeshBasicMaterial({color: 0x00aaff});
var earth = new THREE.Mesh(earth_geometry, earth_material);
earth.position.x = 20;
sun.add(earth);
objects.push(earth);
// moon
var rad = 1, widthSegment = 12, heightSegment = 3;
var moon_geometry = new THREE.SphereGeometry(rad, widthSegment, heightSegment);
var moon_material = new THREE.MeshBasicMaterial({color: 0x00aaff});
var moon = new THREE.Mesh(moon_geometry, moon_material);
moon.position.x = 5;
earth.add(moon);
objects.push(moon);
// mars
var rad = 3, widthSegment = 12, heightSegment = 3;
var mars_geometry = new THREE.SphereGeometry(rad, widthSegment, heightSegment);
var mars_material = new THREE.MeshBasicMaterial({color: 0xff1a00});
var mars = new THREE.Mesh(mars_geometry, mars_material);
mars.position.x = -30;
sun.add(mars);
objects.push(mars);

// var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
// var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// const points = [];
// points.push(new THREE.Vector3(-1,0,0));
// points.push(new THREE.Vector3(0,1,0));
// points.push(new THREE.Vector3(1,0,0));
// var line_geometry = new THREE.BufferGeometry().setFromPoints(points);
// var line_material = new THREE.LineBasicMaterial({color: 0xffffff});
// var line = new THREE.Line(line_geometry, line_material);
// scene.add(line);

// const points2 = [];
// points2.push(new THREE.Vector3(-2,0,0));
// points2.push(new THREE.Vector3(0,2,0));
// points2.push(new THREE.Vector3(2,0,0));
// var line_geometry = new THREE.BufferGeometry().setFromPoints(points2);
// var line_material = new THREE.LineBasicMaterial({color: 0xff00ff});
// var line = new THREE.Line(line_geometry, line_material);
// scene.add(line);


var time_prev = 0
function animate(time) {
    var dt = time - time_prev
    dt *= 0.1;


    // cube.rotation.x += 0.01 * dt;
    // cube.rotation.y += 0.01 * dt;
    objects.forEach((obj) => {
        obj.rotation.z += 0.01 * dt;
    })


    controls.update();
    renderer.render(scene, camera);


    time_prev = time;
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
