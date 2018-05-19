const index = require("../index");
const config = require("./config");
const puppeteer = require("puppeteer");

const movieId = "208157";
const showtimesUrl =
  "https://www.fandango.com/avengers-infinity-war-199925/movie-times";
const theaterSearch = "San Francisco";

(async () => {
  const availableDays = await index.runGetAvailableDays(
    browserFactory,
    movieId,
    showtimesUrl,
    theaterSearch
  );

  console.log("availableDays", availableDays);
  for (const day of availableDays) {
    await index.runScrapeDay(browserFactory, movieId, theaterSearch, day);
  }
})();

function browserFactory() {
  return puppeteer.launch({
    headless: false,
    slowMo: process.env.SLOWMO_MS,
    dumpio: !!config.DEBUG
    // use chrome installed by puppeteer
  });
}
