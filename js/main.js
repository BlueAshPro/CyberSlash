(function () {
  'use strict';

  /* ============================
     SCROLL POSITION RESTORE
     Sauvegarde la position scroll avant navigation
     et la restaure au retour (bouton précédent)
     ============================ */
  (function () {
    try {
      var k = 'scrollPos:' + window.location.href;
      var saved = sessionStorage.getItem(k);
      if (saved !== null) {
        sessionStorage.removeItem(k);
        // Petit délai pour laisser le DOM se stabiliser
        requestAnimationFrame(function () {
          window.scrollTo(0, parseInt(saved, 10));
        });
      }
    } catch (e) {}
  })();


  /* ============================
     MOBILE NAV TOGGLE
     ============================ */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  var menuIcon = toggle ? toggle.querySelector('use') : null;

  function closeMenu() {
    if (!menu || !toggle || !menuIcon) return;
    menu.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    menuIcon.setAttribute('href', '#ico-menu');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = menu.getAttribute('data-open') === 'true';
      if (isOpen) { closeMenu(); }
      else {
        menu.setAttribute('data-open', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        menuIcon.setAttribute('href', '#ico-x');
      }
    });
  }

  if (menu) {
    menu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.getAttribute('data-open') === 'true') {
      closeMenu();
      if (toggle) toggle.focus();
    }
  });

  /* ============================
     SMOOTH SCROLL (anchor links only)
     ============================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        target.focus({ preventScroll: true });
      }
    });
  });

  /* ============================
     GLITCH: add data-text to section titles
     ============================ */
  document.querySelectorAll('.section-header__title').forEach(function (el) {
    el.setAttribute('data-text', el.textContent);
  });

  /* ============================
     STAGGER CARD REVEAL
     ============================ */
  var cardObserver;
  if ('IntersectionObserver' in window) {
    cardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var grid = entry.target;
        var cards = grid.querySelectorAll('.card');
        cards.forEach(function (card, i) {
          setTimeout(function () {
            card.classList.add('card--visible');
          }, i * 90);
        });
        cardObserver.unobserve(grid);
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.cards-grid').forEach(function (grid) {
      cardObserver.observe(grid);
    });
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.card').forEach(function (c) {
      c.classList.add('card--visible');
    });
  }

  /* ============================
     SECTION FADE IN
     ============================ */
  if ('IntersectionObserver' in window) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('fade-in--visible');
    });
  }

  /* ============================
     CODE RAIN CANVAS
     ============================ */
  (function () {
    var canvas = document.getElementById('rain-canvas');
    if (!canvas) return;

    // Skip on very low-power devices (optional: check battery API or use reduced motion)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    var ctx = canvas.getContext('2d');
    var chars = '01アイウエオカキクケコサシスセソ<>{}[]|/\\!?#$%&';
    var cols, drops, fontSize;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      fontSize = window.innerWidth < 600 ? 11 : 13;
      cols = Math.floor(canvas.width / (fontSize * 1.5));
      drops = new Array(cols).fill(0).map(function () {
        return Math.floor(Math.random() * -50);
      });
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function draw() {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.045)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = fontSize + 'px monospace';

      for (var i = 0; i < drops.length; i++) {
        var y = drops[i] * (fontSize * 1.5);
        if (y < 0) { drops[i]++; continue; }

        // Bright head char
        ctx.fillStyle = '#aaffdd';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * (fontSize * 1.5), y);

        // Trailing chars
        ctx.fillStyle = '#00ff88';
        var trailChar = chars[Math.floor(Math.random() * chars.length)];
        if (y - fontSize * 1.5 > 0) {
          ctx.fillText(trailChar, i * (fontSize * 1.5), y - fontSize * 1.5);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = -Math.floor(Math.random() * 20);
        }
        drops[i]++;
      }
    }

    var raf;
    var lastTime = 0;
    var interval = 55; // ~18fps for the rain

    function loop(ts) {
      if (ts - lastTime >= interval) {
        draw();
        lastTime = ts;
      }
      raf = requestAnimationFrame(loop);
    }

    // Pause when tab hidden (save CPU)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); }
      else { raf = requestAnimationFrame(loop); }
    });

    raf = requestAnimationFrame(loop);
  })();

  /* ============================
     CUSTOM CURSOR
     ============================ */
  (function () {
    // Touch devices: skip
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
    document.addEventListener('mouseleave', function () { cursor.classList.add('cursor--hidden'); });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('cursor--hidden'); });

    // Hover class on interactive elements
    var interactives = document.querySelectorAll('a, button, .card, input, textarea, select');
    interactives.forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('cursor--hover'); isHovering = true; });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('cursor--hover'); isHovering = false; });
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

  /* ============================
     PAGE TRANSITION
     ============================ */
  (function () {
    var overlay = document.getElementById('page-transition');
    var progress = document.getElementById('pt-progress');
    if (!overlay) return;

    function navigate(href) {
      try { sessionStorage.setItem('scrollPos:' + window.location.href, '' + window.scrollY); } catch (e) {}
      overlay.classList.add('active');
      if (progress) {
        progress.style.width = '0%';
        // Quick animation to simulate loading
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            progress.style.width = '70%';
            setTimeout(function () {
              progress.style.width = '100%';
            }, 150);
          });
        });
      }
      setTimeout(function () {
        window.location.href = href;
      }, 320);
    }

    // Intercept internal page links (not anchors, not mailto, not external)
    document.querySelectorAll('a.nav-link').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        navigate(href);
      });
    });

    // Fade out on back navigation
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { overlay.classList.remove('active'); }
    });
  })();

  /* ============================
     QUOTE ROTATION
     ============================ */
  var quotes = [
    "Activez l'authentification a deux facteurs (2FA) sur tous vos comptes importants.",
    "Un mot de passe fort fait au moins 16 caracteres avec chiffres, lettres et symboles.",
    "Ne cliquez jamais sur un lien dans un email sans verifier l'expediteur.",
    "Mettez a jour vos logiciels des qu'un correctif de securite est disponible.",
    "Utilisez un gestionnaire de mots de passe pour ne pas reutiliser les memes.",
    "Chiffrez vos donnees sensibles, surtout sur les appareils portables.",
    "Le Wi-Fi public est un terrain de jeu pour les attaquants. Utilisez un VPN.",
    "Sauvegardez regulierement vos donnees selon la regle 3-2-1.",
    "Verifiez les permissions des applications installees sur votre telephone.",
    "Un antivirus ne remplace pas la vigilance humaine face au phishing.",
    "Separez vos usages pro et perso sur des sessions ou appareils differents.",
    "Avant de publier, demandez-vous : cette info pourrait-elle etre exploitee ?",
    "La securite est un processus continu, pas un produit a installer."
  ];
  var quoteIndex = 0;
  var quoteEl = document.getElementById('quote-text');
  if (quoteEl) {
    setInterval(function () {
      quoteIndex = (quoteIndex + 1) % quotes.length;
      quoteEl.style.opacity = '0';
      setTimeout(function () {
        quoteEl.textContent = quotes[quoteIndex];
        quoteEl.style.opacity = '1';
      }, 300);
    }, 8000);
    quoteEl.style.transition = 'opacity 0.3s';
  }

  /* ============================
     SCROLL UTILITIES
     ============================ */
  var quoteBanner = document.getElementById('quote-banner');
  var backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (quoteBanner) quoteBanner.hidden = y > 300;
    if (backToTop) backToTop.setAttribute('data-visible', y > 600 ? 'true' : 'false');
  }, { passive: true });

  /* ============================
     CONTACT FORM
     ============================ */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var submitBtn = document.getElementById('form-submit');
  var msgTextarea = document.getElementById('form-message');
  var msgCounter = document.getElementById('msg-counter');

  // Compteur de caractères message
  if (msgTextarea && msgCounter) {
    msgTextarea.addEventListener('input', function () {
      var len = msgTextarea.value.length;
      var max = 2000;
      msgCounter.textContent = len + ' / ' + max;
      msgCounter.className = 'form__counter';
      if (len > max * 0.9) msgCounter.classList.add('form__counter--warn');
      if (len >= max)      msgCounter.classList.add('form__counter--max');
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = document.getElementById('form-name');
      var email   = document.getElementById('form-email');
      var subject = document.getElementById('form-subject');
      var message = document.getElementById('form-message');
      var hasError = false;

      [name, email, subject, message].forEach(function (f) { if (f) f.removeAttribute('aria-invalid'); });

      if (name && !name.value.trim()) { name.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (email && (!email.value.trim() || !email.value.includes('@'))) { email.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (subject && !subject.value) { subject.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (message && message.value.trim().length < 20) { message.setAttribute('aria-invalid', 'true'); hasError = true; }

      if (hasError) {
        if (statusEl) { statusEl.className = 'form__status form__status--error'; statusEl.textContent = '> Veuillez remplir tous les champs (message : 20 caractères minimum).'; }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Envoi en cours...'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          if (statusEl) { statusEl.className = 'form__status form__status--success'; statusEl.textContent = '> Message envoyé avec succès. Merci !'; }
          form.reset();
          if (msgCounter) { msgCounter.textContent = '0 / 2000'; msgCounter.className = 'form__counter'; }
        } else { throw new Error('err'); }
      })
      .catch(function () {
        if (statusEl) { statusEl.className = 'form__status form__status--error'; statusEl.textContent = "> Erreur lors de l'envoi. Réessayez ou envoyez un email directement."; }
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#ico-send"/></svg> Envoyer le message';
        }
      });
    });
  }

})();