// ... (previous code remains the same until createObstacle function)

function createObstacle() {
    if (!gameRunning) return;
    
    const { height, width, distance } = getRandomObstacleProperties();
    
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    // Set CSS variables for triangle shape
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

            // Get the center points
            const playerCenter = {
                x: (playerRect.left + playerRect.right) / 2,
                y: (playerRect.top + playerRect.bottom) / 2
            };

            const trianglePoints = {
                bottom1: { x: obstacleRect.left, y: obstacleRect.bottom },
                bottom2: { x: obstacleRect.right, y: obstacleRect.bottom },
                top: { x: (obstacleRect.left + obstacleRect.right) / 2, y: obstacleRect.top }
            };

            // First, quick rectangle check (optimization)
            if (playerRect.right > obstacleRect.left && 
                playerRect.left < obstacleRect.right && 
                playerRect.bottom > obstacleRect.top && 
                playerRect.top < obstacleRect.bottom) {
                
                // If we're in the rectangle bounds, do precise triangle collision
                const playerPoints = [
                    { x: playerRect.left, y: playerRect.top },    // Top-left
                    { x: playerRect.right, y: playerRect.top },   // Top-right
                    { x: playerRect.right, y: playerRect.bottom }, // Bottom-right
                    { x: playerRect.left, y: playerRect.bottom }  // Bottom-left
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

// Helper function to determine if a point is inside a triangle
function isPointInTriangle(point, p1, p2, p3) {
    const area = getTriangleArea(p1, p2, p3);
    const area1 = getTriangleArea(point, p2, p3);
    const area2 = getTriangleArea(p1, point, p3);
    const area3 = getTriangleArea(p1, p2, point);

    // Point is inside if the sum of the three areas equals the total area
    return Math.abs(area - (area1 + area2 + area3)) < 0.1; // Using small epsilon for floating point comparison
}

// Helper function to calculate triangle area
function getTriangleArea(p1, p2, p3) {
    return Math.abs(
        (p1.x * (p2.y - p3.y) + 
         p2.x * (p3.y - p1.y) + 
         p3.x * (p1.y - p2.y)) / 2
    );
}

// ... (rest of the code remains the same)
