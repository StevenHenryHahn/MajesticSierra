const fs = require('fs');
const path = require('path');
const { ingestAllNews } = require('./news-ingestor');

// 🔹 Optional: Stats logger
function logStats(articles) {
  const sourceCounts = {};
  const categoryCounts = {};

  for (const article of articles) {
    const source = article.sourceName || 'Unknown';
    const category = article.categoryTag || 'General';

    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  }

  console.log(`📰 Total articles: ${articles.length}`);
  console.log('📊 Source breakdown:', sourceCounts);
  console.log('🏷️ Category breakdown:', categoryCounts);
}

// 🔹 Main async wrapper
async function writeNewsFeed() {
  try {
    const articles = await ingestAllNews();
    const outputPath = path.join(__dirname, '..', 'data', 'news-feed.json');
    fs.writeFileSync(outputPath, JSON.stringify(articles, null, 2));

    console.log(`✅ News feed written to ${outputPath} with ${articles.length} articles`);
    logStats(articles); // ← Add this to see breakdowns
  } catch (err) {
    console.error('❌ Failed to write news feed:', err.message);
    process.exit(1);
  }

  console.log('✅ News feed written. Exiting...');
  process.exit(0); // ← Only exit after everything completes
}

// 🔹 Kick it off
writeNewsFeed();