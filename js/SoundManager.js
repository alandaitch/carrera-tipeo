export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.sounds = {
            acceleration: null,
            win: null,
            lose: null,
            backgroundMusic: null,
            engine: null
        };
        this.engineSound = null;
    }
    
    async load() {
        // No hacemos nada aquí, esperamos a que el usuario interactúe
        console.log("SoundManager preparado, esperando interacción del usuario...");
    }
    
    initialize() {
        if (this.initialized) return;
        
        // Initialize AudioContext
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create engine sound (synthesized)
            this.engineSound = {
                audioContext: this.audioContext,
                oscillator: null, 
                gainNode: null,
                isPlaying: false,
                
                start: function() {
                    if (!this.isPlaying) {
                        this.oscillator = this.audioContext.createOscillator();
                        this.oscillator.type = 'sawtooth';
                        this.oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
                        
                        this.gainNode = this.audioContext.createGain();
                        // Start with very low volume
                        this.gainNode.gain.setValueAtTime(0.01, this.audioContext.currentTime);
                        
                        this.oscillator.connect(this.gainNode);
                        this.gainNode.connect(this.audioContext.destination);
                        
                        this.oscillator.start();
                        this.isPlaying = true;
                    }
                },
                
                stop: function() {
                    if (this.isPlaying) {
                        this.oscillator.stop();
                        this.isPlaying = false;
                    }
                },
                
                setPitch: function(pitch) {
                    if (this.isPlaying && this.oscillator) {
                        this.oscillator.frequency.setValueAtTime(
                            80 * pitch, 
                            this.audioContext.currentTime
                        );
                    }
                },
                
                setVolume: function(volume) {
                    if (this.isPlaying && this.gainNode) {
                        this.gainNode.gain.setValueAtTime(
                            Math.min(0.05, volume * 0.05), // Reduced maximum volume
                            this.audioContext.currentTime
                        );
                    }
                }
            };
            
            this.initialized = true;
            console.log("SoundManager inicializado correctamente");
        } catch (e) {
            console.error('Web Audio API is not supported in this browser:', e);
        }
    }
    
    playAccelSound() {
        if (!this.initialized || !this.audioContext) return;
        
        // Play a key press/acceleration sound
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            300, 
            this.audioContext.currentTime + 0.2
        );
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime); // Reduced volume
        gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            this.audioContext.currentTime + 0.2
        );
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    playWinSound() {
        if (!this.initialized || !this.audioContext) return;
        
        // Victory sequence
        const duration = 0.1;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * duration); // Reduced volume
            gainNode.gain.exponentialRampToValueAtTime(
                0.001, 
                this.audioContext.currentTime + (index + 1) * duration
            );
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime + index * duration);
            oscillator.stop(this.audioContext.currentTime + (index + 1) * duration);
        });
    }
    
    playLoseSound() {
        if (!this.initialized || !this.audioContext) return;
        
        // Losing sound
        const duration = 0.3;
        const notes = [523.25, 493.88, 440, 392]; // C5, B4, A4, G4
        
        notes.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            oscillator.type = 'square';
            oscillator.frequency.value = freq;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + index * duration); // Reduced volume
            gainNode.gain.exponentialRampToValueAtTime(
                0.001, 
                this.audioContext.currentTime + (index + 1) * duration
            );
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start(this.audioContext.currentTime + index * duration);
            oscillator.stop(this.audioContext.currentTime + (index + 1) * duration);
        });
    }
    
    playBackgroundMusic() {
        if (!this.initialized || !this.audioContext) return;
        
        // Simple background rhythm using oscillators - with much lower volume
        const playBeat = () => {
            const now = this.audioContext.currentTime;
            
            // Bass
            for (let i = 0; i < 8; i++) {
                const bass = this.audioContext.createOscillator();
                bass.type = 'triangle';
                bass.frequency.value = i % 2 === 0 ? 80 : 100;
                
                const bassGain = this.audioContext.createGain();
                bassGain.gain.setValueAtTime(0.05, now + i * 0.5); // Reduced volume
                bassGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.5 + 0.4);
                
                bass.connect(bassGain);
                bassGain.connect(this.audioContext.destination);
                
                bass.start(now + i * 0.5);
                bass.stop(now + i * 0.5 + 0.4);
            }
            
            // Simple melody
            const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00];
            for (let i = 0; i < 4; i++) {
                const melody = this.audioContext.createOscillator();
                melody.type = 'sine';
                
                // Select a random note from our scale
                const noteIndex = Math.floor(Math.random() * notes.length);
                melody.frequency.value = notes[noteIndex];
                
                const melodyGain = this.audioContext.createGain();
                melodyGain.gain.setValueAtTime(0.03, now + i * 1); // Reduced volume
                melodyGain.gain.exponentialRampToValueAtTime(0.001, now + i * 1 + 0.8);
                
                melody.connect(melodyGain);
                melodyGain.connect(this.audioContext.destination);
                
                melody.start(now + i * 1);
                melody.stop(now + i * 1 + 0.8);
            }
            
            // Schedule the next beat
            setTimeout(playBeat, 4000);
        };
        
        // Start the background music loop
        playBeat();
    }
    
    getEngineSound() {
        return this.engineSound;
    }
    
    // Clean up audio resources
    cleanup() {
        if (this.engineSound && this.engineSound.isPlaying) {
            this.engineSound.stop();
        }
    }
}
