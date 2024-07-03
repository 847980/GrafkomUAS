import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/Addons.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";
import { Sky } from "three/addons/objects/Sky.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { ShadowMapViewer } from "three/addons/utils/ShadowMapViewer.js";

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  gammaOutput: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
document.body.appendChild(renderer.domElement);

// setup scene and camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x63b0d7);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

// orbit control
// var controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 5, 0);
// controls.update();

// light
// directional light
var light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(200, 500, 300);
light.position.set(0, 700, -1000);
light.target.position.set(0, 0, 0);
light.castShadow = true;
light.shadow.mapSize.width = 2048 * 5; // Increase shadow map size for better quality
light.shadow.mapSize.height = 2048 * 5;
light.shadow.camera.near = 10;
light.shadow.camera.far = 2500;
light.shadow.camera.left = -2000;
light.shadow.camera.right = 2000;
light.shadow.camera.top = 2000;
light.shadow.camera.bottom = -2000;
light.shadow.normalBias = 0.002;
light.shadow.bias = -0.001;
light.shadow.filter = THREE.PCFSoftShadowMap;
const helper = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper);
scene.add(light);
scene.add(light.target);

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
const SHADOW_MAP_WIDTH = 2048,
  SHADOW_MAP_HEIGHT = 1024;
var lightShadowMapViewer = new ShadowMapViewer(light);
lightShadowMapViewer.position.x = 10;
lightShadowMapViewer.position.y = SCREEN_HEIGHT - SHADOW_MAP_HEIGHT / 4 - 10;
lightShadowMapViewer.size.width = SHADOW_MAP_WIDTH / 4;
lightShadowMapViewer.size.height = SHADOW_MAP_HEIGHT / 4;

// hemisphere light
light = new THREE.HemisphereLight(0xB1E1FF, 0x897A20, 0.5);
scene.add(light);

// point light
light = new THREE.PointLight(0xFFFF00, 1);
light.position.set(0, 10, 0);
scene.add(light);

// spotlight
light = new THREE.SpotLight(0xFF0000, 1);
light.position.set(10, 10, 0);
scene.add(light);

// geometry
const object = [];

// plane
// var planeGeo = new THREE.PlaneGeometry(10000, 10000);
// var planeMat = new THREE.MeshPhongMaterial({color : 0x888888, side : THREE.DoubleSide});
// var mesh = new THREE.Mesh(planeGeo, planeMat);
// mesh.rotation.x = Math.PI * -0.5;
// scene.add(mesh);

// cube
// {
//   var cubeGeo = new THREE.BoxGeometry(4, 4, 4);
// var cubeMat = new THREE.MeshPhongMaterial({color : '#8AC'});
// var mesh = new THREE.Mesh(cubeGeo, cubeMat);
// mesh.position.set(7, 3, 0);
// scene.add(mesh);
// }

// // sphere
// {
// var sphereGeo = new THREE.SphereGeometry(3, 32, 16);
// var sphereMat = new THREE.MeshPhongMaterial({color : '#CA8'});
// var mesh = new THREE.Mesh(sphereGeo, sphereMat);
// mesh.position.set(8, 3, 5);
// scene.add(mesh);
// }

// // sun
// var geometry = new THREE.SphereGeometry(1,12,3);
// var material = new THREE.MeshBasicMaterial({color:0XFFFF00});
// var sun = new THREE.Mesh(geometry,material);
// scene.add(sun);
// object.push(sun);

// // earth
// geometry = new THREE.SphereGeometry(0.33,12,3);
// material = new THREE.MeshBasicMaterial({color:0X00AAFF});
// var earth = new THREE.Mesh(geometry,material);
// scene.add(earth);
// object.push(earth);
// earth.position.x = 2;
// sun.add(earth);

// // moon
// geometry = new THREE.SphereGeometry(0.111,12,3);
// material = new THREE.MeshBasicMaterial({color:0X5555FF});
// var moon = new THREE.Mesh(geometry,material);
// scene.add(moon);
// object.push(moon);
// moon.position.x = 0.5;
// earth.add(moon);

// object.push(moon);

const onProgress = function (xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = (xhr.loaded / xhr.total) * 100;
    console.log(percentComplete.toFixed(2) + "% downloaded");
  }
};

// new MTLLoader()
//      .setPath( 'resources/' )
//      .load( 'magic_book_OBJ.mtl', function ( materials ) {

//       materials.preload();

//       new OBJLoader()
//        .setMaterials( materials )
//        .setPath( 'resources/' )
//        .load( 'magic_book_OBJ.obj', function ( object ) {

//         // object.position.y = - 0.95;
//         // object.scale.setScalar( 0.01 );
//         scene.add( object );

//        }, onProgress );

//      } );

var time_prev = 0;

let mixer;
let mixer2;
let mixer3;

const clock = new THREE.Clock();

// model

// const loader = new GLTFLoader().setPath("sonic/");
// loader.load("scene.gltf", function (gltf) {
//   var model = gltf.scene;
//   model.traverse(function (node) {
//     if (node.isMesh) {
//       node.castShadow = true;
//       node.receiveShadow = true;
//       // node.material = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
//       // node.material.transparent = true;
//       // node.material.opacity = 0.5;
//       // node.material = new THREE.MeshPhongMaterial({ color: 0x00ff00, ambient: 0x00ff00, specular: 0xffffff, shininess: 30 });
//       // node.material.ambient = new THREE.Color(0x00ff00);
//       // node.material.diffuse = new THREE.Color(0x00ff00);
//       // node.material.specular = new THREE.Color(0xffffff);
//       // node.material.shininess = 100;
//       // node.material.reflectivity = 100;
// ;    }
//   });
//   model.position.set(-20, -17, 55);
//   model.scale.set(9, 9, 9);
//   model.rotation.set(0, -Math.PI / 2, 0);
//   mixer = new THREE.AnimationMixer(model);

//   var action = mixer.clipAction(gltf.animations[1]);
//   action.timeScale = 4;
//   action.play();

//   // wait until the model can be added to the scene without blocking due to shader compilation

//   renderer.compileAsync(model, camera, scene);

//   scene.add(model);
// });

// loader.castShadow = true;
// loader.receiveShadow = true;

let sky, sun;
function initSky() {
  // Add Sky
  sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  sun = new THREE.Vector3();
  /// GUI

  const effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure,
  };

  function guiChanged() {
    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = effectController.turbidity;
    uniforms["rayleigh"].value = effectController.rayleigh;
    uniforms["mieCoefficient"].value = effectController.mieCoefficient;
    uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(sun);

    renderer.toneMappingExposure = effectController.exposure;
    // renderer.render( scene, camera );
  }

  // const gui = new GUI();

  // gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
  // gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
  // gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
  // gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
  // gui.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
  // gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
  // gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );

  guiChanged();
}
initSky();

const loader2 = new GLTFLoader().setPath("knuckle/");
loader2.load("scene.gltf", function (gltf) {
  var model = gltf.scene;
  model.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  model.position.set(450, -17, -220);
  model.scale.set(10.2, 10.2, 10.2);
  model.rotation.set(0, -Math.PI / 1.35, 0);
  // model.
  mixer2 = new THREE.AnimationMixer(model);

  var action2 = mixer2.clipAction(gltf.animations[2]);
  action2.timeScale = 2;
  action2.play();

  // wait until the model can be added to the scene without blocking due to shader compilation

  renderer.compileAsync(model, camera, scene);

  scene.add(model);
});

const loader3 = new GLTFLoader().setPath("tails/");
loader3.load("scene.gltf", function (gltf) {
  var model = gltf.scene;
  model.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  model.position.set(-300, 100, 200);
  model.scale.set(22, 22, 22);
  model.rotation.set(0, Math.PI / 4, 0);
  // model.
  mixer3 = new THREE.AnimationMixer(model);

  var action3 = mixer3.clipAction(gltf.animations[1]);
  action3.timeScale = 2;
  action3.play();

  // wait until the model can be added to the scene without blocking due to shader compilation

  renderer.compileAsync(model, camera, scene);

  scene.add(model);
});

// const loader4 = new GLTFLoader().setPath( 'envi/Pohon/' );
// loader4.load( 'Pohon0.gltf', function ( gltf ) {

//   var model = gltf.scene;
//   model.position.set(27,0,0);
//   model.scale.set(5,5,5);
//   // model.
//   // mixer3 = new THREE.AnimationMixer( model );

//   // var action3 = mixer3.clipAction(gltf.animations[0] );
//   // action3.play();

//   // wait until the model can be added to the scene without blocking due to shader compilation

//   renderer.compileAsync( model, camera, scene );

//   scene.add( model );

// }
// );

// const loader5 = new GLTFLoader().setPath( 'envi/Pohon/' );
// loader5.load( 'Pohon0.gltf', function ( gltf ) {

//   var model = gltf.scene;
//   model.position.set(-27,0,0);
//   model.scale.set(5,5,5);
//   model.rotation.set(0,180,0);
//   // model.
//   // mixer3 = new THREE.AnimationMixer( model );

//   // var action3 = mixer3.clipAction(gltf.animations[0] );
//   // action3.play();

//   // wait until the model can be added to the scene without blocking due to shader compilation

//   renderer.compileAsync( model, camera, scene );

//   scene.add( model );

// }
// );

// const loader6 = new GLTFLoader().setPath( 'envi/Batu/' );
// loader6.load( 'batu0.gltf', function ( gltf ) {

//   var model = gltf.scene;
//   model.position.set(-22.5,2.5,1);
//   model.scale.set(10,10,10);
//   model.rotation.set(0,180,0);
//   // model.
//   // mixer3 = new THREE.AnimationMixer( model );

//   // var action3 = mixer3.clipAction(gltf.animations[0] );
//   // action3.play();

//   // wait until the model can be added to the scene without blocking due to shader compilation

//   renderer.compileAsync( model, camera, scene );

//   scene.add( model );

// }
// );

// const loader7 = new GLTFLoader().setPath( 'envi/Batu/' );
// loader7.load( 'batu0.gltf', function ( gltf ) {

//   var model = gltf.scene;
//   model.position.set(20.5,2.5,1);
//   model.scale.set(20,20,20);
//   // model.rotation.set(0,180,0);
//   // model.
//   // mixer3 = new THREE.AnimationMixer( model );

//   // var action3 = mixer3.clipAction(gltf.animations[0] );
//   // action3.play();

//   // wait until the model can be added to the scene without blocking due to shader compilation

//   renderer.compileAsync( model, camera, scene );

//   scene.add( model );

// }
// );

// const loader8 = new GLTFLoader().setPath( 'envi/Branch/' );
// loader8.load( 'branch0.gltf', function ( gltf ) {

//   var model = gltf.scene;
//   model.position.set(20.5,2.5,1);
//   model.scale.set(20,20,20);
//   // model.rotation.set(0,180,0);
//   // model.
//   // mixer3 = new THREE.AnimationMixer( model );

//   // var action3 = mixer3.clipAction(gltf.animations[0] );
//   // action3.play();

//   // wait until the model can be added to the scene without blocking due to shader compilation

//   renderer.compileAsync( model, camera, scene );

//   scene.add( model );

// }
// );

// const loader9 = new GLTFLoader().setPath( 'envi/Port/' );
// loader9.load( 'port0.gltf', function ( gltf ) {

//   var model = gltf.scene;
//   model.position.set(30,11,-100);
//   model.scale.set(30,30,30);
//   model.rotation.set(0,-Math.PI/12,0);
//   // model.
//   // mixer3 = new THREE.AnimationMixer( model );

//   // var action3 = mixer3.clipAction(gltf.animations[0] );
//   // action3.play();

//   // wait until the model can be added to the scene without blocking due to shader compilation

//   renderer.compileAsync( model, camera, scene );

//   scene.add( model );

// }
// );

const loader10 = new GLTFLoader().setPath("envi/");
loader10.load("pulau_jadi.gltf", function (gltf) {
  var model = gltf.scene;
  // var model = gltf.scene;
  model.traverse(function (node) {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  console.log(model.children);
  model.position.set(400, -60, 0);
  model.scale.set(10, 10, 10);

  // model.rotation.set(0,-Math.PI/12,0);
  // model.
  // mixer3 = new THREE.AnimationMixer( model );

  // var action3 = mixer3.clipAction(gltf.animations[0] );
  // action3.play();

  // wait until the model can be added to the scene without blocking due to shader compilation

  renderer.compileAsync(model, camera, scene);

  scene.add(model);
});

// var player = new Player(
//     new ThirdPersonCamera(
//         camera, new THREE.Vector3(-35,14,0), new THREE.Vector3(35,0,0)
//     ),
//     new PlayerController(),
//     scene,
//     100
//   );

function animate(time) {
  var dt = time - time_prev;
  dt *= 0.1;

  // cube.rotation.x += 0.01 * dt;
  // cube.rotation.y += 0.01 * dt;

  const delta = clock.getDelta();
  player.update(delta);
  if (mixer) mixer.update(delta);
  if (mixer2) mixer2.update(delta);
  if (mixer3) mixer3.update(delta);

  object.forEach((obj) => (obj.rotation.z += dt * 0.01));

  renderer.render(scene, camera);
  lightShadowMapViewer.update();

  lightShadowMapViewer.render(renderer);

  time_prev = time;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
