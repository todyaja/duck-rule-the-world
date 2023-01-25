import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TextGeometry } from 'three/geometries/TextGeometry.js';

var scene, currentCamera, freeCamera, fixedCamera, renderer, earthMesh, cloudMesh, duck, duckPivot, rocketPivot, controls, moveText, sound, rocket;

var init = () => {
  scene = new THREE.Scene();
  const FOV = 45;
  const ASPECT = window.innerWidth / window.innerHeight;
  const NEAR = 1;
  const FAR = 50000;
  freeCamera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
  freeCamera.position.set(50, 15, 50);
  freeCamera.lookAt(0, 0, 0);

  fixedCamera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
  fixedCamera.position.set(0, 15, 50);
  fixedCamera.lookAt(0, 0, 0);

  currentCamera = fixedCamera;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xabcbff);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
};

window.onresize = function () {
  freeCamera.aspect = window.innerWidth / window.innerHeight;

  renderer.setSize(window.innerWidth, window.innerHeight);
  freeCamera.updateProjectionMatrix();
};

var OrbControl = () => {
  controls = new OrbitControls(freeCamera, renderer.domElement);
  controls.target.set(0, 0.5, 0);
  controls.update();
  controls.enablePan = false;
  controls.enableDamping = true;
};

var initBackGround = () => {
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "./assets/texture/galaxy1to1.png",
    "./assets/texture/galaxy1to1.png",
    "./assets/texture/galaxy1to1.png",
    "./assets/texture/galaxy1to1.png",
    "./assets/texture/galaxy1to1.png",
    "./assets/texture/galaxy1to1.png",
  ]);

  scene.background = texture;
};

var createDuck = () => {
  var loader = new GLTFLoader();
    loader.load('./assets/Duck.gltf', gltf => {
        duckPivot = new THREE.Object3D();
        
        duck = gltf.scene;
        duck.position.set(0, 10, 0);
        // duck.rotation.y += -90

        duckPivot.add(duck);
        scene.add(duckPivot);
    })
};

var createRocket = () => {
  var loader = new GLTFLoader();
    loader.load('./assets/rocket/rocket.gltf', gltf => {
        rocketPivot = new THREE.Object3D();
        rocket = gltf.scene;
        rocket.position.set(20, 0, 10);
        rocket.rotation.x = -Math.PI /2

        rocketPivot.add(rocket)
        scene.add(rocketPivot);
    })
};

var createAsteroid = (x, y, z) => {
  var loader = new GLTFLoader();
    loader.load('./assets/asteroid.glb', gltf => {
        // rocketPivot = new THREE.Object3D();
        let asteroid = gltf.scene;
        asteroid.position.set(x, y, z);
        asteroid.scale.set(0.05, 0.05, 0.05)

        scene.add(asteroid);
    })
};

var createEarth = () => {
  // earth geometry
  const earthGeometry = new THREE.SphereGeometry(10, 32, 32);

  // earth material
  let loader = new THREE.TextureLoader();
  const earthMaterial = new THREE.MeshStandardMaterial({
    roughness: 1,
    metalness: 0,
    map: loader.load("./assets/texture/earthmap1k.jpg"),
    bumpMap: loader.load("./assets/texture/earthbump.jpg"),
    bumpScale: 0.3,
  });

  // earth mesh
  earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earthMesh.position.set(0, 0, 0);
  scene.add(earthMesh);

  // cloud Geometry
  const cloudGeometry = new THREE.SphereGeometry(10.3, 32, 32);

  // cloud metarial
  const cloudMetarial = new THREE.MeshPhongMaterial({
    map: loader.load("./assets/texture/earthCloud.png"),
    transparent: true,
  });

  // cloud mesh
  cloudMesh = new THREE.Mesh(cloudGeometry, cloudMetarial);
  scene.add(cloudMesh);
};

var render = () => {
  requestAnimationFrame(render);
  earthMesh.rotation.y += 0.005;
  cloudMesh.rotation.y += 0.003;
  rocketPivot?.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI / 200)
  //duck.rotation.x += 0.2;
  renderer.render(scene, currentCamera);
};

let createPointLight = () => {
  let PointLight = new THREE.PointLight(0xffffff, 0.9, 1000);
  PointLight.position.set(-30, 50, 70);
  PointLight.castShadow = true;
  scene.add(PointLight);
};

let createSpotLight = () => {
  var SpotLight = new THREE.SpotLight(0xfad5a5, 1, 1000);
  SpotLight.position.set(-50, 50, 160);
  SpotLight.castShadow = true;
  scene.add(SpotLight);
};

const createText = () => {
    const loader = new FontLoader()

    loader.load('./three.js-dev/examples/fonts/helvetiker_bold.typeface.json', (font) => {
        addText(font, 'Press space \nto switch camera!', new THREE.Vector3(20, 15, 0), - Math.PI / 10, - Math.PI / 20)
        moveText = addText(font, 'Try pressing a or d!', new THREE.Vector3(-10, 10, 0), Math.PI / 16, Math.PI / 20)
    })
    
}

const addText = (font, text, position, ry, rz) => {
  const geometry = new TextGeometry(text, {
      font: font,
      size: 0.5,
      height: 1,
  })
  const material = new THREE.MeshPhongMaterial({
      color: '#FFFFFF'
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(position.x, position.y, position.z)
  mesh.rotation.y = ry
  mesh.rotation.z = rz
  scene.add(mesh)
  return mesh
}

const addSound = () => {
  const listener = new THREE.AudioListener();
  fixedCamera.add( listener );

  sound = new THREE.Audio( listener );

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( './assets/quack.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setVolume( 0.1 );
    sound.play();
  });
}

window.onload = () => {
  init();
  addListener();
  createPointLight();
  createSpotLight();
  createEarth();
  createRocket();
  createAsteroid(20, 0, -20);
  createAsteroid(-30, 5, -10);
  createAsteroid(-21, 10, -10);
  createAsteroid(10, -10, -30);
  createAsteroid(10, 5, 10);
  createAsteroid(-15, 5, -10);
  createAsteroid(-20, -10, 10);
  createAsteroid(-10, -5, 15);
  createAsteroid(30, -5, 10);
  createDuck();
  createText();
  addSound();
  initBackGround();
  OrbControl();
  render();
  
};

const addListener = () => {
    document.addEventListener('keydown', keyboardDownListener)
    document.addEventListener('keyup', keyboardUpListener)
}

const keyboardUpListener = (event) => {
  switch(event.keyCode){
    case 68: { // Right
      if (currentCamera == freeCamera) break;
      sound.play();
      break;
    }
    case 65: { // Left
      if (currentCamera == freeCamera) break;
      sound.play();
      break;
    }
    case 32: { // Space
      if (currentCamera == fixedCamera){
            controls.reset() // Change back to default
            scene.remove(moveText);
            currentCamera = freeCamera
      } else {
          scene.add(moveText);
          currentCamera = fixedCamera
      }
    }
}
}

const keyboardDownListener = (event) => {
  switch(event.keyCode){
    case 68: { // Right
      if (currentCamera == freeCamera) break;
      if (duck.rotation.y !== 0) duck.rotation.y = 0;
      duckPivot.rotateOnWorldAxis( new THREE.Vector3(0, 0, 1), -Math.PI/32);
      break;
    }
    case 65: { // Left
      if (currentCamera == freeCamera) break;
      if (duck.rotation.y !== Math.PI) duck.rotation.y = Math.PI;
      duckPivot.rotateOnWorldAxis( new THREE.Vector3(0, 0, 1), Math.PI/32);
      break;
    }
  }
}
