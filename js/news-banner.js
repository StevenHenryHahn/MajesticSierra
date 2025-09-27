function renderBanner(newsItems) {
  const bannerSpan = document.querySelector('.news-banner .scrolling-headline');
  if (!bannerSpan) return;

  bannerSpan.innerHTML = ''; // Clear previous content

// ✅ Select items for the banner with a limit
  const bannerItems = newsItems
  .filter(item => item.showInBannerOverride === true || item.showInBanner === true)
  .slice(0, 8); // ✅ Limit to second number

// Logging for debugging
console.log('Banner items selected:', bannerItems.map(item => ({
  title: item.title,
  override: item.showInBannerOverride,
  scoreBased: item.showInBanner
})));


  bannerItems.forEach(item => {
    const link = document.createElement('a');
    link.href = `news/index.html#${item.id}`;
    link.textContent = item.headline || item.title || 'Untitled';
    link.style.marginRight = '2rem'; // spacing between headlines

    bannerSpan.appendChild(link);
  });
}