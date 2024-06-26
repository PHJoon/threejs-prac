import * as THREE from 'three';
import { WebGL } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
/**
 * cube
 */
// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

// camera.position.z = 5;


/**
 * line
 */
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0);

const material = new THREE.LineBasicMaterial( { coloer: 0x0000ff });

const points = [];
points.push( new THREE.Vector3( -10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );
points.push( new THREE.Vector3( 1, 3, 5));

const geometry = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line( geometry, material );
scene.add(line);



function animate() {
  requestAnimationFrame( animate );
  //   cube.rotation.x += 0.01;
  //   cube.rotation.y += 0.01;
  renderer.render( scene, camera );
}


if (WebGL.isWebGLAvailable()) {
  animate();
} else {
  const warning = WebGL.getWebGLErrorMessage();
  document.getElementById( 'container' ).appendChild( warning );
}