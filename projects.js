const canvas = document.getElementById('circuitCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Array to hold our "circuit lines" and "current particles"
let lines = [];
let particles = [];

// --- Create Circuit Lines (define your static background grid/lines) ---
function createCircuitLines() {
    // Example: Draw some fixed lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)'; // Faint teal lines
    ctx.lineWidth = 0.3;

    // Draw horizontal lines
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
        lines.push({ start: {x:0, y:i}, end: {x:canvas.width, y:i} });
    }
    // Draw vertical lines
    for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        lines.push({ start: {x:i, y:0}, end: {x:i, y:canvas.height} });
    }
    // Add more complex paths as needed
}

// --- Particle Class (represents a "current flow" dot) ---
class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = Math.random() * 2 + 1; // Random size
        this.life = 100; // How long it lives
        this.color = `rgba(0, 255, 255, ${Math.random() * 0.8 + 0.2})`; // Glowing color
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; // For glow effect
        ctx.shadowColor = this.color;
        ctx.fill();
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas
    createCircuitLines(); // Redraw static lines (or draw once if lines don't change)

    // Add new particles periodically
    if (Math.random() < 0.5) { // Adjust frequency
        // Spawn particle at a random point on one of your lines
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        const t = Math.random();
        const startX = randomLine.start.x;
        const startY = randomLine.start.y;
        const endX = randomLine.end.x;
        const endY = randomLine.end.y;
        const spawnX = startX + t * (endX - startX);
        const spawnY = startY + t * (endY - startY);

        // Give it a random velocity along the line or perpendicular
        const angle = Math.atan2(endY - startY, endX - startX) + (Math.random() - 0.5) * Math.PI / 4; // Slight deviation
        const speed = Math.random() * 1 + 0.5;
        particles.push(new Particle(spawnX, spawnY, Math.cos(angle) * speed, Math.sin(angle) * speed));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
            particles.splice(i, 1); // Remove dead particles
        }
    }
}

// Initialize
createCircuitLines();
animate();

// Handle resizing
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Optionally clear lines and redraw for new dimensions
    lines = [];
    createCircuitLines();
});

// The phrases you want to display, one after the other.
const PHRASES = [
    "**Preparing for response**\n",
    "Wait a second...\n",
    "Error:\nNo projects available yet."    
];

// Configuration
const DISPLAY_ELEMENT = document.getElementById('dynamic-text-display');
const DELAY_BETWEEN_PHRASES_MS = 1500; // Time gap between when one phrase finishes and the next starts
const TYPING_SPEED_MS = 50; // Delay between each character being typed

let phraseIndex = 0; // Tracks which phrase we're on

/**
 * Initiates the full sequence of phrases.
 */
function startPhraseSequence() {
    if (!DISPLAY_ELEMENT) return; // Exit if the element wasn't found
    
    // Clear any existing content
    DISPLAY_ELEMENT.innerHTML = '';
    
    // Start the recursive display loop
    displayNextPhrase();
}

/**
 * Displays the current phrase by typing it out character by character.
 */
function displayNextPhrase() {
    // Stop if we've displayed all phrases
    if (phraseIndex >= PHRASES.length) {
        // Optional: Remove the blinking cursor after the last phrase
        DISPLAY_ELEMENT.style.borderRight = 'none';
        return;
    }

    const currentPhrase = PHRASES[phraseIndex];
    let charIndex = 0;
    
    // 1. Clear the previous text
   // DISPLAY_ELEMENT.textContent = '';
   
   // 1. If it's not the first phrase, add a newline to drop to the next line
    if (phraseIndex > 0) {
        DISPLAY_ELEMENT.textContent += '\n';
    }
    // Store the initial content length so we know where to start typing
    const initialLength =DISPLAY_ELEMENT.textContent.length;
    
    // 2. Start the character typing interval
    const typingInterval = setInterval(() => {
        // Append the next character
        // We use slice to update the *entire* content string each time.
        // Get the current content, then add the next character

        // This is a common pattern to keep the text element's value current:
        const currentText = DISPLAY_ELEMENT.textContent;

        // The last part of the text that was just the newline needs to be
        // overwritten as we type. A simpler way is to manage the text content:

        // Append the next character to the text content
        DISPLAY_ELEMENT.textContent += currentPhrase[charIndex];
        charIndex++;

        // Stop the interval when the phrase is complete
        if (charIndex === currentPhrase.length) {
            clearInterval(typingInterval);

            scrollToBottomIfNearEnd();
            // 3. Move to the next phrase after a short delay
            phraseIndex++;
            setTimeout(displayNextPhrase, DELAY_BETWEEN_PHRASES_MS);
        }
    }, TYPING_SPEED_MS);
}

// Start the animation when the page loads
window.onload = startPhraseSequence;

/**
 * Scrolls the page to the bottom ONLY if the user is already near the bottom.
 */
function scrollToBottomIfNearEnd() {
    // We use document.documentElement (or document.body) for the main page scroll
    const scrollElement = document.documentElement; 
    
    // Check if the user is within 100 pixels of the current bottom
    // This defines the "tolerance" for when we decide to auto-scroll.
    const scrollTolerance = 100; 

    // Calculate how far the current scroll position is from the content's bottom
    const distanceToBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;

    // If the user is near the bottom (less than the tolerance), scroll them down
    if (distanceToBottom < scrollTolerance) {
        // Use smooth behavior for a better user experience
        window.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth' 
        });
    }
    // If the user has scrolled up to review content, do nothing (i.e., don't force a scroll).
}