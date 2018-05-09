const fs = require("fs");

async function isReservedSeating(showtimeGroupHandle) {
  const amenityHandles = await showtimeGroupHandle.$$(
    ".theater__amentiy-list li a"
  );

  const promises = amenityHandles.map(amenityHandle =>
    amenityHandle.getProperty("innerText").then(el => el.jsonValue())
  );
  const textList = await Promise.all(promises);
  return textList.includes("Reserved seating");
}

function clickAndNavigate(page, ...clickArgs) {
  return Promise.all([page.waitForNavigation(), page.click(...clickArgs)]);
}

function clickElemAndNavigate(page, elem) {
  return Promise.all([page.waitForNavigation(), elem.click()]);
}

function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

function readFilePromise(...args) {
  return new Promise((resolve, reject) => {
    fs.readFile(...args, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
}

module.exports = {
  isReservedSeating,
  clickAndNavigate,
  clickElemAndNavigate,
  sleep,
  readFilePromise
};
