const myDiv = document.querySelector(
  ".vue-recycle-scroller.ready.direction-vertical.scroller"
);

const interval = setInterval(() => {
  myDiv.scrollTop += 250;
  if (myDiv.scrollTop + myDiv.clientHeight >= myDiv.scrollHeight) {
    clearInterval(interval);
    console.log("Reached the bottom quickly!");
  }
}, 10);

const myDiv = document.querySelector(".products-grid");

const interval = setInterval(() => {
  myDiv.scrollTop += 250;
  if (myDiv.scrollTop + myDiv.clientHeight >= myDiv.scrollHeight) {
    clearInterval(interval);
    console.log("Reached the bottom quickly!");
  }
}, 10);
