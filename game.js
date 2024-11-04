const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.querySelector('.game-over');

// Game state
let isJumping = false;
let jumpHeight = 100;
let currentJumpHeight = 0;
let jumpSpeed = 5;
let gravity = 5;
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
        } else {
            isDescending = true;
            currentJumpHeight -= gravity;
        }

        if (currentJumpHeight <= 0) {
            currentJumpHeight = 0;
            isJumping = false;
            isDescending = false;
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
    
    function moveObstacle() {
        if (position > -20) {
            position -= 5;
            obstacle.style.right = `${800 - position}px`;

            // Improved collision detection
            const playerRect = player.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();

            // Check for collision on all sides
            if (!(playerRect.right < obstacleRect.left || 
                playerRect.left > obstacleRect.right || 
                playerRect.bottom < obstacleRect.top || 
                playerRect.top > obstacleRect.bottom)) {
                gameOver();
                return;
            }

        } else {
            obstacle.remove();
            obstacles = obstacles.filter(obs => obs !== obstacle);
            score++;
            scoreElement.textContent = score;
            return;
        }

        if (gameRunning) {
            requestAnimationFrame(moveObstacle);
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
    // Restart animation loop
    updatePlayerPosition();
}

// Event Listeners
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (gameRunning) {
            jump();
        } else {
            resetGame();
        }
        // Prevent space from scrolling the page
        event.preventDefault();
    }
});

// Start the game
obstacleInterval = setInterval(createObstacle, 2000);
updatePlayerPosition();
