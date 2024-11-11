let player, target;
let message = "Bon Anniversaire!";
let gameOver = false;
let moveInterval;
let score = 0; // Track score without displaying it
let targetPoints = [
    { x: 0.4, y: 0.4 }, // Slightly off-centered points to avoid overlap with starting player position
    { x: 0.6, y: 0.5 },
    { x: 0.7, y: 0.4 },
    { x: 0.5, y: 0.7 },
    { x: 0.4, y: 0.6 }
];
let targetIndex = 0; // Track the current target point

// Images
let playerImage, targetImage, backgroundImage;
let bgWidth, bgHeight; // Store background size
let playerSize, targetSize;
let detectionRadius;

function preload() {
    // Load images - replace with your files as needed
    playerImage = loadImage("assets/belle.webp"); // Player image
    targetImage = loadImage("assets/bete.webp"); // Target image
    backgroundImage = loadImage("assets/background.avif"); // Background image
}

function setup() {
    // Create a responsive canvas based on the window size
    createCanvas(windowWidth, windowHeight);
    updateDimensions();

    player = createVector(width / 2, height / 2);
    target = createVector(0, 0); // Initialize target with default coordinates

    setTargetPosition(); // Set the initial target position based on predefined points
}

function draw() {
    if (!gameOver) {
        // Draw the background image centered within the canvas
        image(backgroundImage, (width - bgWidth) / 2, (height - bgHeight) / 2, bgWidth, bgHeight);

        // Display player character at consistent size
        image(playerImage, player.x - playerSize / 2, player.y - playerSize / 2, playerSize, playerSize);

        // Display target item at consistent size
        image(targetImage, target.x - targetSize / 2, target.y - targetSize / 2, targetSize, targetSize);

        // Check for collision with target
        if (dist(player.x, player.y, target.x, target.y) < detectionRadius) {
            score++;  // Increment the score (not displayed)

            // Move to the next target position if score is less than 5
            if (score < 5) {
                targetIndex = (targetIndex + 1) % targetPoints.length;
                setTargetPosition();
            } else {
                gameOver = true; // End the game when the score reaches 5
                console.log("Game over! Bon Anniversaire!");
            }
        }
    } else {
        // Display game over message
        background(200);
        textSize(bgWidth * 0.1); // Adjust text size based on background width
        fill(0);
        textAlign(CENTER, CENTER);
        text(message, width / 2, height / 2);
    }
}

function setTargetPosition() {
    // Calculate the exact position based on the background display dimensions and percentages
    const offsetX = (width - bgWidth) / 2;
    const offsetY = (height - bgHeight) / 2;

    target.x = offsetX + targetPoints[targetIndex].x * bgWidth;
    target.y = offsetY + targetPoints[targetIndex].y * bgHeight;

    // Debugging logs to verify target position
    console.log(`Target position: (${target.x}, ${target.y})`);
}

function updateDimensions() {
    // Calculate background dimensions based on aspect ratio
    const bgAspectRatio = backgroundImage.width / backgroundImage.height;
    if (width / height > bgAspectRatio) {
        bgWidth = width;
        bgHeight = width / bgAspectRatio;
    } else {
        bgHeight = height;
        bgWidth = height * bgAspectRatio;
    }

    // Set smaller player and target sizes
    playerSize = bgWidth * 0.05; // Reduced player size
    targetSize = bgWidth * 0.03; // Reduced target size
    detectionRadius = targetSize * 1.5; // Adjust detection radius based on new target size
}

// Functions for movement controls
function startMoving(direction) {
    const step = playerSize * 0.12; // Proportional step size

    function move() {
        // Move the player, ensuring they remain within canvas boundaries
        if (direction === 'up') player.y = max(0, player.y - step);
        if (direction === 'down') player.y = min(height - playerSize, player.y + step);
        if (direction === 'left') player.x = max(0, player.x - step);
        if (direction === 'right') player.x = min(width - playerSize, player.x + step);
    }

    // Repeat the movement at intervals
    moveInterval = setInterval(move, 30);
}

function stopMoving() {
    clearInterval(moveInterval);
}

// Update canvas and elements if the window is resized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    updateDimensions(); // Recalculate dimensions
    setTargetPosition(); // Recalculate target position on window resize
}
