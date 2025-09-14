// Top-level imports
import fetch from 'node-fetch';
import { fetchRSSFeed } from './rss-client.js';
import { fetchNewsAPIArticles } from './news-api-client.js'; // optional
import curatedArticles from '../data/manual-news.json' assert { type: 'json' };
import { normalizeArticle } from './normalize-article.js';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BBC validator stays unchanged
const isBBCLinkValid = async (url) => { /* ... */ };

const rssSources = [ /* ... */ ];

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

  const outputPath = path.join(__dirname, '../data/news-feed.json');
  fs.writeFileSync(outputPath, JSON.stringify(normalized, null, 2), 'utf-8');

  return normalized;
}

export { ingestAllNews };