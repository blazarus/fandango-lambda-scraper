const {
  isReservedSeating,
  clickAndNavigate,
  clickElemAndNavigate,
  sleep,
  readFilePromise,
  persistShowtimes
} = require("./util");
const aws = require("aws-sdk");
const s3 = new aws.S3({ apiVersion: "2006-03-01" });

const S3_BUCKET = "hackathon.blazarus";

// TODO should probably be disposing all of the elementHandles

// interface Theater {
//   name: string;
//   showtimeGroups: ShowtimeGroup[];
// }
// interface ShowtimeGroup {
//   description: string; // e.g. if it's imax, standard, etc.
//   showtimes: Showtime[];
// }
// interface Showtime {
//   time: string;
//   reservedSeating: boolean;
//   screenshotPath?: string; // the filename, only applicable if reserved seating is true
//   purchaseUrl: string; // url to fandango to go purchase tickets
// }

async function scrapeFandango(browser) {
  const showtimeInfo = [];

  const page = await browser.newPage();

  try {
    await page.goto(
      "https://www.fandango.com/avengers-infinity-war-199925/movie-times"
    );
    // Search for theaters in area code
    await page.evaluate(() => {
      document.querySelector(".date-picker__location input").value = "";
    });
    await page.type(".date-picker__location input", "94107");
    await clickAndNavigate(page, ".date-picker__location a");

    const allTheaterInfo = await gatherAllTheaterInfo(page);
    console.log("allTheaterInfo", allTheaterInfo);

    // get a list of urls to open and take screenshots of the seating charts, and then open those in new windows in parallel
    const BATCH_SIZE = 5;
    const batches = [];
    let currBatch = [];
    let index = 0;
    for (const theater of allTheaterInfo) {
      for (const group of theater.showtimeGroups) {
        for (const showtime of group.showtimes) {
          if (showtime.reservedSeating) {
            if (currBatch.length >= BATCH_SIZE) {
              currBatch = [];
              batches.push(currBatch);
            }
            currBatch.push({ browser, showtime, index });
            index++;
          }
        }
      }
    }

    for (const batch of batches) {
      const promises = batch.map(({ browser, showtime, index }) =>
        getShowtimeScreenshot(browser, showtime, index)
      );
      await Promise.all(promises);
    }

    await persistShowtimes(allTheaterInfo);
  } catch (e) {
    console.log("Oops:", e.message);
    try {
      await page.screenshot({
        path: "error.jpeg",
        type: "jpeg",
        fullPage: true,
        quality: 50
      });
    } catch (e) {
      console.log("Error taking error screenshot: " + e);
    }
  }

  console.log("Done, closing page");
  await page.close();
}

async function getShowtimeScreenshot(browser, showtime, index) {
  console.log("Starting to process showtime:", showtime);
  const page = await browser.newPage();
  try {
    await page.goto(showtime.purchaseUrl);
    await page.waitForSelector("select", {
      timeout: 5000
    });
    await page.select("select.qtyDropDown", "1");
    await clickAndNavigate(page, "button");
    await page.waitForSelector("#seats_cover", { timeout: 5000 });
    // give the page some time to draw
    await sleep(5000);

    const seatPickerHandle = await page.$("#SeatPickerContainer");

    // purchase url should be unique, so use that for the filename
    const filename = `seating-charts_${index}.png`;
    const path = `/tmp/${filename}`;

    await seatPickerHandle.screenshot({
      path,
      type: "png"
    });
    const screenshot = await readFilePromise(path);
    await s3
      .putObject({
        Bucket: S3_BUCKET,
        Key: filename,
        Body: screenshot
      })
      .promise();

    await page.close();

    // record path in the showtime object so we can retrieve later
    // record only after screenshot is actually successful
    showtime.screenshotPath = filename;
  } catch (e) {
    console.log("Error processing showtime with url:", showtime.purchaseUrl, e);
  }
}

async function doShowtime(page, i) {
  console.log("Starting showtime gathering", i);

  await page.waitForSelector("select", {
    timeout: 5000
  });
  await page.select("select.qtyDropDown", "1");
  await clickAndNavigate(page, "button");

  await page.screenshot({
    path: `images/seating-chart-${i}.png`,
    type: "png",
    fullPage: true
  });
}

async function gatherAllTheaterInfo(page) {
  const results = [];

  for (const theaterHandle of await page.$$(".theater__wrap")) {
    const theaterResults = {};
    const nameElem = await theaterHandle.$(".theater__name-wrap h3 a");
    theaterResults.name = await (await nameElem.getProperty(
      "innerText"
    )).jsonValue();
    console.log("theater name:", theaterResults.name);

    theaterResults.showtimeGroups = [];
    for (const showtimeGroupHandle of await theaterHandle.$$(
      ".theater__showtimes"
    )) {
      theaterResults.showtimeGroups.push(
        await getShowtimeGroupInfo(showtimeGroupHandle)
      );
    }
    results.push(theaterResults);
  }

  return results;
}

async function getShowtimeGroupInfo(showtimeGroupHandle) {
  const results = {};

  results.description = await (await (await showtimeGroupHandle.$(
    ".theater__tick-headline"
  )).getProperty("innerText")).jsonValue();
  console.log("description", results.description);
  const reservedSeating = await isReservedSeating(showtimeGroupHandle);
  console.log("reserved seating?", reservedSeating);

  results.showtimes = [];
  for (const showtimeButtonHandle of await showtimeGroupHandle.$$(
    ".theater__btn-list-item .showtime-btn--available"
  )) {
    const purchaseUrl = await (await showtimeButtonHandle.getProperty(
      "href"
    )).jsonValue();
    const time = await (await showtimeButtonHandle.getProperty(
      "innerText"
    )).jsonValue();
    console.log(time, purchaseUrl);
    results.showtimes.push({
      time,
      reservedSeating,
      purchaseUrl
    });
  }

  return results;
}

module.exports = {
  scrapeFandango
};
