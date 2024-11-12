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

let poemScrollY = 0; // Starting y-position for the scrolling poem
let lineDisplayInterval = 3000; // Time between each line's start
let lineYSpacing = 40; // Vertical space between lines
let currentPoemLineIndex = 0; // Currently typed line index
let lineStartTime = 0; // Track when to move to the next line


// Dialog messages for each target
let dialogMessages = [
    "Hey ma petite, attrape moi si tu peux",
    "Mdr, louper, t'es nullllll!!",
    "Bon dégage, j'ai autre chose à faire...",
    "JE SUIS OCCUPE je t'ai dit!",
    "Ne viens surtout pas!"
];

let poemMode = false;
let poemLines = [
    "Mylène, tu as 21 ans,", 
    "malgré le fait que tu m'ais oublié,", 
    "cela ne pourra plus jamais arrivé.", 
    "Avec toi je veux évoluer,",
    "car ma vie tu as marqué.",
    "Malgrès le fait que tu sois casse pied,",
    /*"un Homme bien tu as mérité.",
    "Je te souhaite bonheur et prospérité,",
    "et une place dans la vie de ton bien aimé.",
    "Mylenka passe une merveilleuse journée,",
    "que Dieu te bénisse et t'assagisse,",
    "qu'il fasse de toi une orchidée,",
    "que personne n'osera jamais butiner.",
    "Malgré mes blagues répétées,",
    "et mes rimes pauvres finissant toujours en é,",
    "je pense que mon Amour j'ai pu te le démontrer.",
    "Trève de plaisenterie,",
    "nous ne sommes pas là pour manger du riz,",
    "à la porte de choisy.",
    "Trève de plaisenterie,",
    "Passe une bonne 21ème année,",
    "et pleins de réussite et de joie.",
    "ILY"*/
];
let currentPoemLine = "";
let poemTypingSpeed = 2;
let poemCharIndex = Array(poemLines.length).fill(0); // Characters displayed per line


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

let poemStartDelay = 10000; // Delay in milliseconds before the poem starts displaying
let poemDisplayStarted = false; // Track whether the poem display has started

// Placeholder for additional character images and their closer relative positions to target
let characterImages = [];
let characterPositions = [
    { x: -0.12, y: -0.12 },
    { x: 0, y: 0.15 },
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
    poemMusic = loadSound("assets/mainPoem.mp3"); // Load the poem music file


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

        if (poemMode) {
            if (poemDisplayStarted) {
                displayPoem(); // Display the poem after the delay
            }
            return;
        } else {
            // Show "Bon Anniversaire!" message briefly before switching to poemMode
            textSize(bgWidth * 0.1);
            fill(0);
            textAlign(CENTER, CENTER);
            text(message, width / 2, height / 2);

            if (backgroundMusic.isPlaying()) {
                backgroundMusic.stop();
            }

            // After displaying "Bon Anniversaire!" for 2 seconds, switch to poemMode
            setTimeout(() => {
                poemMode = true;
                startPoemDisplay();
            }, 2000); // Display "Bon Anniversaire!" for 2 seconds

            return;
        }
    }

    // Game rendering logic if the game is not over
    image(backgroundImage, (width - bgWidth) / 2, (height - bgHeight) / 2, bgWidth, bgHeight);

    if (finalDialogShown) {
        displayAdditionalCharacters(true);
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
            currentDialogText = "Surprise Bon anniversaire. On t'aime tousss (oui je parle au nom de tout le monde vu que t'es la princesse des princesses).";
            dialogActive = true;
            startTyping(currentDialogText);
        } else {
            // Trigger game over and display "Bon Anniversaire!"
            gameOver = true;
            message = "Bon Anniversaire!";
        }
    }
}

// Function to display each line of the poem sequentially without typewriter effect
function displayPoem() {
    background(200); // Set background color
    textSize(24);
    fill(0);
    textAlign(CENTER, CENTER);

    // Starting y-position for the first line of the poem
    let yOffset = height / 2 - (poemLines.length * lineYSpacing) / 2;

    // Display each line with scrolling and typewriter effects
    for (let i = 0; i <= currentPoemLineIndex; i++) {
        let lineY = yOffset + i * lineYSpacing + poemScrollY;
        
        // Typewriter effect: display each character one by one in each line
        text(poemLines[i].slice(0, poemCharIndex[i]), width / 2, lineY);
    }

    // Smooth scrolling effect
    poemScrollY -= 0.17; // Adjust scroll speed by changing this value

    // Update typewriter effect for the current line
    if (frameCount % poemTypingSpeed === 0 && currentPoemLineIndex < poemLines.length) {
        // Reveal the next character in the current line
        if (poemCharIndex[currentPoemLineIndex] < poemLines[currentPoemLineIndex].length) {
            poemCharIndex[currentPoemLineIndex]++;
        } else {
            // Move to the next line after a delay
            if (millis() - lineStartTime > lineDisplayInterval) {
                currentPoemLineIndex++;
                lineStartTime = millis(); // Reset the timer for the next line
            }
        }
    }
}


// Function to show each poem line sequentially with a delay
function startPoemDisplay() {
    poemMode = true; // Enable poem mode
    lineStartTime = millis(); // Track the start time for the first line

    // Start the poem music and set it to loop
    if (poemMusic && !poemMusic.isPlaying()) {
        poemMusic.loop();
    }

    // Set a delay before the poem actually starts displaying
    setTimeout(() => {
        poemDisplayStarted = true; // Allow poem display to start after the delay
    }, poemStartDelay);
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

            let closeDelay = finalDialogShown ? 3000 : 3000; // Adjust delay if needed

            setTimeout(() => {
                dialogActive = false;
                document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "1");

                if (finalDialogShown) {
                    gameOver = true;
                }
            }, closeDelay);
        }
    }, typingSpeed);
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

            // Si c'est le dernier message, augmentez le délai de fermeture
            let closeDelay = finalDialogShown ? 7000 : 3000; // 7 seconds pour le dernier dialog, 3 seconds sinon

            setTimeout(() => {
                dialogActive = false;
                document.querySelectorAll('.controls button').forEach(button => button.style.opacity = "1");
            }, closeDelay);
        }
    }, typingSpeed);
}

// Display dialog box over target with dynamic width based on currentDialogText
function showDialogBox(dialogText) {
    textSize(12);
    const padding = 10;
    const maxWidth = 150; // Maximum width before wrapping text to the next line
    const boxHeight = 14;
    let dialogOffset = finalDialogShown ? 100 : 5;

    // Split the currently displayed text into lines based on maxWidth
    let lines = [];
    let currentLine = "";

    // Dynamically build lines based on the typed text so far
    for (let i = 0; i < dialogText.length; i++) {
        currentLine += dialogText[i];
        if (textWidth(currentLine) > maxWidth || i === dialogText.length - 1) {
            lines.push(currentLine);
            currentLine = "";
        }
    }

    // Calculate the dynamic width of the box based on the widest line so far
    let currentBoxWidth = Math.min(maxWidth, Math.max(...lines.map(line => textWidth(line)))) + padding * 2;
    
    // Calculate the height of the dialog box based on the number of lines
    let totalBoxHeight = boxHeight * lines.length + padding * 2;

    // Draw the dialog box with dynamically calculated width and height
    fill(255);
    stroke(0);
    strokeWeight(2);
    rect(target.x - currentBoxWidth / 2, target.y - targetSize - totalBoxHeight - dialogOffset, currentBoxWidth, totalBoxHeight, 5);

    // Display each line of text within the dialog box
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);

    lines.forEach((line, index) => {
        text(line, target.x, target.y - targetSize - (boxHeight * (lines.length - index)) - dialogOffset);
    });
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
