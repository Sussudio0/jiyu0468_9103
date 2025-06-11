let blobs = [];
let radiants = [];
let holes = [];
let sparks = [];
let bgTexture;

// Time control variables
let currentTime = 0;
let nextEventTime = 0;
let eventInterval = 5000; // 5 seconds per event
let eventDuration = 2000; // Event lasts for 2 seconds

// Event types
const EVENT_BLOBS_PULSE = 0;
const EVENT_RADIANTS_GLOW = 1;
const EVENT_SPARKS_BURST = 2;
const EVENT_HOLES_TWINKLE = 3;

// Current event status
let currentEvent = -1;
let eventStartTime = 0;

function setup() {
  createCanvas(900, 900);
  background(0);
  noStroke();
  
  // Create background texture
  bgTexture = createGraphics(width, height);
  createTexture(bgTexture);

  for (let i = 0; i < 60; i++) {
    blobs.push(new NoiseBlob());
  }

  for (let i = 0; i < 25; i++) {
    radiants.push(new Radiant());
  }

  for (let i = 0; i < 20; i++) {
    holes.push(new Hole());
  }

  for (let i = 0; i < 200; i++) { 
    sparks.push(new Spark());
  }

  // Initialize time control
  currentTime = millis();
  scheduleNextEvent();
}

function draw() {
  // Update time
  currentTime = millis();
  
  // Check if an event is triggered
  checkEvents();
  
  // Display background texture
  image(bgTexture, 0, 0);
  
  // Softer trailing effect
  fill(0, 25);
  rect(0, 0, width, height);

  // Render elements in order of depth
  for (let h of holes) h.show();
  for (let b of blobs) {
    b.update();
    b.show();
  }
  for (let r of radiants) {
    r.update();
    r.show();
  }
  for (let s of sparks) {
    s.update();
    s.show();
  }
}

// Event checking function
function checkEvents() {
  if (currentTime >= nextEventTime) {
    triggerRandomEvent();
    scheduleNextEvent();
  }
  
  // Handle current event
  if (currentEvent !== -1) {
    let elapsedTime = currentTime - eventStartTime;
    let progress = map(elapsedTime, 0, eventDuration, 0, 1);
    
    if (progress >= 1) {
      endEvent();
    } else {
      handleEvent(progress);
    }
  }
}

// Trigger a random event
function triggerRandomEvent() {
  let eventType = floor(random(4));
  currentEvent = eventType;
  eventStartTime = currentTime;
  console.log("Event triggered:", eventType);
}

// Schedule the next event
function scheduleNextEvent() {
  nextEventTime = currentTime + eventInterval;
}

// End the current event
function endEvent() {
  currentEvent = -1;
  console.log("Event ended");
}

// Handle the event
function handleEvent(progress) {
  switch(currentEvent) {
    case EVENT_BLOBS_PULSE:
      for (let b of blobs) {
        b.pulseFactor = map(sin(progress * TWO_PI), -1, 1, 0.8, 1.2);
      }
      break;
      
    case EVENT_RADIANTS_GLOW:
      for (let r of radiants) {
        r.glowIntensity = map(progress, 0, 1, 0.5, 1.5);
      }
      break;
      
    case EVENT_SPARKS_BURST:
      // Increase the number of particles
      for (let i = 0; i < 50; i++) {
        let newSpark = new Spark();
        newSpark.reset();
        newSpark.x = width/2;
        newSpark.y = height/2;
        newSpark.vx = random(-3, 3);
        newSpark.vy = random(-3, 3);
        newSpark.baseAlpha = 255;
        sparks.push(newSpark);
      }
      break;
      
    case EVENT_HOLES_TWINKLE:
      for (let h of holes) {
        h.twinkleFactor = map(sin(progress * TWO_PI * 2), -1, 1, 0.5, 1.5);
      }
      break;
  }
}

// Function to create background texture
function createTexture(g) {
  g.background(0);
  g.noStroke();
  
  // Add subtle noise texture
  for (let i = 0; i < 10000; i++) {
    let x = random(width);
    let y = random(height);
    let s = random(0.5, 2);
    let a = random(5, 15);
    g.fill(30, 20, 40, a);
    g.ellipse(x, y, s);
  }
  
  // Add some subtle line texture
  g.stroke(40, 30, 50, 10);
  for (let i = 0; i < 50; i++) {
    let x1 = random(width);
    let y1 = random(height);
    let x2 = x1 + random(-100, 100);
    let y2 = y1 + random(-100, 100);
    g.line(x1, y1, x2, y2);
  }
}

// Improved NoiseBlob - Increased sense of depth
class NoiseBlob {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.rBase = random(0, 120); 
    this.alpha = random(30, 120);
    this.phase = random(TWO_PI);
    this.speed = random(0.003, 0.01);
    this.c = color(
      255 + random(-30, 0), 
      180 + random(-30, 30), 
      120 + random(-50, 50), 
      this.alpha
    );
    this.depth = random(1); // Depth value for sense of depth
    this.noiseScale = random(0.005, 0.02); // Add noise displacement
    this.pulseFactor = 1; // Pulse factor
  }

  update() {
    this.phase += this.speed;
    this.r = this.rBase + sin(this.phase) * (15 * this.depth * this.pulseFactor); 
    // Depth affects fluctuation amplitude
    // Slow noise displacement
    this.x += map(noise(frameCount * this.noiseScale, 0), -1, 1, -0.3, 0.3);
    this.y += map(noise(0, frameCount * this.noiseScale), -1, 1, -0.3, 0.3);
    
    // Boundary check
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Adjust opacity and blending mode based on depth
    if (this.depth > 0.7) {
      drawingContext.globalCompositeOperation = 'lighter';
    }
    
    // Core glowing part
    fill(this.c);
    ellipse(0, 0, this.r);
    
    // Add glow effect
    let glowSize = this.r * 1.5;
    for (let i = 0; i < 3; i++) {
      fill(red(this.c), green(this.c), blue(this.c), this.alpha * 0.3 / (i+1));
      ellipse(0, 0, glowSize * (0.7 + i * 0.3));
    }
    
    // Add some internal texture
    noFill();
    stroke(255, this.alpha * 0.5);
    strokeWeight(0.5);
    for (let i = 0; i < 5; i++) {
      let r = this.r * (0.3 + i * 0.1);
      ellipse(0, 0, r);
    }
    
    pop();
  }
}

// Improved Radiant - Increased variation
class Radiant {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.r = random(15, 50); 
    this.n = int(random(20, 100));
    this.alpha = random(40, 120);
    this.angle = random(TWO_PI);
    this.rotSpeed = random(0.001, 0.02);
    this.lineLength = random(15, 40);
    this.depth = random(1);
    this.pulseSpeed = random(0.01, 0.03);
    this.pulsePhase = random(TWO_PI);
    this.glowIntensity = 1; // Glow intensity
  }

  update() {
    this.angle += this.rotSpeed * map(this.depth, 0, 1, 0.8, 1.2);
    this.pulsePhase += this.pulseSpeed;
    this.currentLength = this.lineLength * (0.8 + sin(this.pulsePhase) * 0.2) * this.glowIntensity;
  }

  show() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    
    // Adjust appearance based on depth
    let strokeAlpha = this.alpha * map(this.depth, 0, 1, 0.7, 1) * this.glowIntensity;
    stroke(255, 240, 180, strokeAlpha);
    strokeWeight(map(this.depth, 0, 1, 0.3, 0.8) * this.glowIntensity);
    
    for (let i = 0; i < this.n; i++) {
      let a = TWO_PI * i / this.n;
      let x1 = cos(a) * this.r;
      let y1 = sin(a) * this.r;
      let x2 = cos(a) * (this.r + this.currentLength);
      let y2 = sin(a) * (this.r + this.currentLength);
      
      // Make some lines brighter
      if (i % 5 === 0) {
        stroke(255, 255, 200, strokeAlpha * 1.5);
        strokeWeight(map(this.depth, 0, 1, 0.5, 1.2) * this.glowIntensity);
      } else {
        stroke(255, 240, 180, strokeAlpha);
        strokeWeight(map(this.depth, 0, 1, 0.3, 0.8) * this.glowIntensity);
      }
      
      line(x1, y1, x2, y2);
    }
    
    // Add center highlight
    fill(255, 240, 180, strokeAlpha * 0.5 * this.glowIntensity);
    noStroke();
    ellipse(0, 0, this.r * 0.5);
    
    pop();
  }
}

// Improved Hole - Increased variation
class Hole {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.r = random(5, 10); 
    this.depth = random(1);
    this.innerR = this.r * random(0.3, 0.7);
    this.innerColor = color(
      20 + random(-10, 10),
      10 + random(-5, 5),
      30 + random(-10, 10)
    );
    this.twinkleFactor = 1; // Twinkle factor
  }

  show() {
    push();
    translate(this.x, this.y);
    
    // Outer ring
    noStroke();
    fill(0, this.twinkleFactor * 255);
    ellipse(0, 0, this.r * 2);
    
    // Inner ring - Add some sense of depth
    fill(this.innerColor);
    ellipse(0, 0, this.innerR * 2 * this.twinkleFactor);
    
    // Add some subtle highlights
    fill(60, 50, 80, 100 * this.twinkleFactor);
    ellipse(
      this.r * 0.2, 
      -this.r * 0.2, 
      this.r * 0.3 * this.twinkleFactor
    );
    
    pop();
  }
}

// Improved Spark - More diverse
class Spark {
  constructor() {
    this.reset();
    this.life = random(100, 500);
    this.age = random(this.life);
    this.type = random() > 0.7 ? "line" : "dot"; 
  }
  
  reset() {
    this.x = random(width);
    this.y = random(height);
    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5);
    this.size = random(1, 3);
    this.baseAlpha = random(50, 150);
    this.colorVariation = random(100);
    this.life = random(100, 500);
    this.age = 0;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    
    // Reset mechanism
    if (this.age > this.life || 
        this.x < 0 || this.x > width || 
        this.y < 0 || this.y > height) {
      this.reset();
    }
  }

  show() {
    // Flicker based on lifecycle
    let alpha = this.baseAlpha * (0.5 + 0.5 * sin(this.age * 0.05));
    
    if (this.type === "line") {
      // Line particle
      let angle = noise(this.x * 0.01, this.y * 0.01) * TWO_PI;
      let len = this.size * 3;
      stroke(
        255 - this.colorVariation, 
        215 - this.colorVariation * 0.5, 
        130 + this.colorVariation * 0.3, 
        alpha
      );
      strokeWeight(this.size * 0.5);
      line(
        this.x, 
        this.y, 
        this.x + cos(angle) * len, 
        this.y + sin(angle) * len
      );
    } else {
      // Dot particle
      noStroke();
      fill(
        255 - this.colorVariation, 
        215 - this.colorVariation * 0.5, 
        130 + this.colorVariation * 0.3, 
        alpha
      );
      ellipse(this.x, this.y, this.size);
      
      // Add subtle glow
      fill(
        255 - this.colorVariation, 
        215 - this.colorVariation * 0.5, 
        130 + this.colorVariation * 0.3, 
        alpha * 0.3
      );
      ellipse(this.x, this.y, this.size * 3);
    }
  }
}