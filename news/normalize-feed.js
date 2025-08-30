function normalizeArticle(raw) {
  return {
    id: raw.id || generateId(raw),
    headline: raw.title || raw.headline || 'Untitled',
    summary: raw.description || raw.summary || '',
    sourceName: raw.source?.name || raw.source || 'Unknown Source',
    sourceUrl: raw.url || raw.link || '#',
    categoryTag: raw.category || 'General',
    publishedAt: raw.publishedAt || raw.date || new Date().toISOString()
  };
}

function generateId(article) {
  const base = `${article.title || ''}-${article.publishedAt || Date.now()}`;
  return 'id-' + Buffer.from(base).toString('base64').slice(0, 12);
}

module.exports = { normalizeArticle };