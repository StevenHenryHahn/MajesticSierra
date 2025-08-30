// rss-client.js
const Parser = require('rss-parser');
const parser = new Parser();

async function fetchRSSFeed(url) {
  const feed = await parser.parseURL(url);
  return feed.items.map(item => ({
    id: item.guid || item.link,
    title: item.title,
    summary: item.contentSnippet || '',
    source: feed.title,
    url: item.link,
    publishedAt: item.pubDate,
    category: item.categories?.[0] || 'General'
  }));
}

module.exports = { fetchRSSFeed };