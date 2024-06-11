let battleLog = [];
const initialHealth = 1000; // Initial health value
let currentHealth = initialHealth; // Current health value

document.getElementById("moveButton").addEventListener("click", () => {
    const criticalHit = Math.random() < 0.1; // 10% chance of critical hit
    const randomNum = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
    const numberToDisplay = criticalHit ? randomNum * 2 : randomNum;

    if (criticalHit) {
        shakeMagnitude = 20; // Double the magnitude
    } else {
        shakeMagnitude = 10;
    }

    const overlay = {
        x: Math.random() * (canvas.width - overlayImage.width),
        y: canvas.height - Math.random() * (canvas.height / 10),
        angle: 0, // Start angle at 0 radians
        criticalHit: criticalHit,
        numberToDisplay: numberToDisplay,
        textY: 0, // Initial position of the text relative to the overlay
        textSpeed: -1, // Slower speed to make it last longer
        textUp: true, // Indicates whether the text is moving up or down
    };

    overlays.push(overlay);
    if (overlays.length === 1) {
        cancelAnimationFrame(animationFrameId);
        animateOverlay();
    }

    // Start shake effect
    shake = true;
    shakeDuration = 20; // Adjusted duration of the shake
    cancelAnimationFrame(animationFrameId);
    animateOverlay();

    // Play sound based on hit type
    if (criticalHit) {
        const criticalHitSound = new Audio('assets/audio/critical.wav');
        criticalHitSound.play();
    } else {
        const regularHitSound = new Audio('assets/audio/normal.wav');
        regularHitSound.play();
    }

    // Add log entry
    const logEntry = `Player dealt ${numberToDisplay} damage`;
    battleLog.unshift(logEntry); // Add entry to the beginning of the array
    if (battleLog.length > 10) {
        battleLog.pop(); // Remove the last entry if the log length exceeds 5
    }

    // Update damage taken and apply damage
    applyDamage(numberToDisplay);
});

function animateOverlay() {
    overlays.forEach(overlay => {
        overlay.angle += overlay.criticalHit ? rotationSpeedCritical : rotationSpeedNormal;

        // Update text position for upward movement only
        if (overlay.textUp) {
            overlay.textY += overlay.textSpeed;
            if (overlay.textY <= -400) {
                // Move up about twice as much
                overlay.textUp = false; // Stop moving up after reaching the target position
            }
        }
    });

    // Remove overlays that have rotated enough
    for (let i = overlays.length - 1; i >= 0; i--) {
        if (overlays[i].angle >= (0.9 * Math.PI)) {
            overlays.splice(i, 1);
        }
    }

    drawOverlay();
    if (overlays.length > 0 || shakeDuration > 0) {
        animationFrameId = requestAnimationFrame(animateOverlay);
    } else {
        cancelAnimationFrame(animationFrameId);
    }
}

function drawOverlay() {
    // Apply shake effect
    let dx = 0;
    let dy = 0;
    if (shake && shakeDuration > 0) {
        dx = Math.random() * shakeMagnitude - shakeMagnitude / 2;
        dy = Math.random() * shakeMagnitude - shakeMagnitude / 2;
        shakeDuration--;
    }

    // Clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw base image with shake offset
    const adjustedWidth = canvas.width + 2 * shakeMagnitude;
    const adjustedHeight = canvas.height + 2 * shakeMagnitude;
    ctx.drawImage(
        baseImage,
        -shakeMagnitude + dx,
        -shakeMagnitude + dy,
        adjustedWidth,
        adjustedHeight,
    );

    // Draw overlays
    overlays.forEach(overlay => {
        ctx.save();
        ctx.translate(overlay.x, overlay.y); // Translate to the bottom-left corner of the overlay
        ctx.rotate(-overlay.angle); // Rotate counterclockwise
        if (overlay.criticalHit) {
            ctx.shadowColor = 'red';
            ctx.shadowBlur = 40; // Increased shadow blur for critical hit
        }
        ctx.drawImage(overlayImage, 0, -overlayImage.height, overlayImage.width, overlayImage.height); // Draw image rotated
        ctx.restore();

        // Draw the number with upward movement
        ctx.save();
        ctx.translate(overlay.x, overlay.y + overlay.textY); // Move text along with the overlay
        ctx.fillStyle = overlay.criticalHit ? 'orange' : 'white'; // Color based on critical hit
        ctx.font = overlay.criticalHit ? 'bold 20px Arial' : '20px Arial'; // Font style based on critical hit
        ctx.textAlign = 'center';
        ctx.fillText(overlay.numberToDisplay, overlayImage.width / 2, -overlayImage.height); // Draw the number
        ctx.restore();
    });

    // Draw log background on top
    drawLogBackground();
    drawBattleLog();

    // Draw health bar
    updateHealthBar();
}

function drawLogBackground() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Changed transparency to 40%
    ctx.fillRect(canvas.width * 0.8, 0, canvas.width * 0.2, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4; // Changed border width to 4pt
    ctx.strokeRect(canvas.width * 0.8, 0, canvas.width * 0.2, canvas.height);

    // Draw log header
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width * 0.8, 0, canvas.width * 0.2, 30); // Header background
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Battle Log', canvas.width * 0.9, 20); // Header text
}

function drawBattleLog() {
    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Player Actions:', canvas.width * 0.81, 50); // Title for log entries

    // Draw each log entry
    ctx.textAlign = 'left';
    ctx.font = '16px Arial';
    for (let i = 0; i < battleLog.length; i++) {
        const yPosition = 70 + i * 20; // Adjust the vertical position for each entry
        ctx.fillText(battleLog[i], canvas.width * 0.81, yPosition);
    }
}

// Function to update the health bar
function updateHealthBar() {
    // Calculate the percentage of health remaining
    const healthPercentage = currentHealth / initialHealth;

    // Clear the health bar area
    const barWidth = canvas.width * 0.6; // 60% of the canvas width
    const barHeight = 30; // Height of the bar
    const barX = (canvas.width - barWidth - canvas.width * 0.2) / 2; // Center the bar horizontally within remaining canvas
    const barY = 60; // Top margin for the bar, just below the battle log header
    ctx.clearRect(barX + 15, barY + 15, barWidth - 30, barHeight - 30);

    // Draw the red portion of the health bar
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(barX + 15, barY);
    ctx.arcTo(barX + barWidth, barY, barX + barWidth, barY + barHeight, 15);
    ctx.arcTo(barX + barWidth, barY + barHeight, barX, barY + barHeight, 15);
    ctx.arcTo(barX, barY + barHeight, barX, barY, 15);
    ctx.arcTo(barX, barY, barX + 15, barY, 15);
    ctx.fill();

    // Calculate the width of the remaining health bar
    const remainingWidth = barWidth * healthPercentage;

    // Draw the green damage portion of the health bar
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(barX + 15, barY);
    ctx.arcTo(barX + remainingWidth, barY, barX + remainingWidth, barY + barHeight, 15);
    ctx.arcTo(barX + remainingWidth, barY + barHeight, barX, barY + barHeight, 15);
    ctx.arcTo(barX, barY + barHeight, barX, barY, 15);
    ctx.arcTo(barX, barY, barX + 15, barY, 15);
    ctx.fill();

    // Draw the current health value
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Health: ${currentHealth}`, barX + barWidth / 2, barY + barHeight / 1.5); // Centered in the health bar
}

// Function to apply damage to the health bar
function applyDamage(numberToDisplay) {
    console.log('Applying damage:', numberToDisplay);
    currentHealth -= numberToDisplay;
    if (currentHealth < 0) {
        currentHealth = 0;
    }
    updateHealthBar();
}