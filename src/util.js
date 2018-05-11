const fs = require("fs");
const fetch = require("node-fetch");

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
  return Promise.all([
    page.waitForNavigation({
      waitUntil: ["domcontentloaded", "networkidle2"]
    }),
    page.click(...clickArgs)
  ]);
}

function clickElemAndNavigate(page, elem) {
  return Promise.all([
    page.waitForNavigation({
      waitUntil: ["domcontentloaded", "networkidle2"]
    }),
    elem.click()
  ]);
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

function persistShowtimes(movieId, theaterSearch, showtimes) {
  const body = JSON.stringify({
    parameters: [
      { name: "movieId", value: movieId },
      { name: "search", value: theaterSearch },
      { name: "showtimes", value: JSON.stringify(showtimes) }
    ]
  });
  return fetch(
    "https://api.transposit.com/app/v1/blazarus/fandango_scraper/api/execute/persist_metadata",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "k3qs7fjud71n8kqcf7mhf1ar3g"
      },
      body
    }
  );
}

// From https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getUrlParamByName(url, paramName) {
  paramName = paramName.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + paramName + "(=([^&#]*)|&|#|$)");
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

module.exports = {
  isReservedSeating,
  clickAndNavigate,
  clickElemAndNavigate,
  sleep,
  readFilePromise,
  persistShowtimes,
  getUrlParamByName
};
