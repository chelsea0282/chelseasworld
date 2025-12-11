// Global variable to track the current screen (State Management)
// 0: Home/Schedule, 1: Waking Up, 2: Working Out, 3: Eating Healthy, 
// 4: Work Meetings, 5: Classwork, 6: Sleeping Well
let gameState = 0;
let gameTimer = 0;
let gameScore = 0;
let gameActive = false; // Tracks if the mini-game is currently running
let gameComplete = false; // Tracks if the mini-game has ended (win/loss)
let chelseaImg;

// --- GAME 1 VARIABLES (Morning Routine) ---
let wakePlayer = { x: 50, y: 400, s: 20 };
let wakeItems = []; // Array to store item objects
let wakeObstacles = [];

// --- GAME 2 VARIABLES (Workout) ---
let repCount = 0;
let repGoal = 50;

// --- GAME 3 VARIABLES (Eating) ---
let plate = { protein: 0, veg: 0, carb: 0 };
let foodButtons = [];
let eatingGoalMet = false;

// --- GAME 4 VARIABLES (Meeting Maze) ---
let mazePlayer = { x: 50, y: 50, s: 20 };
let mazeWalls = [];
let mazeGoal = { x: 550, y: 400, w: 50, h: 50, label: "Room A" };
let mazeGoalMet = false;

// --- GAME 5 VARIABLES (Classroom) ---
let teacherLooking = false;
let timeSinceLookChange = 0;
let snackProgress = 0;
let lookInterval = 120; // Frames until teacher switches state
let classroomGoalMet = false;

// --- GAME 6 VARIABLES (Sleep) ---
let sleepDepth = 0; // 0 is top, height is bottom
let sleepVelocity = 0;
let sleepTargetZoneY = 0;
let sleepTargetZoneH = 100;

// --- Global Game Area Definition (Limited Interaction Box for Games) ---
const gameAreaRect = {
    x: 20, // Top-left x
    y: 120, // Top-left y 
    w: 610, // Width
    h: 360  // Height
};

function setup() {
  // Set a good size for the game window
  createCanvas(650, 500);
  rectMode(CENTER); // Makes it easier to center buttons
  textAlign(CENTER, CENTER); // Centers text within shapes
  // Define button data once for use in drawHome and mousePressed
  defineScheduleEvents();
  chelseaImg = loadImage('p5images/minigame_chelsea.png');
}

// Data structure for the calendar view
let scheduleEvents = [];

function defineScheduleEvents() {
  // Event Order needs to be sorted by time for calendar view
  scheduleEvents = [
    // Start times for sorting: 6:00 AM, 7:00 AM, 8:00 AM, 12:00 PM, 12:30 PM, 5:00 PM, 6:00 PM, 10:00 PM
    { title: "Morning Prep", time: "6:00 AM", duration: "0.5h", gameId: 1, color: [255, 239, 213] }, // Pale Peach
    { title: "Exercise", time: "7:00 AM", duration: "1h", gameId: 2, color: [255, 160, 122] }, // Light Salmon
    { title: "Work Grind AM", time: "8:00 AM", duration: "4h", gameId: 4, color: [198, 203, 218] }, // Pale Lavender Gray
    { title: "Meal", time: "12:00 PM", duration: "0.5h", gameId: 3, color: [175, 220, 175] }, // Soft Sage Green
    { title: "Work Grind PM", time: "12:30 PM", duration: "4.5h", gameId: 4, color: [198, 203, 218] }, // Pale Lavender Gray
    { title: "Meal", time: "5:00 PM", duration: "1h", gameId: 3, color: [175, 220, 175] }, // Soft Sage Green
    { title: "School Grind", time: "6:00 PM", duration: "3h", gameId: 5, color: [135, 169, 215] }, // Medium Sky Blue
    { title: "Sleep", time: "10:00 PM", duration: "8h", gameId: 6, color: [47, 72, 88] }, // Dark Slate Blue
  ];
  // Sort events by start time 
  scheduleEvents.sort((a, b) => {
    const timeToMinutes = (timeStr) => {
      let [time, ampm] = timeStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });
}


// ------------------------------------------------------------------
// --- Draw Function: Runs continuously ---
function draw() {
  // Clear the background every frame
  background(240); // Lighter background color

  // Use a switch statement to manage state and call the correct drawing function
  switch (gameState) {
    case 0:
      drawHome();
      break;
    case 1:
      drawRoutineGame(); // Morning Prep
      break;
    case 2:
      drawWorkoutGame(); // Exercise
      break;
    case 3:
      drawEatingGame(); // Meal
      break;
    case 4:
      drawMeetingGame(); // Work Grind
      break;
    case 5:
      drawClassworkGame(); // School Grind
      break;
    case 6:
      drawSleepGame(); // Sleep
      break;
  }
}

// ------------------------------------------------------------------
// --- Utility Function: Draw Back Button (Used in all 6 games) ---
function drawBackButton() {
  let btnX = 50; // Shifted left for better balance
  let btnY = 30;
  let btnW = 80; 
  let btnH = 30; 

  // Button hover UI
  if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
    mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
    fill(150); // Lighter reddish on hover
  } else {
    fill(200); // Lighter gray
  }

  rect(btnX, btnY, btnW, btnH, 5); // Draw button rectangle
  fill(0);
  textSize(14);
  text("< Schedule", btnX, btnY);
}


// ------------------------------------------------------------------
// --- PAGE 0: HOME SCREEN (The Calendar Schedule) ------------------
// ------------------------------------------------------------------
function drawHome() {
    // --- 1. Header (Date and Title) ---
    textAlign(CENTER, CENTER); // Ensure header text is centered
    fill(50);
    textSize(24);
    text("Chelsea's Day", width / 2, 30);
    textSize(16);
    text("Monday, Dec 7", width / 2, 55); 
     
    // --- 2. Define Layout and Scale ---
    let timeColW = 70; // Width of the time column
    let scheduleXStart = timeColW + 10; // Start of the event area
    let scheduleW = width - scheduleXStart - 10;
    let scheduleYStart = 80;
    let scheduleYEnd = height - 10;
    let scheduleH = scheduleYEnd - scheduleYStart;

    // The schedule display spans from 6:00 AM to 11:00 PM (17 hours)
    let startHour = 6;
    let totalHours = 17; 
    let pixelsPerHour = scheduleH / totalHours; // Vertical height per hour

    // Draw main schedule background (The white calendar area)
    fill(255); // White background
    noStroke();
    rect(scheduleXStart + scheduleW / 2, scheduleYStart + scheduleH / 2, scheduleW, scheduleH);
    
    // --- 3. Draw Time Axis and Grid Lines ---
    fill(50);
    textSize(12);
    textAlign(RIGHT, CENTER); // Time labels on the left are right-aligned
    
    for (let h = 0; h <= totalHours; h++) {
        let y = scheduleYStart + h * pixelsPerHour;
        let currentHour = startHour + h; 

        // Format time 
        let timeLabel;
        if (currentHour < 12) {
            timeLabel = currentHour + ":00 AM";
        } else if (currentHour === 12) {
            timeLabel = "12:00 PM";
        } else if (currentHour <= 23) {
            timeLabel = (currentHour - 12) + ":00 PM";
        } else { 
            timeLabel = "12:00 AM"; 
        }
        
        // Draw time label
        noStroke();
        fill(50);
        text(timeLabel, timeColW - 5, y); 

        // Draw horizontal grid line 
        stroke(220); // Light gray line
        line(scheduleXStart, y, scheduleXStart + scheduleW, y);
    }

    // --- 4. Draw Event Blocks ---
    
    // Helper function to convert time string to minutes from midnight
    const timeToMinutes = (timeStr) => {
      let [time, ampm] = timeStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (ampm === "PM" && h !== 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };

    let startRefMin = startHour * 60; // 6:00 AM in minutes

    for (let event of scheduleEvents) {
        // Get start and duration in minutes
        let eventStartMin = timeToMinutes(event.time);
        let startOffsetMin = eventStartMin - startRefMin; // Minutes from 6:00 AM

        let durationString = event.duration.replace('h', '');
        let eventDurationMin = parseFloat(durationString) * 60;

        // Convert minutes to Y-coordinate and Height
        let eventY = scheduleYStart + (startOffsetMin / 60) * pixelsPerHour;
        let eventH = (eventDurationMin / 60) * pixelsPerHour;

        // Check bounds (don't draw events that start/end outside the displayed schedule)
        if (eventY + eventH < scheduleYStart || eventY > scheduleYEnd) continue;


        // Check for hover state
        let isHovering = mouseX > scheduleXStart && mouseX < scheduleXStart + scheduleW &&
                         mouseY > eventY && mouseY < eventY + eventH;

        // Draw Event Box (Simple color block)
        let r = event.color[0];
        let g = event.color[1];
        let b = event.color[2];
        
        // Fill: Lighter color with FULL OPACITY (230) to fix blurriness
        fill(r, g, b, isHovering ? 255 : 230); 
        
        noStroke(); 
        
        // Calculate default block positioning and width
        let currentW = scheduleW - 4; // Full width
        let rectCenterX = scheduleXStart + scheduleW / 2;
        let rectCenterY = eventY + eventH / 2;
        
        // Draw the main rectangle with rounded corners
        rect(rectCenterX, rectCenterY, currentW, eventH - 2, 5); 
        
        // Draw Event Text
        fill(event.gameId === 6 ? 255 : 0); // White text for dark Sleep block, black for others
        noStroke();
        textSize(14);
        
        // Combined Title and Time/Duration on one line
        let eventText = event.title + " — " + event.time + " (" + event.duration + ")";
        
        let textY;
        let textX = scheduleXStart + 10;
        
        if (eventH < 30) {
            // For small blocks, center the text vertically
            textAlign(LEFT, CENTER);
            textY = rectCenterY;
        } else {
            // For larger blocks, keep text near the top
            textAlign(LEFT, TOP);
            textY = eventY + 10;
        }
        
        text(eventText, textX, textY); 

        // Save position data for mousePressed to work
        event.pos = { 
            x: rectCenterX, 
            y: eventY, 
            w: currentW, 
            h: eventH 
        };
    }
}

// Helper to reset variables when starting a specific level
function initGame(level) {
  gameActive = true;
  gameComplete = false; // Reset completion status
  gameTimer = 0;
  gameScore = 0;
  
  // Reset goal-specific flags
  eatingGoalMet = false;
  mazeGoalMet = false;
  classroomGoalMet = false;

  if (level === 1) { // Routine Setup
    gameTimer = 300; // 5 seconds (for 60fps)
    wakePlayer = { x: gameAreaRect.x + 0, y: gameAreaRect.y - 20 + gameAreaRect.h - 20, s: 20 };
    wakeItems = generateRandomWakeItems();
    wakeObstacles = [
       {x: gameAreaRect.x + 200, y: gameAreaRect.y + 130, w: 100, h: 50, type: "Bed"},
       {x: gameAreaRect.x + 400, y: gameAreaRect.y + 280, w: 50, h: 50, type: "Phone"}
    ];
  }
  else if (level === 2) { // Workout Setup
    repCount = 0;
    gameTimer = 300; // 5 seconds (for 60fps)
  }
  else if (level === 3) { // Eating Setup
    plate = { protein: 0, veg: 0, carb: 0 };
  }
  else if (level === 4) { // Meeting Setup
    mazePlayer = { x: gameAreaRect.x + 20, y: gameAreaRect.y + 20, s: 20 };
    mazeWalls = generateRandomMazeWalls(4);
    mazeGoal = { x: gameAreaRect.x + gameAreaRect.w - 50, y: gameAreaRect.y + gameAreaRect.h - 50, w: 50, h: 50, label: "Room A" };
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

// --- Generates random item positions for Game 1 ---
function generateRandomWakeItems() {
    const items = ["Teeth", "Clothes", "Keys", "Badge"];
    const itemSize = 30;
    const minX = gameAreaRect.x + itemSize;
    const maxX = gameAreaRect.x + gameAreaRect.w - itemSize;
    const minY = gameAreaRect.y + itemSize;
    const maxY = gameAreaRect.y + gameAreaRect.h - itemSize;
    
    let newItems = [];
    
    for (let label of items) {
        let x = random(minX, maxX);
        let y = random(minY, maxY);
        newItems.push({
            x: x, 
            y: y, 
            collected: false, 
            label: label
        });
    }
    return newItems;
}

// --- Generates random wall placements for Game 4 ---
function generateRandomMazeWalls(count = 4) {
    let newWalls = [];
    const minW = 100;
    const minH = 100;
    const wallThickness = 20;
    
    for (let i = 0; i < count; i++) {
        let orientation = random() > 0.5 ? 'H' : 'V';
        let x, y, w, h;
        
        if (orientation === 'V') { // Vertical Wall
            w = wallThickness;
            h = random(minH, gameAreaRect.h * 0.7);
            x = random(gameAreaRect.x + w / 2, gameAreaRect.x + gameAreaRect.w - w / 2);
            y = random(gameAreaRect.y + h / 2, gameAreaRect.y + gameAreaRect.h - h / 2);
        } else { // Horizontal Wall
            w = random(minW, gameAreaRect.w * 0.7);
            h = wallThickness;
            x = random(gameAreaRect.x + w / 2, gameAreaRect.x + gameAreaRect.w - w / 2);
            y = random(gameAreaRect.y + h / 2, gameAreaRect.y + gameAreaRect.h - h / 2);
        }
        
        newWalls.push({x: x, y: y, w: w, h: h});
    }
    return newWalls;
}

// Function to draw the completion button (Replay or Next)
function drawCompletionButtons(success) {
    let btnX = width / 2;
    let btnY = height / 2 + 100;
    let btnW = 200;
    let btnH = 50;

    let btnColor;
    let btnText;

    if (success) {
        btnColor = [100, 200, 100]; // Green for Win
        btnText = "Go to Next Task ->";
    } 
    else {
        btnColor = [200, 100, 190]; // Red for Lose/Replay
        btnText = "Replay Task";
    }

    // Check for hover state
    if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
        mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
        fill(btnColor[0] + 20, btnColor[1] + 20, btnColor[2] + 20); 
    } 
    else {
        fill(btnColor);
    }

    rect(btnX, btnY, btnW, btnH, 5);
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(btnText, btnX, btnY);

    // Save position for mousePressed
    return { x: btnX, y: btnY, w: btnW, h: btnH, success: success };
}


// ------------------------------------------------------------------
// --- PAGE 1: MINI-GAME 1 - Waking Up & Getting Ready (Routine) ----
// ------------------------------------------------------------------
function drawRoutineGame() {
  // Background matches Morning Prep: [255, 239, 213] (Pale Peach)
  background(255, 239, 213);
  drawBackButton();
  
  textAlign(CENTER, CENTER);
  
  // Goal Text
  textSize(24); // Main Title Size
  text("Goal: Complete the morning tasks!", width/2, 50);
  
  // Draw Interaction Box Boundary
  noFill(); 
  stroke(100); 
  strokeWeight(2);
  rect(gameAreaRect.x + gameAreaRect.w/2, gameAreaRect.y + gameAreaRect.h/2, gameAreaRect.w, gameAreaRect.h);

  // Player Movement (WASD or Arrows) - Limited to the Game Area
  if (!gameComplete) {
      if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) wakePlayer.x -= 3;
      if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) wakePlayer.x += 3;
      if (keyIsDown(UP_ARROW) || keyIsDown(87)) wakePlayer.y -= 3;
      if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) wakePlayer.y += 3;
      
      // Keep player inside the bounds
      wakePlayer.x = constrain(wakePlayer.x, gameAreaRect.x + wakePlayer.s/2, gameAreaRect.x + gameAreaRect.w - wakePlayer.s/2);
      wakePlayer.y = constrain(wakePlayer.y, gameAreaRect.y + wakePlayer.s/2, gameAreaRect.y + gameAreaRect.h - wakePlayer.s/2);
  }

    // --- DRAW ITEMS ---
    let uncollectedCount = 0; // Use a distinct variable name
    for (let item of wakeItems) {
        if (!item.collected) {
            uncollectedCount++;
            fill(0, 0, 255);
            rect(item.x, item.y, 30, 30); // Draw item
            fill(0); 
            textSize(14); 
            text(item.label, item.x, item.y - 20);
      
            // Collision Player <-> Item
            if (!gameComplete && dist(wakePlayer.x, wakePlayer.y, item.x, item.y) < 25) {
                item.collected = true;
            }
        }
    }

  // Draw Obstacles (omitted for brevity)
  for (let obs of wakeObstacles) {
    fill(100);
    rect(obs.x, obs.y, obs.w, obs.h);
    fill(255); textSize(14); text(obs.type, obs.x, obs.y); 
    if (!gameComplete && dist(wakePlayer.x, wakePlayer.y, obs.x, obs.y) < (obs.w/2 + 10)) {
       fill(255,0,0); textSize(14); text("Slowed Down!", wakePlayer.x, wakePlayer.y - 30);
    }
  }

    // --- WIN CONDITION CHECK (FIXED) ---
    // Check if the final count is zero and the game hasn't ended yet
    if (uncollectedCount === 0 && !gameComplete) {
        gameActive = false;
        gameComplete = true; 
    } 

  // Draw Player
  if (chelseaImg) {
    image(chelseaImg, wakePlayer.x, wakePlayer.y, wakePlayer.s * 2, wakePlayer.s * 2);
  } else {
    fill(50, 200, 50);
    ellipse(wakePlayer.x, wakePlayer.y, wakePlayer.s, wakePlayer.s);
  }

    // --- DRAW UI BASED ON GAME STATE (FIXED LOGIC) ---
    if (gameComplete) {
      // The win condition is simply that the game ended (because only wins trigger this block in the logic above)
      // We use uncollectedCount for the final status check
      let win = uncollectedCount === 0; 
      background(255, 239, 213);
      fill(50); 
      textSize(24); 
      drawBackButton();
      text("You're ready to start the day!", width/2, height/2 - 50);
      drawCompletionButtons(win);
      return;
    }

    // Secondary text (Drawn only if game is active/not complete)
    fill(0);
    textSize(16);
    let collectedCount = wakeItems.length - uncollectedCount;
    text(`Progress: ${collectedCount} / ${wakeItems.length} collected`, width/2, 80);
}

// ------------------------------------------------------------------
// --- PAGE 2: MINI-GAME 2 - Working Out (Button Mash) --------------
// ------------------------------------------------------------------
function drawWorkoutGame() {
  background(255, 160, 122);
  drawBackButton();

  textAlign(CENTER, CENTER); 

  if (!gameActive && !gameComplete) {
    // Game just ended due to timer
    gameComplete = true;
  }
  
  if (gameComplete) {
    let win = repCount >= repGoal;
    fill(50); 
    textSize(24); // Main Title Size
    text(win ? "Great Workout!" : "Try Harder!", width/2, height/2 - 50);
    drawCompletionButtons(win);
    return;
  }
  
  gameTimer--;
  if (gameTimer <= 0) gameActive = false;

  fill(50);
  textSize(24); // Main Title Size
  text("Press LEFT and RIGHT arrow fast!", width/2, 100); 
  
  fill(0);
  textSize(16); // Sub-header/Calendar Size
  text("Time Left: " + floor(gameTimer/60) + " seconds", width/2, 150);
  
  // Draw Interaction Box Boundary (Visual aid, movement is limited by logic)
  noFill(); 
  stroke(255); 
  strokeWeight(2);
  rect(gameAreaRect.x + gameAreaRect.w/2, gameAreaRect.y + gameAreaRect.h/2, gameAreaRect.w, gameAreaRect.h);
  
  // Progress Bar (Visual area is not constrained, but limit logic is active)
  noFill(); 
  stroke(255); 
  strokeWeight(3);
  rect(width/2, height/2, 300, 50);
  
  noStroke(); fill(255, 255, 0);
  let barWidth = map(repCount, 0, repGoal, 0, 300);
  if (barWidth > 300) barWidth = 300;
  rect(width/2 - 150 + barWidth/2, height/2, barWidth, 40); 

  fill(0);
  textSize(16); // Sub-header/Calendar Size
  text("Reps: " + repCount + " / " + repGoal, width/2, height/2); 
}

// ------------------------------------------------------------------
// --- PAGE 3: MINI-GAME 3 - Eating Healthy (Selection) -------------
// ------------------------------------------------------------------
function drawEatingGame() {
  // Background matches Meal: [175, 220, 175] (Soft Sage Green)
  background(175, 220, 175);
  drawBackButton();

  textAlign(CENTER, CENTER);

  // Check goal status every frame
  eatingGoalMet = plate.veg >= plate.carb && plate.protein >= 2; 

  if (gameComplete) {
      fill(50); 
      textSize(24); // Main Title Size
      text("Meal Selection Complete", width/2, height/2 - 50);
      drawCompletionButtons(eatingGoalMet);
      return;
  }

  textSize(24); fill(50); // Main Title Size
  text("Build a Balanced Plate", width/2, 80); 
  
  textSize(16); fill(0); // Sub-header/Calendar Size
  text("Click the buttons below to select your meal", width/2, 110); 
  
  // Draw Interaction Box Boundary (Visual aid, movement is limited by logic)
  noFill(); stroke(100); strokeWeight(2);
  rect(gameAreaRect.x + gameAreaRect.w/2, gameAreaRect.y + gameAreaRect.h/2, gameAreaRect.w, gameAreaRect.h);
  
  // Display Plate Stats
  textSize(16); // Sub-header/Calendar Size
  fill(0);
  text("Proteins: " + plate.protein, 150, 250); 
  text("Carbs: " + plate.carb, 325, 250);
  text("Veggies: " + plate.veg, 500, 250);

  // Draw Buttons
  fill(255, 100, 100); rect(150, 300, 100, 40); fill(0); textSize(14); text("Add Meat", 150, 300);
  fill(255, 200, 100); rect(325, 300, 100, 40); fill(0); textSize(14); text("Add Rice", 325, 300);
  fill(100, 255, 100); rect(500, 300, 100, 40); fill(0); textSize(14); text("Add Salad", 500, 300);

  // Evaluate
  let total = plate.protein + plate.carb + plate.veg;
  if (total > 0) {
    fill(0); // Ensure text color is set
    textSize(16);
    if (eatingGoalMet) {
       fill(0, 100, 0); text("Status: Healthy Balance! (Ready to end)", width/2, 400); 
       gameActive = false;
        gameComplete = true;
    } else {
       fill(150, 0, 0); text("Status: Need more Veggies/Protein!", width/2, 400); 
    }
  }
}

// ------------------------------------------------------------------
// --- PAGE 4: MINI-GAME 4 - Work Meetings (Maze) -------------------
// ------------------------------------------------------------------
function drawMeetingGame() {
  // Background matches Work Grind: [198, 203, 218] (Pale Lavender Gray)
  background(198, 203, 218);
  drawBackButton();

  textAlign(CENTER, CENTER);
  
  // Draw Interaction Box Boundary
  noFill(); stroke(100); strokeWeight(2);
  rect(gameAreaRect.x + gameAreaRect.w/2, gameAreaRect.y + gameAreaRect.h/2, gameAreaRect.w, gameAreaRect.h);

  // Check for win
  if (!gameComplete && dist(mazePlayer.x, mazePlayer.y, mazeGoal.x, mazeGoal.y) < 30) {
    mazeGoalMet = true;
    gameComplete = true;
    gameActive = false;
  }
  
  if (gameComplete) {
    fill(50); 
    textSize(24); // Main Title Size
    text("Meeting Room Found! (Goal Met)", width/2, height/2 - 50);
    drawCompletionButtons(mazeGoalMet);
    return;
  }


  textSize(24); fill(50); // Main Title Size
  text("Goal: Navigate the office to find the meeting room!", width/2, 80);
  
  // Draw Goal
  fill(0, 255, 255);
  rect(mazeGoal.x, mazeGoal.y, mazeGoal.w, mazeGoal.h);
  fill(0); textSize(14); text(mazeGoal.label, mazeGoal.x, mazeGoal.y);
  
  // Draw Walls (Limited to game area, coordinates adjusted in initGame)
  fill(50);
  for(let w of mazeWalls) {
    rect(w.x, w.y, w.w, w.h);
  }
  
  // Move Player
  if (gameActive) {
      if (keyIsDown(LEFT_ARROW)) mazePlayer.x -= 2;
      if (keyIsDown(RIGHT_ARROW)) mazePlayer.x += 2;
      if (keyIsDown(UP_ARROW)) mazePlayer.y -= 2;
      if (keyIsDown(DOWN_ARROW)) mazePlayer.y += 2;
      
      // Keep player inside the bounds
      mazePlayer.x = constrain(mazePlayer.x, gameAreaRect.x + mazePlayer.s/2, gameAreaRect.x + gameAreaRect.w - mazePlayer.s/2);
      mazePlayer.y = constrain(mazePlayer.y, gameAreaRect.y + mazePlayer.s/2, gameAreaRect.y + gameAreaRect.h - mazePlayer.s/2);
      
      // Simple Wall Collision (Reset if hit wall)
      for(let w of mazeWalls) {
        if (dist(mazePlayer.x, mazePlayer.y, w.x, w.y) < 30) { // Rough check
            mazePlayer.x = gameAreaRect.x + 20; mazePlayer.y = gameAreaRect.y + 20; // Reset to start
        }
      }
  }

  // Draw Player
  fill(0, 0, 200);
  ellipse(mazePlayer.x, mazePlayer.y, mazePlayer.s, mazePlayer.s);
}

// ------------------------------------------------------------------
// --- PAGE 5: MINI-GAME 5 - Doing Classwork (Stealth) --------------
// ------------------------------------------------------------------
function drawClassworkGame() {
  // Background matches School Grind: [135, 169, 215] (Medium Sky Blue)
  background(135, 169, 215);
  drawBackButton();

  textAlign(CENTER, CENTER);

  // Win condition check
  if (!gameComplete && snackProgress >= 100) {
    classroomGoalMet = true;
    gameComplete = true;
    gameActive = false;
  }
  
  if (gameComplete) {
    fill(50); 
    textSize(24); // Main Title Size
    text("Delicious! (Goal Met)", width/2, height/2 - 50);
    drawCompletionButtons(classroomGoalMet);
    return;
  }
  
  // Draw Interaction Box Boundary (Visual aid, movement is limited by logic)
  noFill(); stroke(200); strokeWeight(2);
  rect(gameAreaRect.x + gameAreaRect.w/2, gameAreaRect.y + gameAreaRect.h/2, gameAreaRect.w, gameAreaRect.h);

  if (gameActive) {
      timeSinceLookChange++;
      if (timeSinceLookChange > lookInterval) {
        teacherLooking = !teacherLooking;
        timeSinceLookChange = 0;
        lookInterval = random(60, 180); // Randomize timing
      }
  }
  
  // Instructions Title (Matching Home Screen)
  fill(50);
  textSize(24);
  text("Goal: Sneak a Snack!", width/2, 80);
  
  // Draw Teacher (Centered above the game area)
  fill(teacherLooking ? 255 : 0, teacherLooking ? 0 : 255, 0); // Red if looking, Green if not
  ellipse(width/2, 150, 80, 80);
  fill(255);
  textSize(16); // Sub-header/Calendar Size
  text(teacherLooking ? "TEACHER LOOKING!" : "Writing on board...", width/2, 150);
  
  // Instructions
  fill(255);
  textSize(16); // Sub-header/Calendar Size
  text("Hold SPACE to eat snack when teacher isn't looking!", width/2, 400);
  
  // Progress Bar (inside game area, centered)
  stroke(255); noFill(); rect(width/2, gameAreaRect.y + gameAreaRect.h/2, 200, 30);
  noStroke(); fill(255, 165, 0); 
  rect(width/2 - 100 + (snackProgress), gameAreaRect.y + gameAreaRect.h/2, snackProgress*2, 28);
  
  // Logic
  if (gameActive && keyIsDown(32)) { // Spacebar
    if (teacherLooking) {
      fill(255, 0, 0); textSize(16); // Use smaller text size
      text("CAUGHT!", width/2, height/2);
      snackProgress = 0; // Reset progress punishment
    } else {
      snackProgress += 0.5;
    }
  }
}


// ------------------------------------------------------------------
// --- PAGE 6: MINI-GAME 6 - Sleeping Well (Balance) ----------------
// ------------------------------------------------------------------
function drawSleepGame() {
  // Background matches Sleep: [47, 72, 88] (Dark Slate Blue)
  background(47, 72, 88);
  drawBackButton();

  textAlign(CENTER, CENTER);
  
  // End game condition check
  if (gameActive && frameCount % 600 === 0) {
      gameActive = false;
      gameComplete = true;
  }
  
  if (gameComplete) {
    let win = gameScore > 500;
    fill(255); 
    textSize(24); // Main Title Size
    text(win ? "Restful Sleep! :)" : "Insomnia... :(", width/2, height/2 - 50);
    drawCompletionButtons(win);
    return;
  }
  
  // Draw Interaction Box Boundary (Visual aid)
  noFill(); stroke(200); strokeWeight(2);
  rect(gameAreaRect.x + gameAreaRect.w/2, gameAreaRect.y + gameAreaRect.h/2, gameAreaRect.w, gameAreaRect.h);

  if (gameActive) {
      // Logic: "Gravity" pulls sleep depth down, UP arrow pushes it up
      sleepDepth += 1 + sin(frameCount * 0.05); 
      if (keyIsDown(UP_ARROW)) sleepDepth -= 3;
      if (keyIsDown(DOWN_ARROW)) sleepDepth += 3;
       
      // Boundary check
      sleepDepth = constrain(sleepDepth, gameAreaRect.y, gameAreaRect.y + gameAreaRect.h);

      // Scoring
      if (abs(sleepDepth - sleepTargetZoneY) < sleepTargetZoneH / 2) {
        gameScore++;
      }
  }

  // Draw Zones
  noStroke();
  fill(100, 255, 100, 100); // Green Target Zone (REM)
  // Draw target zone centered in the game area horizontally, using Y from center of the area
  rect(gameAreaRect.x + gameAreaRect.w/2, sleepTargetZoneY, gameAreaRect.w, sleepTargetZoneH);
  
  // Draw Player Marker
  fill(255);
  ellipse(gameAreaRect.x + gameAreaRect.w/2, sleepDepth, 30, 30);
  
  // Status Text
  fill(255); // White text on dark background
  textSize(16); // Sub-header/Calendar Size
  if (abs(sleepDepth - sleepTargetZoneY) < sleepTargetZoneH / 2) {
    fill(0, 255, 0);
    text("In the Zone (REM/Deep)!", width/2, 100); 
  } else {
    fill(255, 0, 0);
    text("Waking Up/Light Sleep!", width/2, 100); 
  }
  
  fill(255); // White text on dark background
  textSize(16); // Sub-header/Calendar Size
  text("Goal: Use UP/DOWN Arrows to optimize sleep stages and stay in the Green Zone", width/2, 450);
  textAlign(RIGHT, CENTER);
  text("Sleep Score: " + gameScore, width - 10, 50); // Intentionally far right
}

// ------------------------------------------------------------------
// --- Input Handler: Mouse Click -----------------------------------
// ------------------------------------------------------------------
function mousePressed() {
  // We use scheduleXStart instead of timeAxisX to define the event area boundary
  let timeColW = 70;
  let scheduleXStart = timeColW + 10;
  let scheduleW = width - scheduleXStart - 10;


  // --- Logic for Home Screen (gameState = 0) ---
  if (gameState === 0) {
        // ITERATE BACKWARD to prioritize clicking the event drawn on top
    for (let i = scheduleEvents.length - 1; i >= 0; i--) {
            let event = scheduleEvents[i];

        if (event.pos) {
            // Use the dynamically calculated position and width/height
            let btnX = event.pos.x; // This is the calculated Center X from drawHome
            let btnY = event.pos.y + event.pos.h / 2;
            let btnW = event.pos.w;
            let btnH = event.pos.h;
            
            // Check if mouse is over the calendar event box
            if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
                mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
                gameState = event.gameId; // Change to the corresponding game state (1-6)
                initGame(gameState);      // Initialize that game's variables
                break;
            }
        }
    }
  } 
  
  // --- Logic for Back Button and Completion Buttons (All other gameStates) ---
  else {
    // Back Button Logic
    let backBtnX = 60, backBtnY = 30, backBtnW = 120, backBtnH = 30;
    if (mouseX > (backBtnX - backBtnW / 2) && mouseX < (backBtnX + backBtnW / 2) &&
        mouseY > (backBtnY - backBtnH / 2) && mouseY < (backBtnY + backBtnH / 2)) {
      gameState = 0; // Go back to Home
      return;
    }
    
    // Completion Button Logic (Only if game is complete)
    if (gameComplete) {
        // Calculate the button's position (defined in drawCompletionButtons)
        let btnX = width / 2;
        let btnY = height / 2 + 100;
        let btnW = 200;
        let btnH = 50;
        
        if (mouseX > (btnX - btnW / 2) && mouseX < (btnX + btnW / 2) &&
            mouseY > (btnY - btnH / 2) && mouseY < (btnY + btnH / 2)) {
            
            // Check win status of the current game
            let winStatus = false;
            if (gameState === 1) winStatus = wakeItems.filter(i => !i.collected).length === 0;
            if (gameState === 2) winStatus = repCount >= repGoal;
            if (gameState === 3) winStatus = eatingGoalMet;
            if (gameState === 4) winStatus = mazeGoalMet;
            if (gameState === 5) winStatus = classroomGoalMet;
            if (gameState === 6) winStatus = gameScore > 500;
            
            if (winStatus) {
                // WIN: Go to next game in the sequence
                // Find the index of the current game in the schedule (the first one)
                let currentEventIndex = -1;
                for(let i = 0; i < scheduleEvents.length; i++) {
                    if (scheduleEvents[i].gameId === gameState) {
                        currentEventIndex = i;
                        break;
                    }
                }
                
                // Find the next *unique* game event in the schedule
                let nextEvent = null;
                for(let i = currentEventIndex + 1; i < scheduleEvents.length; i++) {
                    // Check if the next event's gameId is different from the current one.
                    // This handles back-to-back similar events (like Meal or Work Grind).
                    if (scheduleEvents[i].gameId !== gameState || i === scheduleEvents.length - 1) {
                         nextEvent = scheduleEvents[i];
                         break;
                    }
                }
                
                if (nextEvent) {
                    gameState = nextEvent.gameId;
                    initGame(gameState);
                } else {
                    // Reached the end of the schedule (Game 6 is usually the last)
                    gameState = 0;
                }
            } else {
                // LOSS: Replay current game
                initGame(gameState);
            }
        }
    }
    
    // Game 3 Specific Interaction (Eating Buttons - only if game is active)
    if (gameState === 3 && gameActive) {
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