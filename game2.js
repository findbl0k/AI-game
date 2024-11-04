const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.querySelector('.game-over');

// Game state
let isJumping = false;
let jumpHeight = 150; // Increased jump height
let currentJumpHeight = 0;
let jumpSpeed = 7; // Increased initial jump speed
let gravity = 4; // Reduced gravity for smoother descent
let gameRunning = true;
let score = 0;
let obstacles = [];
let obstacleInterval;
let animationFrameId;
let isDescending = false;

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
            cancelAnimationFrame(animationFrameId); // Stop the animation when landing
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
        currentJumpHeight = 0; // Reset height at the start of each jump
        cancelAnimationFrame(animationFrameId); // Cancel any existing animation
        updatePlayerPosition();
    }
}

function createObstacle() {
    if (!gameRunning) return;
    
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);
    obstacles.push(obstacle);

    let position = 800;
    let obstacleAnimationId;
    
    function moveObstacle() {
        if (position > -20) {
            position -= 5;
            obstacle.style.right = `${800 - position}px`;

            const playerRect = player.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();

            if (!(playerRect.right < obstacleRect.left || 
                playerRect.left > obstacleRect.right || 
                playerRect.bottom < obstacleRect.top || 
                playerRect.top > obstacleRect.bottom)) {
                gameOver();
                cancelAnimationFrame(obstacleAnimationId);
                return;
            }

        } else {
            obstacle.remove();
            obstacles = obstacles.filter(obs => obs !== obstacle);
            score++;
            scoreElement.textContent = score;
            cancelAnimationFrame(obstacleAnimationId);
            return;
        }

        if (gameRunning) {
            obstacleAnimationId = requestAnimationFrame(moveObstacle);
        }
    }

    moveObstacle();
}

function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = 'block';
    clearInterval(obstacleInterval);
    cancelAnimationFrame(animationFrameId);
}

function resetGame() {
    gameRunning = true;
    score = 0;
    currentJumpHeight = 0;
    isJumping = false;
    isDescending = false;
    player.style.transform = 'translateY(0)';
    scoreElement.textContent = score;
    gameOverScreen.style.display = 'none';
    
    // Clear existing obstacles
    obstacles.forEach(obstacle => obstacle.remove());
    obstacles = [];
    
    // Restart obstacle generation
    obstacleInterval = setInterval(createObstacle, 2000);
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
obstacleInterval = setInterval(createObstacle, 2000);
