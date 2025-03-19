export class GameManager {
    constructor() {
        this.playerCar = null;
        this.aiCars = [];
        this.track = null;
        this.typingManager = null;
        this.uiManager = null;
        this.soundManager = null;
        
        this.raceDistance = 1000; // meters
        this.raceFinished = false;
        this.playerPosition = 0;
    }
    
    init(playerCar, aiCars, track, typingManager, uiManager, soundManager) {
        this.playerCar = playerCar;
        this.aiCars = aiCars;
        this.track = track;
        this.typingManager = typingManager;
        this.uiManager = uiManager;
        this.soundManager = soundManager;
    }
    
    update(delta) {
        if (this.raceFinished) return;
        
        // Check if player has finished the race
        if (this.playerCar.getDistance() >= this.raceDistance) {
            this.raceFinished = true;
            this.calculateFinalPositions();
            return;
        }
        
        // Check if all AI cars have finished
        const allAiFinished = this.aiCars.every(ai => ai.getDistance() >= this.raceDistance);
        if (allAiFinished) {
            this.raceFinished = true;
            this.calculateFinalPositions();
            return;
        }
        
        // Update current player position in race
        this.updatePositions();
    }
    
    updatePositions() {
        // Combine player and AI cars into one array
        const allCars = [this.playerCar, ...this.aiCars];
        
        // Sort by distance (descending)
        allCars.sort((a, b) => b.getDistance() - a.getDistance());
        
        // Find player position
        this.playerPosition = allCars.findIndex(car => car === this.playerCar) + 1;
        
        // Update car positions (for AI behavior)
        allCars.forEach((car, index) => {
            car.setPosition(index + 1);
        });
    }
    
    calculateFinalPositions() {
        // Final sort of all cars by distance
        const allCars = [this.playerCar, ...this.aiCars];
        allCars.sort((a, b) => b.getDistance() - a.getDistance());
        
        // Find player's final position
        this.playerPosition = allCars.findIndex(car => car === this.playerCar) + 1;
    }
    
    isRaceFinished() {
        return this.raceFinished;
    }
    
    getPlayerPosition() {
        return this.playerPosition;
    }
    
    reset() {
        this.raceFinished = false;
        this.playerPosition = 0;
        
        // Reset cars
        this.playerCar.reset();
        this.aiCars.forEach(ai => ai.reset());
        
        // Reset managers
        this.typingManager.reset();
        this.uiManager.reset();
    }
}
