(function () {
  'use strict';

  /* ============================
     SCROLL POSITION RESTORE
     ============================ */
  (function () {
    try {
      var k = 'scrollPos:' + window.location.href;
      var saved = sessionStorage.getItem(k);
      if (saved !== null) {
        sessionStorage.removeItem(k);
        requestAnimationFrame(function () {
          window.scrollTo(0, parseInt(saved, 10));
        });
      }
    } catch (e) {}
  })();


  /* ============================
     MOBILE NAV TOGGLE
     ============================ */
  var toggle  = document.querySelector('.nav__toggle');
  var menu    = document.getElementById('nav-menu');
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
     SMOOTH SCROLL
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
     GLITCH: data-text sur les titres
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
        var cards = entry.target.querySelectorAll('.card');
        cards.forEach(function (card, i) {
          setTimeout(function () { card.classList.add('card--visible'); }, i * 90);
        });
        cardObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.cards-grid').forEach(function (g) { cardObserver.observe(g); });
  } else {
    document.querySelectorAll('.card').forEach(function (c) { c.classList.add('card--visible'); });
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
    document.querySelectorAll('.fade-in').forEach(function (el) { fadeObserver.observe(el); });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('fade-in--visible'); });
  }

  /* ============================
     CODE RAIN CANVAS
     ============================ */
  (function () {
    var canvas = document.getElementById('rain-canvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

    var ctx   = canvas.getContext('2d');
    var chars = '01アイウエオカキクケコサシスセソ<>{}[]|/\\!?#$%&';
    var cols, drops, fontSize;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      fontSize = window.innerWidth < 600 ? 11 : 13;
      cols  = Math.floor(canvas.width / (fontSize * 1.5));
      drops = new Array(cols).fill(0).map(function () { return Math.floor(Math.random() * -50); });
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
        ctx.fillStyle = '#aaffdd';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * (fontSize * 1.5), y);
        ctx.fillStyle = '#00ff88';
        if (y - fontSize * 1.5 > 0) {
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * (fontSize * 1.5), y - fontSize * 1.5);
        }
        if (y > canvas.height && Math.random() > 0.975) { drops[i] = -Math.floor(Math.random() * 20); }
        drops[i]++;
      }
    }

    var raf, lastTime = 0, interval = 55;
    function loop(ts) {
      if (ts - lastTime >= interval) { draw(); lastTime = ts; }
      raf = requestAnimationFrame(loop);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); } else { raf = requestAnimationFrame(loop); }
    });
    raf = requestAnimationFrame(loop);
  })();

  /* ============================
     CUSTOM CURSOR
     ============================ */
  (function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var cursor = document.getElementById('cursor');
    if (!cursor) return;

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my, isHovering = false;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.classList.remove('cursor--hidden');
    });
    document.addEventListener('mouseleave', function () {
      cursor.classList.add('cursor--hidden');
      cursor.classList.remove('cursor--hover');
      isHovering = false;
    });
    document.addEventListener('mouseenter', function () { cursor.classList.remove('cursor--hidden'); });

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest('a, button, .card, .custom-select, .custom-select__option, input, textarea, [role="button"], [role="option"]');
      if (el) { cursor.classList.add('cursor--hover'); isHovering = true; }
      else    { cursor.classList.remove('cursor--hover'); isHovering = false; }
    });

    function tick() {
      var ease = isHovering ? 0.12 : 0.18;
      cx += (mx - cx) * ease;
      cy += (my - cy) * ease;
      cursor.style.left = cx + 'px';
      cursor.style.top  = cy + 'px';
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ============================
     PAGE TRANSITION
     ============================ */
  (function () {
    var overlay  = document.getElementById('page-transition');
    var progress = document.getElementById('pt-progress');
    if (!overlay) return;

    function navigate(href) {
      try { sessionStorage.setItem('scrollPos:' + window.location.href, '' + window.scrollY); } catch (e) {}
      overlay.classList.add('active');
      if (progress) {
        progress.style.width = '0%';
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            progress.style.width = '70%';
            setTimeout(function () { progress.style.width = '100%'; }, 150);
          });
        });
      }
      setTimeout(function () { window.location.href = href; }, 320);
    }

    document.querySelectorAll('a.nav-link').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        navigate(href);
      });
    });

    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { overlay.classList.remove('active'); }
    });
  })();

  /* ============================
     CUSTOM SELECT (sujet de contact)
     ============================ */
  (function () {
    var select    = document.getElementById('custom-select');
    var hidden    = document.getElementById('form-subject');
    var valueEl   = document.getElementById('select-value');
    var iconSlot  = document.getElementById('select-icon-slot');
    var list      = document.getElementById('select-list');
    if (!select || !hidden || !valueEl || !list) return;

    function open() {
      select.setAttribute('aria-expanded', 'true');
    }
    function close() {
      select.setAttribute('aria-expanded', 'false');
    }
    function choose(option) {
      var val  = option.getAttribute('data-value');
      var icon = option.getAttribute('data-icon');
      hidden.value   = val;
      valueEl.textContent = option.textContent.trim();
      valueEl.classList.add('has-value');

      // Mise à jour icône dans le trigger
      if (icon) {
        iconSlot.innerHTML = '<svg class="ico" aria-hidden="true"><use href="' + icon + '"/></svg>';
      }

      // Aria-selected
      list.querySelectorAll('.custom-select__option').forEach(function (o) {
        o.setAttribute('aria-selected', o === option ? 'true' : 'false');
      });

      close();
      select.focus();
    }

    // Toggle
    select.addEventListener('click', function (e) {
      var isOpen = select.getAttribute('aria-expanded') === 'true';
      if (isOpen) { close(); } else { open(); }
    });

    // Sélection option
    list.querySelectorAll('.custom-select__option').forEach(function (option) {
      option.addEventListener('click', function (e) {
        e.stopPropagation();
        choose(option);
      });
      option.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(option); }
      });
    });

    // Fermer au clic extérieur
    document.addEventListener('click', function (e) {
      if (!select.contains(e.target)) { close(); }
    });

    // Navigation clavier
    select.addEventListener('keydown', function (e) {
      var isOpen = select.getAttribute('aria-expanded') === 'true';
      var options = Array.from(list.querySelectorAll('.custom-select__option'));
      var current = list.querySelector('[aria-selected="true"]');
      var idx     = options.indexOf(current);

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen) { open(); } else if (current) { choose(current); }
      } else if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) { open(); }
        var next = options[idx + 1] || options[0];
        options.forEach(function (o) { o.setAttribute('aria-selected', 'false'); });
        next.setAttribute('aria-selected', 'true');
        next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = options[idx - 1] || options[options.length - 1];
        options.forEach(function (o) { o.setAttribute('aria-selected', 'false'); });
        prev.setAttribute('aria-selected', 'true');
        prev.focus();
      }
    });
  })();

  /* ============================
     QUOTE ROTATION
     ============================ */
  var quotes = [
    "Activez l'authentification à deux facteurs (2FA) sur tous vos comptes importants.",
    "Un mot de passe fort fait au moins 16 caractères avec chiffres, lettres et symboles.",
    "Ne cliquez jamais sur un lien dans un e-mail sans vérifier l'expéditeur.",
    "Mettez à jour vos logiciels dès qu'un correctif de sécurité est disponible.",
    "Utilisez un gestionnaire de mots de passe pour ne pas réutiliser les mêmes.",
    "Chiffrez vos données sensibles, surtout sur les appareils portables.",
    "Le Wi-Fi public est un terrain de jeu pour les attaquants. Utilisez un VPN.",
    "Sauvegardez régulièrement vos données selon la règle 3-2-1.",
    "Vérifiez les permissions des applications installées sur votre téléphone.",
    "Un antivirus ne remplace pas la vigilance humaine face au phishing.",
    "Séparez vos usages pro et perso sur des sessions ou appareils différents.",
    "Avant de publier, demandez-vous : cette info pourrait-elle être exploitée ?",
    "La sécurité est un processus continu, pas un produit à installer."
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
  var backToTop   = document.getElementById('back-to-top');
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (quoteBanner) quoteBanner.hidden = y > 300;
    if (backToTop)   backToTop.setAttribute('data-visible', y > 600 ? 'true' : 'false');
  }, { passive: true });

  /* ============================
     CONTACT FORM
     Protection : honeypot + rate limit 1 envoi / 24h / navigateur
     ============================ */
  var form       = document.getElementById('contact-form');
  var statusEl   = document.getElementById('form-status');
  var submitBtn  = document.getElementById('form-submit');
  var msgTextarea = document.getElementById('form-message');
  var msgCounter  = document.getElementById('msg-counter');
  var honeypot    = form ? form.querySelector('.form__honeypot') : null;

  // Compteur caractères
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

  /* Rate limiting : stockage localStorage avec clé + timestamp
     → 1 soumission par 24h par navigateur */
  var RATE_KEY = 'cs_form_last';
  var RATE_DELAY = 24 * 60 * 60 * 1000; // 24h en ms

  function canSubmit() {
    try {
      var last = localStorage.getItem(RATE_KEY);
      if (!last) return true;
      return (Date.now() - parseInt(last, 10)) > RATE_DELAY;
    } catch (e) { return true; }
  }

  function markSubmitted() {
    try { localStorage.setItem(RATE_KEY, '' + Date.now()); } catch (e) {}
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot : si rempli, bot détecté
      if (honeypot && honeypot.value.length > 0) {
        // On simule un succès pour ne pas alerter le bot
        if (statusEl) {
          statusEl.className = 'form__status form__status--success';
          statusEl.textContent = '> Message envoyé avec succès. Merci !';
        }
        form.reset();
        return;
      }

      // Rate limiting côté client
      if (!canSubmit()) {
        if (statusEl) {
          statusEl.className = 'form__status form__status--error';
          statusEl.textContent = '> Vous avez déjà envoyé un message aujourd\'hui. Réessayez demain ou contactez-moi directement via LinkedIn.';
        }
        return;
      }

      // Validation champs
      var name    = document.getElementById('form-name');
      var email   = document.getElementById('form-email');
      var subject = document.getElementById('form-subject');
      var message = document.getElementById('form-message');
      var hasError = false;

      [name, email, message].forEach(function (f) { if (f) f.removeAttribute('aria-invalid'); });

      if (name && !name.value.trim()) { name.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (email && (!email.value.trim() || !email.value.includes('@'))) { email.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (!subject.value) { document.getElementById('custom-select').style.boxShadow = '0 0 0 3px rgba(255,85,85,0.25)'; hasError = true; }
      if (message && message.value.trim().length < 20) { message.setAttribute('aria-invalid', 'true'); hasError = true; }

      // Longueur max côté JS (protection bypass HTML)
      if (name && name.value.length > 80)    { name.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (email && email.value.length > 120)  { email.setAttribute('aria-invalid', 'true'); hasError = true; }
      if (message && message.value.length > 2000) { message.setAttribute('aria-invalid', 'true'); hasError = true; }

      if (hasError) {
        if (statusEl) {
          statusEl.className = 'form__status form__status--error';
          statusEl.textContent = '> Veuillez remplir tous les champs correctement (message : 20 à 2000 caractères).';
        }
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Envoi en cours...'; }

      fetch(form.action, {
  method: 'POST',
  body: new FormData(form),
  headers: { 'Accept': 'application/json' }
})
.then(function (res) {
  // Formspree renvoie parfois 200 ou 303, on accepte les deux
  if (res.ok || res.status === 303) {
    if (statusEl) {
      statusEl.className = 'form__status form__status--success';
      statusEl.textContent = '> Message envoyé avec succès. Merci !';
    }
    markSubmitted();
    form.reset();
    // reset du select custom
    var valueEl = document.getElementById('select-value');
    if (valueEl) { valueEl.textContent = 'Choisissez un sujet'; valueEl.classList.remove('has-value'); }
    var iconSlot = document.getElementById('select-icon-slot');
    if (iconSlot) iconSlot.innerHTML = '';
    if (msgCounter) { msgCounter.textContent = '0 / 2000'; msgCounter.className = 'form__counter'; }
  } else { throw new Error('status:' + res.status); }
})
.catch(function (err) {
  if (statusEl) {
    statusEl.className = 'form__status form__status--error';
    statusEl.textContent = "> Erreur lors de l'envoi. Réessayez ou contactez-moi directement via LinkedIn.";
  }
})
