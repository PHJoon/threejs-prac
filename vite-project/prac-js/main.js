import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

function game() {
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 2);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const scene = new THREE.Scene();

  // 배경 이미지
  // const loader = new THREE.TextureLoader();
  // loader.load('/img/map_pixel_rain.jpg', function (texture) {
  //   scene.background = texture;
  // });
  scene.background = new THREE.Color(0x000000);

  {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }

  {
    const color = 0xffffff;
    const intensity = 2.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }

  /**
   * redPaddle: 빨간색 라켓, bluePaddle: 파란색 라켓, ball: 공
   * hit: 라켓이 공을 맞췄는지 여부, set: 라켓과 공의 초기 위치 설정 여부
   * t: 공의 이동 경로를 계산하기 위한 변수, setCurve: 공의 이동 경로 설정 여부
   * curve: 공의 이동 경로, point: 공의 이동 경로의 한 지점
   * ballDirection: 공의 방향 (1: 빨간색 라켓 -> 파란색 라켓, -1: 파란색 라켓 -> 빨간색 라켓)
   */
  let redPaddle;
  let bluePaddle;
  let ball;

  let hit = false;
  let redPaddleSet = false;
  let bluePaddleSet = false;
  let ballSet = false;

  let t = 0;
  let setCurve = 0;
  let curve;
  let point;
  let ballDirection = -1;

  {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('../tablePing.gltf', (gltf) => {
      const root = gltf.scene;
      scene.add(root);

      // compute the box that contains all the stuff
      // from root and below
      const box = new THREE.Box3().setFromObject(root);

      const boxSize = box.getSize(new THREE.Vector3()).length();
      const boxCenter = box.getCenter(new THREE.Vector3());

      // update the Trackball controls to handle the new size
      controls.maxDistance = boxSize;
      controls.target.copy(boxCenter);
      controls.update();

      redPaddle = root.getObjectByName('red_paddle');
      bluePaddle = root.getObjectByName('blue_paddle');
      ball = root.getObjectByName('ball');
    });
  }

  const geometry = new THREE.CircleGeometry(1.5);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0,
  });
  const redPaddleCircle = new THREE.Mesh(geometry, material);
  const bluePaddleCircle = redPaddleCircle.clone();

  canvas.addEventListener('keydown', (e) => {
    // 시점 변경
    if (e.key === '1') {
      camera.position.set(-2.16, 0.6, 0);
      controls.update();
    }
    if (e.key === '2') {
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
      const mouseY = e.clientY / window.innerHeight;
      if (mouseY > 0.7) {
        redPaddle.position.y = 0;
      } else if (mouseY < 0.2) {
        redPaddle.position.y = 0.5;
      } else {
        redPaddle.position.y = -mouseY + 0.75;
      }

      // 1번 시점 x축
      const mouseX = e.clientX / window.innerWidth;
      if (mouseX < 0.2) {
        redPaddle.position.z = -0.6;
      } else if (mouseX > 0.8) {
        redPaddle.position.z = 0.6;
      } else {
        redPaddle.position.z = (mouseX - 0.5) * 2;
      }
    }
  });

  // 객체의 월드 포지션을 구하는 함수
  function getAbsolutePosition(object) {
    const position = new THREE.Vector3();
    object.getWorldPosition(position);
    return position;
  }

  // 객체의 월드 스케일을 구하는 함수
  function getWorldRadius(object, radius) {
    // 객체의 월드 스케일을 구하기 위해 객체의 부모를 따라감
    object.updateMatrixWorld();
    const worldScale = new THREE.Vector3();
    object.matrixWorld.decompose(
      new THREE.Vector3(),
      new THREE.Quaternion(),
      worldScale
    );

    // 로컬 반지름에 월드 스케일을 곱함
    const localRadius = radius;
    const worldRadius =
      localRadius * Math.max(worldScale.x, worldScale.y, worldScale.z);

    return worldRadius;
  }

  // point 좌표가 원 안에 있는지 확인하는 함수
  function checkInnerCircle(pointX, pointY, centerX, centerY, radius) {
    const point = new THREE.Vector2(pointX, pointY);
    const center = new THREE.Vector2(centerX, centerY);
    const distance = point.distanceTo(center);
    if (distance < radius) {
      return true;
    }
    return false;
  }

  function paddleHit(ball, paddleCircle, side) {
    if (!ball || !paddleCircle) return;

    const paddleY = getAbsolutePosition(paddleCircle).y;
    const paddleZ = getAbsolutePosition(paddleCircle).z;
    const paddleR = getWorldRadius(paddleCircle, 1.5);

    let xMin;
    let xMax;
    if (side === 'red') {
      xMin = -1.22;
      xMax = -1.18;
    } else {
      xMin = 1.18;
      xMax = 1.22;
    }

    const ballX = ball.position.x;
    const ballY = ball.position.y;
    const ballZ = ball.position.z;
    if (ballX > xMin && ballX < xMax) {
      // y 와 z 값이 패들 원 범위에 있어야 함
      if (checkInnerCircle(ballY, ballZ, paddleY, paddleZ, paddleR)) {
        hit = true;
      } else if (side === 'red') {
        console.log('blue win');
      } else {
        console.log('red win');
      }
    }
  }

  /**
   * 시작점 => 라켓 hit 지점
   * 중단점 1 => 네트 x 0 /  y = 0.17 / z -0.4 ~ 0.4
   * 중단점 2 => 상대편 테이블 x 0.3 ~ 0.6 / y = 0.07 / z = 중단점 1의 위치 고려
   * 끝점 상대편 라켓 움직임 가능한 범위
   * x 여유있게 1.25까지 / y 0.1 ~ 0.4  / z -0.6 ~ 0.6
   */
  function makeBallCurve(hitPoint, side) {
    const breakOneZ = Math.random() * 0.8 - 0.4;
    const breakTwoX =
      side === 'red' ? Math.random() * 0.3 + 0.3 : Math.random() * -0.3 - 0.6;
    const breakTwoZ =
      breakOneZ > 0
        ? Math.random() * (0.5 - breakOneZ) + breakOneZ
        : Math.random() * (breakOneZ + 0.5) - 0.5;
    const breakThreeX = side === 'red' ? 1.25 : -1.25;
    const breakThreeY = Math.random() * 0.2 + 0.2;
    const breakThreeZ =
      breakTwoZ > 0
        ? Math.random() * (0.6 - breakTwoZ) + breakTwoZ
        : Math.random() * (breakTwoZ + 0.6) - 0.6;

    const curve = new THREE.CatmullRomCurve3([
      // 시작점
      new THREE.Vector3(hitPoint.x, hitPoint.y, hitPoint.z),
      // 중단점 1 네트 위
      new THREE.Vector3(0, 0.17, breakOneZ),
      // 중단점 2 상대편 테이블
      new THREE.Vector3(breakTwoX, 0.07, breakTwoZ),
      // 끝점
      new THREE.Vector3(breakThreeX, breakThreeY, breakThreeZ),
    ]);
    return curve;
  }

  function initSettings() {
    if (redPaddleSet && bluePaddleSet && ballSet) return;
    if (!redPaddle && !bluePaddle && !ball) return;

    if (!redPaddleSet) {
      redPaddle.position.x = -1.2;
      redPaddle.position.y = 0.12;
      redPaddle.rotation.y = Math.PI / 2;
      redPaddle.rotation.z = Math.PI / 2;
      redPaddleSet = true;

      redPaddle.add(redPaddleCircle);
    }

    if (!bluePaddleSet) {
      bluePaddle.position.x = 1.2;
      bluePaddle.position.y = 0.1;
      bluePaddle.rotation.y = Math.PI / 2;
      bluePaddle.rotation.z = Math.PI / 2;
      bluePaddleSet = true;

      bluePaddle.add(bluePaddleCircle);
    }

    if (!ballSet) {
      ball.position.x = 0;
      ball.position.y = 0.3;
      ball.position.z = 0;
      ballSet = true;
    }
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    renderer.setPixelRatio(window.devicePixelRatio);
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }


  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    initSettings();

    t += 0.005;

    if (ball && ballSet) {
      if (setCurve === 0) {
        curve = makeBallCurve(
          ball.position,
          ballDirection === 1 ? 'red' : 'blue'
        );
        setCurve = 1;
      } else {
        hit = false;
        point = curve.getPointAt(t);
        ball.position.set(point.x, point.y, point.z);
        paddleHit(ball, redPaddleCircle, 'red');
        paddleHit(ball, bluePaddleCircle, 'blue');
        if (ball.position.x > 1.18 && ball.position.x < 1.22) {
          t = 0;
          if (hit) {
            curve = makeBallCurve(ball.position, 'blue');
            ballDirection *= -1;
          } else {
            redPaddleSet = false;
            bluePaddleSet = false;
            ballSet = false;
            setCurve = 0;
          }
        }
        if (ball.position.x < -1.18 && ball.position.x > -1.22) {
          t = 0;
          if (hit) {
            curve = makeBallCurve(ball.position, 'red');
            ballDirection *= -1;
          } else {
            redPaddleSet = false;
            bluePaddleSet = false;
            ballSet = false;
            setCurve = 0;
          }
        }
      }
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

game();
