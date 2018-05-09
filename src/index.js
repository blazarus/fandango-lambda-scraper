const setup = require("./starter-kit/setup");
const { scrapeFandango } = require("./scraper");
// const aws = require("aws-sdk");
// const s3 = new aws.S3({ apiVersion: "2006-03-01" });
// const { readFilePromise } = require("./util");

exports.handler = async (event, context, callback) => {
  // For keeping the browser launch
  context.callbackWaitsForEmptyEventLoop = false;
  const browser = await setup.getBrowser();
  exports
    .run(browser)
    .then(result => callback(null, result))
    .catch(err => callback(err));
};

exports.run = async browser => {
  await scrapeFandango(browser);
};

// exports.run = async browser => {
//   // implement here
//   // this is sample
//   const page = await browser.newPage();
//   await page.goto("https://www.google.co.jp", {
//     waitUntil: ["domcontentloaded", "networkidle0"]
//   });
//   console.log((await page.content()).slice(0, 500));

//   await page.type("#lst-ib", "aaaaa");
//   // avoid to timeout waitForNavigation() after click()
//   await Promise.all([
//     // avoid to
//     // 'Cannot find context with specified id undefined' for localStorage
//     page.waitForNavigation(),
//     page.click("[name=btnK]")
//   ]);

//   await page.screenshot({ path: "/tmp/screenshot.png" });

//   const screenshot = await readFilePromise("/tmp/screenshot.png");
//   await s3
//     .putObject({
//       Bucket: "hackathon.blazarus",
//       Key: "screenshot.png",
//       Body: screenshot
//     })
//     .promise();

//   // cookie and localStorage
//   await page.setCookie({ name: "name", value: "cookieValue" });
//   console.log(await page.cookies());
//   console.log(
//     await page.evaluate(() => {
//       localStorage.setItem("name", "localStorageValue");
//       return localStorage.getItem("name");
//     })
//   );
//   await page.close();
//   return "done";
// };
