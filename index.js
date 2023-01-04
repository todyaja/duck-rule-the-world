import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

var scene, camera, renderer, earthMesh, cloudMesh, duck;

var init = () => {
  scene = new THREE.Scene();
  const FOV = 45;
  const ASPECT = window.innerWidth / window.innerHeight;
  const NEAR = 1;
  const FAR = 50000;
  camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
  camera.position.set(50, 15, 50);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xabcbff);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
};

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

var OrbControl = () => {
  const controls = new OrbitControls(camera, renderer.domElement);
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
    loader.load('Duck.gltf', gltf => {
        duck = gltf.scene;
        duck.position.set(0, 10, 0);
        duck.rotation.y += -90
        scene.add(duck)
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
  //duck.rotation.x += 0.2;
  renderer.render(scene, camera);
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

window.onload = () => {
  init();
  createPointLight();
  createSpotLight();
  createEarth();
  createDuck();
  initBackGround();
  OrbControl();
  render();
};
