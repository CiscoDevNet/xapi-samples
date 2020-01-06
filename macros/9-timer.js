/**
 * Illustrates a personalized message coupled with a timer
 * 
 */

const xapi = require('xapi');


function update(value) {
   // 
   // Custom logic
   //
   console.log(value);
}

let current = {};
current.options = [];
current.iterations = 0;
current.iterate = function (original, max) {
   // Reset options if array is empty 
   if (this.options.length === 0) {
      this.options = original;
   }

   this.iterations++;
   if (this.iterations > max) {
      clearInterval(current.timer);
      return;
   }

   // Pop next option
   let choice = this.options.pop();
   update(choice)
}

current.timer = setInterval(function () {
   current.iterate(["Read a tutorial", "Launch a Sandbox", "Attend an event", "Pick a DevNet activity among:"], 10);
}, 1000);

