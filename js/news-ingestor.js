// news-ingestor.js
const { fetchRSSFeed } = require('./rss-client');
const { fetchNewsAPIArticles } = require('./news-api-client'); // optional
const curatedArticles = require('../data/manual-news.json');
const { normalizeArticle } = require('./normalize-article');

// 🔹 BBC Validator
const cheerio = require('cheerio');

const isBBCLinkValid = async (url) => {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
    const ogType = $('meta[property="og:type"]').attr('content')?.trim();

    const isValid = res.status === 200 &&
                    ogType === 'article' &&
                    ogTitle &&
                    !ogTitle.toLowerCase().includes('404') &&
                    !ogTitle.toLowerCase().includes('page not found');

    return isValid;
  } catch (err) {
    console.warn('Error validating BBC link:', url, err.message);
    return false;
  }
};

const rssSources = [
  'https://feeds.npr.org/1001/rss.xml',
  'http://feeds.bbci.co.uk/news/rss.xml'
];

async function ingestAllNews() {
  const rssArticles = [];

  for (const url of rssSources) {
    try {
      const articles = await fetchRSSFeed(url);
      rssArticles.push(...articles);
    } catch (err) {
      console.warn(`Failed to fetch RSS from ${url}:`, err.message);
    }
  }

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../data/news-feed.json');
fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf-8');

  // Optional: include NewsAPI if needed
  // const apiArticles = await fetchNewsAPIArticles();

  const allRawArticles = [
    ...curatedArticles,
    ...rssArticles,
    // ...apiArticles
  ];

  const filteredArticles = [];
  let bbcSkipped = 0;

  for (const article of allRawArticles) {
    if (article.sourceName === 'BBC') {
      const url = article.sourceUrl || article.url;
      const valid = await isBBCLinkValid(url);
      if (!valid) {
        console.warn('⚠️ Skipping broken BBC link:', url);
        bbcSkipped++;
        continue;
      }
    }
    filteredArticles.push(article);
  }

  if (bbcSkipped > 0) {
    console.log(`🧹 Skipped ${bbcSkipped} broken BBC articles`);
  }

  const normalized = filteredArticles.map(normalizeArticle);
  return normalized;
}

module.exports = { ingestAllNews };