// ----=  HANDS  =----
/* load images here */
function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
}

function drawInteraction(faces, hands) {
  // hands part
  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
push();
translate (200, 100);
flame ();
pop();
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (showKeypoints) {
      drawConnections(hand)
    }

    // Gesture detection (assume detectHandGesture is available)
    let gesture = typeof detectHandGesture === 'function' ? detectHandGesture(hand) : null;

    // Palm position
    let palmX = hand.palm ? hand.palm.x : hand.wrist.x;
    let palmY = hand.palm ? hand.palm.y : hand.wrist.y;

    if (gesture === 'Fist') {
      // Draw a big flame at the palm
      let angle = 0; // Upright
      push();
      scale(2.2); // Make the flame bigger (adjust as needed)
      flame(palmX / 2.2, palmY / 2.2, angle);
      pop();
    } else {
      // Draw individual finger flames
      let indexFingerTipX = hand.index_finger_tip.x;
      let indexFingerTipY = hand.index_finger_tip.y;
      let middleFingerTipX = hand.middle_finger_tip.x;
      let middleFingerTipY = hand.middle_finger_tip.y;
      let thumbTipX = hand.thumb_tip.x;
      let thumbTipY = hand.thumb_tip.y;
      let middleFingerPipX = hand.middle_finger_pip.x;
      let middleFingerPipY = hand.middle_finger_pip.y;
      let angle = Math.atan2(middleFingerTipY - middleFingerPipY, middleFingerTipX - middleFingerPipX);
      flame(middleFingerTipX, middleFingerTipY, angle);
      flame(indexFingerTipX, indexFingerTipY, angle);
      flame(thumbTipX, thumbTipY, angle);
    }
    // ...existing code...
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 
  //------------------------------------------------------
}

function flame(x, y, angle) {
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

  // left side curve
  bezierVertex(-50, 20, -60, -30, -20, -60);//top flame?
  bezierVertex(-30, -100, 0, -120, 0, -100);//bottom flame

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