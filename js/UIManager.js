export class UIManager {
    constructor(playerCar, aiCars, track) {
        this.playerCar = playerCar;
        this.aiCars = aiCars;
        this.track = track;
        
        // DOM elements
        this.positionElement = document.getElementById('position');
        this.speedElement = document.getElementById('speed');
    }
    
    update() {
        // Update position display
        const position = this.getPlayerPosition();
        this.positionElement.textContent = this.formatPosition(position);
        
        // Update speed display
        const speed = Math.floor(this.playerCar.speed);
        this.speedElement.textContent = speed;
    }
    
    getPlayerPosition() {
        // Get all car distances
        const allCars = [this.playerCar, ...this.aiCars];
        
        // Sort by distance (descending)
        const sortedCars = [...allCars].sort((a, b) => b.getDistance() - a.getDistance());
        
        // Find player's position
        return sortedCars.findIndex(car => car === this.playerCar) + 1;
    }
    
    formatPosition(position) {
        switch(position) {
            case 1: return '1°';
            case 2: return '2°';
            case 3: return '3°';
            case 4: return '4°';
            default: return `${position}°`;
        }
    }
    
    reset() {
        // Reset UI elements
        this.positionElement.textContent = '1°';
        this.speedElement.textContent = '0';
    }
}
