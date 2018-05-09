const setup = require("./starter-kit/setup");
const { scrapeFandango } = require("./scraper");

exports.handler = async (event, context) => {
  console.log("hello from lambda");
  const browser = await setup.getBrowser();
  await exports.run(browser);
};

exports.run = async browser => {
  await scrapeFandango(browser);
};
