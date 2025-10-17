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
