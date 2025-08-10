// Duration for highlight effect (in milliseconds)
const HIGHLIGHT_DURATION = 30000;



fetch('../data/news-feed.json')
  .then(res => {
    if (!res.ok) throw new Error('Network error');
    return res.json();
  })
  .then(headlines => {
    console.log("Fetched headlines:", headlines);

    // ⬇️ Reverse the array to show latest news first
    headlines.reverse();

    // ✅ Only call renderBanner if it's defined
    if (typeof renderBanner === 'function') {
      renderBanner(headlines);
    }

    renderNewsBubbles(headlines);

    // ✅ Highlight logic goes here, after bubbles are rendered
    const hash = window.location.hash;
    if (hash) {
      const targetArticle = document.querySelector(hash);
      if (targetArticle) {
        targetArticle.scrollIntoView({ behavior: 'smooth' });

        const bubble = targetArticle.querySelector('.news-bubble');
        if (bubble) {
          bubble.classList.add('highlighted');
          setTimeout(() => {
            bubble.classList.remove('highlighted');
          }, HIGHLIGHT_DURATION);    
        }
      }
    }
  })
  .catch(err => {
    console.error('Error loading news feed:', err);
  });


const hash = window.location.hash;
if (hash) {
  const targetArticle = document.querySelector(hash);
  if (targetArticle) {
    targetArticle.scrollIntoView({ behavior: 'smooth' });

    const bubble = targetArticle.querySelector('.news-bubble');
    if (bubble) {
      bubble.classList.add('highlighted');

      // Remove after 60 seconds
      setTimeout(() => {
        bubble.classList.remove('highlighted');
      }, 60000);
    }
  }
}




function renderNewsBubbles(newsItems) {
  const container = document.getElementById('news-container');
  if (!container || !Array.isArray(newsItems)) return;

  newsItems.forEach(item => {
    console.log("Rendering bubble for:", item.headline); // ✅ Now item is defined

    const article = document.createElement('article');
    article.id = item.id;   // This enables anchor scrolling
    article.className = 'news-article';

    article.innerHTML = `
      <div class="news-bubble bubble-trunk">
        <div class="news-tags">
          <span class="tag">${item.categoryTag}</span>
        </div>
        <h2>${item.headline}</h2>
        <p>${item.summary}</p>
        <p>
          <a href="${item.sourceUrl}" target="_blank" rel="noopener">
            Read full article on ${item.sourceName}
          </a>
        </p>
      </div>
    `;

    container.appendChild(article);
  });
}