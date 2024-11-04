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
let highScore = localStorage.getItem('highScore') || 0;
let obstacles = [];
let obstacleInterval;
let animationFrameId;
let isDescending = false;
let gameSpeed = 5;
let obstacleSpawnRate = 2000;

// Update high score display
highScoreElement.textContent = highScore;

// Difficulty scaling
const SPEED_INCREASE_RATE = 0.2;
const MAX_GAME_SPEED = 12;
const MIN_SPAWN_RATE = 1000;
const SPAWN_RATE_DECREASE = 50;

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

function updateGameDifficulty() {
    // Increase game speed based on score
    gameSpeed = Math.min(MAX_GAME_SPEED, 5 + (score * SPEED_INCREASE_RATE));
    
    // Decrease spawn rate based on score
    const newSpawnRate = Math.max(MIN_SPAWN_RATE, 2000 - (score * SPAWN_RATE_DECREASE));
    
    // Only update interval if spawn rate has changed significantly
    if (Math.abs(newSpawnRate - obstacleSpawnRate) > 100) {
        obstacleSpawnRate = newSpawnRate;
        clearInterval(obstacleInterval);
        obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);
    }
}

function updatePlayerPosition() {
    if (isJumping) {
        if (currentJumpHeight < jumpHeight && !isDescending) {
            currentJumpHeight += jumpSpeed;
            if (currentJumpHeight >= jumpHeight) {
                isDescending = true;
            }
        } else {
            isDescending = true;
            currentJumpHeight = Math.max(0, currentJumpHeight - gravity);
        }

        if (currentJumpHeight <= 0) {
            currentJumpHeight = 0;
            isJumping = false;
            isDescending = false;
            cancelAnimationFrame(animationFrameId);
            return;
        }

        player.style.transform = `translateY(-${currentJumpHeight}px)`;
    }

    if (gameRunning) {
        animationFrameId = requestAnimationFrame(updatePlayerPosition);
    }
}

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

function getRandomObstacleProperties() {
    // Random height between 30 and 60 pixels
    const height = Math.floor(Math.random() * 31) + 30;
    // Random width between 15 and 30 pixels
    const width = Math.floor(Math.random() * 16) + 15;
    // Random distance from previous obstacle (300-600 pixels)
    const distance = Math.floor(Math.random() * 301) + 300;
    
    return { height, width, distance };
}

function isPointInTriangle(point, p1, p2, p3) {
    const area = getTriangleArea(p1, p2, p3);
    const area1 = getTriangleArea(point, p2, p3);
    const area2 = getTriangleArea(p1, point, p3);
    const area3 = getTriangleArea(p1, p2, point);

    // Point is inside if the sum of the three areas equals the total area
    return Math.abs(area - (area1 + area2 + area3)) < 0.1;
}

function getTriangleArea(p1, p2, p3) {
    return Math.abs(
        (p1.x * (p2.y - p3.y) + 
         p2.x * (p3.y - p1.y) + 
         p3.x * (p1.y - p2.y)) / 2
    );
}

function createObstacle() {
    if (!gameRunning) return;
    
    const { height, width, distance } = getRandomObstacleProperties();
    
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.setProperty('--height', `${height}px`);
    obstacle.style.setProperty('--width', `${width}px`);
    gameContainer.appendChild(obstacle);
    obstacles.push(obstacle);

    let position = 800 + distance;
    let obstacleAnimationId;
    
    function moveObstacle() {
        if (position > -width) {
            position -= gameSpeed;
            obstacle.style.right = `${800 - position}px`;

            const playerRect = player.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();

            // Get the center points of player and obstacle
            const playerCenter = {
                x: (playerRect.left + playerRect.right) / 2,
                y: (playerRect.top + playerRect.bottom) / 2
            };

            const trianglePoints = {
                bottom1: { x: obstacleRect.left, y: obstacleRect.bottom },
                bottom2: { x: obstacleRect.right, y: obstacleRect.bottom },
                top: { x: (obstacleRect.left + obstacleRect.right) / 2, y: obstacleRect.top }
            };

            // First check if we're even in the rectangular bounds
            if (playerRect.right > obstacleRect.left && 
                playerRect.left < obstacleRect.right && 
                playerRect.bottom > obstacleRect.top && 
                playerRect.top < obstacleRect.bottom) {
                
                // Get all corners of the player
                const playerPoints = [
                    { x: playerRect.left, y: playerRect.top },     // Top-left
                    { x: playerRect.right, y: playerRect.top },    // Top-right
                    { x: playerRect.right, y: playerRect.bottom }, // Bottom-right
                    { x: playerRect.left, y: playerRect.bottom }   // Bottom-left
                ];

                // Check if any corner of the player is inside the triangle
                for (const point of playerPoints) {
                    if (isPointInTriangle(
                        point,
                        trianglePoints.bottom1,
                        trianglePoints.bottom2,
                        trianglePoints.top
                    )) {
                        gameOver();
                        cancelAnimationFrame(obstacleAnimationId);
                        return;
                    }
                }
            }

        } else {
            obstacle.remove();
            obstacles = obstacles.filter(obs => obs !== obstacle);
            score++;
            scoreElement.textContent = score;
            updateGameDifficulty();
            cancelAnimationFrame(obstacleAnimationId);
            return;
        }

        if (gameRunning) {
            obstacleAnimationId = requestAnimationFrame(moveObstacle);
        }
    }

    moveObstacle();
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

function resetGame() {
    gameRunning = true;
    score = 0;
    currentJumpHeight = 0;
    isJumping = false;
    isDescending = false;
    gameSpeed = 5;
    obstacleSpawnRate = 2000;
    player.style.transform = 'translateY(0)';
    scoreElement.textContent = score;
    gameOverScreen.style.display = 'none';
    
    // Clear existing obstacles
    obstacles.forEach(obstacle => obstacle.remove());
    obstacles = [];
    
    // Restart obstacle generation
    clearInterval(obstacleInterval);
    obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (gameRunning) {
            jump();
        } else {
            resetGame();
        }
        event.preventDefault();
    }
});

// Start the game
obstacleInterval = setInterval(createObstacle, obstacleSpawnRate);
