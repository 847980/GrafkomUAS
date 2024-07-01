import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


export class Player {

    constructor(camera, controller, scene, speed) {
        this.camera = camera;
        this.controller = controller;
        this.scene = scene;
        this.speed = speed;
        this.state = "idle";
        this.rotationVector = new THREE.Vector3(0, 0, 0);
        this.animations = {};
        this.lastRotation = 0;
        this.object = null;
        this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);
        this.loadModel();
        this.block = false;

    }

    loadModel() {
        var loader = new GLTFLoader().setPath('resources/mainC/');
        loader.load('/idle/ThirdPersonIdle.gltf', (gltf) => {
            this.model = gltf.scene;
            this.mesh = this.model;
            this.model.children[0].children.forEach(element => {
                element.castShadow = true;
                element.receiveShadow = true;
            });

            this.model.position.set(3, 2.5, 70);
            this.model.rotation.y += Math.PI / 2;
            this.scene.add(this.model);
            //make cubic to help collision detection
            this.boxPlayer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 0.5), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
            this.boxPlayer.position.set(this.model.position.x, this.model.position.y, this.model.position.z);
            // this.scene.add(this.boxPlayer);
            //helper for the box3
            this.bbPlayer = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
            this.bbPlayer.setFromObject(this.boxPlayer);
            this.scene.add(new THREE.Box3Helper(this.bbPlayer, 0xffff00));


            this.mixer = new THREE.AnimationMixer(this.model);
            var onLoad = (animName, anim) => {
                const clip = anim.animations[0];
                const action = this.mixer.clipAction(clip);

                this.animations[animName] = {
                    clip: clip,
                    action: action,
                };
            };
            const loader = new GLTFLoader().setPath('resources/mainC/');
            loader.load('/idle/ThirdPersonIdle.gltf', (gltf) => { console.log("bu"); onLoad('idle', gltf) });
            loader.load('/walkinplace/ThirdPersonWalk.gltf', (gltf) => { onLoad('run', gltf) });
        });
    }
    doIt(forward, right, rotation) {
        this.mesh.rotation.y += rotation.y;
        this.mesh.position.add(forward);
        this.mesh.position.add(right);
        this.boxPlayer.position.set(this.mesh.position.x, this.model.position.y, this.model.position.z);
        this.bbPlayer.setFromObject(this.boxPlayer);
        this.camera.setup(this.mesh.position, this.rotationVector);
    }
    update(dt) {
        if (this.mesh && this.animations) {
            this.lastRotation = this.mesh.rotation.y;
            var direction = new THREE.Vector3(0, 0, 0);

            if (this.controller.keys['forward']) {
                direction.x = 0.5;
                this.mesh.rotation.y = Math.PI / 2;
            }
            if (this.controller.keys['backward']) {
                direction.x = -0.5;
                this.mesh.rotation.y = -Math.PI / 2;
            }
            if (this.controller.keys['left']) {
                direction.z = -0.5;
                this.mesh.rotation.y = Math.PI;
            }
            if (this.controller.keys['right']) {
                direction.z = 0.5;
                this.mesh.rotation.y = 0;
            }
            this.lastRotation = this.mesh.rotation.y;
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

                // this.rotationVector.y += dtMouse.x * dt * 10;
                // this.rotationVector.z += dtMouse.y * dt * 10;

            }
            // need a temp player for the bbPlayer
            this.mesh = this.mesh;
            this.mesh.rotation.y += this.rotationVector.y;

            var forwardVector = new THREE.Vector3(1, 0, 0);
            var rightVector = new THREE.Vector3(0, 0, 1);
            forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
            rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
            let forward = forwardVector.multiplyScalar(dt * this.speed * direction.x) ;
            let right = rightVector.multiplyScalar(dt * this.speed * direction.z);
            this.boxPlayer.position.add(forward);
            this.boxPlayer.position.add(right);
            this.bbPlayer.setFromObject(this.boxPlayer);

            if (!this.block) {
                this.doIt(forward, right, this.rotationVector);
            } else {
                this.boxPlayer.position.set(this.mesh.position.x, this.model.position.y, this.model.position.z);
            }
            // this.camera.setup(this.mesh.position, this.rotationVector);

            if (this.mixer) {
                this.mixer.update(dt);
            }

        }
    }

}

export class PlayerController {

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

export class ThirdPersonCamera {
    constructor(camera, positionOffSet, targetOffSet) {
        this.camera = camera;
        this.positionOffSet = positionOffSet;
        this.targetOffSet = targetOffSet;
        // this.camera.zoom = 10;
        // this.camera.updateProjectionMatrix();
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