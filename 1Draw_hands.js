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


  //Start drawing on the hands here

  
    //chameleonHandPuppet(hand)

    /*
    Stop drawing on the hands here
    */
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 

  //------------------------------------------------------
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
function drawInteraction(faces, hands) {
  let twoHands = hands.length >= 2;
  let blueMode = false;
  let globalScale = 0.5;
  if (twoHands) {
    // Calculate palm center distance
    let palmJointsA = [
      hands[0].index_finger_mcp,
      hands[0].middle_finger_mcp,
      hands[0].ring_finger_mcp,
      hands[0].pinky_finger_mcp
    ];
    let palmAX = (palmJointsA[0].x + palmJointsA[1].x + palmJointsA[2].x + palmJointsA[3].x) / 4;
    let palmAY = (palmJointsA[0].y + palmJointsA[1].y + palmJointsA[2].y + palmJointsA[3].y) / 4;
    let palmJointsB = [
      hands[1].index_finger_mcp,
      hands[1].middle_finger_mcp,
      hands[1].ring_finger_mcp,
      hands[1].pinky_finger_mcp
    ];
    let palmBX = (palmJointsB[0].x + palmJointsB[1].x + palmJointsB[2].x + palmJointsB[3].x) / 4;
    let palmBY = (palmJointsB[0].y + palmJointsB[1].y + palmJointsB[2].y + palmJointsB[3].y) / 4;
    let palmDist = dist(palmAX, palmAY, palmBX, palmBY);
    // If hands are apart enough, merge flames
    if (palmDist > 150) { // threshold for "apart" (adjust as needed)
      blueMode = true;
      let midX = (palmAX + palmBX) / 2;
      let midY = (palmAY + palmBY) / 2;
      let bigScale = map(palmDist, 150, 500, 1.2, 3, true);
      flame(midX, midY, 0, bigScale, blueMode);
    } else {
      // Draw individual flames
        for (let i = 0; i < hands.length; i++) {
          let hand = hands[i];
          if (showKeypoints) drawConnections(hand);
          let indexFingerTipX = hand.index_finger_tip.x;
          let indexFingerTipY = hand.index_finger_tip.y;
          let thumbTipX = hand.thumb_tip.x;
          let thumbTipY = hand.thumb_tip.y;
          let pinkyTipX = hand.pinky_finger_tip.x;
          let pinkyTipY = hand.pinky_finger_tip.y;
          let palmJoints = [
            hand.index_finger_mcp,
            hand.middle_finger_mcp,
            hand.ring_finger_mcp,
            hand.pinky_finger_mcp
          ];
          let palmX = (palmJoints[0].x + palmJoints[1].x + palmJoints[2].x + palmJoints[3].x) / 4;
          let palmY = (palmJoints[0].y + palmJoints[1].y + palmJoints[2].y + palmJoints[3].y) / 4;
          let openness = dist(thumbTipX, thumbTipY, pinkyTipX, pinkyTipY);
          let scaleFactor = map(openness, 30, 200, 0.7, 2.2, true);
          let t = map(openness, 30, 200, 0, 1, true);
          let flameX = lerp(indexFingerTipX, palmX, t);
          let flameY = lerp(indexFingerTipY, palmY, t);
          flame(flameX, flameY, random(TWO_PI), scaleFactor, blueMode);
        }
    }
  } else {
    // One hand: draw individual flame
    for (let i = 0; i < hands.length; i++) {
      let hand = hands[i];
      if (showKeypoints) drawConnections(hand);
      let indexFingerTipX = hand.index_finger_tip.x;
      let indexFingerTipY = hand.index_finger_tip.y;
      let thumbTipX = hand.thumb_tip.x;
      let thumbTipY = hand.thumb_tip.y;
      let pinkyTipX = hand.pinky_finger_tip.x;
      let pinkyTipY = hand.pinky_finger_tip.y;
      let palmJoints = [
        hand.index_finger_mcp,
        hand.middle_finger_mcp,
        hand.ring_finger_mcp,
        hand.pinky_finger_mcp
      ];
      let palmX = (palmJoints[0].x + palmJoints[1].x + palmJoints[2].x + palmJoints[3].x) / 4;
      let palmY = (palmJoints[0].y + palmJoints[1].y + palmJoints[2].y + palmJoints[3].y) / 4;
      let openness = dist(thumbTipX, thumbTipY, pinkyTipX, pinkyTipY);
      let scaleFactor = map(openness, 30, 200, 0.7, 2.2, true);
      let t = map(openness, 30, 200, 0, 1, true);
      let flameX = lerp(indexFingerTipX, palmX, t);
      let flameY = lerp(indexFingerTipY, palmY, t);
      flame(flameX, flameY, random(TWO_PI), scaleFactor, false);
    }
  }

  // --- EYE GLOW LOGIC ---
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    let leftEyeCenterX = face.leftEye.centerX;
    let leftEyeCenterY = face.leftEye.centerY;
    let leftEyeWidth = face.leftEye.width;
    let leftEyeHeight = face.leftEye.height;
    let rightEyeCenterX = face.rightEye.centerX;
    let rightEyeCenterY = face.rightEye.centerY;
    let rightEyeWidth = face.rightEye.width;
    let rightEyeHeight = face.rightEye.height;
    noStroke();
    if (blueMode) {
      fill(0, 180, 255);
    } else {
      fill(225, 225, 0);
    }
    ellipse(leftEyeCenterX, leftEyeCenterY, leftEyeWidth, leftEyeHeight);
    ellipse(rightEyeCenterX, rightEyeCenterY, rightEyeWidth, rightEyeHeight);
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