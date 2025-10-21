// ----=  HANDS  =----
/* load images here */
function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
}

function drawInteraction(faces, hands) {
  // hands part
  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
  if (hands.length === 2) {
    // Get middle finger tips
    let m1 = hands[0].middle_finger_tip;
    let m2 = hands[1].middle_finger_tip;
    let distMF = dist(m1.x, m1.y, m2.x, m2.y);
    // Get palm centers
    let palm1 = (hands[0].index_finger_mcp.x + hands[0].middle_finger_mcp.x + hands[0].ring_finger_mcp.x + hands[0].pinky_finger_mcp.x + hands[0].wrist.x) / 5;
    let palm2 = (hands[1].index_finger_mcp.x + hands[1].middle_finger_mcp.x + hands[1].ring_finger_mcp.x + hands[1].pinky_finger_mcp.x + hands[1].wrist.x) / 5;
    let palm1Y = (hands[0].index_finger_mcp.y + hands[0].middle_finger_mcp.y + hands[0].ring_finger_mcp.y + hands[0].pinky_finger_mcp.y + hands[0].wrist.y) / 5;
    let palm2Y = (hands[1].index_finger_mcp.y + hands[1].middle_finger_mcp.y + hands[1].ring_finger_mcp.y + hands[1].pinky_finger_mcp.y + hands[1].wrist.y) / 5;
    // Midpoint between palms
    let midX = (palm1 + palm2) / 2;
    let midY = (palm1Y + palm2Y) / 2;
    // Map distance to scale
    let minDist = 50, maxDist = 300;
    let minScale = 0.7, maxScale = 2.5;
    let scaleFactor = map(distMF, minDist, maxDist, minScale, maxScale, true);
    // If hands are close, draw one flame
    if (distMF < 150) {
      flame(midX, midY, random(TWO_PI), scaleFactor, true, false);
    } else {
      // Otherwise, draw individual blue flames on each palm
      flame(palm1, palm1Y, random(TWO_PI), 1, true, false);
      flame(palm2, palm2Y, random(TWO_PI), 1, true, false);
    }
    return;
  }
  // Single hand or more than two: normal gesture logic
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (showKeypoints) drawConnections(hand);
    let gesture = detectHandGesture(hand);
    if (gesture === "Peace") {
      flame(hand.index_finger_tip.x, hand.index_finger_tip.y, random(TWO_PI), 1, false, true);
      flame(hand.middle_finger_tip.x, hand.middle_finger_tip.y, random(TWO_PI), 1, false, true);
      continue;
    }
    if (gesture === "Open Palm") {
      let palmCenterX = (hand.index_finger_mcp.x + hand.middle_finger_mcp.x + hand.ring_finger_mcp.x + hand.pinky_finger_mcp.x + hand.wrist.x) / 5;
      let palmCenterY = (hand.index_finger_mcp.y + hand.middle_finger_mcp.y + hand.ring_finger_mcp.y + hand.pinky_finger_mcp.y + hand.wrist.y) / 5;
      let scaleFactor = map(dist(hand.pinky_finger_tip.x, hand.pinky_finger_tip.y, hand.thumb_tip.x, hand.thumb_tip.y), 30, 200, 0.7, 2.2, true);
      flame(palmCenterX, palmCenterY, random(TWO_PI), scaleFactor, false, true);
      continue;
    }
    flame(hand.index_finger_tip.x, hand.index_finger_tip.y, random(TWO_PI));
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 

  //------------------------------------------------------
}

function flame(x, y, angle, scaleFactor = 1, blueMode = false, redMode = false) {
  push();
  translate(x, y);
  rotate(angle);
  let flicker = random(0.9, 1.1);
  scale(flicker * scaleFactor);
  noStroke();
  if (redMode) {
    // vibrant red flame.
    fill(255, 0, 0, 120);
    ellipse(0, 0, 80, 100);
    fill(255, 40, 40, 200);
    beginShape();
    vertex(0, 40);
    bezierVertex(-20, 10, -10, -40, 0, -60);
    bezierVertex(10, -40, 20, 10, 0, 40);
    endShape(CLOSE);
    fill(255, 100, 100, 255);
    beginShape();
    vertex(0, 30);
    bezierVertex(-10, 5, -5, -30, 0, -40);
    bezierVertex(5, -30, 10, 5, 0, 30);
    endShape(CLOSE);
  } else if (blueMode) {
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
