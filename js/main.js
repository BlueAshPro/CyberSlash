(function () {
  'use strict';

  /* ---- Mobile nav toggle ---- */
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
      if (isOpen) {
        closeMenu();
      } else {
        menu.setAttribute('data-open', 'true');
        toggle.setAttribute('aria-expanded', 'true');
        menuIcon.setAttribute('href', '#ico-x');
      }
    });
  }

  /* Close on link click (mobile) */
  if (menu) {
    menu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (menu && menu.getAttribute('data-open') === 'true') {
        closeMenu();
        toggle.focus();
      }
      // Also close modal
      closeModal();
    }
  });

  /* ---- Smooth scroll ---- */
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

  /* ---- Intersection Observer for fade-in ---- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in').forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-in').forEach(function (el) {
      el.classList.add('fade-in--visible');
    });
  }

  /* ---- Quote rotation ---- */
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
      quoteEl.textContent = quotes[quoteIndex];
    }, 8000);
  }

  /* ---- Hide quote banner on scroll ---- */
  var quoteBanner = document.getElementById('quote-banner');
  var backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', function () {
    var y = window.scrollY;

    if (quoteBanner) {
      quoteBanner.hidden = y > 300;
    }

    if (backToTop) {
      backToTop.setAttribute('data-visible', y > 600 ? 'true' : 'false');
    }
  }, { passive: true });

  /* ---- Modal System ---- */
  var modal = document.getElementById('page-modal');
  var modalTitle = document.getElementById('modal-title');
  var modalIframe = document.getElementById('modal-iframe');
  var modalClose = document.getElementById('modal-close');
  var lastFocusedElement = null;

  function openModal(pageName, title) {
    if (!modal || !modalTitle || !modalIframe) return;

    lastFocusedElement = document.activeElement;

    modalTitle.textContent = title;
    modalIframe.src = 'pages/' + pageName + '.html';

    modal.classList.add('active');
    document.body.classList.add('modal-open');

    // Focus the close button
    if (modalClose) {
      modalClose.focus();
    }
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('active');
    document.body.classList.remove('modal-open');

    if (modalIframe) {
      modalIframe.src = '';
    }

    // Restore focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  // Expose functions globally
  window.openModal = openModal;
  window.closeModal = closeModal;

  // Close button
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Click outside modal content to close
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Handle cards with data-page attribute
  document.querySelectorAll('[data-page]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      var pageName = this.getAttribute('data-page');
      var title = this.getAttribute('data-title') || 'Document';
      openModal(pageName, title);
    });

    // Make keyboard accessible
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var pageName = this.getAttribute('data-page');
        var title = this.getAttribute('data-title') || 'Document';
        openModal(pageName, title);
      }
    });
  });

  /* ---- Contact form ---- */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var submitBtn = document.getElementById('form-submit');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Basic validation */
      var name = document.getElementById('form-name');
      var email = document.getElementById('form-email');
      var message = document.getElementById('form-message');
      var hasError = false;

      [name, email, message].forEach(function (field) {
        if (field) field.removeAttribute('aria-invalid');
      });

      if (name && !name.value.trim()) {
        name.setAttribute('aria-invalid', 'true');
        hasError = true;
      }
      if (email && (!email.value.trim() || !email.value.includes('@'))) {
        email.setAttribute('aria-invalid', 'true');
        hasError = true;
      }
      if (message && !message.value.trim()) {
        message.setAttribute('aria-invalid', 'true');
        hasError = true;
      }

      if (hasError) {
        if (statusEl) {
          statusEl.className = 'form__status form__status--error';
          statusEl.textContent = '> Veuillez remplir tous les champs obligatoires.';
        }
        return;
      }

      /* Submit */
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        if (res.ok) {
          if (statusEl) {
            statusEl.className = 'form__status form__status--success';
            statusEl.textContent = '> Message envoye avec succes. Merci !';
          }
          form.reset();
        } else {
          throw new Error('Erreur serveur');
        }
      })
      .catch(function () {
        if (statusEl) {
          statusEl.className = 'form__status form__status--error';
          statusEl.textContent = "> Erreur lors de l'envoi. Reessayez ou envoyez un email directement.";
        }
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
