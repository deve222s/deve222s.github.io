let player, target;
let message = "Bon Anniversaire!";
let gameOver = false;
let gameStarted = false;
let moveInterval;
let score = 0;
let needsRefresh = false;
let targetPoints = [
    { x: 0.45, y: 0.68 },
    { x: 0.6, y: 0.65 },
    { x: 0.8, y: 0.80 },
    { x: 0.67, y: 0.82 },
    { x: 0.2, y: 0.82 }
];
let targetIndex = 0;
let dialogActive = true;
let finalDialogShown = false;

// Dialog messages for each target
let dialogMessages = [
    "Hello there! I'm dialog 1",
    "Watch out for dialog 2!",
    "Dialog 3 says hi!",
    "Almost there, says dialog 4!",
    "Final one, dialog 5!"
];

// Typewriter effect variables
let currentDialogText = "";
let dialogCharIndex = 0;
let typingSpeed = 50;

// Images and music
let playerImage, targetImage, backgroundImage;
let bgWidth, bgHeight;
let playerSize, targetSize;
let detectionRadius;
let backgroundMusic;

// Placeholder for additional character images and their closer relative positions to target
let characterImages = [];
let characterPositions = [
    { x: -0.12, y: -0.12 },
    { x: 0, y: -0.15 },
    { x: 0.12, y: -0.12 },
    { x: -0.15, y: 0 },
    { x: 0.15, y: 0 },
    { x: -0.12, y: 0.12 },
    { x: 0.12, y: 0.12 }
];


function preload() {
    playerImage = loadImage("assets/belle.webp");
    targetImage = loadImage("assets/bete.webp");
    backgroundImage = loadImage("assets/background.avif");
    backgroundMusic = loadSound("assets/music.mp3");

    for (let i = 0; i < 7; i++) {
        characterImages.push(loadImage(`assets/characters${i + 1}.webp`));
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    updateDimensions();
    player = createVector(width / 1.35, height / 1.2);
    target = createVector(0, 0);
    setTargetPosition();

    setTimeout(() => {
        startTyping(dialogMessages[targetIndex]);
    }, 1500);

    disableMovementFor3Seconds();
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

        if (backgroundMusic.isPlaying()) {
            backgroundMusic.stop();
        }
        return;
    }

    image(backgroundImage, (width - bgWidth) / 2, (height - bgHeight) / 2, bgWidth, bgHeight);

    if (finalDialogShown) {
        displayAdditionalCharacters(true); // Call with `true` to trigger final positioning and scaling effect
    } else {
        image(playerImage, player.x - playerSize / 2, player.y - playerSize / 2, playerSize, playerSize);
        image(targetImage, target.x - targetSize / 2, target.y - targetSize / 2, targetSize, targetSize);
    }

    if (dialogActive) {
        showDialogBox(currentDialogText);
    }

    if (dist(player.x, player.y, target.x, target.y) < detectionRadius && !dialogActive) {
        score++;
        if (score < 5) {
            targetIndex = (targetIndex + 1) % targetPoints.length;
            setTargetPosition();
            startTyping(dialogMessages[targetIndex]);
            disableMovementFor3Seconds();
        } else if (!finalDialogShown) {
            finalDialogShown = true;
            currentDialogText = "This is the final celebration message!";
            dialogActive = true;
            startTyping(currentDialogText);
        } else {
            setTimeout(() => {
                gameOver = true;
                console.log("Game over! Bon Anniversaire!");
            }, 10000); // 10-second delay before "Bon Anniversaire"
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

// Function to display additional characters with optional "grow and move up" effect
function displayAdditionalCharacters(finalEffect = false) {
    let sizeMultiplier = finalEffect ? 1.5 : 1;
    let positionOffset = finalEffect ? -0.15 * bgHeight : 0;

    // Draw player and target with increased size and position if final effect is true
    image(playerImage, player.x - (playerSize * sizeMultiplier) / 2, player.y - (playerSize * sizeMultiplier) / 2 + positionOffset, playerSize * sizeMultiplier, playerSize * sizeMultiplier);
    image(targetImage, target.x - (targetSize * sizeMultiplier) / 2, target.y - (targetSize * sizeMultiplier) / 2 + positionOffset, targetSize * sizeMultiplier, targetSize * sizeMultiplier);

    // Draw additional characters around target with final effect adjustments
    characterPositions.forEach((pos, index) => {
        let charX = target.x + pos.x * bgWidth;
        let charY = target.y + pos.y * bgHeight + positionOffset;
        image(characterImages[index], charX - (targetSize * sizeMultiplier) / 2, charY - (targetSize * sizeMultiplier) / 2, targetSize * sizeMultiplier, targetSize * sizeMultiplier);
    });
}


// Display dialog box with adjusted distance above the target in final position
function showDialogBox(dialogText) {
    textSize(12);
    const padding = 10;
    const textWidthWithPadding = textWidth(dialogText) + padding * 2;
    const boxHeight = 30;
    let dialogOffset = finalDialogShown ? 100 : 5; // Greatly increased offset for final dialog

    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(target.x - textWidthWithPadding / 2, target.y - targetSize - boxHeight - dialogOffset, textWidthWithPadding, boxHeight, 5);

    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    text(dialogText, target.x, target.y - targetSize - boxHeight / 2 - dialogOffset);
}

// Start game function triggered by start button
function startGame() {
    if (needsRefresh) {
        alert("Please refresh the page after switching to landscape mode.");
        return;
    }

    if (window.innerWidth > window.innerHeight) {
        document.getElementById("startOverlay").style.display = "none";
        document.getElementById("orientationMessage").style.display = "none";
        gameStarted = true;

        if (backgroundMusic && !backgroundMusic.isPlaying()) {
            backgroundMusic.loop();
        }

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
    currentDialogText = "";
    dialogCharIndex = 0;
    dialogActive = true;

    document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "0.5");

    const interval = setInterval(() => {
        if (dialogCharIndex < dialogText.length) {
            currentDialogText += dialogText[dialogCharIndex];
            dialogCharIndex++;
        } else {
            clearInterval(interval);

            setTimeout(() => {
                dialogActive = false;
                document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "1");
            }, 3000);
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
    clearInterval(moveInterval);
    dialogActive = true;
    document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "0.5");

    setTimeout(() => {
        dialogActive = false;
        document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "1");
    }, 5000);
}

// Movement controls with temporary disable handling
function startMoving(direction) {
    if (!gameStarted || gameOver || dialogActive) return;

    const step = playerSize * 0.12;

    function move() {
        if (dialogActive) return;

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
