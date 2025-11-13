function doSomething() {
  return new Promise((resolve, reject) => {
    let x = 0;

    if (x == 0) resolve("OK");
    else reject("Error");
  });
}

function myLog(value) {
  console.log(value);
}

doSomething().then(
  (value) => {
    myLog(value);
  },
  (error) => {}
);
