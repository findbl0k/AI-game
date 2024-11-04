const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.querySelector('.game-over');

// Game state
let isJumping = false;
let jumpHeight = 150;
let currentJumpHeight = 0;
let jumpSpeed = 7;
let gravity = 4;
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0; // Load high score from localStorage
let obstacles = [];
let obstacleInterval;
let animationFrameId;
let isDescending = false;
let gameSpeed = 5;
let obstacleSpawnRate = 2000;

// Update high score display
highScoreElement.textContent = highScore;

function getRandomColor() {
    const colors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Turquoise
        '#45B7D1', // Light Blue
        '#96CEB4', // Mint
        '#FFEEAD', // Light Yellow
        '#D4A5A5', // Pink
        '#9B59B6', // Purple
        '#3498DB', // Blue
        '#E67E22', // Orange
        '#2ECC71'  // Green
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Rest of the difficulty scaling constants remain the same...

function jump() {
    if (!isJumping && gameRunning) {
        isJumping = true;
        isDescending = false;
        currentJumpHeight = 0;
        cancelAnimationFrame(animationFrameId);
        updatePlayerPosition();
        // Change player color on jump
        player.style.backgroundColor = getRandomColor();
    }
}

function checkHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = 'block';
    clearInterval(obstacleInterval);
    cancelAnimationFrame(animationFrameId);
    checkHighScore();
}

// Rest of the game logic remains the same...

// The createObstacle function needs to be modified to create triangle shapes
function createObstacle() {
    if (!gameRunning) return;
    
    const { height, width, distance } = getRandomObstacleProperties();
    
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    
    // Create the triangle shape using a pseudo-element defined in CSS
    obstacle.style.height = `${height}px`;
    obstacle.style.width = `${width}px`;
    
    gameContainer.appendChild(obstacle);
    obstacles.push(obstacle);

    let position = 800 + distance;
    let obstacleAnimationId;
    
    // Rest of the obstacle movement logic remains the same...
    
    moveObstacle();
}
