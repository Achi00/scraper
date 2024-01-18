import "dotenv/config";
import express from "express";
import WebScraper from "./scraper.js";

const app = express();

app.use("/scraper", WebScraper);

// listen on specified port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
