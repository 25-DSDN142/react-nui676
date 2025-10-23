// ====================================================================
// HANDS INTERACTION - FLAME EFFECTS AND GESTURES
// ====================================================================

/* ----------------------------------------------------------------
   IMAGE LOADING
   ---------------------------------------------------------------- */
let myImage;

function prepareInteraction() {
  myImage = loadImage('/images/sun.png');
}

/* ----------------------------------------------------------------
   GLOBAL VARIABLES - FLAME TRACKING
   ---------------------------------------------------------------- */
// Per-hand smoothed scales for different flame types
let palmScaleByHand = {};      // Purple palm flames
let mergedScaleByHand = {};    // Peace gesture red flames
let middleScaleByHand = {};    // Orange pointing flames
let pointingAlphaByHand = {};  // Fade in/out for pointing

// Two-hand merged flame state (purple/blue explosion flame)
let twoHandsMergedAlpha = 0;
let twoHandsMergedScale = 1;
let twoHandsMergeLocked = false;
let mergedFlameWasCharged = false;
let mergedFlameShotCooldown = 0;

/* ----------------------------------------------------------------
   SHOOTING MODE VARIABLES
   ---------------------------------------------------------------- */
let shootingMode = false;
let projectiles = [];
let lastGestureByHand = {};
let shotCooldownByHand = {};
let muzzleFlashByHand = {};
let chargeTimeByHand = {};

const SHOT_COOLDOWN = 10;           // Frames between shots
const MUZZLE_FLASH_DURATION = 3;    // Muzzle flash duration
const CHARGE_DURATION = 60;         // 1 second charge time at 60fps

/* ----------------------------------------------------------------
   TRAVELING PURPLE FLAMES CLASS
   Flames that travel between hands when far apart in shooting mode
   ---------------------------------------------------------------- */
let travelingFlames = [];

class TravelingFlame {
  constructor(startX, startY, targetX, targetY, scale) {
    this.x = startX;
    this.y = startY;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.scale = scale;
    this.progress = 0;
    // Speed based on distance: far = slow, close = fast
    let distance = dist(startX, startY, targetX, targetY);
    this.speed = map(distance, 600, 100, 0.02, 0.05, true);
    this.alpha = 1.0;
    this.arrived = false;
  }
  
  update() {
    if (!this.arrived) {
      this.progress += this.speed;
      if (this.progress >= 1) {
        this.progress = 1;
        this.arrived = true;
      }
      this.x = lerp(this.startX, this.targetX, this.progress);
      this.y = lerp(this.startY, this.targetY, this.progress);
    }
  }
  
  draw() {
    flame(this.x, this.y, 0, this.scale, 'purple', this.alpha);
  }
  
  isDone() {
    return this.arrived;
  }
}

/* ----------------------------------------------------------------
   PROJECTILE CLASS
   Handles shooting flames (orange, red, and merged purple/blue)
   ---------------------------------------------------------------- */
class Projectile {
  constructor(x, y, angle, speed = 15) {
    this.x = x;
    this.y = y;
    this.vx = cos(angle) * speed;
    this.vy = sin(angle) * speed;
    this.size = 0.8;
    this.alpha = 1.0;
    this.lifespan = 120;
    this.age = 0;
    this.angle = angle;
    this.isRed = false;       // Red peace gesture projectiles
    this.isMerged = false;    // Purple/blue explosion projectiles
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    // Fade out near end of lifespan
    if (this.age > this.lifespan * 0.7) {
      this.alpha = map(this.age, this.lifespan * 0.7, this.lifespan, 1, 0);
    }
  }
  
  draw() {
    if (this.isMerged) {
      // Purple/blue explosion projectile (spinning)
      flame(this.x, this.y, HALF_PI + this.age * 0.1, this.size * 1.15, 'blue', this.alpha);
      flame(this.x, this.y, this.age * 0.1, this.size, 'purple', this.alpha);
    } else {
      // Orange (pointing) or red (peace) projectile
      let colorMode = this.isRed ? true : false;
      flame(this.x, this.y, this.angle, this.size, colorMode, this.alpha);
    }
  }
  
  isDead() {
    return this.age > this.lifespan || this.x < 0 || this.x > width || this.y < 0 || this.y > height;
  }
}

/* ====================================================================
   MAIN DRAWING FUNCTION
   ==================================================================== */
function drawInteraction(faces, hands) {
  
  /* ----------------------------------------------------------------
     TWO-HAND MERGED FLAME LOGIC (Purple/Blue)
     Appears when both palms are open and wrists are 50-750px apart
     - Normal mode: Static merged flame
     - Shooting mode: Charge up, then explode in 360 degrees
     ---------------------------------------------------------------- */
  let twoHands = hands && hands.length >= 2;
  let mergedPalmCenter = null;
  
  if (twoHands) {
    let h0 = hands[0];
    let h1 = hands[1];
    
    if (h0 && h1 && h0.wrist && h1.wrist) {
      let w0x = h0.wrist.x;
      let w0y = h0.wrist.y;
      let w1x = h1.wrist.x;
      let w1y = h1.wrist.y;
      let wristDist2D = dist(w0x, w0y, w1x, w1y);
      
      // Flame visibility range
      const flameStartDist = 50;   // Min distance for flame
      const flameMaxDist = 750;    // Max distance before disappearing

      let targetAlpha = 0;
      let targetScale = 0;

      if (wristDist2D > flameStartDist && wristDist2D < flameMaxDist) {
        targetAlpha = 1.0;
        targetScale = map(wristDist2D, flameStartDist, flameMaxDist, 0.5, 6.0, true);
      } else {
        targetAlpha = 0;
        targetScale = 0;
      }

      // Smooth transitions
      twoHandsMergedAlpha = lerp(twoHandsMergedAlpha, targetAlpha, 0.18);
      twoHandsMergedScale = lerp(twoHandsMergedScale, targetScale, 0.18);

      // Calculate flame position (above palms, toward fingertips)
      let topFactor = 0.6;
      let top0x = w0x;
      let top0y = w0y;
      let top1x = w1x;
      let top1y = w1y;
      
      if (h0.middle_finger_tip) {
        top0x = w0x + (h0.middle_finger_tip.x - w0x) * topFactor;
        top0y = w0y + (h0.middle_finger_tip.y - w0y) * topFactor;
      }
      if (h1.middle_finger_tip) {
        top1x = w1x + (h1.middle_finger_tip.x - w1x) * topFactor;
        top1y = w1y + (h1.middle_finger_tip.y - w1y) * topFactor;
      }
      
      mergedPalmCenter = { x: (top0x + top1x) / 2, y: (top0y + top1y) / 2 };

      // Lock/unlock logic using depth if available
      let z0 = typeof h0.wrist.z3D !== 'undefined' ? h0.wrist.z3D : null;
      let z1 = typeof h1.wrist.z3D !== 'undefined' ? h1.wrist.z3D : null;
      const unlockZ = 1.0;
      
      if (!twoHandsMergeLocked && twoHandsMergedAlpha > 0.9) {
        twoHandsMergeLocked = true;
      }
      if (twoHandsMergeLocked && z0 !== null && z1 !== null) {
        let zDist = abs(z0 - z1);
        if (zDist > unlockZ) {
          twoHandsMergeLocked = false;
        }
      }
    }
  } else {
    twoHandsMergedAlpha = lerp(twoHandsMergedAlpha, 0, 0.2);
  }
  
  /* ----------------------------------------------------------------
     PER-HAND GESTURE PROCESSING
     ---------------------------------------------------------------- */
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    
    if (showKeypoints) {
      drawConnections(hand)
    }

    // Extract hand landmarks
    let indexFingerTipX = hand.index_finger_tip.x;
    let indexFingerTipY = hand.index_finger_tip.y;
    let wristX = hand.wrist.x;
    let wristY = hand.wrist.y;
    let middleFingerTipX = hand.middle_finger_tip.x;
    let middleFingerTipY = hand.middle_finger_tip.y;
    let middleFingerTipZ = hand.middle_finger_tip.z3D;
    let thumbTipX = hand.thumb_tip.x;
    let thumbTipY = hand.thumb_tip.y;

    let middleOfHandX = (middleFingerTipX + wristX) / 2;
    let middleOfHandY = (middleFingerTipY + wristY) / 2;

    /* --------------------------------------------------------------
       PALM FLAME SCALE CALCULATION
       Based on index-thumb distance
       -------------------------------------------------------------- */
    let palmScale = 1;
    let touching = false;
    const touchThreshold = 30;
    
    if (hand.index_finger_tip && hand.thumb_tip) {
      let itDist = dist(hand.index_finger_tip.x, hand.index_finger_tip.y, hand.thumb_tip.x, hand.thumb_tip.y);
      if (itDist <= touchThreshold) {
        touching = true;
        palmScale = 0;
      } else {
        palmScale = map(itDist, touchThreshold, 200, 0.6, 2.5, true);
      }
    }

    // Smooth palm scale
    palmScaleByHand[i] = palmScaleByHand[i] || palmScale;
    palmScaleByHand[i] = lerp(palmScaleByHand[i], palmScale, 0.2);

    /* --------------------------------------------------------------
       GESTURE DETECTION
       -------------------------------------------------------------- */
    let gesture = typeof detectHandGesture === 'function' ? detectHandGesture(hand) : null;
    let handId = i;

    /* --------------------------------------------------------------
       SHOOTING MODE TOGGLE - THUMBS UP GESTURE
       -------------------------------------------------------------- */
    if (gesture === 'Thumbs Up' && lastGestureByHand[handId] !== 'Thumbs Up') {
      shootingMode = !shootingMode;
      console.log("Shooting mode toggled:", shootingMode ? "ON" : "OFF");
    }
    lastGestureByHand[handId] = gesture;

    // Initialize cooldowns and trackers
    if (!shotCooldownByHand[handId]) shotCooldownByHand[handId] = 0;
    if (!muzzleFlashByHand[handId]) muzzleFlashByHand[handId] = 0;
    if (!chargeTimeByHand[handId]) chargeTimeByHand[handId] = 0;
    
    // Decrease timers
    if (shotCooldownByHand[handId] > 0) shotCooldownByHand[handId]--;
    if (muzzleFlashByHand[handId] > 0) muzzleFlashByHand[handId]--;
    
    /* ==============================================================
       ORANGE FLAME LOGIC - POINTING GESTURE
       - Normal mode: Static orange flame at fingertip
       - Shooting mode: Charge up, then rapid-fire orange projectiles
       ============================================================== */
    if (shootingMode && gesture === 'Pointing') {
      // Charge up while pointing
      if (chargeTimeByHand[handId] < CHARGE_DURATION) {
        chargeTimeByHand[handId]++;
      }
      
      // Pulsing charge effect
      let chargeProgress = chargeTimeByHand[handId] / CHARGE_DURATION;
      let pulseSpeed = 0.3;
      let pulseAmount = 0.3;
      let flicker = 1 + pulseAmount * sin(frameCount * pulseSpeed + handId * 10);
      let chargeScale = chargeProgress * flicker * 1.5;
      
      let angleIdx = atan2(indexFingerTipY - wristY, indexFingerTipX - wristX);
      flame(indexFingerTipX, indexFingerTipY, angleIdx, chargeScale, false, chargeProgress);
      
      // Shoot when fully charged
      if (chargeTimeByHand[handId] >= CHARGE_DURATION && shotCooldownByHand[handId] === 0) {
        let shootAngle = atan2(indexFingerTipY - wristY, indexFingerTipX - wristX);
        projectiles.push(new Projectile(indexFingerTipX, indexFingerTipY, shootAngle));
        console.log("Orange fireball shot!");
        shotCooldownByHand[handId] = SHOT_COOLDOWN;
        muzzleFlashByHand[handId] = MUZZLE_FLASH_DURATION;
      }
    } else {
      chargeTimeByHand[handId] = 0;
    }

    /* ==============================================================
       PURPLE PALM FLAME LOGIC - OPEN PALM
       - Normal mode: Purple flame in palm (blue if two hands)
       - Shooting mode: 
         * 850px+ apart: Traveling flames between hands
         * Closer: Static purple flame
       ============================================================== */
    if (gesture !== 'Fist' && gesture !== 'Pointing' && !touching && gesture !== 'Peace' && twoHandsMergedAlpha < 0.02) {
      if (shootingMode && hands.length >= 2) {
        // Check wrist distance
        let h0 = hands[0];
        let h1 = hands[1];
        if (h0 && h1 && h0.wrist && h1.wrist) {
          let wristDist = dist(h0.wrist.x, h0.wrist.y, h1.wrist.x, h1.wrist.y);
          const travelFlameMinDist = 850;
          
          if (wristDist > travelFlameMinDist) {
            // Create traveling flame
            let otherHandIndex = (i === 0) ? 1 : 0;
            if (hands[otherHandIndex]) {
              let otherHand = hands[otherHandIndex];
              let otherMiddleX = (otherHand.middle_finger_tip.x + otherHand.wrist.x) / 2;
              let otherMiddleY = (otherHand.middle_finger_tip.y + otherHand.wrist.y) / 2;
              
              let existingFlame = travelingFlames.find(f => 
                Math.abs(f.startX - middleOfHandX) < 10 && 
                Math.abs(f.startY - middleOfHandY) < 10 && 
                !f.arrived
              );
              
              if (!existingFlame) {
                travelingFlames.push(new TravelingFlame(
                  middleOfHandX, middleOfHandY, 
                  otherMiddleX, otherMiddleY, 
                  palmScaleByHand[i]
                ));
              }
            }
          } else {
            flame(middleOfHandX, middleOfHandY, 0, palmScaleByHand[i], 'purple');
          }
        }
      } else if (shootingMode) {
        flame(middleOfHandX, middleOfHandY, 0, palmScaleByHand[i], 'purple');
      } else {
        // Normal mode: blue if two hands, purple if one
        let palmColorMode = (hands && hands.length >= 2) ? 'blue' : 'purple';
        flame(middleOfHandX, middleOfHandY, 0, palmScaleByHand[i], palmColorMode);
      }
    }

    /* ==============================================================
       RED FLAME LOGIC - PEACE GESTURE
       Small red flame between index and middle fingers
       - Normal mode: Grows when fingers come together
       - Shooting mode: Charge up, shoot red projectiles
       ============================================================== */
    if (gesture === 'Peace') {
      let midX = (indexFingerTipX + middleFingerTipX) / 2;
      let midY = (indexFingerTipY + middleFingerTipY) / 2;
      let imDist = dist(indexFingerTipX, indexFingerTipY, middleFingerTipX, middleFingerTipY);
      
      if (shootingMode) {
        // Shooting mode: charge and shoot red projectiles
        const shootThreshold = 100;
        
        if (!shotCooldownByHand[handId + '_peace']) shotCooldownByHand[handId + '_peace'] = 0;
        if (!muzzleFlashByHand[handId + '_peace']) muzzleFlashByHand[handId + '_peace'] = 0;
        if (!chargeTimeByHand[handId + '_peace']) chargeTimeByHand[handId + '_peace'] = 0;
        
        if (shotCooldownByHand[handId + '_peace'] > 0) shotCooldownByHand[handId + '_peace']--;
        if (muzzleFlashByHand[handId + '_peace'] > 0) muzzleFlashByHand[handId + '_peace']--;
        
        let baseScale = 1.2;
        let targetScale = baseScale;
        
        if (imDist < shootThreshold) {
          // Charging
          if (chargeTimeByHand[handId + '_peace'] < CHARGE_DURATION) {
            chargeTimeByHand[handId + '_peace']++;
          }
          
          let chargeProgress = chargeTimeByHand[handId + '_peace'] / CHARGE_DURATION;
          let chargeScale = targetScale * (0.5 + chargeProgress * 0.5);
          let pulseSpeed = 0.25 + chargeProgress * 0.3;
          let pulseAmount = 0.2 + chargeProgress * 0.3;
          let flicker = 1 + pulseAmount * sin(frameCount * pulseSpeed + handId * 10);
          
          mergedScaleByHand[i] = mergedScaleByHand[i] || chargeScale;
          mergedScaleByHand[i] = lerp(mergedScaleByHand[i], chargeScale * flicker, 0.2);
          
          // Shoot when fully charged
          if (chargeTimeByHand[handId + '_peace'] >= CHARGE_DURATION && shotCooldownByHand[handId + '_peace'] === 0) {
            let shootAngle = atan2(midY - wristY, midX - wristX);
            let redProjectile = new Projectile(midX, midY, shootAngle, 15);
            redProjectile.isRed = true;
            projectiles.push(redProjectile);
            console.log("Red fireball shot!");
            shotCooldownByHand[handId + '_peace'] = SHOT_COOLDOWN * 1.5;
            muzzleFlashByHand[handId + '_peace'] = MUZZLE_FLASH_DURATION;
          }
        } else {
          chargeTimeByHand[handId + '_peace'] = 0;
          mergedScaleByHand[i] = mergedScaleByHand[i] || targetScale;
          mergedScaleByHand[i] = lerp(mergedScaleByHand[i], targetScale, 0.2);
        }
        
        let angleMid = (atan2(indexFingerTipY - wristY, indexFingerTipX - wristX) +
                        atan2(middleFingerTipY - wristY, middleFingerTipX - wristX)) / 2;
        let chargeProgress = chargeTimeByHand[handId + '_peace'] / CHARGE_DURATION;
        flame(midX, midY, angleMid, mergedScaleByHand[i], true, 0.6 + chargeProgress * 0.4);
        
      } else {
        // Normal mode: grows when fingers come together
        let baseScale = 1.2;
        let targetScale = map(imDist, 10, 150, 3.0, baseScale, true);
        
        mergedScaleByHand[i] = mergedScaleByHand[i] || targetScale;
        mergedScaleByHand[i] = lerp(mergedScaleByHand[i], targetScale, 0.2);

        let angleMid = (atan2(indexFingerTipY - wristY, indexFingerTipX - wristX) +
                        atan2(middleFingerTipY - wristY, middleFingerTipX - wristX)) / 2;
        flame(midX, midY, angleMid, mergedScaleByHand[i], true);
      }
    } else {
      /* --------------------------------------------------------------
         ORANGE FLAME (NON-SHOOTING MODE)
         Shown at index finger when pointing (not in shooting mode)
         -------------------------------------------------------------- */
      pointingAlphaByHand[i] = pointingAlphaByHand[i] || 0;
      let targetAlpha = (gesture === 'Pointing') ? 1 : 0;
      pointingAlphaByHand[i] = lerp(pointingAlphaByHand[i], targetAlpha, 0.25);

      let showFlame = pointingAlphaByHand[i] > 0.02;
      if (shootingMode) {
        showFlame = muzzleFlashByHand[handId] > 0;
      }

      if (showFlame) {
        let angleIdx = atan2(indexFingerTipY - wristY, indexFingerTipX - wristX);
        let targetScale = 1;
        const minScale = 0.6;
        const maxScale = 2.2;

        if (typeof middleFingerTipZ !== 'undefined' && middleFingerTipZ !== null) {
          let depthVal = -middleFingerTipZ;
          let minDepth = 0.05;
          let maxDepth = 0.2;
          targetScale = map(depthVal, minDepth, maxDepth, maxScale, minScale, true);
        } else {
          let pixDist = dist(middleFingerTipX, middleFingerTipY, wristX, wristY);
          let minPix = 20;
          let maxPix = 300;
          targetScale = map(pixDist, minPix, maxPix, maxScale, minScale, true);
        }

        middleScaleByHand[i] = middleScaleByHand[i] || targetScale;
        middleScaleByHand[i] = lerp(middleScaleByHand[i], targetScale, 0.2);

        let finalAlpha = shootingMode ? (muzzleFlashByHand[handId] / MUZZLE_FLASH_DURATION) : pointingAlphaByHand[i];
        flame(indexFingerTipX, indexFingerTipY, angleIdx, middleScaleByHand[i], false, finalAlpha);
      }
    }
  }
  
  /* ================================================================
     MERGED PURPLE/BLUE FLAME RENDERING & EXPLOSION
     ================================================================ */
  if (mergedPalmCenter && twoHandsMergedAlpha > 0.02) {
    if (shootingMode) {
      // Decrease explosion cooldown
      if (mergedFlameShotCooldown > 0) mergedFlameShotCooldown--;
      
      // Charge detection: small flame (hands close)
      const chargeThreshold = 1.5;
      if (twoHandsMergedScale >= chargeThreshold && twoHandsMergedScale < 3.0 && !mergedFlameWasCharged) {
        mergedFlameWasCharged = true;
        console.log("Merged flame charged!");
      }
      
      // Explosion trigger: big flame (hands spread)
      const shootThreshold = 5.0;
      if (mergedFlameWasCharged && twoHandsMergedScale >= shootThreshold && mergedFlameShotCooldown === 0) {
        // 360-degree explosion
        const numProjectiles = 12;
        const angleStep = TWO_PI / numProjectiles;
        
        for (let i = 0; i < numProjectiles; i++) {
          let angle = angleStep * i;
          let mergedProjectile = new Projectile(mergedPalmCenter.x, mergedPalmCenter.y, angle, 12);
          mergedProjectile.isMerged = true;
          mergedProjectile.size = 1.5;
          mergedProjectile.lifespan = 150;
          projectiles.push(mergedProjectile);
        }
        
        console.log("MERGED FLAME EXPLOSION! 💥");
        mergedFlameWasCharged = false;
        mergedFlameShotCooldown = SHOT_COOLDOWN * 5;
      }
      
      // Draw charging flame (hide during cooldown)
      if (twoHandsMergedScale > 0.5 && mergedFlameShotCooldown === 0) {
        flame(mergedPalmCenter.x, mergedPalmCenter.y, HALF_PI, twoHandsMergedScale * 1.15, 'blue', twoHandsMergedAlpha);
        flame(mergedPalmCenter.x, mergedPalmCenter.y, 0, twoHandsMergedScale, 'purple', twoHandsMergedAlpha);
      }
    } else {
      // Normal mode: static merged flame
      flame(mergedPalmCenter.x, mergedPalmCenter.y, HALF_PI, twoHandsMergedScale * 1.15, 'blue', twoHandsMergedAlpha);
      flame(mergedPalmCenter.x, mergedPalmCenter.y, 0, twoHandsMergedScale, 'purple', twoHandsMergedAlpha);
      mergedFlameWasCharged = false;
    }
  } else {
    mergedFlameWasCharged = false;
  }

  /* ----------------------------------------------------------------
     UPDATE AND DRAW PROJECTILES
     ---------------------------------------------------------------- */
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].draw();
    if (projectiles[i].isDead()) {
      projectiles.splice(i, 1);
    }
  }
  
  /* ----------------------------------------------------------------
     UPDATE AND DRAW TRAVELING FLAMES
     ---------------------------------------------------------------- */
  for (let i = travelingFlames.length - 1; i >= 0; i--) {
    travelingFlames[i].update();
    travelingFlames[i].draw();
    if (travelingFlames[i].isDone()) {
      travelingFlames.splice(i, 1);
    }
  }

  /* ----------------------------------------------------------------
     DRAW STATIC IMAGE (SUN)
     ---------------------------------------------------------------- */
  if (myImage) {
    push();
    imageMode(CORNER);
    image(myImage, 20, 20, 150, 150);
    pop();
  }

  /* ----------------------------------------------------------------
     SHOOTING MODE INDICATOR
     ---------------------------------------------------------------- */
  if (shootingMode) {
    push();
    fill(255, 100, 0, 200);
    textSize(20);
    textAlign(CENTER);
    text("SHOOTING MODE: ON", width / 2, 30);
    pop();
  }
}

/* ====================================================================
   FLAME RENDERING FUNCTION
   Draws flames with different colors and animations
   Parameters:
   - x, y: position
   - angle: rotation angle
   - scaleFactor: size multiplier
   - redMode: false (orange), true (red), 'blue', 'purple'
   - alpha: transparency (0-1)
   ==================================================================== */
function flame(x, y, angle, scaleFactor = 2, redMode = false, alpha = 1) {
  push();
  translate(x, y);
  if (typeof angle === 'undefined' || isNaN(angle)) angle = 0;
  rotate(angle);

  // Smooth pulsing effect
  let phaseOffset = ((x || 0) + (y || 0)) * 0.01;
  let freq = 0.12;
  let amp = 0.06;
  let flicker = 1 + amp * sin(frameCount * freq + phaseOffset);
  scale(flicker * scaleFactor);

  noStroke();
  alpha = constrain(alpha, 0, 1);

  if (redMode === 'blue') {
    // BLUE FLAME
    fill(80, 140, 255, 100 * alpha);
    ellipse(0, 0, 80, 100);

    push();
    let spinSpeed = 1;
    let offset = ((x || 0) + (y || 0)) * 0.01;
    let spin = frameCount * spinSpeed + offset;
    rotate(spin);
    fill(100, 170, 255, 180 * alpha);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    pop();

    push();
    rotate(frameCount * 1 + offset);
    fill(160, 200, 255, 220 * alpha);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
    pop();
    
  } else if (redMode === 'purple') {
    // PURPLE FLAME
    fill(128, 0, 255, 100 * alpha);
    ellipse(0, 0, 80, 100);

    push();
    let spinSpeed = 1;
    let offset = ((x || 0) + (y || 0)) * 0.01;
    let spin = frameCount * spinSpeed + offset;
    rotate(spin);
    fill(160, 60, 255, 180 * alpha);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    pop();

    push();
    rotate(frameCount * 1 + offset);
    fill(200, 120, 255, 220 * alpha);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
    pop();
    
  } else if (redMode) {
    // RED FLAME
    fill(255, 0, 0, 100 * alpha);
    ellipse(0, 0, 80, 100);

    push();
    let spinSpeed = 1;
    let offset = ((x || 0) + (y || 0)) * 0.01;
    let spin = frameCount * spinSpeed + offset;
    rotate(spin);
    fill(255, 40, 40, 180 * alpha);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    pop();

    push();
    rotate(frameCount * 1 + offset);
    fill(255, 100, 100, 220 * alpha);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
    pop();
    
  } else {
    // ORANGE FLAME
    fill(255, 80, 0, 100 * alpha);
    ellipse(0, 0, 80, 100);

    push();
    let spinSpeed = 1;
    let offset = ((x || 0) + (y || 0)) * 0.01;
    let spin = frameCount * spinSpeed + offset;
    rotate(spin);
    fill(255, 140, 0, 180 * alpha);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    pop();

    push();
    rotate(frameCount * 1 + offset);
    fill(255, 255, 0, 220 * alpha);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
    pop();
  }

  pop();
}

/* ----------------------------------------------------------------
   HELPER FUNCTION: DRAW HAND SKELETON
   ---------------------------------------------------------------- */
function drawConnections(hand) {
  push()
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(255, 0, 0);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop()
}
