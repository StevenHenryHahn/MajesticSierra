// news-ingestor.js
import fetch from 'node-fetch'; // ES Module-compatible


import { fetchRSSFeed } from './rss-client.js';
import { fetchNewsAPIArticles } from './news-api-client.js'; // optional
import curatedArticles from '../data/manual-news.json' assert { type: 'json' };
import { normalizeArticle } from './normalize-article.js';


// 🔹 BBC Validator
import cheerio from 'cheerio';

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
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
  { name: 'MarketWatch', url: 'https://feeds.content.dowjones.io/public/rss/marketwatch/topstories' },
  { name: 'Cointelegraph', url: 'https://cointelegraph.com/rss' },
  { name: 'CNET', url: 'https://www.cnet.com/rss/news/' },
  { name: 'Nasdaq Earnings', url: 'https://www.nasdaq.com/feed/rssoutbound?category=Earnings' },
  { name: 'MIT Tech Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/rss' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { name: 'BBC Technology', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml' },
  { name: 'Stanford HAI', url: 'https://hai.stanford.edu/news/blog/rss.xml' },
  { name: 'AI Weekly Digest', url: 'https://aiweeklyreport.substack.com/feed' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/' },
  { name: 'TechCrunch AI', url: 'http://feeds.feedburner.com/TechCrunch/ArtificialIntelligence' },
  { name: 'Wired AI', url: 'https://www.wired.com/feed/category/science/ai/latest/rss' },
  { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml'}
];

async function ingestAllNews() {
  const rssArticles = [];

for (const { name, url } of rssSources) {
  try {
    const articles = await fetchRSSFeed(url);
    const tagged = articles.map(article => ({
      ...article,
      sourceName: name,
      sourceUrl: url
    }));
    rssArticles.push(...tagged);
  } catch (err) {
    console.warn(`Failed to fetch RSS from ${name}:`, err.message);
  }
}


import fs from 'fs';
import path from 'path';


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

export { ingestAllNews };