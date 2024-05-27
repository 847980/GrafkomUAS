import { Sky } from 'three/addons/objects/Sky.js';
import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { Water } from 'three/addons/objects/Water.js';
import { Water as Water2 } from 'three/addons/objects/Water2.js';

class Player {
  constructor(camera, controller, scene, speed) {
    this.camera = camera;
    this.controller = controller;
    this.scene = scene;
    this.speed = speed;
    this.state = "idle";
    this.rotationVector = new THREE.Vector3(0, 0, 0);
    this.animations = {};


    this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);


    // this.mesh = new THREE.Mesh(
    // 	new THREE.BoxGeometry(1,1,1),
    // 	new THREE.MeshPhongMaterial({color: 0xFF1111})
    // );
    // this.scene.add(this.mesh);
    // this.mesh.castShadow = true;
    // this.mesh.receiveShadow = true;
    this.loadModel();
  }


  loadModel() {
    var loader = new GLTFLoader().setPath('resources/mainC/idle/');
    loader.load('MM_Idle.gltf', async function (gltf) {
      gltf.scale.setScalar(0.01);
      gltf.traverse(c => {
        c.castShadow = true;
      });
      this.mesh = gltf;
      this.scene.add(this.mesh);
      this.mesh.rotation.y += Math.PI / 2;


      this.mixer = new THREE.AnimationMixer(this.mesh);


      var onLoad = (animName, anim) => {
        const clip = anim.animations[0];
        const action = this.mixer.clipAction(clip);

        this.animations[animName] = {
          clip: clip,
          action: action,
        };
      };


      const loader = new GLTFLoader();
      loader.setPath('resources/mainC/idle/');
      loader.load('MM_Idle.gltf', (gltf) => { onLoad('idle', gltf) });
      loader.setPath('resources/mainC/runfwd/');
      loader.load('MM_Run_Fwd.gltf', (gltf) => { onLoad('run', gltf) });
    });


  }


  update(dt) {
    if (this.mesh && this.animations) {
      var direction = new THREE.Vector3(0, 0, 0);


      if (this.controller.keys['forward']) {
        direction.x = 1;
        this.mesh.rotation.y = Math.PI / 2;
      }
      if (this.controller.keys['backward']) {
        direction.x = -1;
        this.mesh.rotation.y = -Math.PI / 2;
      }
      if (this.controller.keys['left']) {
        direction.z = -1;
        this.mesh.rotation.y = Math.PI;
      }
      if (this.controller.keys['right']) {
        direction.z = 1;
        this.mesh.rotation.y = 0;
      }
      console.log(direction.length())
      if (direction.length() == 0) {
        if (this.animations['idle']) {
          if (this.state != "idle") {
            this.mixer.stopAllAction();
            this.state = "idle";
          }
          this.mixer.clipAction(this.animations['idle'].clip).play();
        }
      } else {
        if (this.animations['run']) {
          if (this.state != "run") {
            this.mixer.stopAllAction();
            this.state = "run";
          }
          this.mixer.clipAction(this.animations['run'].clip).play();
        }
      }


      if (this.controller.mouseDown) {
        var dtMouse = this.controller.deltaMousePos;
        dtMouse.x = dtMouse.x / Math.PI;
        dtMouse.y = dtMouse.y / Math.PI;

        this.rotationVector.y += dtMouse.x * dt * 10;
        this.rotationVector.z += dtMouse.y * dt * 10;
        this.mesh.rotation.y += dtMouse.x * dt * 10;
      }


      var forwardVector = new THREE.Vector3(1, 0, 0);
      var rightVector = new THREE.Vector3(0, 0, 1);
      forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
      rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);


      this.mesh.position.add(forwardVector.multiplyScalar(dt * this.speed * direction.x));
      this.mesh.position.add(rightVector.multiplyScalar(dt * this.speed * direction.z));

      this.camera.setup(this.mesh.position, this.rotationVector);

      if (this.mixer) {
        this.mixer.update(dt);
      }
    }
  }
}

class PlayerController {

  constructor() {
    this.keys = {
      "forward": false,
      "backward": false,
      "left": false,
      "right": false
    }
    this.mousePos = new THREE.Vector2();
    this.mouseDown = false;
    this.deltaMousePos = new THREE.Vector2();
    document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    document.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
    document.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
  }
  onMouseDown(event) {
    this.mouseDown = true;
  }
  onMouseUp(event) {
    this.mouseDown = false;
  }
  onMouseMove(event) {
    var currentMousePos = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    this.deltaMousePos.addVectors(currentMousePos, this.mousePos.multiplyScalar(-1));
    this.mousePos.copy(currentMousePos);
  }
  onKeyDown(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys['forward'] = true;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys['backward'] = true;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys['left'] = true;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys['right'] = true;
        break;
    }
  }
  onKeyUp(event) {
    switch (event.keyCode) {
      case "W".charCodeAt(0):
      case "w".charCodeAt(0):
        this.keys['forward'] = false;
        break;
      case "S".charCodeAt(0):
      case "s".charCodeAt(0):
        this.keys['backward'] = false;
        break;
      case "A".charCodeAt(0):
      case "a".charCodeAt(0):
        this.keys['left'] = false;
        break;
      case "D".charCodeAt(0):
      case "d".charCodeAt(0):
        this.keys['right'] = false;
        break;
    }
  }

}

class ThirdPersonCamera {
  constructor(camera, positionOffSet, targetOffSet) {
    this.camera = camera;
    this.positionOffSet = positionOffSet;
    this.targetOffSet = targetOffSet;
  }
  setup(target, angle) {
    var temp = new THREE.Vector3(0, 0, 0);
    temp.copy(this.positionOffSet);
    temp.applyAxisAngle(new THREE.Vector3(angle.x, 1, 0), angle.y);
    temp.applyAxisAngle(new THREE.Vector3(angle.y, 0, 1), angle.z);
    temp.addVectors(target, temp);
    this.camera.position.copy(temp);
    temp = new THREE.Vector3(0, 0, 0);
    temp.addVectors(target, this.targetOffSet);
    this.camera.lookAt(temp);
  }
}


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
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth
  / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, 100);
camera.lookAt(0, 0, 0);

//Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

//LIGHT
//Directional Light
var color = 0xFFFFFF;
var light = new THREE.DirectionalLight(color, 0.5);
light.castShadow = true;
light.position.set(0, 10, 0);
light.target.position.set(-5, 0, 0);
scene.add(light);
scene.add(light.target);

//Hemisphere Light (warna langit)
//skycolor //groundColor //intensity
light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 5);
light.castShadow = true;
scene.add(light);

//Point Light (warna dari lampu)
//color  //intensity
light = new THREE.PointLight(0xFFFF00, 50);
light.castShadow = true;
light.position.set(10, 10, 0);
scene.add(light);

//Spot Light
//color  //intensity
light = new THREE.SpotLight(0xFF0000, 50);
light.castShadow = true;
light.position.set(10, 10, 0);
scene.add(light);

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

// instantiate a loader
const onProgress = function (xhr) {

  if (xhr.lengthComputable) {

    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log(percentComplete.toFixed(2) + '% downloaded');

  }

};

const loader = new GLTFLoader().setPath('resources/newHome/');
loader.load('envi.gltf', async function (gltf) {

  const model = gltf.scene;
  console.log(model)
  //buat play animasi
  // mixer = new THREE.AnimationMixer(model);
  // mixer.clipAction(gltf.animations[0]).play();

  model.children[0].children.forEach(element => {
    // var lod = new THREE.LOD();
    // lod.addLevel(element, 0);
    // scene.add(lod);
    //jok dihapus!!!!
    element.castShadow = true;
    element.receiveShadow = true;
    element.material.wireframe = false;
  });

  model.position.set(0, -5, 0);
  scene.add(model);

});

var player = new Player(
  new ThirdPersonCamera(
      camera, new THREE.Vector3(-5,2,0), new THREE.Vector3(0,0,0)
  ),
  new PlayerController(),
  scene,
  10
);


var time_prev = 0;
function animate(time) {
  var dt = time - time_prev;
  dt *= 0.1;

  const delta = clock.getDelta();

  if (mixer) mixer.update(delta);
  ocean.material.uniforms['time'].value += 1.0 / 60.0;
  renderer.render(scene, camera);

  time_prev = time;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
