(function () {
  'use strict';

  /* ============================
     CUSTOM CURSOR (pages services)
     Uniquement sur desktop (pointer: fine)
     ============================ */
  (function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    var cursor = document.getElementById('cursor');
    if (!cursor) return;

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var cx = mx, cy = my;
    var isHovering = false;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove('cursor--hidden');
    });
    document.addEventListener('mouseleave', function () {
      cursor.classList.add('cursor--hidden');
      cursor.classList.remove('cursor--hover');
      isHovering = false;
    });
    document.addEventListener('mouseenter', function () {
      cursor.classList.remove('cursor--hidden');
    });

    // Delegation — évite le bug "curseur reste en cercle après scroll/logo"
    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest('a, button, .card, .cta-button, input, textarea, select, [role="button"]');
      if (el) {
        cursor.classList.add('cursor--hover');
        isHovering = true;
      } else {
        cursor.classList.remove('cursor--hover');
        isHovering = false;
      }
    });

    function tick() {
      var ease = isHovering ? 0.12 : 0.18;
      cx += (mx - cx) * ease;
      cy += (my - cy) * ease;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(tick);
    }
    tick();
  })();

})();
