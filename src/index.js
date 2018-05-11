const setup = require("./starter-kit/setup");
const { scrapeFandango } = require("./scraper");

exports.handler = async (event, context) => {
  const { movieId, showtimesUrl, theaterSearch } = event;
  console.log("Starting to scrape", movieId, theaterSearch, showtimesUrl);
  const browserFactory = await setup.createBrowser;
  await exports.run(browserFactory, movieId, showtimesUrl, theaterSearch);
};

exports.run = async (browserFactory, movieId, showtimesUrl, theaterSearch) => {
  await scrapeFandango(browserFactory, movieId, showtimesUrl, theaterSearch);
};
