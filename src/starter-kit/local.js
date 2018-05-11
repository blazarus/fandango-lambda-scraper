const index = require("../index");
const config = require("./config");
const puppeteer = require("puppeteer");

const movieId = "208157";
const showtimesUrl =
  "https://www.fandango.com/avengers-infinity-war-199925/movie-times";
const theaterSearch = "94107";

(async () => {
  await index
    .run(browserFactory, showtimesUrl, theaterSearch)
    .then(result => console.log(result))
    .catch(err => console.error(err));
  await browser.close();
})();

function browserFactory() {
  return puppeteer.launch({
    headless: false,
    slowMo: process.env.SLOWMO_MS,
    dumpio: !!config.DEBUG
    // use chrome installed by puppeteer
  });
}
