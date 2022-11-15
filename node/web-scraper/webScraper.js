const axios = require("axios");
const cheerio = require("cheerio");

const search = "food near me";
// URL of the website to scrape
const url = `https://www.google.com/search?q=${encodeURIComponent(search)}`;
// const url = `https://food.grab.com/ph/en/restaurants`;

// Function to scrape the website
async function scrapeWebsite() {
  try {
    // Make a GET request to the website using Axios
    const response = await axios.get(url);

    // Load the HTML content of the website using Cheerio
    const $ = cheerio.load(response.data);

    // Find the title of the website
    const title = $("title").text();

    // Find the first paragraph of the website
    const linkTitles = $("h3").text();
    const links = $("h3").text();

    // Log the results to the console
    console.log(`Title: ${title}`);
    console.log(`HTML:\n`, response.data);
    console.log("Link Titles:\n", linkTitles);
    console.log("links", linkTitles);
  } catch (error) {
    console.error(error);
  }
}

// Call the scrapeWebsite function
scrapeWebsite();
