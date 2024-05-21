import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function main() {

	const canvas = document.querySelector( '#c' );
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );

	const fov = 45;
	const aspect = 2; // the canvas default
	const near = 0.1;
	const far = 1000;
	const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );
	camera.position.set( 0, 1, 2 );

	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );

	{

		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = 2;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

	{
		const color = 0xFFFFFF;
		const intensity = 2.5;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );

	}

	function frameArea( sizeToFitOnScreen, boxSize, boxCenter, camera ) {

		const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
		const halfFovY = THREE.MathUtils.degToRad( camera.fov * .5 );
		const distance = halfSizeToFitOnScreen / Math.tan( halfFovY );
		// compute a unit vector that points in the direction the camera is now
		// in the xz plane from the center of the box
		const direction = ( new THREE.Vector3() )
			.subVectors( camera.position, boxCenter )
			.multiply( new THREE.Vector3( 1, 0, 1 ) )
			.normalize();

    console.log(direction);
		// move the camera to a position distance units way from the center
		// in whatever direction the camera was from the center already
		// camera.position.copy( direction.multiplyScalar( distance ).add( boxCenter ) );

		// pick some near and far values for the frustum that
		// will contain the box.
		camera.near = boxSize / 100;
		camera.far = boxSize * 100;

		camera.updateProjectionMatrix();

		// point the camera to look at the center of the box
		camera.lookAt( boxCenter.x, boxCenter.y, boxCenter.z );

	}

  let table, redPaddle, bluePaddle, ball;
	{
		const gltfLoader = new GLTFLoader();
		gltfLoader.load( '../tablePing.gltf', ( gltf ) => {
			const root = gltf.scene;
			scene.add( root );

			// compute the box that contains all the stuff
			// from root and below
			const box = new THREE.Box3().setFromObject( root );

			const boxSize = box.getSize( new THREE.Vector3() ).length();
			const boxCenter = box.getCenter( new THREE.Vector3() );

			// set the camera to frame the box
			frameArea( boxSize * 0.5, boxSize, boxCenter, camera );

			// update the Trackball controls to handle the new size
			controls.maxDistance = boxSize * 10;
			controls.target.copy( boxCenter );
			controls.update();

      table = root.getObjectByName('table');
      redPaddle = root.getObjectByName('red_paddle');
      bluePaddle = root.getObjectByName('blue_paddle');
      ball = root.getObjectByName('ball');

		} );
	}

  {
    canvas.addEventListener('keydown', (e) => {
      console.log(e.key);

      // 시점 변경
      if (e.key === '1')  {
        camera.position.set(-2.16, 0.6, 0);
        controls.update();
      }
      if (e.key === '2')  {
        camera.position.set(2.16, 0.6, 0);
        controls.update();
      }


      if (e.key === 'a') {
        if (bluePaddle) {
          if (bluePaddle.position.z < 0.8) {
            bluePaddle.position.z += 0.05;
          }
        }
      }
      if (e.key === 'd') {
        if (bluePaddle) {
          if (bluePaddle.position.z > -0.8) {
            bluePaddle.position.z -= 0.05;
          }
        }
      }
      if (e.key === 'w') {
        if (bluePaddle) {
          if (bluePaddle.position.y < 0.3) {
            bluePaddle.position.y += 0.05;
          }
        }
      }
      if (e.key === 's') {
        if (bluePaddle) {
          if (bluePaddle.position.y > 0.12) {
            bluePaddle.position.y -= 0.05;
          }
        }
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (redPaddle) {
        // 1번 시점 y축
        if (e.clientY / canvas.height > 0.7) {
          redPaddle.position.y = 0;
        } else if (e.clientY / canvas.height < 0.2) {
          redPaddle.position.y = 0.5;
        } else {
          redPaddle.position.y = -(e.clientY / canvas.height) + 0.7;
        }

        // 1번 시점 x축
        if (e.clientX / canvas.width < 0.2) {
          redPaddle.position.z = -0.6;
        } else if (e.clientX / canvas.width > 0.8) {
          redPaddle.position.z = 0.6;
        } else {
          redPaddle.position.z = 2 * (e.clientX / canvas.width) - 1;
        }
      }
    })
  }


  let redPaddleSet = false;
  let bluePaddleSet = false;
  let ballSet = false;

  function initSettings() {
    if (redPaddleSet && bluePaddleSet && ballSet) {
      return;
    }

    if (redPaddle && !redPaddleSet) {
      redPaddle.position.x = -1.2;
      redPaddle.position.y = 0.12;
      redPaddle.rotation.y = Math.PI / 2;
      redPaddle.rotation.z = Math.PI / 2;
      redPaddleSet = true;
    }
    
    if (bluePaddle && !bluePaddleSet) {
      bluePaddle.position.x = 1.2;
      bluePaddle.position.y = 0.1;
      bluePaddle.rotation.y = Math.PI / 2;
      bluePaddle.rotation.z = Math.PI / 2;
      bluePaddleSet = true;
    }

    if (ball && !ballSet) {
      ballSet = true;
    }
  }

	function resizeRendererToDisplaySize( renderer ) {
		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {
			renderer.setSize( width, height, false );
		}
		return needResize;
	}
  
	function render(time) {
    time *= 0.001;
    
		if ( resizeRendererToDisplaySize( renderer ) ) {
      
      const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
      
		}
    
    initSettings();

    if (ball && ballSet) {
      ball.position.x = Math.sin(time) * 0.5;
    }
		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );

}

main();