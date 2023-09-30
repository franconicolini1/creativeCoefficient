// This class should be in another file, but for the sake of simplicity I'll leave it here.
class Stack {
  constructor() {
    this.items = [];
  }

  push(value) {
    this.items.push(value);
  }

  pop() {
    if (this.items.length === 0) throw new Error('Stack is empty');
    return this.items.pop();
  }

  peek() {
    if (this.items.length === 0) throw new Error('Stack is empty');
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}


const validOpenBraces = ['(', '[', '{'];
const validCloseBraces = [')', ']', '}'];


function bracesOrderAreValid(bracesString) {
  if (typeof bracesString !== 'string') throw new Error('Input must be a string');
  
  const openBraces = new Stack();

  for (let brace of bracesString) {
    if (validOpenBraces.includes(brace)) openBraces.push(brace);
    else if (validCloseBraces.includes(brace)) {
        if (openBraces.isEmpty()) return false;

        const lastOpenBrace = openBraces.pop();
        if (validOpenBraces.indexOf(lastOpenBrace) !== validCloseBraces.indexOf(brace))
          return false;
    } else throw new Error('Invalid character');
  }

  return openBraces.isEmpty();
}


console.log("TEST 1: ", bracesOrderAreValid('()[]{}') ? "OK" : "ERROR"); // true
console.log("TEST 2: ", bracesOrderAreValid('([{}])') ? "OK" : "ERROR"); // true
console.log("TEST 3: ", bracesOrderAreValid('([]{})') ? "OK" : "ERROR"); // true
console.log("TEST 4: ", bracesOrderAreValid('') ? "OK" : "ERROR"); // true
console.log("TEST 5: ", bracesOrderAreValid('(}') ? "ERROR" : "OK"); // false
console.log("TEST 6: ", bracesOrderAreValid('[(])') ? "ERROR" : "OK"); // false
console.log("TEST 7: ", bracesOrderAreValid('([]') ? "ERROR" : "OK"); // false
console.log("TEST 8: ", bracesOrderAreValid('[({})](]') ? "ERROR" : "OK"); // false
console.log("TEST 9: ", bracesOrderAreValid(')]}') ? "ERROR" : "OK"); // false

try {
  bracesOrderAreValid('( )'); // error
  console.log('TEST 10: ERROR');
} catch (_) {
  console.log('TEST 10: OK');
}

try {
  bracesOrderAreValid('(a)'); // error
  console.log('TEST 11: ERROR');
} catch (_) {
  console.log('TEST 11: OK');
}
