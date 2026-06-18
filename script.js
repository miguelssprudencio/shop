/* =========================================================================
   ÁUREA — script.js
   JavaScript puro, sem dependências. Organizado em módulos independentes,
   cada um inicializado em DOMContentLoaded.
   ========================================================================= */

(function () {
  'use strict';

  /* Preferência do usuário por movimento reduzido — respeitada em todo o JS */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------
     Utilitário: throttle via requestAnimationFrame
     Evita disparar lógica pesada em todo evento de scroll/resize.
     ----------------------------------------------------------------- */
  function rafThrottle(callback) {
    var ticking = false;
    return function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  }

  /* =====================================================================
     MÓDULO: Navbar — estado "glass" ao rolar
     ===================================================================== */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    function updateNavbarState() {
      navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    }

    updateNavbarState();
    window.addEventListener('scroll', rafThrottle(updateNavbarState), { passive: true });
  }

  /* =====================================================================
     MÓDULO: Menu mobile (hambúrguer animado + painel deslizante)
     ===================================================================== */
  function initMobileMenu() {
    var burgerBtn = document.getElementById('burgerBtn');
    var panel = document.getElementById('mobilePanel');
    var overlay = document.getElementById('mobileOverlay');
    if (!burgerBtn || !panel || !overlay) return;

    function openMenu() {
      panel.classList.add('is-active');
      overlay.classList.add('is-active');
      burgerBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('nav-open');
    }

    function closeMenu() {
      panel.classList.remove('is-active');
      overlay.classList.remove('is-active');
      burgerBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }

    function toggleMenu() {
      var isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    }

    burgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);

    /* Fecha o menu ao clicar em qualquer link interno do painel */
    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    /* Fecha com a tecla Esc, por acessibilidade */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* =====================================================================
     MÓDULO: Reveal on scroll — fade-in com stagger via IntersectionObserver
     ===================================================================== */
  function initRevealAnimations() {
    var revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    /* Agrupa elementos por seção-pai para calcular o atraso em sequência
       (efeito "stagger") apenas entre irmãos próximos, sem acumular delay
       infinito ao longo da página inteira. */
    var groupCounters = new WeakMap();

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var parent = el.parentElement;
        var index = groupCounters.get(parent) || 0;

        el.style.setProperty('--reveal-delay', Math.min(index * 90, 360) + 'ms');
        el.classList.add('is-visible');

        groupCounters.set(parent, index + 1);
        obs.unobserve(el);
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* =====================================================================
     MÓDULO: Parallax do Hero (mouse + scroll, suave)
     ===================================================================== */
  function initHeroParallax() {
    if (prefersReducedMotion) return;

    var hero = document.querySelector('.hero');
    var heroBg = document.querySelector('.hero__bg');
    var artLayers = document.querySelectorAll('.hero__layer');
    if (!hero) return;

    var pointerX = 0;
    var pointerY = 0;

    /* Parallax sutil ao mover o mouse sobre o hero */
    hero.addEventListener('mousemove', function (event) {
      var rect = hero.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;

      artLayers.forEach(function (layer) {
        var depth = parseFloat(layer.getAttribute('data-depth')) || 0.03;
        var moveX = pointerX * depth * 300;
        var moveY = pointerY * depth * 300;
        layer.style.transform = 'translate(' + moveX.toFixed(1) + 'px, ' + moveY.toFixed(1) + 'px)';
      });
    });

    hero.addEventListener('mouseleave', function () {
      artLayers.forEach(function (layer) {
        layer.style.transform = 'translate(0, 0)';
      });
    });

    /* Parallax leve do fundo conforme o usuário rola a página */
    function updateScrollParallax() {
      var offset = window.scrollY;
      if (offset > window.innerHeight) return;
      if (heroBg) heroBg.style.transform = 'translateY(' + (offset * 0.18).toFixed(1) + 'px)';
    }

    window.addEventListener('scroll', rafThrottle(updateScrollParallax), { passive: true });
  }

  /* =====================================================================
     MÓDULO: Fio de progresso (elemento de assinatura, tema alfaiataria)
     Preenche conforme o avanço de leitura da página.
     ===================================================================== */
  function initProgressThread() {
    var fill = document.getElementById('threadFill');
    var pctLabel = document.getElementById('threadPct');
    if (!fill || !pctLabel) return;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

      fill.style.height = (progress * 100).toFixed(1) + '%';
      pctLabel.textContent = String(Math.round(progress * 100)).padStart(2, '0');
    }

    updateProgress();
    window.addEventListener('scroll', rafThrottle(updateProgress), { passive: true });
    window.addEventListener('resize', rafThrottle(updateProgress));
  }

  /* =====================================================================
     MÓDULO: Slider de depoimentos
     Controles por botão, navegação por dots, swipe em touch e autoplay
     (pausado ao interagir ou passar o mouse).
     ===================================================================== */
  function initTestimonialSlider() {
    var slider = document.getElementById('slider');
    var track = document.getElementById('sliderTrack');
    var dotsContainer = document.getElementById('sliderDots');
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    if (!slider || !track || !dotsContainer) return;

    var slides = Array.prototype.slice.call(track.children);
    var currentIndex = 0;
    var autoplayId = null;
    var autoplayDelay = 6500;

    /* Cria os indicadores (dots) dinamicamente, um por depoimento */
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
      dot.addEventListener('click', function () { goToSlide(i); });
      dotsContainer.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsContainer.children);

    function render() {
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === currentIndex);
        dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      });
    }

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      render();
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayId = window.setInterval(nextSlide, autoplayDelay);
    }

    function stopAutoplay() {
      if (autoplayId) {
        window.clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { nextSlide(); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prevSlide(); startAutoplay(); });

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    /* Suporte a swipe em telas touch */
    var touchStartX = 0;
    var touchEndX = 0;

    track.addEventListener('touchstart', function (event) {
      touchStartX = event.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', function (event) {
      touchEndX = event.changedTouches[0].clientX;
      var delta = touchStartX - touchEndX;
      if (Math.abs(delta) > 40) {
        delta > 0 ? nextSlide() : prevSlide();
      }
      startAutoplay();
    }, { passive: true });

    render();
    startAutoplay();
  }

  /* =====================================================================
     MÓDULO: Formulário de Newsletter
     Validação simples no cliente + mensagem de retorno acessível.
     ===================================================================== */
  function initNewsletterForm() {
    var form = document.getElementById('newsletterForm');
    var input = document.getElementById('newsletterEmail');
    var feedback = document.getElementById('newsletterFeedback');
    if (!form || !input || !feedback) return;

    function showFeedback(message, type) {
      feedback.textContent = message;
      feedback.classList.remove('is-success', 'is-error');
      feedback.classList.add('is-visible', type === 'success' ? 'is-success' : 'is-error');
    }

    function isValidEmail(value) {
      /* Validação pragmática de e-mail, suficiente para o front-end */
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();

      if (!isValidEmail(value)) {
        showFeedback('Verifique o e-mail informado antes de continuar.', 'error');
        input.focus();
        return;
      }

      /* Aqui entraria a chamada real a um serviço de e-mail marketing. */
      showFeedback('Inscrição confirmada. Em breve você recebe novidades da Edição 07.', 'success');
      form.reset();
    });
  }

  /* =====================================================================
     INICIALIZAÇÃO
     ===================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileMenu();
    initRevealAnimations();
    initHeroParallax();
    initProgressThread();
    initTestimonialSlider();
    initNewsletterForm();
  });

})();