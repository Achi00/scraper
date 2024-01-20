import express from "express";
import puppeteer from "puppeteer-core";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import cheerio from "cheerio";

const router = express.Router();

const AUTH = `${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}`;
const SBR_WS_ENDPOINT = `wss://${AUTH}@brd.superproxy.io:9222`;

router.get("/", async (req, res) => {
  let browser;

  try {
    console.log("Connecting to Scraping Browser...");
    browser = await puppeteer.connect({
      browserWSEndpoint: SBR_WS_ENDPOINT,
    });

    console.log("Connected! Navigating...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const targetUrl =
      "https://www.accuweather.com/en/ge/tbilisi/171705/weather-forecast/171705";
    if (!targetUrl) {
      return res.status(400).send("No URL provided");
    }

    await page.goto(targetUrl, { waitUntil: "networkidle0" });

    // Extracting broader content
    const pageContent = await page.evaluate(() => document.body.innerText);

    // Basic post-processing to improve readability
    const processedContent = pageContent
      .split("\n")
      .filter((line) => line.trim().length > 0) // Remove empty lines
      .map((line) => {
        // Further processing each line if needed, e.g., removing or replacing certain characters
        return line.trim();
      })
      .join(". "); // Rejoin the lines

    res.json({ content: processedContent });
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).send("Error occurred during scraping");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export default router;
