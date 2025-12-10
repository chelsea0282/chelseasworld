/*to improve on
1. separate out this into multiple different files
2. make the flowers sway
3. do i want to change the colors more
4. allow users to input their own data and see how it materializes (it can be just one go kind of a thing)
*/

// json data

const GARDEN_DATA = [
  // ROMANTIC DATES
  { id: "D1", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },
  { id: "D2", type: "romantic", agency: "them", ending: "bad", time: 3, connotation: 2, datenum: 1 },
  { id: "D3", type: "romantic", agency: "them", ending: "bad", time: 5, connotation: 3, datenum: 1 },
  { id: "D4", type: "romantic", agency: "me", ending: "good", time: 2, connotation: 2, datenum: 3 }, 
  { id: "D5", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },
  { id: "D6", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 2 },
  { id: "D7", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },
  { id: "D8", type: "romantic", agency: "NA", ending: "bad", time: 1, connotation: 1, datenum: 1 },
  { id: "D9", type: "romantic", agency: "me", ending: "bad", time: 4, connotation: 3, datenum: 4 }, 
  { id: "D10", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },
  { id: "D11", type: "romantic", agency: "NA", ending: "NA", time: 2, connotation: 1, datenum: 2 },
  { id: "D12", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 2, datenum: 1 }, 
  { id: "D13", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },
  { id: "D14", type: "romantic", agency: "ongoing", ending: "good", time: 5, connotation: 3, datenum: 8 }, 
  { id: "D15", type: "romantic", agency: "me", ending: "good", time: 3, connotation: 3, datenum: 5 }, 
  { id: "D16", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },
  { id: "D17", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },
  { id: "D18", type: "romantic", agency: "NA", ending: "NA", time: 1, connotation: 1, datenum: 1 },

  // PLATONIC DATES
  { id: "F1", type: "platonic", agency: "ongoing", ending: "good", time: 3, connotation: 3, datenum: 3 }, 
  { id: "F2", type: "platonic", agency: "ongoing", ending: "good", time: 3, connotation: 3, datenum: 2 }, 
  { id: "F3", type: "platonic", agency: "NA", ending: "NA", time: 3, connotation: 1, datenum: 1 },
  { id: "F4", type: "platonic", agency: "ongoing", ending: "good", time: 3, connotation: 2, datenum: 1 }, 
  { id: "F5", type: "platonic", agency: "ongoing", ending: "good", time: 3, connotation: 2, datenum: 1 }, 

  // SELF DATE
  { id: "S1", type: "self", agency: "ongoing", ending: "good", time: 5, connotation: 3, datenum: 3 } 
];

// variable set up
let PIXEL_SIZE = 4; // Smaller pixel size for fidelity
let PADDING_X = 50; 
let plants = [];
let grassColor;
let dropPadding = 100;
let RESERVATION_SIZE = 60; // Spacing to prevent overlap
let data_points = GARDEN_DATA; 
let totalPlants = data_points.length;
// Constant for extra stem height for blooms 
const BLOOM_PADDING = PIXEL_SIZE * 6; 

function setup() {
  createCanvas(600, 600);
  grassColor = color(104, 160, 72); 
  noStroke();
  angleMode(DEGREES); // Use degrees for easy rotation
  frameRate(30); 
  
  // Collision detection and random placement loop
  for (let i = 0; i < totalPlants; i++) {
    let newX, newY;
    let overlap = true;
    let attempts = 0;
    
    while (overlap && attempts < 1000) {
      newX = random(PADDING_X, width - PADDING_X);
      newY = random(dropPadding + PIXEL_SIZE, height - 50);
      
      newX = floor(newX / PIXEL_SIZE) * PIXEL_SIZE;
      newY = floor(newY / PIXEL_SIZE) * PIXEL_SIZE;
      
      overlap = false;
      
      for (let existingPlant of plants) {
        let d = dist(newX, newY, existingPlant.x, existingPlant.targetY);
        
        if (d < RESERVATION_SIZE) {
          overlap = true;
          break; 
        }
      }
      attempts++;
    }
    
    plants.push(new Datapoint(data_points[i], newX, newY));
  }
}

function draw() {
  background(grassColor); 
  
  for (let plant of plants) {
    plant.update();
    plant.display();
  }
}

// datapoint class
class Datapoint {
  constructor(data, targetX, targetY) { 
    this.data = data;
    this.x = targetX; 
    this.y = 0; 
    this.targetY = targetY; 
    
    this.isDropped = false;
    this.isSprouting = false;
    this.currentHeight = 0;
    
    //height of base is datenum
    let baseHeight = this.data.datenum * PIXEL_SIZE * 3;

    // add height for floor bloom to not hide leaves
    if (this.data.connotation > 1) {
        this.maxHeight = baseHeight + BLOOM_PADDING;
    } else {
        this.maxHeight = baseHeight;
    }
  }

  update() {
    if (!this.isDropped) {
      this.y += PIXEL_SIZE * 2; 
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.isDropped = true;
        this.isSprouting = true;
      }
    } 
    else if (this.isSprouting && this.currentHeight < this.maxHeight) {
      this.currentHeight += this.data.datenum / 8; 
      
      if (this.currentHeight >= this.maxHeight) {
        this.isSprouting = false;
      }
    }
  }

  display() {
    push();
    
    // A. Dropping Seed 
    if (!this.isDropped) {
      fill(139, 69, 19); 
      rect(this.x, this.y, PIXEL_SIZE, PIXEL_SIZE);
      pop();
      return;
    }
    
    // Check for Mouseover 
    let d = dist(mouseX, mouseY, this.x, this.targetY);
    let isMouseOver = d < RESERVATION_SIZE / 2; 
    
    // Translate to the plant's root position
    translate(this.x, this.targetY); 
    
    // Leaf placement logic: leafCount is now based on 'time' spent
    let leafCount = this.data.time;
    
    // Divide by leafCount + 1 to ensure the last leaf is drawn below maxHeight
    let leafInterval = this.maxHeight / (leafCount + 1); 

    // B. The Stem and Leaves 
    if (this.currentHeight > 0) {
      let stemColor, shadowColor;
      
      if (this.data.type === 'romantic') {
          // Romantic: Dark Green
          stemColor = color(0, 80, 0); 
          shadowColor = color(0, 50, 0); 
      } else if (this.data.type === 'platonic') {
          // Platonic: Standard Green
          stemColor = color(0, 150, 0);
          shadowColor = color(0, 100, 0); 
      } else if (this.data.type === 'self') {
          // Self/Personal: Brown
          stemColor = color(90, 45, 10); 
          shadowColor = color(60, 30, 0); 
      } else {
          // Fallback 
          stemColor = color(255, 215, 0); 
          shadowColor = color(190, 160, 0); 
      }
      
      // Draw stem segments
      for(let h = 0; h < this.currentHeight; h += PIXEL_SIZE){
        
        let currentStemColor = isMouseOver ? lerpColor(stemColor, color(255, 255, 150), 0.3) : stemColor;
        
        // 1. Draw Main Stem (3/4 width)
        fill(currentStemColor);
        rect(-PIXEL_SIZE/2, -h, PIXEL_SIZE/4 * 3, PIXEL_SIZE); 
        
        // 2. Draw Shadow (1/4 width on the right)
        fill(shadowColor);
        rect(-PIXEL_SIZE/2 + PIXEL_SIZE/4 * 3, -h, PIXEL_SIZE/4, PIXEL_SIZE);
      }
      
      // Draw leaves based on 'time' score (up to the current height)
      for (let i = 1; i <= leafCount; i++) {
          let leafY = i * leafInterval;
          
          if (leafY < this.currentHeight) {
              let side = (i % 2 !== 0) ? 0 : 1; 
              drawLeaf(0, -leafY, this.data.connotation, side);
          }
      }
    }
    
    // C. The Custom Bloom/Weed Head 
    if (!this.isSprouting) {
      let bloomY = -this.maxHeight; 
      
      if (this.data.connotation === 3) {
        // Calculate the total petal count = 3 Binary Factors + datenum
        let petalCount = 0;
        if (this.data.agency === 'me') {
            petalCount++;
        }
        if (this.data.ending === 'good' || this.data.ending === 'ongoing') { 
            petalCount++;
        }
        if (this.data.connotation >= 2) { 
            petalCount++;
        }
        
        // ADD datenum to petal count (1 to 8)
        petalCount += this.data.datenum;

        // Pass the combined score as the total petal count AND the ending type
        drawComplexFlower(0, bloomY, isMouseOver, petalCount, this.data.ending);
      } else if (this.data.connotation === 2) {
        drawSimpleBud(0, bloomY, isMouseOver);
      } 
      // Connotation 1 results in no bloom
    }
    
    // D. DISPLAY ID ON MOUSEOVER
    if (isMouseOver) {
        fill(255); 
        textSize(12);
        textAlign(CENTER, CENTER);
        text(this.data.id, 0, -this.maxHeight - 20); 
    }

    pop();
  }
}

function drawLeaf(stemX, stemY, connotation, side) {
    push();
    translate(stemX, stemY); 
    
    // Leaf color logic remains tied to connotation (1=Red, 2/3=Green)
    let leafColor = color(0, 120, 0); 
    let shadowColor = color(0, 80, 0);
    
    if (connotation === 1) { 
        leafColor = color(150, 0, 0); 
        shadowColor = color(100, 0, 0);
    }
    
    if (side === 0) { // LEFT SIDE
        // Left Leaf Shaded Design
        // 1. Shadow (Darker)
        fill(shadowColor);
        rect(-PIXEL_SIZE * 3, 0, PIXEL_SIZE * 2, PIXEL_SIZE);
        // 2. Highlight (Lighter)
        fill(leafColor);
        rect(-PIXEL_SIZE * 2, -PIXEL_SIZE, PIXEL_SIZE * 2, PIXEL_SIZE);
    } else { // RIGHT SIDE
        // Right Leaf Shaded Design
        // 1. Highlight (Lighter)
        fill(leafColor);
        rect(PIXEL_SIZE, -PIXEL_SIZE, PIXEL_SIZE * 2, PIXEL_SIZE);
        // 2. Shadow (Darker)
        fill(shadowColor);
        rect(PIXEL_SIZE * 2, 0, PIXEL_SIZE * 2, PIXEL_SIZE);
    }

    pop();
}

/**
 * Draws a complex flower with a variable number of petals (1 to 11).
 * Petals are drawn by rotating a single petal shape around the center.
 *
 * @param {number} x - Center X coordinate (relative to translation).
 * @param {number} y - Center Y coordinate (relative to translation).
 * @param {boolean} isMouseOver - If the mouse is hovering.
 * @param {number} petalCount - The total number of petals to draw (1-11).
 * @param {string} endingType - The ending ('good', 'bad', 'ongoing', 'NA') to determine color.
 */
function drawComplexFlower(x, y, isMouseOver, petalCount, endingType) { 
  let basePetal, shadowPetal;
  let centerColor = color(255, 215, 0); // Stigma remains yellow
  
  // --- Determine Petal Color based on Ending ---
  switch (endingType) {
    case 'good':
    case 'ongoing':
      basePetal = color(255, 105, 180); // Pink
      shadowPetal = color(200, 80, 140); 
      break;
    case 'bad':
      basePetal = color(150, 0, 0);     // Dark Red
      shadowPetal = color(100, 0, 0);
      break;
    case 'NA':
    default:
      basePetal = color(255, 255, 0);   // Yellow
      shadowPetal = color(200, 200, 0); 
      break;
  }
  
  // Highlight color on mouseover
  if (isMouseOver) basePetal = lerpColor(basePetal, color(255, 255, 255), 0.3);

  // Translate to the center of the flower head
  push();
  translate(x, y);

  // Loop to draw petals based on the total combined count
  for (let i = 0; i < petalCount; i++) {
    push();
    // Calculate rotation angle (360 degrees / total petals)
    rotate(i * (360 / petalCount));
    
    fill(basePetal);
    // Draw a single petal shape (1x2 pixel shape) at the top position
    rect(-PIXEL_SIZE / 2, -PIXEL_SIZE * 3.5, PIXEL_SIZE, PIXEL_SIZE * 2); 
    
    pop();
  }
  
  // Center/Stigma 
  // 1. Draw Center Shadow/Base (Fixed 3x3 pixels)
  fill(shadowPetal);
  rect(-PIXEL_SIZE * 1.5, -PIXEL_SIZE * 1.5, PIXEL_SIZE * 3, PIXEL_SIZE * 3);
  
  // 2. Draw Center Highlight (Fixed 1x1 pixels)
  fill(centerColor);
  rect(-PIXEL_SIZE / 2, -PIXEL_SIZE / 2, PIXEL_SIZE, PIXEL_SIZE);

  pop();
}

function drawSimpleBud(x, y, isMouseOver) { 
  let baseBud = color(100, 100, 200); 
  let shadowBud = color(50, 50, 150);
  let highlightBud = color(150, 150, 255);
  
  if (isMouseOver) baseBud = lerpColor(baseBud, color(255, 255, 255), 0.5);

  // 1. Bottom Shadow 
  fill(shadowBud);
  rect(x - PIXEL_SIZE * 1.5, y, PIXEL_SIZE * 3, PIXEL_SIZE);

  // 2. Main Body 
  fill(baseBud);
  rect(x - PIXEL_SIZE * 1.5, y - PIXEL_SIZE * 1.5, PIXEL_SIZE * 3, PIXEL_SIZE * 2.5);
  
  // 3. Highlight stripe
  fill(highlightBud);
  rect(x - PIXEL_SIZE, y - PIXEL_SIZE * 1.5, PIXEL_SIZE / 2, PIXEL_SIZE * 2);
}

function drawAggressiveWeed(x, y, weedColor, spikeColor, isMouseOver) { 
  if (isMouseOver) weedColor = lerpColor(weedColor, color(255, 0, 0), 0.5);
  fill(weedColor);
  rect(x - PIXEL_SIZE * 3, y - PIXEL_SIZE, PIXEL_SIZE * 6, PIXEL_SIZE * 2);
}