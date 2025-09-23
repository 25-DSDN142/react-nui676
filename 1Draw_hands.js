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

    //  let pinkyFingerTipX = hand.pinky_finger_tip.x;
    //  let pinkyFingerTipY = hand.pinky  _finger_tip.y;

    /*
    Start drawing on the hands here
    */
   let middleOfHandX = (middleFingerTipX + wristX) / 2
   let middleOfHandY = (middleFingerTipY + wristY) / 2

    fill(225, 225, 0);
    ellipse(middleOfHandX, middleOfHandY, 30, 30);

    fill (0);
    rect (wristX, wristY, 30, 30);

    strokeWeight(2);
    stroke (0);
    line (middleFingerTipX, middleFingerTipY, indexFingerTipX, indexFingerTipY);
    line (thumbTipX, thumbTipY, middleFingerTipX, middleFingerTipY);
  
  // Calculate angle between middle finger tip and pip (proximal interphalangeal joint)
  let middleFingerPipX = hand.middle_finger_pip.x;
  let middleFingerPipY = hand.middle_finger_pip.y;
  let angle = Math.atan2(middleFingerTipY - middleFingerPipY, middleFingerTipX - middleFingerPipX);
  flame(middleFingerTipX, middleFingerTipY, angle);


    //drawPoints(hand)

    fingerPuppet(indexFingerTipX, indexFingerTipY);



    //chameleonHandPuppet(hand)

    /*
    Stop drawing on the hands here
    */
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 
  //------------------------------------------------------
}

function flame(x, y, angle) {
  push();
  translate(x, y);
  rotate(angle - Math.PI/2); // Make flame point away from finger
  // Optionally scale the flame to fit the finger size
  // scale(0.2); // Uncomment and adjust if needed
  beginShape();
  vertex(0, 50); // bottom center

  // left side curve
  bezierVertex(-40, 20, -60, -30, -20, -60);
  bezierVertex(-30, -90, 0, -120, 0, -100);

  // right side curve
  bezierVertex(0, -120, 30, -90, 20, -60);
  bezierVertex(60, -30, 40, 20, 0, 50);

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