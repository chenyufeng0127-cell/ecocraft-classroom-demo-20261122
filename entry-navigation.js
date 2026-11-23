// The showroom also hosts the AI demonstration at a stable fragment.
if (document.querySelector('#ai-demo')) {
  const navLinks = document.querySelectorAll('.ec-routes [data-route]');
  function indicateDestination() {
    const current = location.hash === '#ai-demo' ? 'ai' : 'home';
    for (const link of navLinks) {
      if (link.dataset.route === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  indicateDestination();
  window.addEventListener('hashchange', indicateDestination);
}
