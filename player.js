import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { and, log } from "three/examples/jsm/nodes/Nodes.js";


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
            this.boxPlayer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 0.5), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
            this.boxPlayer.position.set(this.model.position.x, this.model.position.y, this.model.position.z);
            // this.scene.add(this.boxPlayer);
            this.bbPlayer = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
            this.bbPlayer.setFromObject(this.boxPlayer);


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

            // Batas rotate untuk Pitch, Roll, Yaw
            var minPitch = -Math.PI / 4; 
            var maxPitch = Math.PI / 4; 

            var minRoll = -Math.PI / 4; 
            var maxRoll = Math.PI / 4; 

            var minYaw = -Math.PI / 8; 
            var maxYaw = Math.PI / 8; 

            if (this.controller.keys['pitchUp']) {
                if (this.rotationVector.x < maxPitch) {
                    this.rotationVector.x += Math.PI/4 * 0.1;
                    if (this.rotationVector.x > maxPitch) {
                        this.rotationVector.x = maxPitch;
                    }
                }
            }
            if (this.controller.keys['pitchDown']) {
                if (this.rotationVector.x > minPitch) {
                    this.rotationVector.x -= Math.PI/4 * 0.1;
                    if (this.rotationVector.x < minPitch) {
                        this.rotationVector.x = minPitch;
                    }
                }
            }
            if (this.controller.keys['rollLeft']) {
                if (this.rotationVector.y < maxRoll) {
                    this.rotationVector.y += Math.PI/4 * 0.1;
                    if (this.rotationVector.y > maxRoll) {
                        this.rotationVector.y = maxRoll;
                    }
                }
            }
            if (this.controller.keys['rollRight']) {
                if (this.rotationVector.y > minRoll) {
                    this.rotationVector.y -= Math.PI/4 * 0.1;
                    if (this.rotationVector.y < minRoll) {
                        this.rotationVector.y = minRoll;
                    }
                }
            }
            if (this.controller.keys['yawLeft']) {
                if (this.rotationVector.z < maxYaw) {
                    this.rotationVector.z += Math.PI/4 * 0.1;
                    if (this.rotationVector.z > maxYaw) {
                        this.rotationVector.z = maxYaw;
                    }
                }
            }
            if (this.controller.keys['yawRight']) {
                if (this.rotationVector.z > minYaw) {
                    this.rotationVector.z -= Math.PI/4 * 0.1;
                    if (this.rotationVector.z < minYaw) {
                        this.rotationVector.z = minYaw;
                    }
                }
            }
            
            
            // need a temp player for the bbPlayer
            this.mesh.rotation.y += this.rotationVector.y;

            var forwardVector = new THREE.Vector3(1, 0, 0);
            var rightVector = new THREE.Vector3(0, 0, 1);
            forwardVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
            rightVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationVector.y);
            let forward = forwardVector.multiplyScalar(dt * this.speed * direction.x);
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
            this.mesh.rotation.y = this.lastRotation;
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
    constructor(camera, positionOffset, targetOffset) {
        this.camera = camera;
        this.positionOffset = positionOffset;
        this.targetOffset = targetOffset;
    }

    setup(target, angle) {
        let temp = new THREE.Vector3();
        temp.copy(this.positionOffset);
        // temp.applyAxisAngle(new THREE.Vector3(1, 0, 0), angle.x);
        temp.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle.y);
        temp.applyAxisAngle(new THREE.Vector3(0, 0, 1), angle.z);
        temp.add(target);
        this.camera.position.copy(temp);
        let lookAtTarget = new THREE.Vector3().copy(target).add(this.targetOffset);
        this.camera.lookAt(lookAtTarget);
    }

    zooming(delta) {
        if (this.camera.getFocalLength() >= 24 & delta >= 0 | this.camera.getFocalLength() <= 14 & delta <= 0 ) {
            return;
        }
        console.log("fl",this.camera.getFocalLength());
        console.log(this.camera.setFocalLength(this.camera.getFocalLength() + delta));
    }
}



export class PlayerController2 {

    constructor() {
        this.keys = {
            "forward": false,
            "backward": false,
            "left": false,
            "right": false,
            "pitchUp": false,
            "pitchDown": false,
            "yawLeft": false,
            "yawRight": false,
            "rollLeft": false,
            "rollRight": false
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
                this.keys['left'] = true;
                break;
            case "S".charCodeAt(0):
            case "s".charCodeAt(0):
                this.keys['right'] = true;
                break;
            case "A".charCodeAt(0):
            case "a".charCodeAt(0):
                this.keys['backward'] = true;
                break;
            case "D".charCodeAt(0):
            case "d".charCodeAt(0):
                this.keys['forward'] = true;
                break;
            case 38: // Up arrow
                this.keys['pitchUp'] = true;
                break;
            case 40: // Down arrow
                this.keys['pitchDown'] = true;
                break;
            case 37: // Left arrow
                this.keys['rollLeft'] = true;
                break;
            case 39: // Right arrow
                this.keys['rollRight'] = true;
                break;
            case 219: // '[' key
                this.keys['yawLeft'] = true;
                break;
            case 221: // ']' key
                this.keys['yawRight'] = true;
                break;
        }
    }
    onKeyUp(event) {
        switch (event.keyCode) {
            case "W".charCodeAt(0):
            case "w".charCodeAt(0):
                this.keys['left'] = false;
                break;
            case "S".charCodeAt(0):
            case "s".charCodeAt(0):
                this.keys['right'] = false;
                break;
            case "A".charCodeAt(0):
            case "a".charCodeAt(0):
                this.keys['backward'] = false;
                break;
            case "D".charCodeAt(0):
            case "d".charCodeAt(0):
                this.keys['forward'] = false;
                break;
            case 38: // Up arrow
                this.keys['pitchUp'] = false;
                break;
            case 40: // Down arrow
                this.keys['pitchDown'] = false;
                break;
            case 37: // Left arrow
                this.keys['rollLeft'] = false;
                break;
            case 39: // Right arrow
                this.keys['rollRight'] = false;
                break;
            case 219: // '[' key
                this.keys['yawLeft'] = false;
                break;
            case 221: // ']' key
                this.keys['yawRight'] = false;
                break;
        }
    }

}

export class FirstPersonCamera {

    constructor(camera, controller) {
        this.camera = camera;
        this.controller = controller;
    }

    setup(position, rotation) {
        this.camera.position.set(position.x, position.y + 1.6, position.z - 0.3);
        this.camera.rotation.set(rotation.x, rotation.y, rotation.z);
    }
}