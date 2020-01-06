function showProgress(count, delay, cb, final, initial) {
   let counter = 0;
   if (!initial) initial = "";
   let progress = ".....".padEnd(count, '.');
   setInterval(function (event) {
      cb(initial + progress.substring(0, counter + 1));
      counter++;
      if (counter >= count) {
         clearInterval(timer);
         cb(final);
      }
   }, delay);
}

showProgress(20, 100, console.log, "completed", "working");
