const axios = require("axios");
const cheerio = require("cheerio");

const urls = [
  {
    title: "Canva",
    source: "https://static.canva.com/static/images/favicon-1.ico",
  },
  {
    title: "CapCut App",
    source:
      "https://lf16-web-buz.capcut.com/obj/capcut-web-buz-us/common/images/lv_web.ico",
  },
  {
    title: "Google Trends",
    source: "https://ssl.gstatic.com/trends/favicon.ico",
  },
  {
    title: "Answer The Public",
    source: "https://answerthepublic.com/favicon.ico",
  },
  {
    title: "Notion",
    source: "https://www.notion.so/images/favicon.ico",
  },
];

const getFavicon = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const faviconUrl =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href");
    return faviconUrl;
  } catch (error) {
    console.error(error);
  }
};

const addFaviconToUrls = async () => {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].source;
    const faviconUrl = await getFavicon(url);
    urls[i].logo = faviconUrl;
  }
  console.log(urls);
};

addFaviconToUrls();
