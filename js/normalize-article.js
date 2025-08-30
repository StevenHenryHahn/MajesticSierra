function normalizeArticle(article) {
  return {
    id: article.id || generateId(article),
    headline: article.headline || article.title || 'Untitled',
    summary: article.summary || article.description || 'No summary available',
    sourceName: article.sourceName || (typeof article.source === 'string' ? article.source : article.source?.name) || 'Unknown Source',
    sourceUrl: article.sourceUrl || article.url || '',
    categoryTag: article.categoryTag || article.category || 'General',
    publishDate: article.publishDate || article.publishedAt || new Date().toISOString(),
    isCurated: article.isCurated || false,
    priority: article.priority || 0,
    showInBanner: article.showInBanner || article.bannerOverride || false
  };
}


function generateId(article) {
  const base = `${article.title || ''}-${article.publishedAt || Date.now()}`;
  return 'id-' + Buffer.from(base).toString('base64').slice(0, 12);
}

module.exports = { normalizeArticle };