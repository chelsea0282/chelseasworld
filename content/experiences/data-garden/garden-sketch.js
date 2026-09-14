/* To improve on
* 1. Separate out this into multiple different files
* 2. Make the flowers sway
* 3. Do i want to change the colors of the flowers more? Allow more variations of the flower pattern, see if there are librarie that I can use for these garden visuals so I don't need to hard code these as much.
* 4. Allow users to input their own data and see how it materializes (it can be just one go kind of a thing)
*/

/* JSON DATA
TODO: move this to a different file */
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

//global variables
let PIXEL_SIZE = 4; // pixel size for pixel design asesthetic 
let PADDING_X = 50; 
let plants = [];
let grassColor;
let dropPadding = 100;
let RESERVATION_SIZE = 60; // Spacing to prevent overlap
let data_points = GARDEN_DATA; 
let totalPlants = data_points.length;

// Constant for extra stem height for blooms 
const BLOOM_PADDING = PIXEL_SIZE * 6; 

// Function: setup()
function setup() {
  createCanvas(600, 600);
  grassColor = color(104, 160, 72); 
  noStroke();
  angleMode(DEGREES); 
  frameRate(30); 
  
  // Collision detection and random placement loop
  for (let i = 0; i < totalPlants; i++) {
    let newX;
    let newY;
    let overlap = true;
    let attempts = 0;
    
    let newData = data_points[i];
    let baseHeight = newData.datenum * PIXEL_SIZE * 3;
    let newMaxHeight;
    
    // Connotation dictates the height
    if (newData.connotation > 1) {
        newMaxHeight = baseHeight + BLOOM_PADDING;
    } else {
        newMaxHeight = baseHeight;
    }

    // potential risk of infinite for loop, do added attempts <1000
    while (overlap && attempts < 1000) {
      
      newX = random(PADDING_X, width - PADDING_X);
      
      let minY = dropPadding + newMaxHeight + PIXEL_SIZE; // Add a pixel buffer
      let maxY = height - 50; // Maximum allowed Y position (bottom of canvas)
      
      // Check if the plant can actually fit on the canvas.
      if (minY >= maxY) {
          // if plant is too tall, reset Y position to highest possible Y
          newY = maxY; 
      } else {
          // Generate a random Y position between the minY and maxY
          newY = random(minY, maxY);
      }
      
      // Charted to pixel graph
      newX = floor(newX / PIXEL_SIZE) * PIXEL_SIZE;
      newY = floor(newY / PIXEL_SIZE) * PIXEL_SIZE;
      
      overlap = false;
      
      for (let existingPlant of plants) {
        
        // Calculate distances between centers of the two plants' bounding boxes
        let existingMaxHeight = existingPlant.maxHeight; 
        
        // Horizontal distance between centers (x)
        let dx = abs(newX - existingPlant.x); 
        
        // Check 1: Horizontal overlap
        // New Plant (bottom: newY, top: newY - newMaxHeight)
        // Existing Plant (bottom: existingPlant.targetY, top: existingPlant.targetY - existingMaxHeight)
        let horizontalOverlap = dx < RESERVATION_SIZE;
        
        // Check 2: Vertical overlap
        // Vertical space occupied by the new plant: [newY - newMaxHeight, newY]
        // Vertical space occupied by the existing plant: [existingPlant.targetY - existingMaxHeight, existingPlant.targetY]
        let existingTop = existingPlant.targetY - existingMaxHeight;
        let existingBottom = existingPlant.targetY;
        let newTop = newY - newMaxHeight;
        let newBottom = newY;
        
        // Overlap check: (A.min < B.max) && (A.max > B.min)
        let verticalOverlap = (newTop < existingBottom) && (newBottom > existingTop);
        
        // Final Collision Check
        if (horizontalOverlap && verticalOverlap) {
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

// Datapoint class object that represents each of the dates
class Datapoint {
  constructor(data, targetX, targetY) { 
    this.data = data;
    this.x = targetX; 
    
    // For seed dropping animation 
    this.y = 0; 
    this.targetY = targetY; 
    
    this.isDropped = false;
    this.isSprouting = false;
    this.currentHeight = 0;
    
    // Height of base is datenum
    let baseHeight = this.data.datenum * PIXEL_SIZE * 3;

    // Add height for floor bloom to not hide leaves
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
      } 
      
      // Stem drawing
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
        let petalCount = 0;
        
        // Calculate the total petal count = 3 Factors + datenum
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

        drawComplexFlower(0, bloomY, isMouseOver, petalCount, this.data.ending);
      } else if (this.data.connotation === 2) {
        drawSimpleBud(0, bloomY, isMouseOver);
      } 
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

// Draw Leaf
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
    
  
    if (side === 0) { 
        // LEFT SIDE
        fill(leafColor);
        rect(-PIXEL_SIZE * 2, -PIXEL_SIZE, PIXEL_SIZE * 2, PIXEL_SIZE);  
        fill(shadowColor);
        rect(-PIXEL_SIZE * 3, 0, PIXEL_SIZE * 2, PIXEL_SIZE);
        
    } else { 
        // RIGHT SIDE
        fill(leafColor);
        rect(PIXEL_SIZE, -PIXEL_SIZE, PIXEL_SIZE * 2, PIXEL_SIZE);
        fill(shadowColor);
        rect(PIXEL_SIZE * 2, 0, PIXEL_SIZE * 2, PIXEL_SIZE);
    }

    pop();
}

/* Draw Complex Flower
 * Petals are drawn by rotating a single petal shape around the center.
 * @param {number} x - Center X coordinate (relative to translation).
 * @param {number} y - Center Y coordinate (relative to translation).
 * @param {boolean} isMouseOver - If the mouse is hovering.
 * @param {number} petalCount - The total number of petals to draw (1-11).
 * @param {string} endingType - The ending ('good', 'bad', 'ongoing', 'NA') to determine color.
 */
function drawComplexFlower(x, y, isMouseOver, petalCount, endingType) { 
  let basePetal, shadowPetal;
  let centerColor = color(255, 215, 0); // Stigma remains yellow
  
  // Peter color based on endingType
  switch (endingType) {
    case 'good':
    case 'ongoing':
      basePetal = color(255, 105, 180); // Pink
      shadowPetal = color(200, 80, 140); 
      break;
    case 'bad':
      basePetal = color(150, 0, 0); // Dark Red
      shadowPetal = color(100, 0, 0);
      break;
    case 'NA':
    default:
      basePetal = color(255, 255, 0); // Yellow
      shadowPetal = color(200, 200, 0); 
      break;
  }
  
  // Highlight color on mouseover
  if (isMouseOver) basePetal = lerpColor(basePetal, color(255, 255, 255), 0.3);

  // Translate to the center of the flower head
  push();
  translate(x, y);

  // Loop to draw petals 
  for (let i = 0; i < petalCount; i++) {
    push();
    
    // Calculate rotation angle (360 degrees / total petals)
    rotate(i * (360 / petalCount));
    fill(basePetal);
    
    // Draw a single petal shape (1x2 pixel shape) at the top position
    rect(-PIXEL_SIZE / 2, -PIXEL_SIZE * 3.5, PIXEL_SIZE, PIXEL_SIZE * 2); 
    
    pop();
  }
  
  // Center of flower
  // Center Shadow/Base (Fixed 3x3 pixels)
  fill(shadowPetal);
  rect(-PIXEL_SIZE * 1.5, -PIXEL_SIZE * 1.5, PIXEL_SIZE * 3, PIXEL_SIZE * 3);
  
  // Center Highlight (Fixed 1x1 pixels)
  fill(centerColor);
  rect(-PIXEL_SIZE / 2, -PIXEL_SIZE / 2, PIXEL_SIZE, PIXEL_SIZE);

  pop();
}

// Draw Simple Flower
function drawSimpleBud(x, y, isMouseOver) { 
  let baseBud = color(100, 100, 200); 
  let shadowBud = color(50, 50, 150);
  let highlightBud = color(150, 150, 255);
  
  if (isMouseOver) baseBud = lerpColor(baseBud, color(255, 255, 255), 0.5);

  // Bottom Shadow 
  fill(shadowBud);
  rect(x - PIXEL_SIZE * 1.5, y, PIXEL_SIZE * 3, PIXEL_SIZE);

  // Main Body 
  fill(baseBud);
  rect(x - PIXEL_SIZE * 1.5, y - PIXEL_SIZE * 1.5, PIXEL_SIZE * 3, PIXEL_SIZE * 2.5);
  
  // Highlight stripe
  fill(highlightBud);
  rect(x - PIXEL_SIZE, y - PIXEL_SIZE * 1.5, PIXEL_SIZE / 2, PIXEL_SIZE * 2);
}

function drawAggressiveWeed(x, y, weedColor, spikeColor, isMouseOver) { 
  if (isMouseOver) weedColor = lerpColor(weedColor, color(255, 0, 0), 0.5);
  fill(weedColor);
  rect(x - PIXEL_SIZE * 3, y - PIXEL_SIZE, PIXEL_SIZE * 6, PIXEL_SIZE * 2);
}