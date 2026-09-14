// Global variables for the sound analysis
let mic;
let fft;
let canvas;

function setup() {
    // Create canvas that matches the parent iframe's size
    background(0, 0, 0, 100);  
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('display', 'block'); // Remove default canvas margin
    colorMode(HSB, 360, 100, 100);
    noStroke();

    // Initialize audio input and FFT (Fast Fourier Transform)
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
}

function draw() {
    // Cyberpunk/Glitchy Background: Subtle trail effect
    background(0, 0, 0, 10); 
    
    // Get the frequency analysis data
    let spectrum = fft.analyze();
    
    translate(width / 2, height / 2); // Center the visualization

    // Base variables for visualization
    let numCircles = 64;
    let radius = min(width, height) * 0.4;
    let hue = (frameCount / 2) % 360; // Slow color shift

    for (let i = 0; i < numCircles; i++) {
        // Map the current iteration (i) to a specific frequency band
        // We focus on the lower-mid frequencies (index 1 to 64 in the spectrum array)
        let spectrumIndex = floor(map(i, 0, numCircles, 1, 64));
        let level = spectrum[spectrumIndex]; // Value from 0 to 255
        
        // Map level to size (making it audio-reactive)
        let size = map(level, 0, 255, 5, 50); 
        
        // Calculate position in a circular pattern
        let angle = map(i, 0, numCircles, 0, TWO_PI);
        let x = cos(angle) * radius;
        let y = sin(angle) * radius;

        // Apply a small glitch/flicker (random size adjustment)
        size += random(-5, 5); 

        // Set color: Pink/Cyan Cyberpunk theme
        let currentHue = (hue + i * 5) % 360;
        
        // Fill based on audio level
        fill(currentHue, 100, map(level, 0, 255, 30, 100)); 
        
        // Draw the circle/shape
        ellipse(x, y, size, size);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// NOTE: Request microphone access on mouse press
function mousePressed() {
    // Ensure the sketch is running and the user interaction starts the audio
    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }
}