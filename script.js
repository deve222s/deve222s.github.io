let player, target;
let message = "Bon Anniversaire!";
let gameOver = false;
let gameStarted = false; // Track if game has started
let moveInterval;
let score = 0;
let targetPoints = [
    { x: 0.45, y: 0.68 },
    { x: 0.6, y: 0.65 },
    { x: 0.8, y: 0.80 },
    { x: 0.67, y: 0.82 },
    { x: 0.2, y: 0.82 }
];
let targetIndex = 0;

// Images
let playerImage, targetImage, backgroundImage;
let bgWidth, bgHeight;
let playerSize, targetSize;
let detectionRadius;

function preload() {
    playerImage = loadImage("assets/belle.webp");
    targetImage = loadImage("assets/bete.webp");
    backgroundImage = loadImage("assets/background.avif");
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    updateDimensions();
    player = createVector(width / 1.35, height / 1.2);
    target = createVector(0, 0);
    setTargetPosition();
}

function draw() {
    if (!gameStarted) return; // Only draw if the game has started

    // Check if the game is over and hide controls if so
    if (gameOver) {
        document.querySelector('.controls').style.display = 'none'; // Hide controls
        background(200);
        textSize(bgWidth * 0.1);
        fill(0);
        textAlign(CENTER, CENTER);
        text(message, width / 2, height / 2);
        return; // Exit the draw function to stop updating
    }

    // Normal game rendering when not over
    image(backgroundImage, (width - bgWidth) / 2, (height - bgHeight) / 2, bgWidth, bgHeight);
    image(playerImage, player.x - playerSize / 2, player.y - playerSize / 2, playerSize, playerSize);
    image(targetImage, target.x - targetSize / 2, target.y - targetSize / 2, targetSize, targetSize);

    if (dist(player.x, player.y, target.x, target.y) < detectionRadius) {
        score++;
        if (score < 5) {
            targetIndex = (targetIndex + 1) % targetPoints.length;
            setTargetPosition();
        } else {
            gameOver = true; // Set game over flag
            console.log("Game over! Bon Anniversaire!");
        }
    }
}

function setTargetPosition() {
    const offsetX = (width - bgWidth) / 2;
    const offsetY = (height - bgHeight) / 2;
    target.x = offsetX + targetPoints[targetIndex].x * bgWidth;
    target.y = offsetY + targetPoints[targetIndex].y * bgHeight;
}

function updateDimensions() {
    const bgAspectRatio = backgroundImage.width / backgroundImage.height;
    if (width / height > bgAspectRatio) {
        bgWidth = width;
        bgHeight = width / bgAspectRatio;
    } else {
        bgHeight = height;
        bgWidth = height * bgAspectRatio;
    }
    playerSize = bgWidth * 0.05;
    targetSize = bgWidth * 0.03;
    detectionRadius = targetSize * 1.2;
}

// Start game function triggered by start button
function startGame() {
    if (window.innerWidth > window.innerHeight) {
        document.getElementById("startOverlay").style.display = "none";
        document.getElementById("orientationMessage").style.display = "none";
        gameStarted = true;

        // Request fullscreen if available
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Safari support
            document.documentElement.webkitRequestFullscreen();
        }
    } else {
        document.getElementById("orientationMessage").style.display = "flex";
    }
}


// Movement controls
function startMoving(direction) {
    if (!gameStarted || gameOver) return;

    const step = playerSize * 0.12;

    function move() {
        if (direction === 'up') player.y = max(0, player.y - step);
        if (direction === 'down') player.y = min(height - playerSize, player.y + step);
        if (direction === 'left') player.x = max(0, player.x - step);
        if (direction === 'right') player.x = min(width - playerSize, player.x + step);
    }

    moveInterval = setInterval(move, 35);
}

function stopMoving() {
    clearInterval(moveInterval);
}

window.addEventListener("resize", () => {
    resizeCanvas(windowWidth, windowHeight);
    updateDimensions();
    setTargetPosition();
    if (!gameStarted && window.innerWidth > window.innerHeight) {
        document.getElementById("orientationMessage").style.display = "none";
    } else if (!gameStarted) {
        document.getElementById("orientationMessage").style.display = "flex";
    }
});
