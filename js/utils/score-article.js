function calculateImportance(article) {
  let score = 0;
  const title = article.title?.toLowerCase() || '';
  const desc = article.description?.toLowerCase() || '';

  if (title.includes('ai') || desc.includes('ai')) score += 3;
  if (title.includes('artificial intelligence') || desc.includes('artificial intelligence')) score += 3;
  if (title.includes('datacenter') || desc.includes('datacenter')) score += 2;

  const published = new Date(article.publishedAt);
  const now = new Date();
  const hoursAgo = (now - published) / (1000 * 60 * 60);
  if (hoursAgo < 48) score += 1;

  return Math.min(score, 10);
}

module.exports = { calculateImportance };