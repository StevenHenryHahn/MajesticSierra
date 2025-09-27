require('dotenv').config({ path: '.env.local' });

console.log('Loaded API Key:', process.env.NEWSAPI_AI_KEY);

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_KEY = process.env.NEWSAPI_AI_KEY;
const OUTPUT_PATH = path.join(__dirname, '../data/news-feed.json');

// 🔖 Banner flagging logic
const flagBannerStories = (stories) => {
  const sorted = [...stories].sort((a, b) => b.importanceScore - a.importanceScore);
  const topThreeURLs = new Set(sorted.slice(0, 3).map(story => story.url));

  return stories.map(story => ({
    ...story,
    showInBanner: topThreeURLs.has(story.url)
  }));
};


async function fetchAINews() {
  try {
    const { calculateImportance } = require('./utils/score-article');
    const keywords = ['datacenter', 'AI', 'artificial intelligence'];
    let newArticles = [];

    // 🛡️ Backup existing feed BEFORE doing anything
const backupPath = OUTPUT_PATH.replace('.json', `.backup-latest.json`);
fs.copyFileSync(OUTPUT_PATH, backupPath);

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

// 🔗 Build a map of existing articles by URL
const existingMap = new Map(existingArticles.map(article => [article.url, article]));

// 🧱 Map new articles only if they’re not already present
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

// 🔗 Merge without overwriting curated fields
const mergedMap = new Map();

// Add existing articles first
for (const article of existingArticles) {
  mergedMap.set(article.url, article);
}

// Overwrite or add new articles
for (const article of mappedNewArticles) {
  mergedMap.set(article.url, article); // overwrites if URL matches
}

const mergedArticles = Array.from(mergedMap.values());

  // Normalize articles to ensure consistent structure
const { normalizeArticle } = require('./normalize-article');



    // 🏷️ Flag banner stories
const normalizedArticles = mergedArticles.map(normalizeArticle);
const flaggedArticles = flagBannerStories(normalizedArticles);

    // 💾 Write merged feed
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(flaggedArticles, null, 2));
    console.log(`✅ Merged and saved ${flaggedArticles.length} AI-relevant news stories.`);
  } catch (error) {
    console.error('❌ Error fetching AI news:', error.message);
  }
}

fetchAINews();