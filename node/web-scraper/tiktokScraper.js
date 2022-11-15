const axios = require("axios");
const cheerio = require("cheerio");

const url = `https://www.tiktok.com/@argieestrella/video/6817248570178014466`;

// Function to scrape the website
async function scrapeTiktok() {
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
  } catch (error) {
    console.error(error);
  }
}

// Call the scrapeTiktok function
scrapeTiktok();
