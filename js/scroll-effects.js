// Super cool scroll progress bar and smooth scroll

// Progress bar
(function() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';
  document.body.appendChild(bar);
  function updateBar() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + '%';
  }
  window.addEventListener('scroll', updateBar);
  window.addEventListener('resize', updateBar);
  updateBar();
})();

// Optional: smooth scroll for anchor links
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth'});
      }
    });
  });
})();
