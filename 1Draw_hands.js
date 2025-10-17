// ----=  HANDS  =----
/* load images here */
function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
}

function drawInteraction(faces, hands) {
  // hands part
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

let ringFingerTipX = hand.ring_finger_tip.x;
let ringFingerTipY = hand.ring_finger_tip.y;
let ringFingerTipZ = hand.ring_finger_tip.z3D;

let pinkyFingerTipX = hand.pinky_finger_tip.x;
let pinkyFingerTipY = hand.pinky_finger_tip.y;
let pinkyFingerTipZ = hand.pinky_finger_tip.z3D;


    //  let pinkyFingerTipX = hand.pinky_finger_tip.x;
    //  let pinkyFingerTipY = hand.pinky  _finger_tip.y;

    /*
    Start drawing on the hands here
    */
  push();
  translate (100, 200);
  flame ();
  pop ();
  
    //chameleonHandPuppet(hand)

    /*
    Stop drawing on the hands here
    */
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 

  //------------------------------------------------------
}
function drawInteraction(faces, hands) {
  let twoHands = hands.length >= 2;
  let blueMode = false;
  let globalScale = 1;
  if (twoHands) {
    // Calculate thumb tip distance
    let t0 = hands[0].thumb_tip;
    let t1 = hands[1].thumb_tip;
    let thumbDist = dist(t0.x, t0.y, t1.x, t1.y);
    // Map thumb distance to scale (adjust min/max as needed)
    globalScale = map(thumbDist, 50, 500, 0.7, 2.5, true);
    blueMode = true;
  }
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (showKeypoints) drawConnections(hand);
    // get index fingertip and palm center (average of MCP joints)
    let indexFingerTipX = hand.index_finger_tip.x;
    let indexFingerTipY = hand.index_finger_tip.y;
    let thumbTipX = hand.thumb_tip.x;
    let thumbTipY = hand.thumb_tip.y;
    let pinkyTipX = hand.pinky_finger_tip.x;
    let pinkyTipY = hand.pinky_finger_tip.y;
    // Palm center as average of MCP joints
    let palmJoints = [
      hand.index_finger_mcp,
      hand.middle_finger_mcp,
      hand.ring_finger_mcp,
      hand.pinky_finger_mcp
    ];
    let palmX = (palmJoints[0].x + palmJoints[1].x + palmJoints[2].x + palmJoints[3].x) / 4;
    let palmY = (palmJoints[0].y + palmJoints[1].y + palmJoints[2].y + palmJoints[3].y) / 4;

    // Calculate openness as distance between thumb and pinky
    let openness = dist(thumbTipX, thumbTipY, pinkyTipX, pinkyTipY);
    // Map openness to a reasonable scale factor (adjust min/max as needed)
    let scaleFactor = twoHands ? globalScale : map(openness, 30, 200, 0.7, 2.2, true);

    // Interpolate flame position from index to palm as hand opens
    // t = 0 (closed) -> index, t = 1 (open) -> palm
    let t = map(openness, 30, 200, 0, 1, true);
    let flameX = lerp(indexFingerTipX, palmX, t);
    let flameY = lerp(indexFingerTipY, palmY, t);

    // draw the flame at the interpolated position, scaling with openness or wrist distance
    flame(flameX, flameY, random(TWO_PI), scaleFactor, blueMode);
  }
}
function flame(x, y, angle, scaleFactor = 1, blueMode = false) {
  push();
  translate(x, y);
  rotate(angle);
  // subtle flicker
  let flicker = random(0.9, 1.1);
  scale(flicker * scaleFactor);

  noStroke();

  if (blueMode) {
    // blue flame
    fill(0, 120, 255, 100);
    ellipse(0, 0, 80, 100);
    fill(0, 180, 255, 180);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    fill(0, 255, 255, 220);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
  } else {
    // orange/yellow flame
    fill(255, 80, 0, 100);
    ellipse(0, 0, 80, 100);
    fill(255, 140, 0, 180);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    fill(255, 255, 0, 220);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
  }
  pop();
}


function flamer(x, y, angle) {
  push();
  strokeWeight (2)
  stroke ("white")
  fill ("orange")
  translate(x, y);
  rotate(angle - Math.PI/2); // Make flame point away from finger
  // Optionally scale the flame to fit the finger size
  // scale(0.2); // Uncomment and adjust if needed
  beginShape();
  vertex(0, 50); // bottom center
  bezierVertex ()

  endShape(CLOSE);
  pop();
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