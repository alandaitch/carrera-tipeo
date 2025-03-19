import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GameManager } from './GameManager.js';
import { CarController } from './CarController.js';
import { AI } from './AI.js';
import { Track } from './Track.js';
import { SoundManager } from './SoundManager.js';
import { TypingManager } from './TypingManager.js';
import { UIManager } from './UIManager.js';

// Game state
let gameManager;
let scene, camera, renderer;
let track;
let playerCar, aiCars = [];
let typingManager;
let uiManager;
let soundManager;
let isGameStarted = false;
let assetsLoaded = false;

// DOM elements
const loadingScreen = document.getElementById('loading-screen');
const startScreen = document.getElementById('start-screen');
const gameUI = document.getElementById('game-ui');
const endScreen = document.getElementById('end-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const typingContainer = document.getElementById('typing-container');
const jokeDisplay = document.getElementById('joke-display');

// Make sure typing interface is initially hidden
if (typingContainer) typingContainer.style.display = 'none';
if (jokeDisplay) jokeDisplay.style.display = 'none';
if (gameUI) gameUI.style.display = 'none';

// Three.js setup
function initThree() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 100, 1000);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, -10);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('game-container').prepend(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize game components
async function initGame() {
    console.log("Iniciando carga del juego...");
    
    // Game manager
    gameManager = new GameManager();
    
    // Sound manager
    soundManager = new SoundManager();
    await soundManager.load();
    
    // Track
    track = new Track(scene);
    await track.load();
    
    // Player car
    playerCar = new CarController(scene, camera, soundManager);
    await playerCar.load();
    playerCar.setPosition(0, 0.5, 0);
    
    // AI cars
    const aiCount = 3;
    for (let i = 0; i < aiCount; i++) {
        const aiCar = new AI(scene, soundManager, `AI ${i+1}`);
        await aiCar.load();
        aiCar.setPosition(i-1, 0.5, -5);
        aiCars.push(aiCar);
    }
    
    // Typing manager (inicializar después de que PlayerCar está creado)
    typingManager = new TypingManager(playerCar);
    console.log("TypingManager inicializado");
    
    // UI manager
    uiManager = new UIManager(playerCar, aiCars, track);
    
    // Init game state
    gameManager.init(playerCar, aiCars, track, typingManager, uiManager, soundManager);
    
    // Prepare DOM for game start
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
        console.log("Pantalla de carga oculta");
    }
    
    if (startScreen) {
        startScreen.style.display = 'flex';
        console.log("Pantalla de inicio visible");
    }
    
    // Set assets as loaded
    assetsLoaded = true;
    console.log("Todos los assets cargados");
    
    // Start rendering loop to show static scene
    renderLoop();
}

// Setup keyboard handlers for typing
function setupKeyboardHandlers() {
    console.log("Configurando handlers de teclado");
    
    window.addEventListener('keypress', (event) => {
        if (isGameStarted && typingManager) {
            // Handle alphanumeric keys for typing
            const key = event.key;
            console.log("Keypress detectado:", key);
            typingManager.handleKeyPress(key);
        }
    });
}

// Start game
function startGame() {
    console.log("Iniciando juego...");
    
    // Initialize audio context now that user has interacted
    if (!soundManager.initialized) {
        soundManager.initialize();
        console.log("SoundManager inicializado");
        if (soundManager.engineSound) {
            soundManager.engineSound.start();
            console.log("Sonido de motor iniciado");
        }
    }
    
    // Ocultar pantalla de inicio
    if (startScreen) {
        startScreen.style.display = 'none';
        console.log("Pantalla de inicio oculta");
    }
    
    // Mostrar UI del juego
    if (gameUI) {
        gameUI.style.display = 'block';
        console.log("UI del juego visible");
    }
    
    // Mostrar contenedor de tipeo
    if (typingContainer) {
        typingContainer.style.display = 'block';
        console.log("Contenedor de tipeo visible");
    }
    
    // Mostrar chiste
    if (jokeDisplay) {
        jokeDisplay.style.display = 'block';
        console.log("Display de chiste visible");
    }
    
    // Setup keyboard handlers if not already setup
    setupKeyboardHandlers();
    
    // Start typing challenges
    if (typingManager) {
        typingManager.start();
        console.log("TypingManager iniciado");
    } else {
        console.error("typingManager no está inicializado");
    }
    
    // Start AI cars
    aiCars.forEach(ai => ai.start());
    
    // Play background music
    soundManager.playBackgroundMusic();
    
    isGameStarted = true;
    console.log("Juego iniciado correctamente");
}

// Game loop
function gameLoop() {
    if (!isGameStarted) return;
    
    // Update game elements
    const delta = 0.016; // Approx 60fps
    
    playerCar.update(delta);
    aiCars.forEach(ai => ai.update(delta));
    
    track.update(delta);
    gameManager.update(delta);
    uiManager.update();
    
    // Check for race end
    if (gameManager.isRaceFinished()) {
        endGame();
    }
}

// Rendering loop (separate from game logic)
function renderLoop() {
    // Render scene
    renderer.render(scene, camera);
    
    // Update game state if game is started
    if (isGameStarted) {
        gameLoop();
    }
    
    // Continue rendering loop
    requestAnimationFrame(renderLoop);
}

// End game
function endGame() {
    isGameStarted = false;
    
    // Display end screen
    document.getElementById('final-position').textContent = 
        `¡Terminaste en ${gameManager.getPlayerPosition()}° lugar!`;
    endScreen.classList.remove('hidden');
    
    // Play appropriate sound
    if (gameManager.getPlayerPosition() === 1) {
        soundManager.playWinSound();
    } else {
        soundManager.playLoseSound();
    }
}

// Initialize the game when window loads
window.addEventListener('load', () => {
    console.log("Ventana cargada, inicializando juego");
    initThree();
    initGame();
    
    // Event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', () => {
        endScreen.classList.add('hidden');
        resetGame();
        startGame();
    });
    
    // Handle keyboard events
    document.addEventListener('keydown', (event) => {
        // Handle restart with Enter key when game is over
        if (event.key === 'Enter' && !isGameStarted && assetsLoaded) {
            if (endScreen.classList.contains('hidden')) {
                startGame();
            } else {
                endScreen.classList.add('hidden');
                resetGame();
                startGame();
            }
        }
    });
});

// Reset game for replay
function resetGame() {
    playerCar.reset();
    aiCars.forEach(ai => ai.reset());
    typingManager.reset();
    uiManager.reset();
    gameManager.reset();
    
    // Reset camera
    camera.position.set(0, 5, -10);
    camera.lookAt(0, 0, 0);
}
