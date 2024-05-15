import { Sky } from 'three/addons/objects/Sky.js';
import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//SKY
let sky, sun;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

//setup Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth
  /window.innerHeight,0.1,1000);
camera.position.set(0,0,100);
camera.lookAt(0,0,0);

//Orbit Controls
const controls = new OrbitControls(camera,renderer.domElement);
controls.target.set(0,5,0);
controls.update();

//LIGHT
//Directional Light
var color = 0xFFFFFF;
var light = new THREE.DirectionalLight(color, 0.5);
light.position.set(0,10,0);
light.target.position.set(-5,0,0);
scene.add(light);
scene.add(light.target);

//Hemisphere Light (warna langit)
                                  //skycolor //groundColor //intensity
light = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 5);
scene.add(light);

//Point Light (warna dari lampu)
                            //color  //intensity
light = new THREE.PointLight(0xFFFF00,50);
light.position.set(10,10,0);
scene.add(light);

//Spot Light
                            //color  //intensity
light = new THREE.SpotLight(0xFF0000,50);
light.position.set(10,10,0);
scene.add(light);

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

renderer.toneMappingExposure = 0.2;


//Geometry
const objects = [];

//plane
{
  var planetGeo = new THREE.PlaneGeometry(200,200);
  var planetMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(planetGeo, planetMat);
  mesh.rotation.x = Math.PI * -0.5;
  scene.add(mesh);
}

// instantiate a loader
const onProgress = function ( xhr ) {

  if ( xhr.lengthComputable ) {

    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log( percentComplete.toFixed( 2 ) + '% downloaded' );

  }

};

const loader = new GLTFLoader().setPath( 'resources/day/' );
	loader.load( 'map_village_day.gltf', async function ( gltf ) {

		const model = gltf.scene;
    model.position.set(0,-6.5,0);
		scene.add( model );
			
	} );

var time_prev = 0;
function animate(time){
  var dt = time - time_prev;
  dt *= 0.1;

  objects.forEach((obj)=>{
    obj.rotation.z += dt * 0.01;
  });

  renderer.render(scene,camera);

  time_prev = time;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
