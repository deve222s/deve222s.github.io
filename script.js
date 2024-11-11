let player, target;
let message = "Bon Anniversaire!";
let gameOver = false;
let gameStarted = false;
let moveInterval;
let score = 0;
let needsRefresh = false; // New flag to detect orientation change
let targetPoints = [
    { x: 0.45, y: 0.68 },
    { x: 0.6, y: 0.65 },
    { x: 0.8, y: 0.80 },
    { x: 0.67, y: 0.82 },
    { x: 0.2, y: 0.82 }
];
let targetIndex = 0;
let dialogActive = true;
let dialogTimeout;

// Dialog messages for each target
let dialogMessages = [
    "Hello there! I'm dialog 1",
    "Watch out for dialog 2!",
    "Dialog 3 says hi!",
    "Almost there, says dialog 4!",
    "Final one, dialog 5!"
];

// Typewriter effect variables
let currentDialogText = ""; // Holds the portion of text currently shown
let dialogCharIndex = 0; // Tracks the current character index being displayed
let typingSpeed = 50; // Milliseconds between each character

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

    // Add a delay before the first dialog starts typing
    setTimeout(() => {
        startTyping(dialogMessages[targetIndex]); // Start typing the first dialog after delay
    }, 1500); // 1000 ms = 1 second delay

    disableMovementFor3Seconds(); // Disable movement initially
}

function draw() {
    if (!gameStarted) return;

    if (gameOver) {
        document.querySelector('.controls').style.display = 'none';
        background(200);
        textSize(bgWidth * 0.1);
        fill(0);
        textAlign(CENTER, CENTER);
        text(message, width / 2, height / 2);
        return;
    }

    image(backgroundImage, (width - bgWidth) / 2, (height - bgHeight) / 2, bgWidth, bgHeight);
    image(playerImage, player.x - playerSize / 2, player.y - playerSize / 2, playerSize, playerSize);
    image(targetImage, target.x - targetSize / 2, target.y - targetSize / 2, targetSize, targetSize);

    if (dialogActive) {
        showDialogBox(currentDialogText); // Show the portion of text typed so far
    }

    if (dist(player.x, player.y, target.x, target.y) < detectionRadius && !dialogActive) {
        score++;
        if (score < 5) {
            targetIndex = (targetIndex + 1) % targetPoints.length;
            setTargetPosition();
            startTyping(dialogMessages[targetIndex]); // Start typing for the new target’s dialog
            disableMovementFor3Seconds();
        } else {
            gameOver = true;
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
    // Prevent game start if needsRefresh is true
    if (needsRefresh) {
        alert("Please refresh the page after switching to landscape mode.");
        return;
    }

    if (window.innerWidth > window.innerHeight) {
        document.getElementById("startOverlay").style.display = "none";
        document.getElementById("orientationMessage").style.display = "none";
        gameStarted = true;

        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
    } else {
        document.getElementById("orientationMessage").style.display = "flex";
    }
}

// Typewriter effect for dialog
function startTyping(dialogText) {
    currentDialogText = ""; // Reset the dialog text
    dialogCharIndex = 0; // Reset the index
    dialogActive = true;

    // Typing interval to gradually reveal the text
    const interval = setInterval(() => {
        if (dialogCharIndex < dialogText.length) {
            currentDialogText += dialogText[dialogCharIndex];
            dialogCharIndex++;
        } else {
            clearInterval(interval); // Stop typing once all characters are displayed
            setTimeout(disableMovementFor3Seconds, 1000); // Disable movement after typing finishes
        }
    }, typingSpeed);
}

// Display dialog box over target with dynamic width based on currentDialogText
function showDialogBox(dialogText) {
    textSize(12);
    const padding = 10;
    const textWidthWithPadding = textWidth(dialogText) + padding * 2;
    const boxHeight = 30;

    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(target.x - textWidthWithPadding / 2, target.y - targetSize - boxHeight - 5, textWidthWithPadding, boxHeight, 5);

    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(dialogText, target.x, target.y - targetSize - boxHeight / 2 - 5);
}

// Disable movement for 3 seconds and dim controls
function disableMovementFor3Seconds() {
    dialogActive = true; // Ensure dialog is active during the delay
    document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "0.5");

    setTimeout(() => {
        dialogActive = false; // Allow movement again
        document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "1");
    }, 5000);
}

// Movement controls with temporary disable handling
function startMoving(direction) {
    if (!gameStarted || gameOver || dialogActive) return;

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

// Detect orientation change and set needsRefresh flag if going from portrait to landscape
window.addEventListener("orientationchange", () => {
    // Check if orientation change has switched to landscape
    if (Math.abs(window.orientation) === 90) {
        needsRefresh = true;
        alert("Please refresh the page after switching to landscape mode."); // Notify the user to refresh
    }
});

// Safari-friendly resize event to update elements
window.addEventListener("resize", () => {
    resizeCanvas(windowWidth, windowHeight);
    updateDimensions();
    setTargetPosition();
    
    if (!gameStarted) {
        if (window.innerWidth > window.innerHeight) {
            document.getElementById("orientationMessage").style.display = "none";
        } else {
            document.getElementById("orientationMessage").style.display = "flex";
        }
    }
});
