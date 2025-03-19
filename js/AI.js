import * as THREE from 'three';

export class AI {
    constructor(scene, soundManager, name) {
        this.scene = scene;
        this.soundManager = soundManager;
        this.name = name;
        
        this.model = null;
        this.position3D = new THREE.Vector3(0, 0, 0);
        
        this.speed = 0;
        this.maxSpeed = 180; // km/h, slightly lower than player's max speed
        this.distance = 0;
        this.racePosition = 0;
        
        // AI behavior parameters
        this.baseAcceleration = 15; // Base acceleration in km/h per second
        this.accelerationVariance = 5; // Random variance in acceleration
        this.updateInterval = 0.5; // How often AI updates its behavior (seconds)
        this.timeSinceLastUpdate = 0;
        this.isActive = false;
        
        // Different colors for AI cars
        this.colors = [0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    }
    
    async load() {
        // Create a simple car mesh with a different color than the player
        const carGeometry = new THREE.BoxGeometry(2, 1, 4);
        const colorIndex = Math.floor(Math.random() * this.colors.length);
        const carMaterial = new THREE.MeshPhongMaterial({ color: this.colors[colorIndex] });
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
    
    start() {
        this.isActive = true;
    }
    
    update(delta) {
        if (!this.isActive) return;
        
        // Update AI behavior periodically
        this.timeSinceLastUpdate += delta;
        if (this.timeSinceLastUpdate >= this.updateInterval) {
            this.updateBehavior();
            this.timeSinceLastUpdate = 0;
        }
        
        // Update speed (AI cars don't decelerate unless they're in first place)
        if (this.racePosition === 1 && Math.random() < 0.2) {
            // If in first place, occasionally slow down to give player a chance
            this.speed -= 5 * delta;
        }
        
        // Clamp speed
        this.speed = Math.max(0, Math.min(this.speed, this.maxSpeed));
        
        // Update distance based on speed
        const distanceDelta = (this.speed / 3.6) * delta; // Convert km/h to m/s
        this.distance += distanceDelta;
        
        // Move the car model forward
        if (this.model) {
            this.model.position.z += distanceDelta;
            
            // Apply a slight sway to make AI cars look more dynamic
            const swayAmount = Math.sin(this.distance * 0.1) * 0.05;
            this.model.position.x += swayAmount * delta;
        }
    }
    
    updateBehavior() {
        // Different behavior based on race position
        if (this.racePosition === 1) {
            // In first place - maintain speed with small random variations
            this.speed += (Math.random() * 2 - 1) * 5;
        } else {
            // Not in first place - try to catch up
            const catchUpBoost = (this.racePosition - 1) * 2; // Higher positions get more boost
            const randomFactor = Math.random() * this.accelerationVariance;
            const acceleration = this.baseAcceleration + catchUpBoost + randomFactor;
            this.speed += acceleration;
        }
    }
    
    reset() {
        this.speed = 0;
        this.distance = 0;
        this.racePosition = 0;
        this.isActive = false;
        
        // Reset position
        const randomOffset = (Math.random() * 2 - 1) * 2;
        this.setPosition(randomOffset, 0.5, -5);
    }
}
