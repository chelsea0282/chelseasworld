// Global variable to track the current screen (State Management)
// 0: Home/Schedule, 1: Waking Up, 2: Working Out, 3: Eating Healthy, 
// 4: Work Meetings, 5: Classwork, 6: Sleeping Well
let gameState = 0;
let gameTimer = 0;
let gameScore = 0;
let gameActive = false; // Tracks if the mini-game is currently running or ended

// --- GAME 6 VARIABLES (Sleep) ---
let sleepDepth = 0; // 0 is top, height is bottom
let sleepVelocity = 0;
let sleepTargetZoneY = 0;
let sleepTargetZoneH = 100;

// --- GAME 1 VARIABLES (Morning Routine) ---
let wakePlayer = { x: 50, y: 400, s: 20 };
let wakeItems = []; // Array to store item objects
let wakeObstacles = [];

// --- GAME 2 VARIABLES (Workout) ---
let repCount = 0;
let repGoal = 20;

// --- GAME 3 VARIABLES (Eating) ---
let plate = { protein: 0, veg: 0, carb: 0 };
let foodButtons = [];

// --- GAME 4 VARIABLES (Meeting Maze) ---
let mazePlayer = { x: 50, y: 50, s: 20 };
let mazeWalls = [];
let mazeGoal = { x: 550, y: 400, w: 50, h: 50, label: "Room A" };

// --- GAME 5 VARIABLES (Classroom) ---
let teacherLooking = false;
let timeSinceLookChange = 0;
let snackProgress = 0;
let lookInterval = 120; // Frames until teacher switches state

// ------------------------------------------------------------------
// --- Setup Function: Runs once ---
function setup() {
  // Set a good size for the game window
  createCanvas(650, 500);
  rectMode(CENTER); // Makes it easier to center buttons
  textAlign(CENTER, CENTER); // Centers text within shapes
  // Define button data once for use in drawHome and mousePressed
  defineScheduleEvents();
}

// Data structure for the calendar view
let scheduleEvents = [];

function defineScheduleEvents() {
  // Event Order is now 1 to 6
  scheduleEvents = [
    // 1. Morning Prep: Soft, light, sunrise color
    { title: "Morning Prep", time: "6:00 AM", duration: "0.5h", gameId: 1, color: [255, 239, 213] }, // Pale Peach
    { title: "Exercise", time: "7:00 AM", duration: "1.5h", gameId: 2, color: [255, 160, 122] }, // Light Salmon
    { title: "Diet", time: "12:00 PM", duration: "1h", gameId: 3, color: [175, 220, 175] }, // Soft Sage Green
    { title: "Work Grind", time: "8:00 AM", duration: "9h", gameId: 4, color: [198, 203, 218] }, // Pale Lavender Gray
    { title: "School Grind", time: "5:00 PM", duration: "3h", gameId: 5, color: [135, 169, 215] }, // Medium Sky Blue
    { title: "Sleep", time: "10:00 PM", duration: "8h", gameId: 6, color: [47, 72, 88] }, // Dark Slate Blue
  ];
}


// ------------------------------------------------------------------
// --- Draw Function: Runs continuously ---
function draw() {
  // Clear the background every frame
  background(220); // Light gray background for all pages

  // Use a switch statement to manage state and call the correct drawing function
  switch (gameState) {
    case 0:
      drawHome();
      break;
    case 1:
      drawRoutineGame(); // Old Game 2: Waking Up
      break;
    case 2:
      drawWorkoutGame(); // Old Game 3: Working Out
      break;
    case 3:
      drawEatingGame(); // Old Game 4: Eating Healthy
      break;
    case 4:
      drawMeetingGame(); // Old Game 5: Work Meetings
      break;
    case 5:
      drawClassworkGame(); // Old Game 6: Classwork
      break;
    case 6:
      drawSleepGame(); // Old Game 1: Sleeping Well (moved to end of day)
      break;
  }
}

// ------------------------------------------------------------------
// --- Utility Function: Draw Back Button (Used in all 6 games) ---
function drawBackButton() {
  let btnX = 100;
  let btnY = 30;
  let btnW = 150;
  let btnH = 40;

  // The button's look changes slightly on mouse hover (better UX)
  if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
    mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
    fill(255, 100, 100); // Reddish on hover
  } else {
    fill(200); // Lighter gray
  }

  rect(btnX, btnY, btnW, btnH, 5); // Draw button rectangle
  fill(0);
  textSize(14);
  text("<- Back to Schedule", btnX, btnY);
}


// ------------------------------------------------------------------
// --- PAGE 0: HOME SCREEN (The Calendar Schedule) ------------------
// TODO: it would be fun to have this synced with my calendar so it actually updates real time as well
// ------------------------------------------------------------------
function drawHome() {
  // Header
  fill(50);
  textSize(25);
  text("Chelsea's Day", width / 2, 50);

  // Time Axis (left side)
  let yStart = 100;
  let yStep = 40;
  let timeAxisX = 90;
  let eventAreaX = (width + timeAxisX) / 2;
  let eventAreaW = width - timeAxisX - 20;

  textSize(12);
  textAlign(RIGHT, CENTER);
  text("6:00 AM", timeAxisX, yStart + 0 * yStep);
  text("9:00 AM", timeAxisX, yStart + 1.5 * yStep);
  text("12:00 PM", timeAxisX, yStart + 3 * yStep);
  text("3:00 PM", timeAxisX, yStart + 4.5 * yStep);
  text("6:00 PM", timeAxisX, yStart + 6 * yStep);
  text("9:00 PM", timeAxisX, yStart + 7.5 * yStep);

  // Divider line
  stroke(150);
  line(timeAxisX + 10, yStart - 20, timeAxisX + 10, yStart + 7.5 * yStep + 20);

  // Event Boxes (Schedule Games)
  textAlign(CENTER, CENTER);
  noStroke();

  let positions = [
    { y: yStart + 0 * yStep, h: 30 },     // Game 1: Waking Up
    { y: yStart + 1 * yStep, h: 80 },     // Game 2: Working Out
    { y: yStart + 2.75 * yStep, h: 50 },  // Game 3: Eating Healthy
    { y: yStart + 4.5 * yStep, h: 100 },  // Game 4: Work Meetings
    { y: yStart + 6.5 * yStep, h: 150 },  // Game 5: Classwork
    { y: yStart + 8.5 * yStep, h: 50 },   // Game 6: Sleeping Well (a visual summary of the night)
  ];
  
  for (let i = 0; i < scheduleEvents.length; i++) {
    let event = scheduleEvents[i];
    let pos = positions[i];
    
    // Check for hover state to change color
    let isHovering = mouseX > timeAxisX + 15 && mouseX < width - 10 &&
                     mouseY > pos.y - pos.h / 2 && mouseY < pos.y + pos.h / 2;

    let r = event.color[0] + (isHovering ? 20 : 0);
    let g = event.color[1] + (isHovering ? 20 : 0);
    let b = event.color[2] + (isHovering ? 20 : 0);
    
    // Draw event box
    fill(r, g, b);
    rect(eventAreaX, pos.y, eventAreaW, pos.h, 5);
    
    // Draw text
    fill(i === 5 ? 255 : 0); // Text is white for the dark Sleep block
    textSize(18);
    text(event.title, eventAreaX, pos.y - 10);
    textSize(12);
    text(event.time + " (" + event.duration + ")", eventAreaX, pos.y + 10);
  }
  
  // Save the calculated positions for use in mousePressed
  scheduleEvents.forEach((e, i) => e.pos = positions[i]);
}

// Helper to reset variables when starting a specific level
function initGame(level) {
  gameActive = true;
  gameTimer = 0;
  gameScore = 0;

  if (level === 1) { // Routine Setup
    wakePlayer = { x: 50, y: 400, s: 20 };
    wakeItems = [
      {x: 100, y: 100, collected: false, label: "Teeth"},
      {x: 300, y: 50, collected: false, label: "Clothes"},
      {x: 500, y: 300, collected: false, label: "Keys"},
      {x: 550, y: 50, collected: false, label: "Phone"}
    ];
    wakeObstacles = [
       {x: 200, y: 200, w: 100, h: 50, type: "Bed"},
       {x: 400, y: 350, w: 50, h: 50, type: "Alarm"}
    ];
  }
  else if (level === 2) { // Workout Setup
    repCount = 0;
    gameTimer = 600; // 10 seconds (assuming 60fps)
  }
  else if (level === 3) { // Eating Setup
    plate = { protein: 0, veg: 0, carb: 0 };
  }
  else if (level === 4) { // Meeting Setup
    mazePlayer = { x: 50, y: 50, s: 20 };
    mazeWalls = [
      {x: 200, y: 100, w: 20, h: 200},
      {x: 400, y: 300, w: 20, h: 200},
      {x: 300, y: 200, w: 200, h: 20}
    ];
  }
  else if (level === 5) { // Class Setup
    teacherLooking = false;
    snackProgress = 0;
    timeSinceLookChange = 0;
  }
  else if (level === 6) { // Sleep Setup
    sleepDepth = height / 2;
    sleepVelocity = 0;
    sleepTargetZoneY = height / 2;
  }
}

// ------------------------------------------------------------------
// --- PAGE 1: MINI-GAME 1 - Waking Up & Getting Ready (Routine) ----
// ------------------------------------------------------------------
function drawRoutineGame() {
  background(255, 230, 180); // Light Yellow (Sunrise)
  drawBackButton();
  
  // Player Movement (WASD or Arrows)
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) wakePlayer.x -= 3;
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) wakePlayer.x += 3;
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) wakePlayer.y -= 3;
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) wakePlayer.y += 3;

  // Draw Items
  let itemsLeft = 0;
  for (let item of wakeItems) {
    if (!item.collected) {
      itemsLeft++;
      fill(0, 0, 255);
      rect(item.x, item.y, 30, 30); // Draw item
      fill(0); textSize(12); text(item.label, item.x, item.y - 20);
      
      // Collision Player <-> Item
      if (dist(wakePlayer.x, wakePlayer.y, item.x, item.y) < 25) {
        item.collected = true;
      }
    }
  }

  // Draw Obstacles
  for (let obs of wakeObstacles) {
    fill(100);
    rect(obs.x, obs.y, obs.w, obs.h);
    fill(255); text(obs.type, obs.x, obs.y);
    // Simple slowdown if touching obstacle (not full collision for now)
    if (dist(wakePlayer.x, wakePlayer.y, obs.x, obs.y) < (obs.w/2 + 10)) {
       fill(255,0,0); text("Slowed Down!", wakePlayer.x, wakePlayer.y - 30);
    }
  }

  // Draw Player
  fill(50, 200, 50);
  ellipse(wakePlayer.x, wakePlayer.y, wakePlayer.s, wakePlayer.s);

  fill(0); textSize(20);
  if (itemsLeft === 0) {
    text("Ready to go! (Game Over)", width/2, height/2);
  } else {
    text("Goal: Complete the morning tasks! Items left: " + itemsLeft, width/2, 50);
  }
}

// ------------------------------------------------------------------
// --- PAGE 2: MINI-GAME 2 - Working Out (Button Mash) --------------
// ------------------------------------------------------------------
function drawWorkoutGame() {
  background(255, 100, 100); // Red (Energy)
  drawBackButton();

  if (!gameActive) {
    fill(255); textSize(30); text(repCount >= repGoal ? "Great Workout!" : "Try Harder!", width/2, height/2); return;
  }
  
  gameTimer--;
  if (gameTimer <= 0) gameActive = false;

  fill(255);
  textSize(30);
  text("Press LEFT and RIGHT arrow fast!", width/2, 100);
  text("Time Left: " + floor(gameTimer/60), width/2, 150);
  
  // Progress Bar
  noFill(); stroke(255); strokeWeight(3);
  rect(width/2, height/2, 300, 50);
  
  noStroke(); fill(255, 255, 0);
  let barWidth = map(repCount, 0, repGoal, 0, 300);
  if (barWidth > 300) barWidth = 300;
  rect(width/2 - 150 + barWidth/2, height/2, barWidth, 40); // Fill bar

  fill(0);
  text("Reps: " + repCount + " / " + repGoal, width/2, height/2);
}

// ------------------------------------------------------------------
// --- PAGE 3: MINI-GAME 3 - Eating Healthy (Selection) -------------
// ------------------------------------------------------------------
function drawEatingGame() {
  background(150, 250, 150); // Green (Healthy)
  drawBackButton();

  textSize(24); fill(0);
  text("Build a Balanced Plate", width/2, 80);
  text("Click the buttons below to select your meal", width/2, 110);
  
  // Display Plate Stats
  textSize(20);
  text("Proteins: " + plate.protein, 150, 250);
  text("Carbs: " + plate.carb, 325, 250);
  text("Veggies: " + plate.veg, 500, 250);

  // Draw Buttons (We draw them here, interaction is in mousePressed)
  fill(255, 100, 100); rect(150, 300, 100, 40); fill(0); text("Add Meat", 150, 300);
  fill(255, 200, 100); rect(325, 300, 100, 40); fill(0); text("Add Rice", 325, 300);
  fill(100, 255, 100); rect(500, 300, 100, 40); fill(0); text("Add Salad", 500, 300);

  // Evaluate
  let total = plate.protein + plate.carb + plate.veg;
  if (total > 0) {
    if (plate.veg >= plate.carb && plate.protein >= 2) {
       fill(0, 100, 0); text("Status: Healthy Balance! (Goal Met)", width/2, 400);
    } else {
       fill(150, 0, 0); text("Status: Need more Veggies/Protein!", width/2, 400);
    }
  }
}

// ------------------------------------------------------------------
// --- PAGE 4: MINI-GAME 4 - Work Meetings (Maze) -------------------
// ------------------------------------------------------------------
function drawMeetingGame() {
  background(180); // Medium Gray (Office)
  drawBackButton();

  textSize(20); fill(0);
  text("Goal: Navigate the office to find the meeting room! (Room A)", width/2, 80);
  
  // Draw Goal
  fill(0, 255, 255);
  rect(mazeGoal.x, mazeGoal.y, mazeGoal.w, mazeGoal.h);
  fill(0); text(mazeGoal.label, mazeGoal.x, mazeGoal.y);
  
  // Draw Walls
  fill(50);
  for(let w of mazeWalls) {
    rect(w.x, w.y, w.w, w.h);
  }
  
  // Move Player
  if (keyIsDown(LEFT_ARROW)) mazePlayer.x -= 2;
  if (keyIsDown(RIGHT_ARROW)) mazePlayer.x += 2;
  if (keyIsDown(UP_ARROW)) mazePlayer.y -= 2;
  if (keyIsDown(DOWN_ARROW)) mazePlayer.y += 2;
  
  // Simple Wall Collision (Reset if hit wall)
  for(let w of mazeWalls) {
    if (dist(mazePlayer.x, mazePlayer.y, w.x, w.y) < 30) { // Rough check
       mazePlayer.x = 50; mazePlayer.y = 50; // Reset
    }
  }
  
  // Draw Player
  fill(0, 0, 200);
  ellipse(mazePlayer.x, mazePlayer.y, mazePlayer.s, mazePlayer.s);
  
  // Win Check
  if (dist(mazePlayer.x, mazePlayer.y, mazeGoal.x, mazeGoal.y) < 30) {
    fill(0, 100, 0); textSize(40);
    text("Found it!", width/2, height/2);
  }
}

// ------------------------------------------------------------------
// --- PAGE 5: MINI-GAME 5 - Doing Classwork (Stealth) --------------
// ------------------------------------------------------------------
function drawClassworkGame() {
  background(100, 100, 200); // Dark Blue (Classroom)
  drawBackButton();

  timeSinceLookChange++;
  if (timeSinceLookChange > lookInterval) {
    teacherLooking = !teacherLooking;
    timeSinceLookChange = 0;
    lookInterval = random(60, 180); // Randomize timing
  }
  
  // Draw Teacher
  fill(teacherLooking ? 255 : 0, teacherLooking ? 0 : 255, 0); // Red if looking, Green if not
  ellipse(width/2, 150, 80, 80);
  fill(255);
  text(teacherLooking ? "TEACHER LOOKING!" : "Writing on board...", width/2, 150);
  
  // Instructions
  fill(255);
  text("Hold SPACE to eat snack when teacher isn't looking!", width/2, 400);
  
  // Progress Bar
  stroke(255); noFill(); rect(width/2, 300, 200, 30);
  noStroke(); fill(255, 165, 0); 
  rect(width/2 - 100 + (snackProgress), 300, snackProgress*2, 28);
  
  // Logic
  if (keyIsDown(32)) { // Spacebar
    if (teacherLooking) {
      fill(255, 0, 0); textSize(40);
      text("CAUGHT!", width/2, height/2);
      snackProgress = 0; // Reset progress punishment
    } else {
      snackProgress += 0.5;
    }
  }
  
  if (snackProgress >= 100) {
    fill(0, 255, 0); textSize(40);
    text("Delicious! (Goal Met)", width/2, height/2);
  }
}


// ------------------------------------------------------------------
// --- PAGE 6: MINI-GAME 6 - Sleeping Well (Balance) ----------------
// ------------------------------------------------------------------
function drawSleepGame() {
  background(20, 20, 70); // Dark Blue (Night)
  drawBackButton();
  
  if (!gameActive) {
    fill(255); textSize(30); 
    text(gameScore > 500 ? "Restful Sleep! :)" : "Insomnia... :(", width/2, height/2);
    return;
  }

  // Logic: "Gravity" pulls sleep depth down, UP arrow pushes it up
  sleepDepth += 1 + sin(frameCount * 0.05); 
  if (keyIsDown(UP_ARROW)) sleepDepth -= 3;
  if (keyIsDown(DOWN_ARROW)) sleepDepth += 3;
  
  // Boundary check
  if (sleepDepth < 0) sleepDepth = 0;
  if (sleepDepth > height) sleepDepth = height;

  // Draw Zones
  noStroke();
  fill(100, 255, 100, 100); // Green Target Zone (REM)
  rect(width/2, sleepTargetZoneY, width, sleepTargetZoneH);
  
  // Draw Player Marker
  fill(255);
  ellipse(width/2, sleepDepth, 30, 30);
  
  // Scoring
  if (abs(sleepDepth - sleepTargetZoneY) < sleepTargetZoneH / 2) {
    gameScore++;
    fill(0, 255, 0);
    text("In the Zone (REM/Deep)!", width/2, 100);
  } else {
    fill(255, 0, 0);
    text("Waking Up/Light Sleep!", width/2, 100);
  }
  
  fill(255);
  text("Goal: Use UP/DOWN Arrows to optimize sleep stages and stay in the Green Zone", width/2, 450);
  text("Sleep Score: " + gameScore, width - 100, 50);
  
  // End game condition (simple timer)
  if (frameCount % 600 === 0) gameActive = false;
}

// ------------------------------------------------------------------
// --- Input Handler: Mouse Click -----------------------------------
// ------------------------------------------------------------------
function mousePressed() {
  let timeAxisX = 80;

  // --- Logic for Home Screen (gameState = 0) ---
  if (gameState === 0) {
    let eventAreaW = width - timeAxisX - 20;
    let eventAreaX = (width + timeAxisX) / 2;
    
    for (let event of scheduleEvents) {
      if (event.pos) {
        let btnX = eventAreaX;
        let btnY = event.pos.y;
        let btnW = eventAreaW;
        let btnH = event.pos.h;
        
        // Check if mouse is over the calendar event box
        if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
            mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
          gameState = event.gameId; // Change to the corresponding game state (1-6)
          initGame(gameState);      // Initialize that game's variables
          break;
        }
      }
    }
  } 
  
  // --- Logic for Back Button (All other gameStates) ---
  else {
    let btnX = 100, btnY = 30, btnW = 150, btnH = 40;

    // Check if the "Back to Schedule" button was clicked
    if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
        mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
      gameState = 0; // Go back to Home
    }
    
    // Game 3 Specific Interaction (Eating Buttons)
    if (gameState === 3) {
      // Button positions defined by center points (150, 325, 500)
      if (dist(mouseX, mouseY, 150, 300) < 50) plate.protein++;
      if (dist(mouseX, mouseY, 325, 300) < 50) plate.carb++;
      if (dist(mouseX, mouseY, 500, 300) < 50) plate.veg++;
    }
  }
}

function keyPressed() {
  // Game 2 Specific Interaction (Workout)
  if (gameState === 2 && gameActive) {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      repCount++;
    }
  }
}