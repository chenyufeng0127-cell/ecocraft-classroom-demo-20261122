for (const carousel of document.querySelectorAll('[data-work-carousel]')) {
  const shopMode = carousel.dataset.workCarousel === 'shop';
  const track = carousel.querySelector('.work-carousel-track');
  const back = carousel.querySelector('[data-carousel-back]');
  const next = carousel.querySelector('[data-carousel-next]');
  const position = carousel.querySelector('.work-carousel-position');
  const works = [...products, ...campusProducts];
  let index = 0;

  for (const [itemIndex, work] of works.entries()) {
    const campus = campusProducts.includes(work);
    const opensShopDetail = shopMode && !campus;
    const panel = document.createElement(opensShopDetail ? 'button' : 'a');
    panel.className = 'work-carousel-panel';
    if (opensShopDetail) {
      panel.type = 'button';
      panel.dataset.detail = work.id;
    } else {
      panel.href = (shopMode ? 'studio.html' : '') + '#product-' + work.id;
    }
    panel.setAttribute('aria-label', '查看' + work.name);
    const image = document.createElement('img');
    image.src = opensShopDetail ? 'assets/shop-' + work.id + '.webp' : work.image;
    image.alt = work.name + (campus ? '成品圖' : '概念圖');
    image.loading = itemIndex === 0 ? 'eager' : 'lazy';
    const caption = document.createElement('span');
    caption.className = 'work-carousel-caption';
    const series = document.createElement('span');
    series.textContent = campus ? '校園系列 · 成品展示' : '日常系列 · 概念設計';
    const title = document.createElement('strong');
    title.textContent = work.name;
    caption.append(series, title);
    panel.append(image, caption);
    track.append(panel);
  }

  function showPosition() {
    position.textContent = (index + 1) + ' / ' + works.length;
    back.disabled = index === 0;
    next.disabled = index === works.length - 1;
  }

  function move(offset) {
    index = Math.max(0, Math.min(works.length - 1, index + offset));
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
    showPosition();
  }

  back.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', () => {
    index = Math.round(track.scrollLeft / track.clientWidth);
    showPosition();
  }, { passive: true });
  showPosition();
}
