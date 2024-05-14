/**
 * https://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */
import * as THREE from 'three';

const Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

window.addEventListener('load', init, false);

function init() {
  createScene();

  // createLights();

  // createPlane();
  // createSea();
  // createSky();

  loop();
}

let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container;

function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();

  scene.fog = new THREE.Fog( 0xf7d9aa, 100, 950);

  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });

  renderer.setSize(WIDTH, HEIGHT);

  renderer.shadowMap.enabled = true;

  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

let hemisphereLight, shadowLight;

function createLights() {
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

  shadowLight.position.set(150, 350, 350);

  shadowLight.castShadow = true;

  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

let sea, sky;

let Sea = function () {
  let geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);

  geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  let mat = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    transparent: true,
    opacity: .6,
    shading: THREE.FlatShading,
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
}

function createSea() {
  sea = new Sea();
  sea.mesh.position.y = -600;
  scene.add(sea.mesh);
}

let Cloud = function () {
  this.mesh = new THREE.Object3D();

  let geom = new THREE.BoxGeometry(20, 20, 20);

  let mat = new THREE.MeshPhongMaterial({
    color: Colors.white,
  });

  let nBlocks = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < nBlocks; i++) {
    let m = new THREE.Mesh(geom, mat);

    m.position.x = i * 15;
    m.position.y = Math.random() * 10;
    m.position.z = Math.random() * 10;
    m.rotation.z = Math.random() * Math.PI * 2;
    m.rotation.y = Math.random() * Math.PI * 2;

    let s = .1 + Math.random() * 9;
    m.scale.set(s, s, s);

    m.castShadow = true;
    m.receiveShadow = true;

    this.mesh.add(m);
  }
}

let Sky = function () {
  this.mesh = new THREE.Object3D();

  this.nClouds = 20;

  let stepAngle = Math.PI * 2 / this.nClouds;

  for (let i = 0; i < this.nClouds; i++) {
    let c = new Cloud();
    let a = stepAngle * i;
    let h = 750 + Math.random() * 200;

    c.mesh.position.y = Math.sin(a) * h;
    c.mesh.position.x = Math.cos(a) * h;

    c.mesh.rotation.z = a + Math.PI/2;
    c.mesh.position.z = -400 - Math.random() * 400;

    let s = 1 + Math.random() * 2;
    c.mesh.scale.set(s, s, s);
    this.mesh.add(c.mesh);
  }
}

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -600;
  scene.add(sky.mesh);
}

function loop() {
  requestAnimationFrame(loop);
  renderer.render(scene, camera);
}