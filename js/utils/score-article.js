function calculateImportance(article) {
  let score = 0;

  // Normalize fields
  const title = article.title?.toLowerCase() || '';
  const desc = article.description?.toLowerCase() || '';
  const source = article.source?.name?.toLowerCase() || '';

  // 🧹 Filter out non-article sources
  const noisySources = ['pypi', 'npm', 'github', 'gitlab', 'sourceforge'];
  if (noisySources.some(ns => source.includes(ns))) {
    console.log(`🧹 Skipping non-article source "${source}"`);
    return 0;
  }

  // ⚽ Suppress sports-related content
  const sportsTerms = ['super cup', 'championship', 'match', 'goal', 'football', 'soccer', 'nba', 'nfl'];
  if (sportsTerms.some(term => title.includes(term) || desc.includes(term))) {
    console.log(`⚽ Sports-related content detected → score suppressed`);
    return 0;
  }

  // 🔍 Keyword weights
  const keywordWeights = {
    'mount diablo': 100,
    'ai': 40,
    'artificial intelligence': 40,
    'datacenter': 40,
    'chip': 10,
    'microchip': 10
  };


for (const [keyword, weight] of Object.entries(keywordWeights)) {
  let matched = false;

  if (keyword === 'ai') {
    // Tokenize title and description into clean word arrays
    const titleWords = title.split(/\W+/).filter(Boolean);
    const descWords = desc.split(/\W+/).filter(Boolean);

    // Match "ai" only as a standalone word
    matched = titleWords.includes('ai') || descWords.includes('ai');

    if (matched) {
      console.log(`🔍 Matched keyword "ai" (strict word match) → +${weight}`);
      score += weight;
    }
  } else {
    // Match other keywords using standard substring logic
    if (title.includes(keyword) || desc.includes(keyword)) {
      console.log(`🔍 Matched keyword "${keyword}" → +${weight}`);
      score += weight;
    }
  }
}



  // 🏛️ Trusted source weights
  const sourceWeights = {
    'stanford hai': 40,
    'microsoft': 30,
    'meta': 30,
    'google': 30,
    'openai': 25,
    'nvidia': 25,
    'mit technology review': 20,
    'wired': 20,
    'the verge': 15,
    'techcrunch': 15
  };

  for (const [trustedSource, weight] of Object.entries(sourceWeights)) {
    if (source.includes(trustedSource)) {
      console.log(`🏛️ Trusted source "${trustedSource}" → +${weight}`);
      score += weight;
      break;
    }
  }

  // ⏱️ Recency decay by day
  const published = new Date(article.publishedAt);
  const now = new Date();
  const hoursAgo = (now - published) / (1000 * 60 * 60);
  const daysAgo = Math.floor(hoursAgo / 24);
  const recencyBoost = Math.max(0, 3 - daysAgo) * 15;
  if (recencyBoost > 0) {
    console.log(`⏱️ Recency boost: ${recencyBoost} (published ${daysAgo} day(s) ago)`);
    score += recencyBoost;
  }

  // ⚠️ Clickbait filters
  if (title.length < 30) {
    console.log(`⚠️ Short title (<30 chars) → -10`);
    score -= 10;
  }

  const baitPhrases = ['you won’t believe', 'shocking', 'this one trick', 'goes viral', 'what happened next'];
  for (const phrase of baitPhrases) {
    if (title.includes(phrase) || desc.includes(phrase)) {
      console.log(`🚫 Clickbait phrase "${phrase}" → -20`);
      score -= 20;
    }
  }

  // Exclamation mark penalty
  if ((title.match(/!/g) || []).length > 1) {
    console.log(`❗ Excessive exclamation → -10`);
    score -= 10;
  }

  // 🧠 Final score
  console.log(`🧠 Final score for "${article.title}" → ${score}`);
  return score;
}

module.exports = { calculateImportance };