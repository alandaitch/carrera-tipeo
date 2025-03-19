import * as THREE from 'three';

export class CarController {
    constructor(scene, camera, soundManager) {
        this.scene = scene;
        this.camera = camera;
        this.soundManager = soundManager;
        
        this.model = null;
        this.position3D = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        
        this.speed = 0;
        this.maxSpeed = 200; // km/h
        this.acceleration = 0;
        this.deceleration = 20; // km/h per second
        this.distance = 0;
        this.racePosition = 1;
        
        // For camera follow
        this.cameraOffset = new THREE.Vector3(0, 3, -8);
        this.cameraLookAt = new THREE.Vector3(0, 1, 4);
        
        // For model animation
        this.wheelMeshes = [];
        this.engineSound = null;
    }
    
    async load() {
        // For now, create a simple car mesh
        const carGeometry = new THREE.BoxGeometry(2, 1, 4);
        const carMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.model = new THREE.Mesh(carGeometry, carMaterial);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        
        // Add wheels (simple cylinders)
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        wheelGeometry.rotateZ(Math.PI / 2);
        
        const wheelPositions = [
            new THREE.Vector3(-1, -0.3, 1.5), // Front left
            new THREE.Vector3(1, -0.3, 1.5),  // Front right
            new THREE.Vector3(-1, -0.3, -1.5), // Rear left
            new THREE.Vector3(1, -0.3, -1.5)   // Rear right
        ];
        
        for (const pos of wheelPositions) {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.copy(pos);
            wheel.castShadow = true;
            this.model.add(wheel);
            this.wheelMeshes.push(wheel);
        }
        
        // Create a windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.8, 0.5, 1);
        const windshieldMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x88cfff,
            transparent: true,
            opacity: 0.7
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 0.5, 0.5);
        this.model.add(windshield);
        
        this.scene.add(this.model);
        
        // Load engine sound
        this.engineSound = this.soundManager.getEngineSound();
    }
    
    setPosition(x, y, z) {
        if (typeof x === 'number' && arguments.length === 1) {
            // This is for race position
            this.racePosition = x;
            return;
        }
        
        this.position3D.set(x, y, z);
        if (this.model) {
            this.model.position.copy(this.position3D);
        }
    }
    
    getPosition() {
        return this.position3D;
    }
    
    getDistance() {
        return this.distance;
    }
    
    accelerate(amount) {
        // Aplicar aceleración directamente a la velocidad para efecto inmediato
        // en lugar de acumularla para aplicarla después con el delta
        this.speed += amount;
        console.log(`CarController: velocidad incrementada a ${this.speed} km/h (+${amount} km/h)`);
        
        // Play acceleration sound
        this.soundManager.playAccelSound();
    }
    
    update(delta) {
        // Aplicar desaceleración natural
        this.speed -= this.deceleration * delta;
        
        // Clamp speed
        this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed));
        
        // Update distance based on speed
        const distanceDelta = (this.speed / 3.6) * delta; // Convert km/h to m/s
        this.distance += distanceDelta;
        
        // Move the car model forward
        if (this.model) {
            this.model.position.z += distanceDelta;
            
            // Rotate wheels based on speed
            const wheelRotation = (this.speed / 10) * delta;
            this.wheelMeshes.forEach(wheel => {
                wheel.rotation.x += wheelRotation;
            });
        }
        
        // Update camera position
        this.updateCamera();
        
        // Update engine sound based on speed
        this.updateEngineSound();
    }
    
    updateCamera() {
        // Calculate target camera position
        const targetCameraPos = new THREE.Vector3().copy(this.model.position).add(this.cameraOffset);
        
        // Smooth camera movement
        this.camera.position.lerp(targetCameraPos, 0.1);
        
        // Calculate target look at position
        const targetLookAt = new THREE.Vector3().copy(this.model.position).add(this.cameraLookAt);
        
        // Make camera look at the target
        this.camera.lookAt(targetLookAt);
    }
    
    updateEngineSound() {
        if (this.engineSound) {
            // Update engine sound pitch based on speed
            const pitch = 0.5 + (this.speed / this.maxSpeed) * 1.5;
            this.engineSound.setPitch(pitch);
            
            // Update engine sound volume based on speed
            const volume = 0.2 + (this.speed / this.maxSpeed) * 0.8;
            this.engineSound.setVolume(volume);
        }
    }
    
    reset() {
        this.speed = 0;
        this.acceleration = 0;
        this.distance = 0;
        this.racePosition = 1;
        
        // Reset car position
        this.setPosition(0, 0.5, 0);
        
        if (this.model) {
            this.model.rotation.set(0, 0, 0);
        }
    }
}
