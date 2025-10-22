// ----=  HANDS  =----
/* load images here */
function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
}

// per-hand smoothed palm scales
let palmScaleByHand = {};
// per-hand smoothed merged flame scales (for Peace gesture)
let mergedScaleByHand = {};
// per-hand smoothed index (pointing) scale and alpha
let middleScaleByHand = {};
let pointingAlphaByHand = {};
// per-hand smoothed ring (third finger) scale
let ringScaleByHand = {};
// two-hands merged palm state (single blue flame between palms)
let twoHandsMergedAlpha = 0;
let twoHandsMergedScale = 1;
// lock state: once merged, stay merged until wrists separate beyond unlockZ (meters)
let twoHandsMergeLocked = false;

function drawInteraction(faces, hands) {
  // hands part
  // Precompute two-hand palm merge state if there are two hands
  let twoHands = hands && hands.length >= 2;
  let mergedPalmCenter = null;
  if (twoHands) {
    let h0 = hands[0];
    let h1 = hands[1];
    if (h0 && h1 && h0.wrist && h1.wrist) {
      // use wrist 2D distance for activation/position, and z3D for unlock
      let w0x = h0.wrist.x;
      let w0y = h0.wrist.y;
      let w1x = h1.wrist.x;
      let w1y = h1.wrist.y;
      let wristDist2D = dist(w0x, w0y, w1x, w1y);
      // thresholds (px) - tuneable
      const flameStartDist = 50;  // Flame appears when wrists are this far apart
      const flameMaxDist = 300;   // Flame is at max size and disappears beyond this

      let targetAlpha = 0;
      let targetScale = 0;

      // Check if the wrist distance is within the active range
      if (wristDist2D > flameStartDist && wristDist2D < flameMaxDist) {
        // If we are in the sweet spot, the flame is visible
        targetAlpha = 1.0;
        // The scale of the flame is linked to the distance between the wrists.
        // It starts small and gets bigger as the wrists move apart.
        targetScale = map(wristDist2D, flameStartDist, flameMaxDist, 0.5, 4.0, true);
      } else {
        // If the wrists are too close or too far, the flame should not be visible.
        targetAlpha = 0;
        targetScale = 0;
      }

      // Smoothly transition the alpha and scale values to prevent jerky movements
      twoHandsMergedAlpha = lerp(twoHandsMergedAlpha, targetAlpha, 0.18);
      twoHandsMergedScale = lerp(twoHandsMergedScale, targetScale, 0.18);

      // compute a 'top of wrist' point for each hand (a fraction toward the middle fingertip)
      // this places the merged flame above the palms instead of centered on the wrists
  let topFactor = 0.6; // how far from wrist toward middle fingertip (raised higher)
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
      // midpoint between those 'top of wrist' points
      mergedPalmCenter = { x: (top0x + top1x) / 2, y: (top0y + top1y) / 2 };

      // lock/unlock logic using wrist.z3D (meters) if available
      let z0 = typeof h0.wrist.z3D !== 'undefined' ? h0.wrist.z3D : null;
      let z1 = typeof h1.wrist.z3D !== 'undefined' ? h1.wrist.z3D : null;
      const unlockZ = 1.0; // meters apart to unlock
      if (!twoHandsMergeLocked && twoHandsMergedAlpha > 0.9) {
        // lock when fully merged
        twoHandsMergeLocked = true;
      }
      if (twoHandsMergeLocked && z0 !== null && z1 !== null) {
        // compute absolute distance in z (approx meters if z3D is in meters)
        let zDist = abs(z0 - z1);
        if (zDist > unlockZ) {
          twoHandsMergeLocked = false;
        }
      }
    }
  } else {
    // decay alpha if second hand disappears
    twoHandsMergedAlpha = lerp(twoHandsMergedAlpha, 0, 0.2);
  }
  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    //console.log(hand);
    if (showKeypoints) {
      drawConnections(hand)
    }

    // This is how to load in the x and y of a point on the hand.
    let indexFingerTipX = hand.index_finger_tip.x;
    let indexFingerTipY = hand.index_finger_tip.y;
    let wristX = hand.wrist.x;
    let wristY = hand.wrist.y;
    let wristZ = hand.wrist.z3D;
    
    let middleFingerTipX = hand.middle_finger_tip.x;
    let middleFingerTipY = hand.middle_finger_tip.y;
    let middleFingerTipZ = hand.middle_finger_tip.z3D;


    let thumbTipX = hand.thumb_tip.x;
    let thumbTipY = hand.thumb_tip.y;
    let thumbTipZ = hand.thumb_tip.z3D;

    //  let pinkyFingerTipX = hand.pinky_finger_tip.x;
    //  let pinkyFingerTipY = hand.pinky  _finger_tip.y;

    /*
    Start drawing on the hands here
    */
   let middleOfHandX = (middleFingerTipX + wristX) / 2;
   let middleOfHandY = (middleFingerTipY + wristY) / 2;

   // map pinky-thumb distance to palm flame scale
   // map index-thumb distance to palm flame scale; hide palm flame when index and thumb touch
   let palmScale = 1;
   let touching = false;
   const touchThreshold = 30; // pixels; adjust based on camera / calibration
   if (hand.index_finger_tip && hand.thumb_tip) {
     let itDist = dist(hand.index_finger_tip.x, hand.index_finger_tip.y, hand.thumb_tip.x, hand.thumb_tip.y);
     if (itDist <= touchThreshold) {
       // index and thumb touching/overlapping -> hide palm flame
       touching = true;
       palmScale = 0;
     } else {
       // map itDist (px) to scale range: touchThreshold -> 0.6, 200px -> 2.5
       palmScale = map(itDist, touchThreshold, 200, 0.6, 2.5, true);
     }
   }

   // smooth palm scale per hand to reduce jitter
   palmScaleByHand[i] = palmScaleByHand[i] || palmScale;
   palmScaleByHand[i] = lerp(palmScaleByHand[i], palmScale, 0.2);

   // only draw palm flame when hand is not a 'Fist'
   // determine gesture once per hand
   let gesture = typeof detectHandGesture === 'function' ? detectHandGesture(hand) : null;

   // only draw palm flame if hand is not a 'Fist', index/thumb are not touching, and not Peace gesture
   // skip per-hand palm flames when a merged two-hand blue flame is active
   if (gesture !== 'Fist' && !touching && gesture !== 'Peace' && twoHandsMergedAlpha < 0.02) {
     // when two hands are visible, show blue palm flames instead of orange
     let palmColorMode = (hands && hands.length >= 2) ? 'blue' : false;
     flame(middleOfHandX, middleOfHandY, 0, palmScaleByHand[i], palmColorMode);
   }

  // Peace gesture: merge two flames into one red flame centered between index+middle
  if (gesture === 'Peace') {
    // midpoint between index and middle
    let midX = (indexFingerTipX + middleFingerTipX) / 2;
    let midY = (indexFingerTipY + middleFingerTipY) / 2;
    // distance between index and middle
    let imDist = dist(indexFingerTipX, indexFingerTipY, middleFingerTipX, middleFingerTipY);
  // map distance to merged scale (tweak min/max as needed)
  // reverse behavior: when fingers close, flame larger; when farther, flame smaller
  let targetScale = map(imDist, 10, 200, 3.0, 0.8, true);
    // smooth per-hand
    mergedScaleByHand[i] = mergedScaleByHand[i] || targetScale;
    mergedScaleByHand[i] = lerp(mergedScaleByHand[i], targetScale, 0.2);

    // compute an angle (average direction from wrist to midpoint)
    let angleMid = (atan2(indexFingerTipY - wristY, indexFingerTipX - wristX) +
                    atan2(middleFingerTipY - wristY, middleFingerTipX - wristX)) / 2;
    // draw single merged red flame
    flame(midX, midY, angleMid, mergedScaleByHand[i], true);
  } else {
    // default: draw index flame only when pointing gesture is active
    // smooth alpha for fade in/out
    pointingAlphaByHand[i] = pointingAlphaByHand[i] || 0;
    let targetAlpha = (gesture === 'Pointing') ? 1 : 0;
    pointingAlphaByHand[i] = lerp(pointingAlphaByHand[i], targetAlpha, 0.25);

    if (pointingAlphaByHand[i] > 0.02) {
      // compute angle for index flame
      let angleIdx = 0;
      if (typeof wristX !== 'undefined' && typeof wristY !== 'undefined') {
        angleIdx = atan2(indexFingerTipY - wristY, indexFingerTipX - wristX);
      }

      // compute depth-based scale (prefer z3D if available)
      let targetScale = 1;
      const minScale = 0.2; // when closest
      const maxScale = 0.8; // when farthest

      if (typeof middleFingerTipZ !== 'undefined' && middleFingerTipZ !== null) {
        // many models use negative z for closer points; negate to get "larger = closer"
        let depthVal = -middleFingerTipZ;
        // tune these based on your camera; these are reasonable starting points
        let minDepth = 0.05; // very close
        let maxDepth = 0.6;  // far
        // we want closer -> smaller, farther -> larger, so map depthVal -> maxScale..minScale
        targetScale = map(depthVal, minDepth, maxDepth, maxScale, minScale, true);
      } else {
        // fallback: use pixel distance between middle tip and wrist as proxy (larger pixel dist ~ closer)
        let pixDist = dist(middleFingerTipX, middleFingerTipY, wristX, wristY);
        let minPix = 20;
        let maxPix = 300;
        // pixDist larger => closer, so map to maxScale..minScale to make closer->smaller
        targetScale = map(pixDist, minPix, maxPix, maxScale, minScale, true);
      }

      // smooth scale per-hand
      middleScaleByHand[i] = middleScaleByHand[i] || targetScale;
      middleScaleByHand[i] = lerp(middleScaleByHand[i], targetScale, 0.2);

      // draw orange flame at index with alpha fade
      flame(indexFingerTipX, indexFingerTipY, angleIdx, middleScaleByHand[i], false, pointingAlphaByHand[i]);
    }
  }

    

    //chameleonHandPuppet(hand)

    /*
    Stop drawing on the hands here
    */
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 
  //------------------------------------------------------
  // after drawing this frame's hands, if two-hands merged center is present, draw merged blue flame
  if (mergedPalmCenter && twoHandsMergedAlpha > 0.02) {
    // draw merged blue flame between palms
    flame(mergedPalmCenter.x, mergedPalmCenter.y, 0, twoHandsMergedScale, 'blue', twoHandsMergedAlpha);
  }
}

function flame(x, y, angle, scaleFactor = 2, redMode = false, alpha = 1) {
  push();
  translate(x, y);
  // guard angle (if caller didn't pass it)
  if (typeof angle === 'undefined' || isNaN(angle)) angle = 0;
  rotate(angle);

    // smooth sinusoidal flicker (gentle pulse) with per-flame phase offset
    // freq controls speed, amp controls strength
    let phaseOffset = ((x || 0) + (y || 0)) * 0.01;
    let freq = 0.12; // speed of wobble (radians/frame)
    let amp = 0.06;  // amplitude (6% around 1.0)
    let flicker = 1 + amp * sin(frameCount * freq + phaseOffset);
  scale(flicker * scaleFactor);

  noStroke();

  // clamp alpha
  alpha = constrain(alpha, 0, 1);

  // redMode can be boolean (true for red) or string 'blue' for blue palms
  if (redMode === 'blue') {
    // blue flame variant (used for two-hand palm mode)
    fill(80, 140, 255, 100 * alpha);
    ellipse(0, 0, 80, 100);

    push();
    let spinSpeedsB = 1;
    let offsetsB = ((x || 0) + (y || 0)) * 0.01;
    let spinsB = frameCount * spinSpeedsB + offsetsB;
    rotate(spinsB);
    fill(100, 170, 255, 180 * alpha);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    pop();

    push();
    let spinSpeedB = 1;
    let offsetB = ((x || 0) + (y || 0)) * 0.01;
    let spinB = frameCount * spinSpeedB + offsetB;
    rotate(spinB);
    fill(160, 200, 255, 220 * alpha);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
    pop();
  } else if (redMode) {
    // red flame colors
    fill(255, 0, 0, 100 * alpha);
    ellipse(0, 0, 80, 100);

    push();
    let spinSpeeds = 1;
    let offsets = ((x || 0) + (y || 0)) * 0.01;
    let spins = frameCount * spinSpeeds + offsets;
    rotate(spins);
  fill(255, 40, 40, 180 * alpha);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    pop();

    push();
    let spinSpeed = 1;
    let offset = ((x || 0) + (y || 0)) * 0.01;
    let spin = frameCount * spinSpeed + offset;
    rotate(spin);
  fill(255, 100, 100, 220 * alpha);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
    pop();
  } else {
  // outer glow (unchanging)
  fill(255, 80, 0, 100 * alpha);
    ellipse(0, 0, 80, 100);

    // main body (unchanging)
    push();
    let spinSpeeds = 1; // radians per frame multiplier
    let offsets = ((x || 0) + (y || 0)) * 0.01; // i dont know what this is i just asked co pilot to make it spin
    let spins = frameCount * spinSpeeds + offsets;
    rotate(spins);
  fill(255, 140, 0, 180 * alpha);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    pop();

    push();
    let spinSpeed = 1; // radians per frame multiplier
    let offset = ((x || 0) + (y || 0)) * 0.01; 
    let spin = frameCount * spinSpeed + offset;
    rotate(spin);
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


function chatflame (x, y) {
  
  beginShape();
  vertex(200, 450);          // bottom center

  // left side curve
  bezierVertex(120, 400, 80, 300, 150, 200);
  bezierVertex(100, 100, 160, 50, 200, 80);

  // right side curve
  bezierVertex(240, 50, 300, 100, 250, 200);
  bezierVertex(320, 300, 280, 400, 200, 450);

  endShape(CLOSE);

}


function fingerPuppet(x, y) {
  fill(255, 38, 219) // pink
  ellipse(x, y, 100, 20)
  ellipse(x, y, 20, 100)

  fill(255, 252, 48) // yellow
  ellipse(x, y, 20) // draw center 

}


function pinchCircle(hand) { // adapted from https://editor.p5js.org/ml5/sketches/DNbSiIYKB
  // Find the index finger tip and thumb tip
  let finger = hand.index_finger_tip;
  //let finger = hand.pinky_finger_tip;
  let thumb = hand.thumb_tip;

  // Draw circles at finger positions
  let centerX = (finger.x + thumb.x) / 2;
  let centerY = (finger.y + thumb.y) / 2;
  // Calculate the pinch "distance" between finger and thumb
  let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

  // This circle's size is controlled by a "pinch" gesture
  fill(0, 255, 0, 200);
  stroke(0);
  strokeWeight(2);
  circle(centerX, centerY, pinch);

}

function chameleonHandPuppet(hand) {
  // Find the index finger tip and thumb tip
  // let finger = hand.index_finger_tip;

  let finger = hand.middle_finger_tip; // this finger now contains the x and y infomation! you can access it by using finger.x 
  let thumb = hand.thumb_tip;

  // Draw circles at finger positions
  let centerX = (finger.x + thumb.x) / 2;
  let centerY = (finger.y + thumb.y) / 2;
  // Calculate the pinch "distance" between finger and thumb
  let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

  // This circle's size is controlled by a "pinch" gesture
  fill(0, 255, 0, 200);
  stroke(0);
  strokeWeight(2);
  circle(centerX, centerY, pinch);

  let indexFingerTipX = hand.index_finger_tip.x;
  let indexFingerTipY = hand.index_finger_tip.y;
  fill(0)
  circle(indexFingerTipX, indexFingerTipY, 20);

}

function drawConnections(hand) {
  // Draw the skeletal connections
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


// This function draw's a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature) {
  push()
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(0, 255, 0);
    circle(element.x, element.y, 10);
  }
  pop()

}