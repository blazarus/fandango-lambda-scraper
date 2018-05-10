const index = require("../index");
const config = require("./config");
const puppeteer = require("puppeteer");

(async () => {
  await index
    .run(browserFactory)
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
