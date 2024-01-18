import express from "express";
import puppeteer from "puppeteer-core";
import cheerio from "cheerio";

const router = express.Router();

const AUTH = `${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}`;
const SBR_WS_ENDPOINT = `wss://${AUTH}@brd.superproxy.io:9222`;

router.get("/", async (req, res) => {
  const SBR_WS_ENDPOINT = `wss://${AUTH}@brd.superproxy.io:9222`;

  try {
    console.log("Connecting to Scraping Browser...");
    const browser = await puppeteer.connect({
      browserWSEndpoint: SBR_WS_ENDPOINT,
    });

    console.log("Connected! Navigating...");
    const page = await browser.newPage();
    await page.goto("https://openai.com/", { timeout: 2 * 60 * 1000 }); // Replace with your target URL
    console.log("Taking screenshot to page.png");
    // pass this screenshot to gpt vision
    await page.screenshot({ path: "./page.png", fullPage: true });
    console.log("Navigated! Scraping page content...");
    const html = await page.content();
    // Load the HTML content into Cheerio
    const $ = cheerio.load(html);

    // Implement your data extraction logic with Cheerio here
    // For example, let's say you want to extract all the headlines (h2) and paragraphs (p)
    let data = {
      headlines: [],
      paragraphs: [],
    };

    $("h2").each((index, element) => {
      data.headlines.push($(element).text().trim());
    });

    $("p").each((index, element) => {
      data.paragraphs.push($(element).text().trim());
    });

    // Send back the extracted data as JSON
    res.json(data);

    // Uncomment the below CAPTCHA handling code if needed
    const client = await page.target().createCDPSession();
    const { status } = await client.send("Captcha.solve", {
      detectTimeout: 30 * 1000,
    });
    console.log(`Captcha solve status: ${status}`);
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).send("Error occurred during scraping");
  } finally {
    await browser.close();
  }
});

export default router;
