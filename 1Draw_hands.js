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
   let handedness = hand.handedness; // "Left" or "Right"
// Wrist
let wristX = hand.wrist.x;
let wristY = hand.wrist.y;
let wristZ = hand.wrist.z3D;

// Thumb
let thumbCmcX = hand.thumb_cmc.x;
let thumbCmcY = hand.thumb_cmc.y;
let thumbCmcZ = hand.thumb_cmc.z3D;

let thumbMcpX = hand.thumb_mcp.x;
let thumbMcpY = hand.thumb_mcp.y;
let thumbMcpZ = hand.thumb_mcp.z3D;

let thumbIpX = hand.thumb_ip.x;
let thumbIpY = hand.thumb_ip.y;
let thumbIpZ = hand.thumb_ip.z3D;

let thumbTipX = hand.thumb_tip.x;
let thumbTipY = hand.thumb_tip.y;
let thumbTipZ = hand.thumb_tip.z3D;

// Index finger
let indexFingerMcpX = hand.index_finger_mcp.x;
let indexFingerMcpY = hand.index_finger_mcp.y;
let indexFingerMcpZ = hand.index_finger_mcp.z3D;

let indexFingerPipX = hand.index_finger_pip.x;
let indexFingerPipY = hand.index_finger_pip.y;
let indexFingerPipZ = hand.index_finger_pip.z3D;

let indexFingerDipX = hand.index_finger_dip.x;
let indexFingerDipY = hand.index_finger_dip.y;
let indexFingerDipZ = hand.index_finger_dip.z3D;

let indexFingerTipX = hand.index_finger_tip.x;
let indexFingerTipY = hand.index_finger_tip.y;
let indexFingerTipZ = hand.index_finger_tip.z3D;

// Middle finger
let middleFingerMcpX = hand.middle_finger_mcp.x;
let middleFingerMcpY = hand.middle_finger_mcp.y;
let middleFingerMcpZ = hand.middle_finger_mcp.z3D;

let middleFingerPipX = hand.middle_finger_pip.x;
let middleFingerPipY = hand.middle_finger_pip.y;
let middleFingerPipZ = hand.middle_finger_pip.z3D;

let middleFingerDipX = hand.middle_finger_dip.x;
let middleFingerDipY = hand.middle_finger_dip.y;
let middleFingerDipZ = hand.middle_finger_dip.z3D;

let middleFingerTipX = hand.middle_finger_tip.x;
let middleFingerTipY = hand.middle_finger_tip.y;
let middleFingerTipZ = hand.middle_finger_tip.z3D;

// Ring finger
let ringFingerMcpX = hand.ring_finger_mcp.x;
let ringFingerMcpY = hand.ring_finger_mcp.y;
let ringFingerMcpZ = hand.ring_finger_mcp.z3D;

let ringFingerPipX = hand.ring_finger_pip.x;
let ringFingerPipY = hand.ring_finger_pip.y;
let ringFingerPipZ = hand.ring_finger_pip.z3D;

let ringFingerDipX = hand.ring_finger_dip.x;
let ringFingerDipY = hand.ring_finger_dip.y;
let ringFingerDipZ = hand.ring_finger_dip.z3D;

let ringFingerTipX = hand.ring_finger_tip.x;
let ringFingerTipY = hand.ring_finger_tip.y;
let ringFingerTipZ = hand.ring_finger_tip.z3D;

// Pinky finger
let pinkyFingerMcpX = hand.pinky_finger_mcp.x;
let pinkyFingerMcpY = hand.pinky_finger_mcp.y;
let pinkyFingerMcpZ = hand.pinky_finger_mcp.z3D;

let pinkyFingerPipX = hand.pinky_finger_pip.x;
let pinkyFingerPipY = hand.pinky_finger_pip.y;
let pinkyFingerPipZ = hand.pinky_finger_pip.z3D;

let pinkyFingerDipX = hand.pinky_finger_dip.x;
let pinkyFingerDipY = hand.pinky_finger_dip.y;
let pinkyFingerDipZ = hand.pinky_finger_dip.z3D;

let pinkyFingerTipX = hand.pinky_finger_tip.x;
let pinkyFingerTipY = hand.pinky_finger_tip.y;
        
    // Map flame size to distance between pinky and thumb (wider = bigger)
    let pinkyTipX = hand.pinky_finger_tip.x;
    let pinkyTipY = hand.pinky_finger_tip.y;
    let thumbTipX = hand.thumb_tip.x;
    let thumbTipY = hand.thumb_tip.y;
    let pinkyThumbDist = dist(pinkyTipX, pinkyTipY, thumbTipX, thumbTipY);
    let scaleFactor = map(pinkyThumbDist, 30, 200, 0.7, 2.2, true);
let pinkyFingerTipZ = hand.pinky_finger_tip.z3D;


// Place flame in the middle of the palm (average of MCP joints and wrist)
let palmCenterX = (hand.index_finger_mcp.x + hand.middle_finger_mcp.x + hand.ring_finger_mcp.x + hand.pinky_finger_mcp.x + hand.wrist.x) / 5;
let palmCenterY = (hand.index_finger_mcp.y + hand.middle_finger_mcp.y + hand.ring_finger_mcp.y + hand.pinky_finger_mcp.y + hand.wrist.y) / 5;
let flameX = palmCenterX;
let flameY = palmCenterY;

  //Start drawing on the hands here
  
flame(flameX, flameY, random(TWO_PI))

    /*
    Stop drawing on the hands here
    */
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 

  //------------------------------------------------------
}

function flame (x, y, angle){
  push ();
  translate (x, y);
  rotate (angle);

  let flicker = random(0.9, 1.1);
  scale (flicker);
  noStroke ();

  //outer glow part
  fill (255, 80, 0, 100)//(255, 80, 0);//orangey red
  ellipse (0, 0, 80, 100);
  //main bit
  fill (255, 140, 0, 180);//(255, 140, 0);//warm orange?
  beginShape ();
  vertex (0, 40);
  bezierVertex (-20, 10, -10, -40, 0, -60);
  bezierVertex (10, -40, 20, 10, 0, 40);
  endShape (CLOSE);
  //inner bit
  fill (255, 255, 0, 220)//(255, 255, 0);//yellow
  beginShape();
  vertex (0, 30);
  bezierVertex (-10, 5, -5, -30, 0, -40);
  bezierVertex (5, -30, 10, 5, 0, 30);
  endShape (CLOSE);
  pop();
  //
function flame (x, y, angle, scaleFactor = 1, blueMode = false) {
  push();
  translate(x, y);
  rotate(angle);
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

}
