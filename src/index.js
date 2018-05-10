const setup = require("./starter-kit/setup");
const { scrapeFandango } = require("./scraper");

exports.handler = async (event, context) => {
  console.log("hello from lambda");
  const browserFactory = await setup.createBrowser;
  await exports.run(browserFactory);
};

exports.run = async browserFactory => {
  await scrapeFandango(browserFactory);
};
