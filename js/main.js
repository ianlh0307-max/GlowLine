document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  var heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    var dayBtn = heroVisual.querySelector('.hero-toggle .btn-day');
    var nightBtn = heroVisual.querySelector('.hero-toggle .btn-night');
    if (dayBtn && nightBtn) {
      dayBtn.addEventListener('click', function () {
        heroVisual.classList.remove('is-night');
        dayBtn.classList.add('active');
        nightBtn.classList.remove('active');
      });
      nightBtn.addEventListener('click', function () {
        heroVisual.classList.add('is-night');
        nightBtn.classList.add('active');
        dayBtn.classList.remove('active');
      });
    }
  }
});
