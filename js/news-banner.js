function renderBanner(newsItems) {
  const bannerSpan = document.querySelector('.news-banner .scrolling-headline');
  if (!bannerSpan) return;

  bannerSpan.innerHTML = ''; // Clear previous content

  const bannerItems = newsItems.filter(item => item.showInBanner);

  bannerItems.forEach(item => {
    const link = document.createElement('a');
    link.href = `news/index.html#${item.id}`;
    link.textContent = item.headline;
    link.style.marginRight = '2rem'; // spacing between headlines

    bannerSpan.appendChild(link);
  });
}