const RIGHT = "RIGHT";
const LEFT = "LEFT";
const PICK = "PICK";
const PLACE = "PLACE";
const WARNING = "WARNING";
const FINISHED = "FINISHED";
const MIN_BOXES_AMOUNT = 1;
const MAX_BOXES_AMOUNT = 16;
const MIN_BOXES_PER_STACK = 0;
const MAX_BOXES_PER_STACK = 5;
const MAX_CLAW_POSITION = 7;
const MIN_CLAW_POSITION = 0;
const MIN_STACK_AMOUNT = 2;
const MAX_STACK_AMOUNT = 8;


function validateArguments(clawPos, boxes, boxInClaw) {
  if (typeof clawPos !== 'number') throw new Error('Claw position must be a number');
  if (clawPos < MIN_CLAW_POSITION || clawPos > MAX_CLAW_POSITION)
    throw new Error(`Claw position must be between ${MIN_CLAW_POSITION} and ${MAX_CLAW_POSITION}`)

  if (!Array.isArray(boxes)) throw new Error('Boxes must be an array');
  if (clawPos > boxes.length - 1) throw new Error('Claw position must be less than the amount of stacks');

  if (boxInClaw !== 0 && boxInClaw !== 1) throw new Error('Box in claw must be 0 or 1');
  if (boxes.length < MIN_STACK_AMOUNT || boxes.length > MAX_STACK_AMOUNT)
    throw new Error(`Boxes must be between ${MIN_STACK_AMOUNT} and ${MAX_STACK_AMOUNT}`);
  
  let totalOfBoxes = 0

  boxes.forEach((amountPerStack) => {
    if (typeof amountPerStack !== 'number') throw new Error('Box amount must be a number');
    // I am not sure if I should validate the maximum amount of boxes per stack.
    if (amountPerStack < MIN_BOXES_PER_STACK) // || amountPerStack > MAX_BOXES_PER_STACK
      throw new Error(`Box amount must be between ${MIN_BOXES_PER_STACK}`); //  and ${MAX_BOXES_PER_STACK}
    
    totalOfBoxes += amountPerStack;
  })

  if (totalOfBoxes < MIN_BOXES_AMOUNT || totalOfBoxes > MAX_BOXES_AMOUNT)
    throw new Error(`Total of boxes must be between ${MIN_BOXES_AMOUNT} and ${MAX_BOXES_AMOUNT}`);
}

// If it is necessary, the performance could be improved just by checking the closest stacks to the claw.
// In this case, it is not necessary because the amount of stacks and boxes is small.
function getClosestUncompletedStackPos(boxes, clawPos, boxesPerStack, leftoverBoxes) {
  const uncompletedStacks = [];

  boxes.forEach((currentStackAmount, index) => {
    if (currentStackAmount === MAX_BOXES_PER_STACK) return;

    if (currentStackAmount < boxesPerStack) uncompletedStacks.push(index);
    // If it is a stack that has more boxes than the "boxesPerStack".
    if (index < leftoverBoxes && currentStackAmount === boxesPerStack) uncompletedStacks.push(index);
  })

  if (uncompletedStacks.length === 0) throw new Error('There are no uncompleted stacks');

  return uncompletedStacks.reduce((prev, curr) => Math.abs(curr - clawPos) < Math.abs(prev - clawPos) ? curr : prev);
}

function checkIfFinished(boxes, boxesPerStack, leftoverBoxes) {
  let finished = true;

  boxes.forEach((currentStackAmount, index) => {
    if (currentStackAmount < boxesPerStack) finished = false;
    if (index < leftoverBoxes && currentStackAmount === boxesPerStack) finished = false;
  })

  return finished
}

// If it is necessary, the performance could be improved just by checking the closest stacks to the claw.
// In this case, it is not necessary because the amount of stacks and boxes is small.
function getClosestOverloadedStackPos(boxes, clawPos, boxesPerStack, leftoverBoxes) {
  const overloadedStacks = [];

  boxes.forEach((currentStackAmount, index) => {
    if (currentStackAmount < boxesPerStack) return;

    // More than max limit per stack
    if (currentStackAmount > boxesPerStack + 1) overloadedStacks.push(index);
    
    // If it has (boxesPerStack + 1) boxes and is not a stack with leftover boxes.
    if (index >= leftoverBoxes && currentStackAmount === boxesPerStack + 1) overloadedStacks.push(index);
  })

  if (overloadedStacks.length === 0) throw new Error('There are no overloaded stacks');

  return overloadedStacks.reduce((prev, curr) => Math.abs(curr - clawPos) < Math.abs(prev - clawPos) ? curr : prev);
}
    
function rearrangeBoxes(clawPos, boxes, boxInClaw) {
  validateArguments(clawPos, boxes, boxInClaw);
  
  const totalStackedBoxes = boxes.reduce((total, amount) => total + amount, 0);
  const totalOfBoxes = boxInClaw === 1 ? totalStackedBoxes + 1 : totalStackedBoxes;
  const boxesPerStack = Math.floor(totalOfBoxes / boxes.length);
  const leftoverBoxes = totalOfBoxes % boxes.length;

  if (checkIfFinished(boxes, boxesPerStack, leftoverBoxes)) return FINISHED;

  if (boxInClaw === 1) {
    if (boxes[clawPos] < boxesPerStack) return PLACE;
    // If it is a stack that has leftover boxes.
    else if (boxes[clawPos] === boxesPerStack && clawPos < leftoverBoxes) return PLACE;
    else {
      try {
        const closestUncompletedStackPos = getClosestUncompletedStackPos(boxes, clawPos, boxesPerStack, leftoverBoxes);
        return closestUncompletedStackPos > clawPos ? RIGHT : LEFT;
      } catch (_) {
        return WARNING;
      }
    }
  }

  try {
    const closestOverloadedStackPos = getClosestOverloadedStackPos(boxes, clawPos, boxesPerStack, leftoverBoxes);
    
    if (closestOverloadedStackPos === clawPos) return PICK;
    else return closestOverloadedStackPos > clawPos ? RIGHT : LEFT;
  } catch (_) {
    return FINISHED;
  }
}


// TESTS

let test1IsOk = true;

test1IsOk &&= rearrangeBoxes(1, [3, 2, 1, 4], 1) === PLACE;
test1IsOk &&= rearrangeBoxes(1, [3, 3, 1, 4], 0) === RIGHT;
test1IsOk &&= rearrangeBoxes(2, [3, 3, 1, 4], 0) === RIGHT;
test1IsOk &&= rearrangeBoxes(3, [3, 3, 1, 4], 0) === PICK;
test1IsOk &&= rearrangeBoxes(3, [3, 3, 1, 3], 1) === LEFT;
test1IsOk &&= rearrangeBoxes(2, [3, 3, 1, 3], 1) === PLACE;
test1IsOk &&= rearrangeBoxes(2, [3, 3, 2, 3], 0) === RIGHT;
test1IsOk &&= rearrangeBoxes(3, [3, 3, 2, 3], 0) === PICK;
test1IsOk &&= rearrangeBoxes(3, [3, 3, 2, 2], 1) === LEFT;
test1IsOk &&= rearrangeBoxes(2, [3, 3, 2, 2], 1) === PLACE;
test1IsOk &&= rearrangeBoxes(2, [3, 3, 3, 2], 0) === FINISHED;

console.log("TEST 1: ", test1IsOk ? "OK" : "ERROR");


let test2IsOk = true;

test2IsOk &&= rearrangeBoxes(0, [4, 2, 1, 4], 1) === RIGHT;
test2IsOk &&= rearrangeBoxes(1, [4, 2, 1, 4], 1) === PLACE;
test2IsOk &&= rearrangeBoxes(1, [4, 3, 1, 4], 0) === LEFT;
test2IsOk &&= rearrangeBoxes(0, [4, 3, 1, 4], 0) === PICK;
test2IsOk &&= rearrangeBoxes(0, [3, 3, 1, 4], 1) === RIGHT;
test2IsOk &&= rearrangeBoxes(1, [3, 3, 1, 4], 1) === RIGHT;
test2IsOk &&= rearrangeBoxes(2, [3, 3, 1, 4], 1) === PLACE;
test2IsOk &&= rearrangeBoxes(2, [3, 3, 2, 4], 0) === RIGHT;
test2IsOk &&= rearrangeBoxes(3, [3, 3, 2, 4], 0) === PICK;
test2IsOk &&= rearrangeBoxes(3, [3, 3, 2, 3], 1) === LEFT;
test2IsOk &&= rearrangeBoxes(2, [3, 3, 2, 3], 1) === PLACE;
test2IsOk &&= rearrangeBoxes(2, [3, 3, 3, 3], 0) === FINISHED;

console.log("TEST 2: ", test2IsOk ? "OK" : "ERROR");


let test3IsOk = true;

test3IsOk &&= rearrangeBoxes(7, [0, 1, 0, 1, 0, 1, 0, 1], 0) === PICK;
test3IsOk &&= rearrangeBoxes(7, [0, 1, 0, 1, 0, 1, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(6, [0, 1, 0, 1, 0, 1, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(5, [0, 1, 0, 1, 0, 1, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(4, [0, 1, 0, 1, 0, 1, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(3, [0, 1, 0, 1, 0, 1, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(2, [0, 1, 0, 1, 0, 1, 0, 0], 1) === PLACE;
test3IsOk &&= rearrangeBoxes(2, [0, 1, 1, 1, 0, 1, 0, 0], 0) === RIGHT;
test3IsOk &&= rearrangeBoxes(3, [0, 1, 1, 1, 0, 1, 0, 0], 0) === RIGHT;
test3IsOk &&= rearrangeBoxes(4, [0, 1, 1, 1, 0, 1, 0, 0], 0) === RIGHT;
test3IsOk &&= rearrangeBoxes(5, [0, 1, 1, 1, 0, 1, 0, 0], 0) === PICK;
test3IsOk &&= rearrangeBoxes(5, [0, 1, 1, 1, 0, 0, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(4, [0, 1, 1, 1, 0, 0, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(3, [0, 1, 1, 1, 0, 0, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(2, [0, 1, 1, 1, 0, 0, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(1, [0, 1, 1, 1, 0, 0, 0, 0], 1) === LEFT;
test3IsOk &&= rearrangeBoxes(0, [0, 1, 1, 1, 0, 0, 0, 0], 1) === PLACE;
test3IsOk &&= rearrangeBoxes(0, [1, 1, 1, 1, 0, 0, 0, 0], 0) === FINISHED;


console.log("TEST 3: ", test3IsOk ? "OK" : "ERROR");

let test4isOk = true;

test4isOk &&= rearrangeBoxes(2, [1, 0, 0], 0) === FINISHED;


console.log("TEST 4: ", test4isOk ? "OK" : "ERROR");


let test5isOk = true;

test5isOk &&= rearrangeBoxes(2, [5, 4, 6], 1) === LEFT;
test5isOk &&= rearrangeBoxes(1, [5, 4, 6], 1) === PLACE;
test5isOk &&= rearrangeBoxes(1, [5, 5, 6], 0) === RIGHT;
test5isOk &&= rearrangeBoxes(2, [5, 5, 6], 0) === PICK;
test5isOk &&= rearrangeBoxes(2, [5, 5, 5], 1) === WARNING;

console.log("TEST 5: ", test5isOk ? "OK" : "ERROR");

let test6isOk = true;

test6isOk &&= rearrangeBoxes(2, [2, 0, 0, 2, 0], 0) === RIGHT;
test6isOk &&= rearrangeBoxes(3, [2, 0, 0, 2, 0], 0) === PICK;
test6isOk &&= rearrangeBoxes(3, [2, 0, 0, 1, 0], 1) === LEFT;
test6isOk &&= rearrangeBoxes(2, [2, 0, 0, 1, 0], 1) === PLACE;
test6isOk &&= rearrangeBoxes(2, [2, 0, 1, 1, 0], 0) === LEFT;
test6isOk &&= rearrangeBoxes(1, [2, 0, 1, 1, 0], 0) === LEFT;
test6isOk &&= rearrangeBoxes(0, [2, 0, 1, 1, 0], 0) === PICK;
test6isOk &&= rearrangeBoxes(0, [1, 0, 1, 1, 0], 1) === RIGHT;
test6isOk &&= rearrangeBoxes(1, [1, 0, 1, 1, 0], 1) === PLACE;
test6isOk &&= rearrangeBoxes(1, [1, 1, 1, 1, 0], 0) === FINISHED;


console.log("TEST 6: ", test6isOk ? "OK" : "ERROR");

try {
  rearrangeBoxes("a", [1, 0, 0, 0, 0, 0, 0, 0], 0);
  console.log("TEST 7:  ERROR");
} catch (_) {
  console.log("TEST 7:  OK");
}

try {
  rearrangeBoxes(-1, [1, 0, 0, 0, 0, 0, 0, 0], 1);
  console.log("TEST 8:  ERROR");
} catch (_) {
  console.log("TEST 8:  OK");
}

try {
  rearrangeBoxes(9, [1, 0, 0, 0, 0, 0, 0, 0], 0);
  console.log("TEST 9:  ERROR");
} catch (_) {
  console.log("TEST 9:  OK");
}

try {
  rearrangeBoxes(4, null, 0);
  console.log("TEST 10: ERROR");
} catch (_) {
  console.log("TEST 10: OK");
}

try {
  rearrangeBoxes(4, [1, 2, 3, 4], 0);
  console.log("TEST 11: ERROR");
} catch (_) {
  console.log("TEST 11: OK");
}

try {
  rearrangeBoxes(4, [1, 2, 3, 4], 2);
  console.log("TEST 12: ERROR");
} catch (_) {
  console.log("TEST 12: OK");
}

try {
  rearrangeBoxes(4, [], 1);
  console.log("TEST 13: ERROR");
} catch (_) {
  console.log("TEST 13: OK");
}

try {
  rearrangeBoxes(4, [1, 2, 3, 1, 1, 1, 1, 1, 1], 1);
  console.log("TEST 14: ERROR");
} catch (_) {
  console.log("TEST 14: OK");
}

try {
  rearrangeBoxes(4, [1, "a", 3, 4, 5, 6, 7, 8, 9], 1);
  console.log("TEST 15: ERROR");
} catch (_) {
  console.log("TEST 15: OK");
}

try {
  rearrangeBoxes(4, [1, -1, 3, 4, 5, 6, 7, 8, 9], 1);
  console.log("TEST 16: ERROR");
} catch (_) {
  console.log("TEST 16: OK");
}

try {
  rearrangeBoxes(4, [0, 0, 0, 0], 1);
  console.log("TEST 17: ERROR");
} catch (_) {
  console.log("TEST 17: OK");
}

try {
  rearrangeBoxes(4, [1, 0, 3, 4, 5, 6, 7, 8, 9], 1);
  console.log("TEST 18: ERROR");
} catch (_) {
  console.log("TEST 18: OK");
}
