import { Sky } from 'three/addons/objects/Sky.js';
import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { Water as Water2 } from 'three/addons/objects/Water2.js';
import { Player, PlayerController, ThirdPersonCamera, PlayerController2, FirstPersonCamera } from "./player.js";
import { log, mix, or } from 'three/examples/jsm/nodes/Nodes.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);
document.getElementById('app').appendChild(renderer.domElement);

//setup Scene and Camera
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0008);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 80);
camera.lookAt(0, 0, 0);

const cameraP = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 1000);
cameraP.position.set(0, 3, 100);
cameraP.lookAt(0, 0, 0);

const cameraF = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 1000);
cameraF.position.set(0, 3, 100);
cameraF.lookAt(0, 0, 0);

// //Orbit Controls
var controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();


var skybox;
var loader4 = new GLTFLoader().setPath('resources/milky_way_skybox/');
loader4.load('scene.gltf', async function (gltf) {
  skybox = gltf.scene;
  skybox.name = 'skybox';

  skybox.scale.set(800, 800, 800);
  skybox.position.set(0, 0, 0);
});

var tpp = true;
var fpp = true;



var light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);


//LIGHT
//Directional Light
var color = 0xFFFFFF;
var dirLight = new THREE.DirectionalLight(color, 0.3);
dirLight.castShadow = true;

dirLight.shadow.mapSize = new THREE.Vector2(4096, 4096);
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = - 50;
dirLight.shadow.camera.left = - 100;
dirLight.shadow.camera.right = 100;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 150;
dirLight.shadow.bias = -0.002;

dirLight.position.set(50, 50, 0);
dirLight.target.position.set(-20, 0, 0);
dirLight.name = 'dirLight';


scene.add(dirLight);
scene.add(dirLight.target);


// Hemisphere Light (warna langit)
// skycolor //groundColor //intensity
var hemiLight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 5);
hemiLight.receiveShadow = true;
hemiLight.name = 'hemiLight';
scene.add(hemiLight);


let gui = new GUI();
var guiElements = {
  cameras: 'TPP',
  orbit: false,
  day: true,
  music: false
};

gui.add(guiElements, "cameras", ['Free', 'TPP', 'FPP']).name("Camera").onChange(value => {
  if (value == 'Free') {
    tpp = false;
    fpp = false;
    player.controller = new PlayerController();
    orbital.enable(orbital._disabled);
  } else if (value == 'TPP') {
    if (player.camera instanceof FirstPersonCamera) {
      player.camera.setup((player.mesh.position.x, player.mesh.position.y + 1.6, player.mesh.position.z - 0.3), new THREE.Vector3(0, 0, 0));
    }
    tpp = true;
    fpp = false;
    controls.autoRotate = false;
    player.controller = new PlayerController();
    player.camera = new ThirdPersonCamera(
      cameraP, new THREE.Vector3(-8, 10, 0), new THREE.Vector3(0, 0, 0)
    );
    orbital.setValue(false);
    if (!orbital._disabled) {
      orbital.disable(!orbital._disabled);
    }
    console.log("tp");
  } else if (value == 'FPP') {
    console.log("fp");
    tpp = false;
    fpp = true;
    controls.autoRotate = false;
    player.controller = new PlayerController2();
    player.camera = new FirstPersonCamera(
      cameraF, player.controller
    );
    orbital.setValue(false);
    if (!orbital._disabled) {
      orbital.disable(!orbital._disabled);
    }
  }
});
let orbital = gui.add(guiElements, "orbit").name("Orbital").disable().onChange(value => {
  if (value) {
    controls.autoRotate = true;
  } else {
    controls.autoRotate = false;
  }
});

gui.add(guiElements, "day").name("Day").onChange(value => {
  if (value) {
    phi = THREE.MathUtils.degToRad(90 - 45); //elevation
    theta = THREE.MathUtils.degToRad(180); //azimuth
    sun.setFromSphericalCoords(1, phi, theta);
    uniforms['sunPosition'].value.copy(sun);
    ocean.material.uniforms['sunDirection'].value.copy(sun).normalize();
    scene.remove(scene.getObjectByName('skybox'));
    scene.add(dirLight);
    scene.add(hemiLight);
    for (let index = 0, counter = 1; index < light_position.length / 3; index++, counter++) {
      scene.remove(scene.getObjectByName("light" + counter));
    }
    ocean.material.uniforms['sunDirection'].value.copy(sun).normalize();
  } else {
    phi = THREE.MathUtils.degToRad(90); //elevation
    theta = THREE.MathUtils.degToRad(0); //azimuth
    sun.setFromSphericalCoords(1, phi, theta);
    uniforms['sunPosition'].value.copy(sun);
    ocean.material.uniforms['sunDirection'].value.copy(sun).normalize();
    scene.add(skybox);
    scene.remove(scene.getObjectByName('dirLight'));
    scene.remove(scene.getObjectByName('hemiLight'));
    setLight(light_position, scene);
    ocean.material.uniforms['sunDirection'].value.copy(new THREE.Vector3(0, 0, 0)).normalize();
  }
});
gui.add(guiElements, "music").name("Music").onChange(value => {
  if (value) {
    document.getElementById("bgm").play();
  } else {
    document.getElementById("bgm").pause();
  }
});
gui.open();

var light_position = [
  -46.462, 5.084, 0.512,
  -45.498, 5.015, 18.665,
  -43.255, 5.084, -27.002,
  -42.478, 4.565, -8.774,
  -35.466, 5.579, 14.891,
  -33.611, 7.032, -16.505,
  -28.612, 6.825, 31.950,
  -27.432, 3.413, 21.113,
  -27.409, 3.478, 21.160,
  -24.658, 3.346, 17.352,
  -21.109, 4.532, 38.266,
  -20.497, 6.943, -34.939,
  -20.607, 4.932, -22.648,
  -17.675, 5.071, -45.794,
  -12.625, 6.824, -8.368,
  -12.022, 6.999, 30.405,
  -12.002, 6.93, 30.386,
  -11.191, 4.936, -19.807,
  -10.721, 7.042, 9.812,
  -10.062, 4.996, -5.393,
  -9.967, 5.01, -5.447,
  -8.488, 4.976, 5.181,
  -8.253, 5.090, 64.794,
  -3.270, 4.923, 0.897,
  -2.597, 5.122, 63.922,
  -2.721, 5.090, 82.338,
  -2.586, 5.090, 84.719,
  -1.624, 5.110, -49.348,
  0.807, 5.495, -25.024,
  2.643, 5.016, -24.975,
  2.444, 2.812, 14.923,
  4.022, 4.896, 51.699,
  4.335, 5.434, -63.885,
  5.654, 5.425, -36.125,
  5.465, 5.389, -36.163,
  5.521, 5.330, -30.206,
  9.243, 4.328, 36.920,
  9.605, 6.209, 21.340,
  12.652, 5.273, -44.913,
  15.128, 4.954, -40.932,
  18.314, 4.394, -29.949,
  19.683, 5.074, 2.558,
  24.863, 5.150, 81.175,
  26.951, 4.744, -16.678,
  28.58, 5.716, -30.865,
  30.775, 5.399, -4.158,
  36.200, 5.309, -23.393,
  39.495, 2.830, 11.776,
  41.372, 4.725, 21.876,
  46.024, 4.968, 80.845,
  -11.161, 5.007, -19.802,
  -8.933, 4.954, 23.184,
  -0.923, 5.036, -63.755,
  7.590, 5.232, -13.711,
  48.375, 4.968, 81.018,
  18.427, 4.860, -3.539,
  35.550, 4.204, 63.246,
  51.322, 5.227, 67.955,
  -23.003, 4.988, 15.416,
  -18.455, 4.521, 0.964,
  -23.04, 5.028, 15.571,
  -22.473, 4.873, -28.267,
  3.864, 5.279, 31.355,
  3.796, 5.281, 31.362,
  3.297, 5.243, 63.578,
  -34.360, 4.940, 43.709
];

function setLight(light_position, scene) {
  for (let index = 0, counter = 1; index < light_position.length; index += 3, counter++) {
    var light = new THREE.PointLight(0xfcfdd3, 5);
    light.position.set(light_position[index], light_position[index + 1], light_position[index + 2]);
    light.name = "light" + counter;
    scene.add(light);
  }
}

var light = new THREE.PointLight(0xfcfdd3, 5);
light.position.set(3.297, 5.243, 63.578);
light.castShadow = true;
scene.add(light);

var transparencyBoxGeometry = new THREE.BoxGeometry(0.9, 1.5, 0.9);
var transparencyBoxMaterial = new THREE.MeshPhongMaterial({
  color: 0xfcfdd3,
  transparent: true,
  opacity: 0.4,
  side: THREE.DoubleSide
});
var transparencyBox = new THREE.Mesh(transparencyBoxGeometry, transparencyBoxMaterial);
transparencyBox.position.set(-11.747, 2.888, 54.092);
scene.add(transparencyBox);

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
ocean.position.set(0, 2, 0);

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

water.position.set(-12, 2.3, 20);
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

var phi = THREE.MathUtils.degToRad(90 - 45); //elevation
var theta = THREE.MathUtils.degToRad(180); //azimuth

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
var npc = [];
var mixers = [];

function createCollisionBox(model) {
  const box = new THREE.Box3().setFromObject(model);
  collisionHome.push(box);
}

var loader11 = new FBXLoader().setPath('resources/animasi/');
loader11.load('archerjoyful.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  
  // Mengatur posisi objek
  model.position.set(14,3, 20);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  
  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader12 = new FBXLoader().setPath('resources/animasi/');
loader12.load('archerwaving.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  
  // Mengatur posisi objek
  model.position.set(5, 3, 70);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader13 = new FBXLoader().setPath('resources/animasi/');
loader13.load('archerymcadance.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  

  // Mengatur posisi objek
  model.position.set(15, 3, 48);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader14 = new FBXLoader().setPath('resources/animasi/');
loader14.load('kachujinchickendance.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  
  // Mengatur posisi objek
  model.position.set(-15, 3, 50);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader15 = new FBXLoader().setPath('resources/animasi/');
loader15.load('kachujinjoyful.fbx', function (fbx) {
  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  
  // Mengatur posisi objek
  model.position.set(-13, 3,16 );

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader16 = new FBXLoader().setPath('resources/animasi/');
loader16.load('kachujinwaving.fbx', function (fbx) {
  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  

  // Mengatur posisi objek
  model.position.set(8, 3, -5);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader17 = new FBXLoader().setPath('resources/animasi/');
loader17.load('kachujinymcadance.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  

  // Mengatur posisi objek
  model.position.set(8, 3, -24);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
});
var loader18 = new FBXLoader().setPath('resources/animasi/');
loader18.load('knightchickendance.fbx', function (fbx) {
  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  

  // Mengatur posisi objek
  model.position.set(5, 3, 14);
  createCollisionBox(model);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader19 = new FBXLoader().setPath('resources/animasi/');
loader19.load('knightjoyful.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  

  // Mengatur posisi objek
  model.position.set(-18, 3, -25);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader20 = new FBXLoader().setPath('resources/animasi/');
loader20.load('knightwaving.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  

  // Mengatur posisi objek
  model.position.set(20, 3, -14);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var loader21 = new FBXLoader().setPath('resources/animasi/');
loader21.load('knightymcadance.fbx', function (fbx) {

  const model = fbx;
  model.castShadow = true;
  model.receiveShadow = true;
  console.log("env");
  console.log(model);
  model.scale.set(0.010, 0.010, 0.010); // Menggandakan ukuran objek
  

  // Mengatur posisi objek
  model.position.set(25, 3, -45);

  // Buat play animasi
  const mixer = new THREE.AnimationMixer(model);
  if (fbx.animations.length > 0) {
    mixer.clipAction(fbx.animations[0]).play();
  }

  model.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Asumsi Anda memiliki `scene` yang telah dibuat
  scene.add(model);
  npc.push(model);
  mixers.push(mixer);
  createCollisionBox(model);
});
var player = new Player(
  new ThirdPersonCamera(
    camera, new THREE.Vector3(-35, 14, 0), new THREE.Vector3(35, 0, 0)
  ),
  scene,
  100,
  new THREE.Vector3(-20, -17, 55)
);
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

let collisionBoundary = [];
let collisionHome = [];

// Frame dimensions and material
const frameThickness = 2;  // Uniform thickness for all parts of the frame
const frameLength = 168.9;  // The length for all sides of the frame
const frameWidth = frameLength - 48; // Adjust this value to fit the width of the frame
const frameHeight = frameLength - 251; // Adjust this value to fit the height of the frame
const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

// Function to create frame parts
function createFramePart(x, y, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const framePart = new THREE.Mesh(geometry, frameMaterial);
  framePart.position.set(x, y, z);
  //scene.add(framePart);

  // Creating and adding bounding box using Box3
  const box = new THREE.Box3().setFromObject(framePart);
  collisionBoundary.push(box);
}

// Creating the frame with uniform thickness
const halfFrameWidth = frameWidth / 2;
const halfFrameHeight = frameHeight / 2;
const halfThickness = frameThickness / 2;

// Function to create a Box3 (cube) with specified position and size
function createBox(x, y, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00});
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z);

  // Adding Box3Helper to visualize the bounding box
  const box = new THREE.Box3().setFromObject(cube);
  collisionHome.push(box);
}

// Example: Create a cube at position (1, 1, 1) with size (1, 1, 1)
//(geser kekakan atau ke kiri,naik turun,atas ke bawah ,panjang,tinggi,lebar)

// membuat box 3 tepi
createBox(0, 3.5, 85, 120, 3, 1);//bawah
createBox(0, 3.5, -81, 120, 3, 1);//atas
createBox(59, 3.5, 3, 1, 3, 164);//kanan
createBox(-59, 3.5, 3, 1, 3, 164);//kiri

//detail dalem
createBox(17.5, 3, 59, 30, 10, 7);// pintu masuk kanan bagian bawa
createBox(-17.5, 3, 59, 34, 10, 7);// pintu masuk kiri bagian bawah
createBox(17.5, 3, -59, 30, 10, 7);// pintu masuk kanan bagian atas
createBox(-17.5, 3, -59, 34, 10, 7);// pintu masuk kiri bagian atas


createBox(-45, 0, 50, 20, 5, 19);// pintu serong bawah bagian kiri
createBox(-52, 0, 0, 8.5, 5, 80);// pintu kiri
createBox(52, 0, 0, 8.5, 5, 80);// pintu kanan


//rumah rumah
createBox(0.5, 1, -3.8, 7, 6, 7);
createBox(16.5, 1, -7.7, 5, 4, 5);//kayu tengah
createBox(20, 1, -20, 6, 4, 6);

createBox(1, 5, 9, 14, 15, 9);
createBox(18, 4, 8, 17, 10, 12);
createBox(35.3, 2, 10, 13, 8, 22);
createBox(33, 3, 29.5, 8, 10, 9);
createBox(18, 5, 38, 17.5, 15, 15.5);
createBox(6.5, 2.5, 22, 7.5, 10, 10);
createBox(-0.7, 4, 37, 17, 13, 12);
createBox(-15, 5, 38, 10.5, 15, 17);
createBox(-25.2, 3.5, 34.5, 7, 13, 10);
createBox(-34.2, 3.8, 31.5, 7, 13, 10);
createBox(-16.5, 5, 8, 17.5, 15, 16);
createBox(-31, 5, 8, 8, 14, 10);
createBox(-39, 5, 13, 7, 6, 7);
createBox(-39, 5, 5, 7, 6, 7);


createBox(-37, 5, -9.3, 13, 12, 17);
createBox(-26, 3, -7, 8.8, 10, 8);
createBox(-15, 3, -6, 10, 10, 9);
createBox(-3, 3, -16.5, 8, 10, 8);
//createBox(-26,3 , -24, 18 ,10,18);
createBox(-18.2, 3, -38, 9, 10, 9);
createBox(-6.5, 3, -33.7, 11, 10, 18.5);
createBox(35.7, 3, -10, 9, 10, 9);
createBox(31, 3, -23, 16, 10, 15);
createBox(13, 3, -35, 17, 10, 13);


createBox(38, 3, 64, 8, 10, 8);
createBox(52, 3, 65, 8.5, 10, 8.5);
createBox(12, 8, 74.5, 11, 20, 17);
createBox(-9, 3, 68, 8.5, 10, 8.5);
createBox(-34, 3, 66, 13, 10, 10);

// bagian kecil kecil dari ujujung kiri bawah
createBox(-50, 0, 69.7, 15, 5, 19);
createBox(-19.5, 0, 70, 11, 5, 14);
createBox(-8, 3.5, 79, 5, 12, 6);
createBox(33, 0, 77, 28, 3, 8.5);




// console.log(player);
var time_prev = 0;
function animate(time) {
  if (player.mesh != null) {

    document.getElementById("app").addEventListener("wheel", function zoom(event) {
      if (tpp) {
        player.camera.zooming(event.deltaY * -0.000005, player.mesh.position);

      }
    });
    for (let index = 0; index < collisionHome.length; index++) {
      if (player.bbPlayer.intersectsBox(collisionHome[index])) {
        player.block = true;
        break;
      } else {
        player.block = false;
      }
    }
    if (!player.block) {
      for (let index = 0; index < collisionBoundary.length; index++) {
        if (player.bbPlayer.intersectsBox(collisionBoundary[index])) {
          player.block = true;
          break;
        } else {
          player.block = false;
        }
      }
    }
  }

  var dt = time - time_prev;
  dt *= 0.1;

  const delta = clock.getDelta();
  player.update(delta);
  controls.update(); //params in second
  // fControls.update(); //params in second
  if (mixer) mixer.update(delta);
  ocean.material.uniforms['time'].value += 1.0 / 60.0;
  if (tpp) {
    renderer.render(scene, cameraP);
  } else if (fpp) {
    renderer.render(scene, cameraF);
  } else {
    renderer.render(scene, camera);
  }

  if (skybox != null) {
    skybox.rotateZ(0.0005);
    skybox.rotateY(0.0007);
    skybox.rotateX(0.0009);
  }
  // const timeSnow = Date.now() * 0.00001;
  // for (let i = 0; i < scene.children.length; i++) {
  //   const object = scene.children[i];
  //   if (object instanceof THREE.Points) {
  //     object.rotation.z = timeSnow * (i < 4 ? i + 1 : - (i + 1));
  //   }
  // }
  mixers.forEach(mixer => {
    if (mixer) {
      mixer.update(delta);
    }
  });
  time_prev = time;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
