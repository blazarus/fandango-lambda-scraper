const setup = require("./starter-kit/setup");
const { scrapeFandango, scrapeDay } = require("./scraper");
const { runLambdaScrapeDay } = require("./util");

exports.getAvailableDaysHandler = async (event, context) => {
  const { movieId, showtimesUrl, theaterSearch } = event;
  console.log("Starting to scrape", movieId, theaterSearch, showtimesUrl);
  const browserFactory = setup.createBrowser;
  const availableDays = await exports.runGetAvailableDays(
    browserFactory,
    movieId,
    showtimesUrl,
    theaterSearch
  );
  const promises = [];
  for (const day of availableDays) {
    promises.push(runLambdaScrapeDay(movieId, theaterSearch, day));
  }
  // Run in parallel but wait for all to finish
  await Promise.all(promises);
};

exports.runGetAvailableDays = async (
  browserFactory,
  movieId,
  showtimesUrl,
  theaterSearch
) => {
  return await scrapeFandango(
    browserFactory,
    movieId,
    showtimesUrl,
    theaterSearch
  );
};

exports.scrapeDayHandler = async (event, context) => {
  const { movieId, theaterSearch, day } = event;
  const parsedDay = JSON.parse(day);
  console.log("Starting to scrape", movieId, theaterSearch, parsedDay);
  const browserFactory = setup.createBrowser;
  await exports.runScrapeDay(browserFactory, movieId, theaterSearch, parsedDay);
};
exports.runScrapeDay = async (browserFactory, movieId, theaterSearch, day) => {
  return await scrapeDay(browserFactory, movieId, theaterSearch, day);
};
