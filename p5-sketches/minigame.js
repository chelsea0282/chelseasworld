// Global variable to track the current screen
// 0: Home, 1: Sleep, 2: Routine, 3: Workout, 4: Eat, 5: Meeting, 6: Class
let gameState = 0;
let gameTimer = 0;
let gameScore = 0;
let gameActive = false; // Tracks if the mini-game is currently running or ended

// --- GAME 1 VARIABLES (Sleep) ---
let sleepDepth = 0; // 0 is top, height is bottom
let sleepVelocity = 0;
let sleepTargetZoneY = 0;
let sleepTargetZoneH = 100;

// --- GAME 2 VARIABLES (Morning Routine) ---
let wakePlayer = { x: 50, y: 400, s: 20 };
let wakeItems = []; // Array to store item objects
let wakeObstacles = [];

// --- GAME 3 VARIABLES (Workout) ---
let repCount = 0;
let repGoal = 20;

// --- GAME 4 VARIABLES (Eating) ---
let plate = { protein: 0, veg: 0, carb: 0 };
let foodButtons = [];

// --- GAME 5 VARIABLES (Meeting Maze) ---
let mazePlayer = { x: 50, y: 50, s: 20 };
let mazeWalls = [];
let mazeGoal = { x: 550, y: 400, w: 50, h: 50, label: "Room A" };

// --- GAME 6 VARIABLES (Classroom) ---
let teacherLooking = false;
let timeSinceLookChange = 0;
let snackProgress = 0;
let lookInterval = 120; // Frames until teacher switches state

// ------------------------------------------------------------------
// --- SETUP --------------------------------------------------------
// ------------------------------------------------------------------
function setup() {
  createCanvas(650, 500);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
}

// ------------------------------------------------------------------
// --- DRAW LOOP ----------------------------------------------------
// ------------------------------------------------------------------
function draw() {
  background(220);

  switch (gameState) {
    case 0: drawHome(); break;
    case 1: drawSleepGame(); break;
    case 2: drawRoutineGame(); break;
    case 3: drawWorkoutGame(); break;
    case 4: drawEatingGame(); break;
    case 5: drawMeetingGame(); break;
    case 6: drawClassworkGame(); break;
  }
}

// ------------------------------------------------------------------
// --- UTILITIES ----------------------------------------------------
// ------------------------------------------------------------------
function drawBackButton() {
  let btnX = 100, btnY = 30, btnW = 150, btnH = 40;
  
  if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
      mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
      fill(255, 100, 100);
  } else {
      fill(200);
  }
  rect(btnX, btnY, btnW, btnH, 5);
  fill(0);
  textSize(14);
  text("<- Back to Activities", btnX, btnY);
}

// Helper to reset variables when starting a specific level
function initGame(level) {
  gameActive = true;
  gameTimer = 0;
  gameScore = 0;
  
  if (level === 1) { // Sleep Setup
    sleepDepth = height / 2;
    sleepVelocity = 0;
    sleepTargetZoneY = height / 2;
  } 
  else if (level === 2) { // Routine Setup
    wakePlayer = { x: 50, y: 400, s: 20 };
    // Create simple items to collect
    wakeItems = [
      {x: 100, y: 100, collected: false, label: "Teeth"},
      {x: 300, y: 50, collected: false, label: "Clothes"},
      {x: 500, y: 300, collected: false, label: "Keys"},
      {x: 550, y: 50, collected: false, label: "Phone"}
    ];
    // Create obstacles (Alarm, Bed)
    wakeObstacles = [
       {x: 200, y: 200, w: 100, h: 50, type: "Bed"},
       {x: 400, y: 350, w: 50, h: 50, type: "Alarm"}
    ];
  }
  else if (level === 3) { // Workout Setup
    repCount = 0;
    gameTimer = 600; // 10 seconds (assuming 60fps)
  }
  else if (level === 4) { // Eating Setup
    plate = { protein: 0, veg: 0, carb: 0 };
  }
  else if (level === 5) { // Meeting Setup
    mazePlayer = { x: 50, y: 50, s: 20 };
    // Define some walls
    mazeWalls = [
      {x: 200, y: 100, w: 20, h: 200},
      {x: 400, y: 300, w: 20, h: 200},
      {x: 300, y: 200, w: 200, h: 20}
    ];
  }
  else if (level === 6) { // Class Setup
    teacherLooking = false;
    snackProgress = 0;
    timeSinceLookChange = 0;
  }
}

// ------------------------------------------------------------------
// --- HOME SCREEN --------------------------------------------------
// ------------------------------------------------------------------
function drawHome() {
  fill(50);
  textSize(45);
  text("A Day in My Life 🗓️", width / 2, height * 0.12);
  
  let titles = [
    "1. Sleep (Keep Balance)", 
    "2. Routine (Collect Items)", 
    "3. Workout (Mash Buttons)", 
    "4. Eat (Pick Nutrients)", 
    "5. Meetings (Maze)", 
    "6. Class (Sneak Snack)"
  ];

  for (let i = 0; i < titles.length; i++) {
    let y = height * 0.3 + i * 65;
    fill(150);
    rect(width/2, y, 350, 50, 10);
    fill(0);
    textSize(18);
    text(titles[i], width/2, y);
  }
}

// ------------------------------------------------------------------
// --- GAME 1: SLEEP (Balance) --------------------------------------
// ------------------------------------------------------------------
function drawSleepGame() {
  background(20, 20, 70);
  drawBackButton();
  
  if (!gameActive) {
    fill(255); textSize(30); 
    text(gameScore > 500 ? "Restful Sleep! :)" : "Insomnia... :(", width/2, height/2);
    return;
  }

  // Logic: "Gravity" pulls sleep depth down, UP arrow pushes it up
  // Random noise simulates changing sleep stages
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
    text("In the Zone!", width/2, 100);
  } else {
    fill(255, 0, 0);
    text("Waking Up!", width/2, 100);
  }
  
  fill(255);
  text("Use UP/DOWN Arrows to stay in Green", width/2, 450);
  text("Sleep Score: " + gameScore, width - 100, 50);
  
  // End game condition (simple timer)
  if (frameCount % 600 === 0) gameActive = false;
}

// ------------------------------------------------------------------
// --- GAME 2: ROUTINE (Collection) ---------------------------------
// ------------------------------------------------------------------
function drawRoutineGame() {
  background(255, 230, 180);
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
    text("Collect items: " + itemsLeft, width/2, 50);
  }
}

// ------------------------------------------------------------------
// --- GAME 3: WORKOUT (Button Mash) --------------------------------
// ------------------------------------------------------------------
function drawWorkoutGame() {
  background(255, 100, 100);
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
// --- GAME 4: EATING (Selection) -----------------------------------
// ------------------------------------------------------------------
function drawEatingGame() {
  background(150, 250, 150);
  drawBackButton();

  textSize(24); fill(0);
  text("Build a Balanced Plate", width/2, 80);
  text("Click the buttons below", width/2, 110);
  
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
       fill(0, 100, 0); text("Status: Healthy Balance!", width/2, 400);
    } else {
       fill(150, 0, 0); text("Status: Need more Veggies/Protein!", width/2, 400);
    }
  }
}

// ------------------------------------------------------------------
// --- GAME 5: MEETINGS (Maze) --------------------------------------
// ------------------------------------------------------------------
function drawMeetingGame() {
  background(180);
  drawBackButton();
  
  textSize(20); fill(0);
  text("Find Room A!", width/2, 80);
  
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
// --- GAME 6: CLASS (Stealth) --------------------------------------
// ------------------------------------------------------------------
function drawClassworkGame() {
  background(100, 100, 200);
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
  text(teacherLooking ? "LOOKING!" : "Writing on board...", width/2, 150);
  
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
    text("Delicious!", width/2, height/2);
  }
}

// ------------------------------------------------------------------
// --- INPUTS -------------------------------------------------------
// ------------------------------------------------------------------

function mousePressed() {
  // Logic for Home Screen selection
  if (gameState === 0) {
    let titlesLen = 6;
    for (let i = 0; i < titlesLen; i++) {
      let y = height * 0.3 + i * 65;
      if (mouseX > width/2 - 175 && mouseX < width/2 + 175 &&
          mouseY > y - 25 && mouseY < y + 25) {
        gameState = i + 1;
        initGame(gameState); // RESET the game when we enter it
      }
    }
  } 
  // Back Button Logic
  else {
    if (mouseX > 25 && mouseX < 175 && mouseY > 10 && mouseY < 50) {
      gameState = 0;
    }
    
    // Game 4 Specific Interaction (Eating Buttons)
    if (gameState === 4) {
      // Meat Button
      if (dist(mouseX, mouseY, 150, 300) < 50) plate.protein++;
      // Rice Button
      if (dist(mouseX, mouseY, 325, 300) < 50) plate.carb++;
      // Salad Button
      if (dist(mouseX, mouseY, 500, 300) < 50) plate.veg++;
    }
  }
}

function keyPressed() {
  // Game 3 Specific Interaction (Workout)
  if (gameState === 3 && gameActive) {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      repCount++;
    }
  }
}