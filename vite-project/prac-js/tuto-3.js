import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/Addons.js';

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias:true, canvas});
  const fov = 40;
  const aspect = 2;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  
  camera.position.z = 120;
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xAAAAAA);

  const objects = [];
  const spread = 15;

  function addObject(x, y, obj) {
    obj.position.x = x * spread;
    obj.position.y = y * spread;

    scene.add(obj);
    objects.push(obj);
  }

  function createMaterial() {
    const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
    const hue = Math.random();
    const saturation = 1;
    const luminance = 0.5;
    material.color.setHSL(hue, saturation, luminance);

    return material;
  }

  const color = 0xFFFFFF;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function addSolidGeometry(x, y, geometry) {
    const mesh = new THREE.Mesh(geometry, createMaterial());
    addObject(x, y, mesh);
  }
  
  addSolidGeometry(-2, 2, new THREE.BoxGeometry(8, 8, 8));
  addSolidGeometry(-1, 2, new THREE.CircleGeometry(5, 33));
  addSolidGeometry(0, 2, new THREE.CircleGeometry(5, 20, Math.PI * 1.1, Math.PI * 1.5));
  addSolidGeometry(1, 2, new THREE.ConeGeometry(6, 6.6, 44, Math.PI * 1.5));
  addSolidGeometry(2, 2, new THREE.ConeGeometry(5.1, 7, 20, 2, true, Math.PI * 0.5, Math.PI * 1.1));

  addSolidGeometry(-2, 1, new THREE.CylinderGeometry(5, 5, 6, 30));
  addSolidGeometry(-1, 1, new THREE.CylinderGeometry(6, 2, 6, 30));
  addSolidGeometry(0, 1, new THREE.DodecahedronGeometry(5));
  addSolidGeometry(1, 1, new THREE.DodecahedronGeometry(7, 2));
  addSolidGeometry(2, 1, new THREE.TorusGeometry(5, 2, 8, 24));

  addSolidGeometry(-2, 0, new THREE.TorusKnotGeometry(5, 1, 100, 16));

  const loader = new FontLoader();

  function loadFont(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    })
  }

  async function doit() {
    const font = await loadFont('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json');
    const geometry = new TextGeometry('Hello', {
      font: font,
      size: 3.0,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.3,
      bevelSegments: 5,
    });
    const mesh = new THREE.Mesh(geometry, createMaterial());
    geometry.computeBoundingBox();
    geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);
    
    const parent = new THREE.Object3D();
    parent.add(mesh);

    addObject(-1, -1, parent);
  }

  doit();

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    objects.forEach((obj, idx) => {
      const speed = 1 + idx * 0.1;
      const rot = time * speed;
      obj.rotation.x = rot;
      obj.rotation.y = rot;
      obj.rotation.z = rot;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  render();
}


main();


// const boxWidth = 1;
// const boxHeight = 1;
// const boxDept = 1;
// const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDept);

// function makeInstance(geometry, color, x) {
//   const material = new THREE.MeshPhongMaterial({color});
  
//   const cube = new THREE.Mesh(geometry, material);
//   scene.add(cube);
//   cube.position.x = x;

//   return cube;
// }

// const cubes = [
//   makeInstance(geometry, 0x44aa88, 0),
//   makeInstance(geometry, 0x8844aa, -2),
//   makeInstance(geometry, 0x01ba29, 2),
// ];

// cubes.forEach((cube, idx) => {
//   const speed = 1 + idx * 0.1;
//   const rot = time * speed;
//   cube.rotation.x = rot;
//   cube.rotation.y = rot + 50;
// })