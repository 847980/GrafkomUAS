import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

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

//Geometry
const objects = [];

//dikasi kurung kurawal itu biar codingannya isa nutup, jdi ndak panjang2
//dan var nya itu pny masing2 kurung kurawal ndak dipake lgi dibawahnya makanya bisa pake const

//plane
{
  var planetGeo = new THREE.PlaneGeometry(40,40);
  var planetMat = new THREE.MeshPhongMaterial({color: '#8AC'});
  const mesh = new THREE.Mesh(planetGeo, planetMat);
  mesh.rotation.x = Math.PI * -0.5;
  scene.add(mesh);
}

// //cube
// {
//   var cubeGeo = new THREE.BoxGeometry(4,4,4);
//   var cubeMat = new THREE.MeshPhongMaterial({color: '#8AC'});
//   const mesh = new THREE.Mesh(cubeGeo,cubeMat);
//   mesh.position.set(5,3.5,0);
//   scene.add(mesh);
// }

// //sphere
// {
//   var sphereGeo = new THREE.SphereGeometry(3,32,16);
//   var sphereMat = new THREE.MeshPhongMaterial({color: '#CA8'});
//   const mesh = new THREE.Mesh(sphereGeo,sphereMat);
//   mesh.position.set(-4,5,0);
//   scene.add(mesh);
// }

// instantiate a loader
const onProgress = function ( xhr ) {

  if ( xhr.lengthComputable ) {

    const percentComplete = xhr.loaded / xhr.total * 100;
    console.log( percentComplete.toFixed( 2 ) + '% downloaded' );

  }

};

new MTLLoader()
	.setPath( 'resources/' )
	.load( 'MrBean.mtl', function ( materials ) {

		materials.preload();

		new OBJLoader()
		.setMaterials( materials )
		.setPath( 'resources/' )
		.load( 'MrBean.obj', function ( object ) {

  		object.position.x = 0;
			object.scale.setScalar(10);
			scene.add( object );

		}, onProgress );

} );

new MTLLoader()
	.setPath( 'resources/' )
	.load( 'MrsWicket.mtl', function ( materials ) {

		materials.preload();

		new OBJLoader()
		.setMaterials( materials )
		.setPath( 'resources/' )
		.load( 'MrsWicket.obj', function ( object ) {

  		object.position.x = -10;
			object.scale.setScalar(10);
			scene.add( object );

		}, onProgress );

} );

new MTLLoader()
	.setPath( 'resources/' )
	.load( 'Tedd.mtl', function ( materials ) {

		materials.preload();

		new OBJLoader()
		.setMaterials( materials )
		.setPath( 'resources/' )
		.load( 'Tedd.obj', function ( object ) {

  		object.position.x = 8;
      object.position.y = 3;
      object.rotation.y = 180;
			object.scale.setScalar(3);
			scene.add( object );

		}, onProgress );

} );

new MTLLoader()
	.setPath( 'resources/' )
	.load( 'Irma Gobb.mtl', function ( materials ) {

		materials.preload();

		new OBJLoader()
		.setMaterials( materials )
		.setPath( 'resources/' )
		.load( 'Irma Gobb.obj', function ( object ) {

  		object.position.x = 10;
			object.scale.setScalar(10);
			scene.add( object );

		}, onProgress );

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

