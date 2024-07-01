import { Sky } from 'three/addons/objects/Sky.js';
import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { Water as Water2 } from 'three/addons/objects/Water2.js';
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";
import { mix } from 'three/examples/jsm/nodes/Nodes.js';

const clock = new THREE.Clock();
let mixer;

//OCEAN and river
let ocean, water;
const params = { //river
  color: '#ffffff',
  scale: 4,
  flowX: 1,
  flowY: 1
};


//SKY
let sky, sun;

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);
document.getElementById('app').appendChild(renderer.domElement);

//setup Scene and Camera
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0008);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 100);
camera.lookAt(0, 0, 0);

const cameraP = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 1000);
cameraP.position.set(0, 3, 100);
cameraP.lookAt(0, 0, 0);

// //Orbit Controls
var controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

//LIGHT
//Directional Light
var color = 0xFFFFFF;
var light = new THREE.DirectionalLight(color, 0.5);
light.castShadow = true;

light.shadow.mapSize = new THREE.Vector2(4096, 4096);
light.shadow.camera.top = 50;
light.shadow.camera.bottom = - 50;
light.shadow.camera.left = - 100;
light.shadow.camera.right = 100;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 150;
light.shadow.bias = -0.002;

light.position.set(50, 50, 0);
light.target.position.set(-20, 0, 0);



scene.add(light);
scene.add(light.target);

var shadowHelper = new THREE.CameraHelper(light.shadow.camera);
scene.add(shadowHelper);

//Hemisphere Light (warna langit)
//skycolor //groundColor //intensity
light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 5);
// light.receiveShadow = true;
scene.add(light);

//Point Light (warna dari lampu)
//color  //intensity
light = new THREE.PointLight(0xFFFF00, 50);
light.castShadow = true;
light.position.set(10, 10, 0);
// scene.add(light);

//Spot Light
//color  //intensity
light = new THREE.SpotLight(0xFF0000, 50);
light.castShadow = true;
light.position.set(10, 10, 0);
// scene.add(light);


{
  //   var planetGeo = new THREE.PlaneGeometry(40, 40);
  //   var planetMat = new THREE.MeshLambertMaterial({ color: '#8AC' });
  //   var mesh = new THREE.Mesh(planetGeo, planetMat);
  //   //rotation here
  //   mesh.rotation.x = Math.PI * -0.5;
  //   mesh.position.set(5, 3.5, 0);
  //   mesh.castShadow = true;
  //   mesh.receiveShadow = true;
  //   scene.add(mesh);

  //   var sphereGeo = new THREE.SphereGeometry(3, 32, 16);
  //   var sphereMat = new THREE.MeshLambertMaterial({ color: '#CA8' });
  //   var mesh = new THREE.Mesh(sphereGeo, sphereMat);
  //   mesh.castShadow = true;
  //   mesh.receiveShadow = true;
  //   mesh.position.set(-4, 8, 0);
  //   scene.add(mesh);
}


// snow
{
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  const textureLoader = new THREE.TextureLoader();

  const assignSRGB = (texture) => {

    texture.colorSpace = THREE.SRGBColorSpace;

  };

  const sprite1 = textureLoader.load('textures/sprites/snowflake1.png', assignSRGB);
  const sprite2 = textureLoader.load('textures/sprites/snowflake2.png', assignSRGB);
  const sprite3 = textureLoader.load('textures/sprites/snowflake3.png', assignSRGB);
  const sprite4 = textureLoader.load('textures/sprites/snowflake4.png', assignSRGB);
  const sprite5 = textureLoader.load('textures/sprites/snowflake5.png', assignSRGB);

  for (let i = 0; i < 500; i++) {

    const x = Math.random() * 1000 - 500;
    const y = Math.random() * 1000 - 500;
    const z = Math.random() * 1000 - 500;

    vertices.push(x, y, z);

  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

  let parameters = [
    [[1.0, 0.0, 1.0], sprite2, 5],
    [[1.0, 0.0, 1.0], sprite3, 7],
    [[1.0, 0.0, 1.0], sprite1, 5],
    [[1.0, 0.0, 1.0], sprite5, 3],
    [[1.0, 0.0, 1.0], sprite4, 1]
  ];

  for (let i = 0; i < parameters.length; i++) {

    const color = parameters[i][0];
    const sprite = parameters[i][1];
    const size = parameters[i][2];

    let materials = [];
    materials[i] = new THREE.PointsMaterial({ size: size, map: sprite, blending: THREE.AdditiveBlending, depthTest: false, transparent: true });
    materials[i].color.setHSL(color[0], color[1], color[2], THREE.SRGBColorSpace);

    const particles = new THREE.Points(geometry, materials[i]);

    // particles.rotation.x = Math.random() * 6;
    // particles.rotation.y = Math.random() * 6;
    // particles.rotation.z = Math.random() * 6;

    scene.add(particles);

  }
}

//OCEAN
const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

ocean = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {

      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined
  }
);
// ocean.position.set(0,10,0);

ocean.rotation.x = - Math.PI / 2;

scene.add(ocean);

// river
const riverGeometry = new THREE.PlaneGeometry(48, 6.5);

water = new Water2(riverGeometry, {
  color: params.color,
  scale: params.scale,
  flowDirection: new THREE.Vector2(params.flowX, params.flowY),
  textureWidth: 1024,
  textureHeight: 1024
});

water.position.set(-12, 2, 20);
water.rotation.x = Math.PI * - 0.5;
scene.add(water);

//Sky
sky = new Sky();
sky.scale.setScalar(45000);
scene.add(sky);

sun = new THREE.Vector3();

const uniforms = sky.material.uniforms;
uniforms['turbidity'].value = 1;
uniforms['rayleigh'].value = 0.2;
uniforms['mieCoefficient'].value = 0.007;
uniforms['mieDirectionalG'].value = 0.73;

const phi = THREE.MathUtils.degToRad(90 - 45); //elevation
const theta = THREE.MathUtils.degToRad(180); //azimuth

sun.setFromSphericalCoords(1, phi, theta);

uniforms['sunPosition'].value.copy(sun);
ocean.material.uniforms['sunDirection'].value.copy(sun).normalize();

renderer.toneMappingExposure = 0.2;
renderer.shadowMap.enabled = true;

// instantiate a loader
const onProgress = function (xhr) {

  if (xhr.lengthComputable) {

    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log(percentComplete.toFixed(2) + '% downloaded');

  }

};

// var loader = new GLTFLoader().setPath('resources/newHome/try/');
// loader.load('try.gltf', async function (gltf) {

//   const model = gltf.scene;
//   model.castShadow = true;
//   model.receiveShadow = true;
//   console.log(model)
//   //buat play animasi
//   // mixer = new THREE.AnimationMixer(model);
//   // mixer.clipAction(gltf.animations[0]).play();

//   // model.children.forEach(element => {
//   //   // var lod = new THREE.LOD();
//   //   // lod.addLevel(element, 0);
//   //   // scene.add(lod);
//   //   //jok dihapus!!!!
//   //   element.castShadow = true;
//   //   element.receiveShadow = true;
//   //   // element.material.wireframe = false;
//   // });

//   model.children[0].children.forEach(element => {
//     // var lod = new THREE.LOD();
//     // lod.addLevel(element, 0);
//     // scene.add(lod);
//     //jok dihapus!!!!
//     element.castShadow = true;
//     element.receiveShadow = true;
//     element.material.wireframe = false;
//   });

//   model.position.set(0, 4, 0);
//   scene.add(model);

// });

var loader = new GLTFLoader().setPath('resources/newHome/');
loader.load('envi.gltf', async function (gltf) {

  const model = gltf.scene;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model)
  //buat play animasi
  // mixer = new THREE.AnimationMixer(model);
  // mixer.clipAction(gltf.animations[0]).play();

  model.children.forEach(element => {
    // var lod = new THREE.LOD();
    // lod.addLevel(element, 0);
    // scene.add(lod);
    //jok dihapus!!!!
    element.castShadow = true;
    element.receiveShadow = true;
    element.children.forEach(element1 => {
      element1.castShadow = true;
      element1.receiveShadow = true;
      element1.children.forEach(element2 => {
        // console.log(element2);
        element2.castShadow = true;
        element2.receiveShadow = true;
        element2.children.forEach(element3 => {
          // console.log(element3);
          element3.castShadow = true;
          element3.receiveShadow = true;
        });
      });
    });
    // element.material.wireframe = false;
  });
{
  // model.children[30].children.forEach(element => {
  //   // var lod = new THREE.LOD();
  //   // lod.addLevel(element, 0);
  //   // scene.add(lod);
  //   //jok dihapus!!!!

  //   element.castShadow = true;
  //   element.receiveShadow = true;
  //   element.material.wireframe = false;
  // });
}

  model.position.set(0, 0, 0);
  scene.add(model);

});
{
// var loader = new GLTFLoader().setPath('resources/mainC/');
// loader.load('/walkinplace/ThirdPersonWalk.gltf',  (gltf) => {

//   const model = gltf.scene;
//   console.log(model)
//   //buat play animasi
//   mixer = new THREE.AnimationMixer(model);
//   console.log(mixer);
//   mixer.clipAction(gltf.animations[0]).play();

//   model.children[0].children.forEach(element => {
//     // var lod = new THREE.LOD();
//     // lod.addLevel(element, 0);
//     // scene.add(lod);
//     //jok dihapus!!!!
//     element.castShadow = true;
//     element.receiveShadow = true;
//     // element.material.wireframe = false;
//   });

//   model.position.set(0, -5, 0);
//   scene.add(model);
// console.log("haii");

// });
}
var player = new Player(
  new ThirdPersonCamera(
    cameraP, new THREE.Vector3(-8, 10, 0), new THREE.Vector3(0, 0, 0)
  ),
  new PlayerController(),
  scene,
  10
);


var boxxes = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xffffff}));
boxxes.position.set(3,3,3);
var bbPlayer = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
bbPlayer.setFromObject(boxxes);
scene.add(new THREE.Box3Helper(bbPlayer, 0xffff11));

var boxing = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshPhysicalMaterial({
  opacity: 0.2,
  transparent: true}));
boxing.position.set(3,3,3);
boxing.castShadow = true;
boxing.receiveShadow = true;
scene.add(boxing);

// console.log(player);
var time_prev = 0;
function animate(time) {
  if (player.mesh != null) {
    if (player.bbPlayer.intersectsBox(bbPlayer)) {
      player.block = true;
    } else {
      player.block = false;
    }
  }

  var dt = time - time_prev;
  dt *= 0.1;

  const delta = clock.getDelta();
  player.update(delta);
  if (mixer) mixer.update(delta);
  ocean.material.uniforms['time'].value += 1.0 / 60.0;
  renderer.render(scene, cameraP);

  const timeSnow = Date.now() * 0.00001;
  for ( let i = 0; i < scene.children.length; i ++ ) {

    const object = scene.children[ i ];

    if ( object instanceof THREE.Points ) {

      object.rotation.z = timeSnow * ( i < 4 ? i + 1 : - ( i + 1 ) );

    }

  }
  
  time_prev = time;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
