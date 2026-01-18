// Fade in .fade-in-on-scroll elements when they enter viewport
(function() {
  function onScroll() {
    document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', onScroll);
  window.addEventListener('DOMContentLoaded', onScroll);
})();
