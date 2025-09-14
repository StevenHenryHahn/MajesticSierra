// news-api-client.mjs

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { calculateImportance } from './utils/score-article.js';

// 🔑 API Key and Output Path
const API_KEY = process.env.NEWSAPI_AI_KEY;
const OUTPUT_PATH = path.join(path.dirname(new URL(import.meta.url).pathname), '../data/news-feed.json');

// 🔖 Banner flagging logic
function flagBannerStories(stories) {
  const sorted = [...stories].sort((a, b) => b.importanceScore - a.importanceScore);
  const topThreeURLs = new Set(sorted.slice(0, 3).map(story => story.url));

  return stories.map(story => ({
    ...story,
    showInBanner: topThreeURLs.has(story.url)
  }));
}

// 🧼 Article normalization
function normalizeArticle(article) {
  return {
    id: article.id,
    headline: article.title || article.headline || 'Untitled',
    summary: article.summary || 'No summary available.',
    sourceName: article.source || article.sourceName || 'Unknown',
    sourceUrl: article.url || article.sourceUrl || `missing-url-${article.id}`,
    publishedAt: article.publishedAt || article.publishDate || 'Unknown',
    importanceScore: article.importanceScore ?? 0,
    showInBanner: false,
    categoryTag: article.category || 'General',
    ...article
  };
}

// 🚀 Main exportable function
export async function fetchNewsAPIArticles() {
  try {
    const keywords = ['datacenter', 'AI', 'artificial intelligence'];
    let newArticles = [];

    // 🛡️ Backup existing feed
    const backupPath = OUTPUT_PATH.replace('.json', `.backup-latest.json`);
    if (fs.existsSync(OUTPUT_PATH)) {
      fs.copyFileSync(OUTPUT_PATH, backupPath);
    }

    // 📖 Read existing articles
    let existingArticles = [];
    if (fs.existsSync(OUTPUT_PATH)) {
      const rawData = fs.readFileSync(OUTPUT_PATH);
      existingArticles = JSON.parse(rawData);
    }

    // 🔍 Fetch and filter articles by keyword
    for (const keyword of keywords) {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: keyword,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 20,
          apiKey: API_KEY
        }
      });

      const filtered = response.data.articles.filter(article =>
        article.title?.toLowerCase().includes('ai') ||
        article.description?.toLowerCase().includes('ai') ||
        article.title?.toLowerCase().includes('datacenter') ||
        article.description?.toLowerCase().includes('datacenter')
      );

      newArticles.push(...filtered);
    }

    // 🔗 Merge logic
    const existingMap = new Map(existingArticles.map(article => [article.url, article]));
    const trulyNewArticles = newArticles.filter(article => !existingMap.has(article.url));

    const mappedNewArticles = trulyNewArticles.map((article, index) => {
      const score = calculateImportance(article);
      console.log(`🧠 Scored: "${article.title}" → ${score}`);

      return {
        id: article.source?.id || `story-${Date.now()}-${index}`,
        title: article.title,
        summary: article.description ? article.description.slice(0, 200) + '...' : 'No summary available.',
        source: article.source?.name || 'Unknown',
        url: article.url,
        publishedAt: article.publishedAt || 'Unknown',
        importanceScore: score,
        showInBanner: false
      };
    });

    const mergedMap = new Map();
    for (const article of existingArticles) {
      mergedMap.set(article.url, article);
    }
    for (const article of mappedNewArticles) {
      mergedMap.set(article.url, article);
    }

    const mergedArticles = Array.from(mergedMap.values());
    const normalizedArticles = mergedArticles.map(normalizeArticle);
    const flaggedArticles = flagBannerStories(normalizedArticles);

    // 💾 Write merged feed
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(flaggedArticles, null, 2));
    console.log(`✅ Merged and saved ${flaggedArticles.length} AI-relevant news stories.`);

    return flaggedArticles;
  } catch (error) {
    console.error('❌ Error fetching AI news:', error.message);
    return [];
  }
}