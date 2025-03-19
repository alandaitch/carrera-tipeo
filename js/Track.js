import * as THREE from 'three';

export class Track {
    constructor(scene) {
        this.scene = scene;
        this.roadLength = 2000; // Length of the road in meters
        this.roadWidth = 10;    // Width of the road
        this.roadSegments = [];
        this.buildings = [];
        this.landmarks = [];
        
        // Buenos Aires landmarks coordinates (simplified for game)
        this.landmarkPositions = [
            { name: "Obelisco", position: new THREE.Vector3(5, 0, 200), scale: new THREE.Vector3(2, 15, 2) },
            { name: "Casa Rosada", position: new THREE.Vector3(-15, 0, 400), scale: new THREE.Vector3(10, 8, 15) },
            { name: "Teatro Colón", position: new THREE.Vector3(20, 0, 600), scale: new THREE.Vector3(12, 10, 8) },
            { name: "La Bombonera", position: new THREE.Vector3(-25, 0, 800), scale: new THREE.Vector3(15, 8, 15) }
        ];
    }
    
    async load() {
        // Create ground
        const groundGeometry = new THREE.PlaneGeometry(100, this.roadLength);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x335533,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.1, this.roadLength / 2);
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Create road
        const roadGeometry = new THREE.PlaneGeometry(this.roadWidth, this.roadLength);
        const roadMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            side: THREE.DoubleSide
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0, this.roadLength / 2);
        road.receiveShadow = true;
        this.scene.add(road);
        
        // Add road markings
        this.createRoadMarkings();
        
        // Add buildings and landmarks
        this.createBuildings();
        this.createLandmarks();
        
        // Add finish line
        this.createFinishLine();
        
        // Add sky
        this.createSky();
    }
    
    createRoadMarkings() {
        // Create center line
        const lineGeometry = new THREE.PlaneGeometry(0.2, this.roadLength);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.set(0, 0.01, this.roadLength / 2);
        this.scene.add(centerLine);
        
        // Create dashed lines on sides
        const dashCount = Math.floor(this.roadLength / 5);
        const dashLength = 3;
        const dashGap = 2;
        
        for (let i = 0; i < dashCount; i++) {
            const z = i * (dashLength + dashGap);
            
            if (z < this.roadLength) {
                // Left lane marking
                const leftDashGeometry = new THREE.PlaneGeometry(0.2, dashLength);
                const leftDash = new THREE.Mesh(leftDashGeometry, lineMaterial);
                leftDash.rotation.x = -Math.PI / 2;
                leftDash.position.set(-this.roadWidth / 4, 0.01, z + dashLength / 2);
                this.scene.add(leftDash);
                
                // Right lane marking
                const rightDashGeometry = new THREE.PlaneGeometry(0.2, dashLength);
                const rightDash = new THREE.Mesh(rightDashGeometry, lineMaterial);
                rightDash.rotation.x = -Math.PI / 2;
                rightDash.position.set(this.roadWidth / 4, 0.01, z + dashLength / 2);
                this.scene.add(rightDash);
            }
        }
    }
    
    createBuildings() {
        // Create random buildings along the road
        const buildingCount = 50;
        const buildingColors = [0x8899aa, 0xaabbcc, 0x99aacc, 0xbbccdd];
        
        for (let i = 0; i < buildingCount; i++) {
            const side = Math.random() > 0.5 ? 1 : -1;
            const offset = (this.roadWidth / 2 + 5 + Math.random() * 10) * side;
            const z = Math.random() * this.roadLength;
            
            const height = 3 + Math.random() * 10;
            const width = 3 + Math.random() * 8;
            const depth = 3 + Math.random() * 8;
            
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshPhongMaterial({ 
                color: buildingColors[Math.floor(Math.random() * buildingColors.length)]
            });
            
            const building = new THREE.Mesh(geometry, material);
            building.position.set(offset, height / 2, z);
            building.castShadow = true;
            building.receiveShadow = true;
            
            this.buildings.push(building);
            this.scene.add(building);
        }
    }
    
    createLandmarks() {
        // Create Buenos Aires landmarks
        for (const landmark of this.landmarkPositions) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0xffaa88 
            });
            
            const model = new THREE.Mesh(geometry, material);
            model.scale.copy(landmark.scale);
            model.position.copy(landmark.position);
            model.position.y += landmark.scale.y / 2; // Adjust to ground level
            model.castShadow = true;
            model.receiveShadow = true;
            
            // Add a name plate
            const textGeometry = new THREE.PlaneGeometry(landmark.name.length * 0.6, 1);
            const textMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF,
                side: THREE.DoubleSide
            });
            const nameplate = new THREE.Mesh(textGeometry, textMaterial);
            nameplate.position.set(0, landmark.scale.y + 2, 0);
            nameplate.rotation.y = Math.PI / 4;
            model.add(nameplate);
            
            this.landmarks.push(model);
            this.scene.add(model);
        }
    }
    
    createFinishLine() {
        // Create a finish line at the end of the track
        const finishLineGeometry = new THREE.PlaneGeometry(this.roadWidth, 2);
        const finishLineMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        });
        const finishLine = new THREE.Mesh(finishLineGeometry, finishLineMaterial);
        finishLine.rotation.x = -Math.PI / 2;
        finishLine.position.set(0, 0.02, this.roadLength - 10); // Near the end
        this.scene.add(finishLine);
        
        // Add checkered pattern
        const checkerSize = 1;
        const checkerRows = Math.ceil(this.roadWidth / checkerSize);
        
        for (let i = 0; i < checkerRows; i++) {
            if (i % 2 === 0) continue; // Skip every other row for checkered effect
            
            const blackSegmentGeometry = new THREE.PlaneGeometry(checkerSize, 2);
            const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const blackSegment = new THREE.Mesh(blackSegmentGeometry, blackMaterial);
            blackSegment.rotation.x = -Math.PI / 2;
            
            const xPos = -this.roadWidth / 2 + checkerSize / 2 + i * checkerSize;
            blackSegment.position.set(xPos, 0.03, this.roadLength - 10);
            
            this.scene.add(blackSegment);
        }
    }
    
    createSky() {
        // Simple hemisphere light to simulate sky lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x555555, 0.6);
        this.scene.add(hemisphereLight);
    }
    
    update(delta) {
        // Any animations or updates for the track can go here
        // For example, we could add moving clouds, traffic, etc.
    }
}
