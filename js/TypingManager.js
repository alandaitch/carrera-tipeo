export class TypingManager {
    constructor(playerCar) {
        this.playerCar = playerCar;
        
        // DOM elements
        this.jokeDisplay = document.getElementById('joke-display');
        this.typedText = document.getElementById('typed-text');
        this.currentChar = document.getElementById('current-char');
        this.remainingText = document.getElementById('remaining-text');
        
        // Log DOM element status for debugging
        console.log('TypingManager DOM elements initialized:', {
            jokeDisplay: !!this.jokeDisplay,
            typedText: !!this.typedText,
            currentChar: !!this.currentChar,
            remainingText: !!this.remainingText
        });
        
        // Typing state
        this.activeText = '';
        this.typedTextValue = '';
        this.currentPosition = 0;
        this.correctStreak = 0;
        
        // Game parameters - reducidos para un juego más equilibrado
        this.accelerationPerCorrectKey = 2.5; // km/h por tecla correcta (reducido de 5 a 2.5)
        this.bonusThreshold = 3; // Teclas correctas seguidas para bonus
        this.bonusMultiplier = 2; // Multiplicador para bonus (reducido de 2.5 a 2)
        
        // Display options
        this.visibleCharsTyped = 15;  // Cuántos caracteres ya escritos mostrar
        this.visibleCharsAhead = 25;  // Cuántos caracteres por delante mostrar
        
        // Argentine joke collection
        this.jokes = [
            "¿Cómo se llama el campeón de buceo argentino? Arturo Mido.",
            "¿Por qué los argentinos no pueden usar auriculares? Porque ya vienen con altavoz incluido.",
            "¿Cómo le dicen a un argentino con medio cerebro? Superdotado.",
            "¿Qué le dice un árbol a otro? ¡Qué pasa loco, tanto tiempo!",
            "¿Por qué los argentinos comen milanesa en los casamientos? Porque siempre hay que esperar al que se empana.",
            "¿Por qué los argentinos no juegan al escondite? Porque nadie los busca.",
            "¿Sabés cómo evitar que un argentino se ahogue? Fácil, solo dejá de aplaudirle.",
            "¿Qué es una obra de teatro argentina sin actores? Una mejora.",
            "¿Cómo se dice 'ya volví' en argentino? Soy yo, boludo, abrime.",
            "¿Cómo le dicen a Batman en Argentina? El Boludo de la Capa.",
            "¿Cómo se reconoce a un argentino en el Paraíso? Es el único que quiere irse porque no conoce a nadie.",
            "¿Por qué no hay hipermercados en Argentina? Porque se les queman los súper.",
            "Si un argentino y un mexicano se tiran de un avión, ¿quién llega primero al suelo? El mexicano, porque el argentino se para en cada nube a preguntar si ya llegó a Europa.",
            "Buenos Aires es tan húmeda que los peces salen del río a secarse.",
            "¿Qué hace un argentino cuando su equipo ganó el Mundial? Apaga la PlayStation.",
            "Si un argentino dice que va a llegar en 5 minutos, ¿Cuánto tiempo hay que esperar? Hasta que te canses.",
            "Los argentinos no mueren, desencarnan. Porque carne es lo que nunca les falta.",
            "¿Cómo se suicida un argentino? ¡Subiéndose a su ego y tirándose a su coeficiente intelectual!",
            "Si un argentino te dice 'haceme la segunda', no te está pidiendo que lo imites, sino que lo ayudes.",
            "¿Sabés por qué los argentinos tienen las narices grandes? Porque el aire es gratis."
        ];
        
        // Inicialización inmediata del primer chiste (no espera a start)
        this.selectNewJoke();
    }
    
    start() {
        console.log("TypingManager.start() llamado");
        
        // Aseguramos que haya un chiste visible al inicio
        if (!this.activeText) {
            console.log("No hay chiste activo, seleccionando uno nuevo");
            this.selectNewJoke();
        }
        
        // Hacemos visibles los elementos de la UI
        if (this.jokeDisplay) {
            this.jokeDisplay.style.display = 'block';
            console.log("jokeDisplay visible:", this.jokeDisplay.textContent);
        } else {
            console.error("jokeDisplay es null o undefined");
        }
        
        if (this.typedText && this.typedText.parentElement) {
            this.typedText.parentElement.style.display = 'block';
            console.log("typedText container visible");
        } else {
            console.error("typedText o su padre es null o undefined");
        }
    }
    
    selectNewJoke() {
        console.log("Seleccionando nuevo chiste...");
        
        // Verificar que los elementos del DOM estén disponibles
        if (!this.jokeDisplay || !this.typedText || !this.currentChar || !this.remainingText) {
            console.error("Elementos del DOM necesarios no encontrados en TypingManager.selectNewJoke()");
            return;
        }
        
        // Select a random joke
        const randomIndex = Math.floor(Math.random() * this.jokes.length);
        const joke = this.jokes[randomIndex];
        console.log("Chiste seleccionado:", joke);
        
        // Display joke title
        this.jokeDisplay.textContent = "Tipea para acelerar:";
        
        // Initialize typing state
        this.activeText = joke;
        this.typedTextValue = '';
        this.currentPosition = 0;
        
        // Update display
        this.updateDisplay();
    }
    
    updateDisplay() {
        // Verificar que los elementos del DOM estén disponibles
        if (!this.jokeDisplay || !this.typedText || !this.currentChar || !this.remainingText) {
            console.error("Elementos del DOM necesarios no encontrados en TypingManager.updateDisplay()");
            return;
        }
        
        // Creamos una ventana deslizante que muestre:
        // 1. Los últimos X caracteres ya escritos (los más recientes)
        // 2. El carácter actual que debe escribirse
        // 3. Los próximos Y caracteres por escribir
        
        // Determinamos la parte ya escrita a mostrar (los últimos X caracteres)
        const startTyped = Math.max(0, this.currentPosition - this.visibleCharsTyped);
        const visibleTyped = this.typedTextValue.substring(startTyped);
        
        // El carácter actual a escribir
        const currentChar = this.activeText.charAt(this.currentPosition) || ' ';
        
        // Los próximos caracteres a escribir
        const remainingText = this.activeText.substring(
            this.currentPosition + 1, 
            this.currentPosition + 1 + this.visibleCharsAhead
        );
        
        // Opcional: añadir "..." si hay más texto que no se está mostrando
        const prefix = startTyped > 0 ? '...' : '';
        const suffix = this.currentPosition + 1 + this.visibleCharsAhead < this.activeText.length ? '...' : '';
        
        // Actualizar el DOM
        this.typedText.textContent = prefix + visibleTyped;
        this.currentChar.textContent = currentChar;
        this.remainingText.textContent = remainingText + suffix;
        
        // Verificación de visibilidad
        if (this.jokeDisplay.style.display === 'none') {
            console.log("jokeDisplay está oculto, haciéndolo visible");
            this.jokeDisplay.style.display = 'block';
        }
        
        if (this.typedText.parentElement && this.typedText.parentElement.style.display === 'none') {
            console.log("Container de texto está oculto, haciéndolo visible");
            this.typedText.parentElement.style.display = 'block';
        }
        
        // Actualizar el título con el progreso
        const percentComplete = Math.floor((this.currentPosition / this.activeText.length) * 100);
        this.jokeDisplay.textContent = `Tipea para acelerar: ${percentComplete}% completado`;
    }
    
    // Normaliza el texto para comparación (quita acentos y convierte a minúsculas)
    normalizeChar(char) {
        // Reemplazar caracteres acentuados
        const normalized = char
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
        
        // Reemplazar caracteres especiales
        if (char === '¿') return '?';
        if (char === '¡') return '!';
        
        return normalized;
    }
    
    handleKeyPress(key) {
        console.log("Tecla presionada:", key);
        
        // Check if there's still text to type
        if (this.currentPosition >= this.activeText.length) {
            // If joke is complete, select a new one
            console.log("Chiste completado, seleccionando uno nuevo");
            this.selectNewJoke();
            return;
        }
        
        // Get the expected character and normalize it
        const expectedChar = this.activeText.charAt(this.currentPosition);
        const normalizedExpected = this.normalizeChar(expectedChar);
        const normalizedInput = this.normalizeChar(key);
        
        console.log(`Comparando: expectativa normalizada '${normalizedExpected}' vs entrada normalizada '${normalizedInput}'`);
        
        // Check if the normalized key pressed matches the normalized expected character
        if (normalizedInput === normalizedExpected) {
            // Correct key
            this.typedTextValue += expectedChar; // Add the original character to maintain formatting
            this.currentPosition++;
            this.correctStreak++;
            
            // Apply acceleration to the player's car
            let acceleration = this.accelerationPerCorrectKey;
            
            // Apply bonus for streak
            if (this.correctStreak >= this.bonusThreshold) {
                acceleration *= this.bonusMultiplier;
                console.log(`¡Bonus de velocidad! (streak: ${this.correctStreak}, aceleración: ${acceleration})`);
            }
            
            console.log(`Aplicando aceleración de ${acceleration} km/h`);
            this.playerCar.accelerate(acceleration);
            
            // Check if joke is complete
            if (this.currentPosition >= this.activeText.length) {
                // Short delay before loading a new joke
                console.log("Chiste completado, cargando nuevo en 1 segundo");
                setTimeout(() => this.selectNewJoke(), 1000);
            }
        } else {
            // Incorrect key - reset streak
            console.log(`Tecla incorrecta. Esperaba '${expectedChar}' (normalizado: '${normalizedExpected}'), recibió '${key}' (normalizado: '${normalizedInput}')`);
            this.correctStreak = 0;
        }
        
        // Update display
        this.updateDisplay();
    }
    
    reset() {
        console.log("Reseteando TypingManager");
        this.typedTextValue = '';
        this.currentPosition = 0;
        this.correctStreak = 0;
        
        // Clear display
        if (this.typedText) this.typedText.textContent = '';
        if (this.currentChar) this.currentChar.textContent = '';
        if (this.remainingText) this.remainingText.textContent = '';
        
        // Load a new joke
        this.selectNewJoke();
    }
}
