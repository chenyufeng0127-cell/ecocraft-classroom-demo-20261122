for (const carousel of document.querySelectorAll('[data-work-carousel]')) {
  const shopMode = carousel.dataset.workCarousel === 'shop';
  const track = carousel.querySelector('.work-carousel-track');
  const back = carousel.querySelector('[data-carousel-back]');
  const next = carousel.querySelector('[data-carousel-next]');
  const position = carousel.querySelector('.work-carousel-position');
  const rotationButton = carousel.querySelector('[data-carousel-toggle]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
    panel.append(image);
    track.append(panel);
  }

  const carouselWidth = () => track.getBoundingClientRect().width;

  function showPosition() {
    const label = (index + 1) + ' / ' + works.length;
    if (position.textContent !== label) position.textContent = label;
    back.disabled = index === 0;
    next.disabled = index === works.length - 1;
  }

  function scrollToPanel(panel) {
    track.scrollTo({
      left: panel * carouselWidth(),
      behavior: reducedMotion.matches ? 'instant' : 'smooth'
    });
  }

  function move(offset) {
    index = Math.max(0, Math.min(works.length - 1, index + offset));
    scrollToPanel(index);
    showPosition();
  }

  back.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  track.addEventListener('scroll', () => {
    const width = carouselWidth();
    if (!width) return;

    if (rotationButton && track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) {
      track.scrollTo({ left: 0, behavior: 'instant' });
      index = 0;
    } else {
      index = Math.max(0, Math.min(works.length - 1, Math.round(track.scrollLeft / width)));
    }
    showPosition();
  }, { passive: true });
  showPosition();

  if (rotationButton) {
    // A copy of the first panel makes the last-to-first transition move one slide forward.
    const loopPanel = track.firstElementChild.cloneNode(true);
    loopPanel.inert = true;
    loopPanel.setAttribute('aria-hidden', 'true');
    loopPanel.querySelector('img').loading = 'lazy';
    track.append(loopPanel);

    const advanceDelay = 1500;
    let playing = !reducedMotion.matches;
    let visible = false;
    let hovered = false;
    let focused = false;
    let touching = false;
    let timer;

    function scheduleRotation() {
      clearTimeout(timer);
      if (!playing || !visible || document.hidden || hovered || focused || touching) return;
      timer = setTimeout(() => {
        scrollToPanel(index + 1);
        scheduleRotation();
      }, advanceDelay);
    }

    function syncPlayback() {
      rotationButton.textContent = playing ? '暫停輪播' : '開始輪播';
      position.setAttribute('aria-live', playing ? 'off' : 'polite');
      scheduleRotation();
    }

    rotationButton.addEventListener('click', () => {
      playing = !playing;
      syncPlayback();
    });
    carousel.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      hovered = true;
      scheduleRotation();
    });
    carousel.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      hovered = false;
      scheduleRotation();
    });
    carousel.addEventListener('focusin', event => {
      focused = event.target !== rotationButton;
      scheduleRotation();
    });
    carousel.addEventListener('focusout', event => {
      const nextFocus = event.relatedTarget;
      focused = Boolean(nextFocus && nextFocus !== rotationButton && carousel.contains(nextFocus));
      scheduleRotation();
    });
    for (const eventName of ['touchstart', 'touchend', 'touchcancel']) {
      carousel.addEventListener(eventName, event => {
        touching = event.touches.length > 0;
        scheduleRotation();
      }, { passive: true });
    }

    new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= .4;
      scheduleRotation();
    }, { threshold: .4 }).observe(carousel);
    document.addEventListener('visibilitychange', scheduleRotation);
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) playing = false;
      syncPlayback();
    });
    syncPlayback();
  }
}
