// This class should be in a separate file, but for the sake of simplicity I'll leave it here.
class QueueOfNumbers {
  constructor() {
    this.queue = [];
  }
    
  enqueue(item) {
    if (typeof item !== 'number') throw new Error('Item must be a number');
    this.queue.push(item);
  }
    
  dequeue() {
    return this.queue.shift();
  }
    
  isEmpty() {
    return this.queue.length === 0;
  }

  peek() {
    return this.queue[0];
  }

  // This is not a common method in a queue, but it's useful for this exercise.
  sumValues() {
    return this.queue.reduce((prev, curr) => prev + curr, 0);
  }
}

function getMaximunQueueTime(queues) {
  let max = 0;
  
  queues.forEach((queue) => {
    const queueTime = queue.sumValues();
    if (queueTime > max) max = queueTime;
  });

  return max;
}

function queueTime(customers, n) {
  if (n <= 0) throw new Error('Invalid number of tills');
  if (customers.length === 0) return 0;
  if (n === 1) return customers.reduce((prev, curr) => prev + curr, 0);
  if (n >= customers.length) return Math.max(...customers);

  let queues = [];

  for (let i = 0; i < n; i++) {
    queues.push(new QueueOfNumbers());
  }

  customers.forEach((customer) => {
    const queueWithLessTime = queues.reduce((prev, curr) => {
      if (prev.isEmpty()) return prev;
      if (curr.isEmpty()) return curr;
      return prev.sumValues() < curr.sumValues() ? prev : curr
    })

    queueWithLessTime.enqueue(customer);
  })

  return getMaximunQueueTime(queues);
}



console.log("TEST 1: ", queueTime([], 1) === 0 ? "OK" : "ERROR"); // 0
console.log("TEST 2: ", queueTime([2, 2, 3, 3, 4, 4], 2) === 9 ? "OK" : "ERROR"); // 9
console.log("TEST 3: ", queueTime([1, 2, 3, 4, 5], 5) === 5 ? "OK" : "ERROR"); // 5
console.log("TEST 4: ", queueTime([5, 3, 4], 1) === 12 ? "OK" : "ERROR"); // 12
console.log("TEST 5: ", queueTime([10, 2, 3, 3], 2) === 10 ? "OK" : "ERROR"); // 10
console.log("TEST 6: ", queueTime([2, 3, 10], 2) === 12 ? "OK" : "ERROR"); // 12
console.log("TEST 7: ", queueTime([2, 3, 10, 14, 12], 1) === 41 ? "OK" : "ERROR"); // 41
console.log("TEST 8: ", queueTime([2, 3, 10, 14, 12, 13], 6) === 14 ? "OK" : "ERROR"); // 14

try {
  queueTime([1, 2, 3], 0); // error
  console.log('TEST 9:  ERROR');
} catch (_) {
  console.log('TEST 9:  OK');
}

try {
  queueTime([1, 2, 3], -1); // error
  console.log('TEST 10: ERROR');
} catch (_) {
  console.log('TEST 10: OK');
}