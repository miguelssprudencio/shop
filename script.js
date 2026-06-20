
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function raf(fn) {
    var locked = false;
    return function () {
      if (locked) return;
      locked = true;
      var a = arguments, t = this;
      requestAnimationFrame(function () { fn.apply(t, a); locked = false; });
    };
  }

  (function () {
    var toggle = document.getElementById('themeToggle');
    var html = document.documentElement;
    function set(light) {
      html.classList.toggle('light', light);
      toggle.checked = light;
      localStorage.setItem('aurea-theme', light ? 'light' : 'dark');
    }
    var saved = localStorage.getItem('aurea-theme');
    if (saved) set(saved === 'light');
    toggle.addEventListener('change', function () { set(toggle.checked); });
  })();

  (function () {
    var nav = document.getElementById('navbar');
    var burger = document.getElementById('navToggle');
    var panel = document.getElementById('mobilePanel');
    var overlay = document.getElementById('mobileOverlay');

    window.addEventListener('scroll', raf(function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }), { passive: true });

    function toggleMenu() {
      var open = panel.classList.toggle('active');
      overlay.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', open);
      document.body.classList.toggle('menu-open', open);
    }
    burger.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    panel.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', toggleMenu); });
  })();

  (function () {
    var cart = [];

    var cartBtn       = document.getElementById('cartBtn');
    var cartOverlay   = document.getElementById('cartOverlay');
    var cartDrawer    = document.getElementById('cartDrawer');
    var closeCart     = document.getElementById('closeCart');
    var continueShopping = document.getElementById('continueShopping');
    var cartBody      = document.getElementById('cartBody');
    var cartTotalEl   = document.getElementById('cartTotal');
    var cartBadge     = document.getElementById('cartBadge');
    var checkoutBtn   = document.getElementById('checkoutBtn');
    var toast         = document.getElementById('toast');
    var toastMsg      = document.getElementById('toastMsg');

    var sizeOverlay   = document.getElementById('sizeOverlay');
    var sizeSheet     = document.getElementById('sizeSheet');
    var sizeProductEl = document.getElementById('sizeProductName');
    var sizeOpts      = document.querySelectorAll('.size-opt');
    var cancelSize    = document.getElementById('cancelSize');
    var confirmSize   = document.getElementById('confirmSize');

    var pendingProduct = null;
    var chosenSize = null;
    var toastTimer = null;

    function openCart() {
      cartDrawer.classList.add('active');
      cartOverlay.classList.add('active');
      document.body.classList.add('menu-open');
    }
    function closeCartFn() {
      cartDrawer.classList.remove('active');
      cartOverlay.classList.remove('active');
      document.body.classList.remove('menu-open');
    }

    function showToast(msg) {
      toastMsg.textContent = msg || 'Item adicionado à sacola';
      toast.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('visible'); }, 2800);
    }

    function fmtPrice(n) {
      return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function renderCart() {
      var total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
      var count = cart.reduce(function (s, i) { return s + i.qty; }, 0);

      cartBadge.textContent = count;
      cartBadge.classList.toggle('visible', count > 0);
      cartTotalEl.textContent = fmtPrice(total);

      if (cart.length === 0) {
        cartBody.innerHTML =
          '<div class="cart-empty">' +
          '<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>' +
          '<p>Sua sacola está vazia.</p></div>';
        checkoutBtn.disabled = true;
        return;
      }

      checkoutBtn.disabled = false;
      cartBody.innerHTML = '';
      cart.forEach(function (item, idx) {
        var el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML =
          '<div>' +
            '<p class="cart-item__name">' + item.name + '</p>' +
            '<p class="cart-item__meta">Tamanho ' + item.size + '</p>' +
            '<p class="cart-item__price">' + fmtPrice(item.price * item.qty) + '</p>' +
            '<div class="qty-row">' +
              '<button class="qty-btn" data-idx="' + idx + '" data-act="minus" aria-label="Diminuir">&#8722;</button>' +
              '<span class="qty-value">' + item.qty + '</span>' +
              '<button class="qty-btn" data-idx="' + idx + '" data-act="plus" aria-label="Aumentar">&#43;</button>' +
            '</div>' +
          '</div>' +
          '<button class="cart-item__remove" data-idx="' + idx + '" aria-label="Remover item">&#215;</button>';
        cartBody.appendChild(el);
      });
    }

    cartBody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-idx]');
      if (!btn) return;
      var idx = parseInt(btn.dataset.idx);
      var act = btn.dataset.act;
      if (act === 'plus') { cart[idx].qty++; }
      else if (act === 'minus') {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      } else if (btn.classList.contains('cart-item__remove')) {
        cart.splice(idx, 1);
      }
      renderCart();
    });

    cartBtn.addEventListener('click', function () { renderCart(); openCart(); });
    cartOverlay.addEventListener('click', closeCartFn);
    closeCart.addEventListener('click', closeCartFn);
    continueShopping.addEventListener('click', closeCartFn);

    function openSize(product) {
      pendingProduct = product;
      chosenSize = null;
      sizeProductEl.textContent = product.name;
      sizeOpts.forEach(function (o) { o.classList.remove('selected'); });
      sizeSheet.classList.add('active');
      sizeOverlay.classList.add('active');
    }
    function closeSize() {
      sizeSheet.classList.remove('active');
      sizeOverlay.classList.remove('active');
      pendingProduct = null;
    }

    sizeOpts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        sizeOpts.forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        chosenSize = opt.dataset.size;
      });
    });

    confirmSize.addEventListener('click', function () {
      if (!chosenSize) {
        sizeOpts[0].focus();
        return;
      }
      var existing = cart.find(function (i) {
        return i.name === pendingProduct.name && i.size === chosenSize;
      });
      if (existing) { existing.qty++; }
      else { cart.push({ name: pendingProduct.name, price: pendingProduct.price, size: chosenSize, qty: 1 }); }
      closeSize();
      renderCart();
      showToast(pendingProduct.name + ' (tam. ' + chosenSize + ') adicionado');
    });

    cancelSize.addEventListener('click', closeSize);
    sizeOverlay.addEventListener('click', closeSize);

    document.querySelectorAll('.add-to-cart').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openSize({ name: btn.dataset.name, price: parseFloat(btn.dataset.price) });
      });
    });

    checkoutBtn.addEventListener('click', function () {
      var span = checkoutBtn.querySelector('span');
      span.textContent = 'Processando…';
      checkoutBtn.disabled = true;
      setTimeout(function () {
        checkoutBtn.classList.add('btn-checkout-success');
        span.textContent = 'Pedido Confirmado ✓';
        setTimeout(function () {
          cart = [];
          renderCart();
          closeCartFn();
          checkoutBtn.classList.remove('btn-checkout-success');
          span.textContent = 'Finalizar Pedido';
          showToast('Pedido realizado com sucesso!');
        }, 2000);
      }, 1400);
    });

    renderCart();
  })();

  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length || reduced) {
      els.forEach(function (e) { e.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { obs.observe(el); });
  })();

  (function () {
    var bg = document.getElementById('heroBg');
    if (!bg || reduced) return;
    window.addEventListener('scroll', raf(function () {
      if (window.scrollY < window.innerHeight) {
        bg.style.transform = 'translateY(' + (window.scrollY * 0.16).toFixed(1) + 'px)';
      }
    }), { passive: true });
  })();

  (function () {
    var fill = document.getElementById('threadFill');
    var pct  = document.getElementById('threadPct');
    if (!fill) return;
    function update() {
      var p = Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1);
      fill.style.height = (p * 100).toFixed(1) + '%';
      pct.textContent = String(Math.round(p * 100)).padStart(2, '0');
    }
    update();
    window.addEventListener('scroll', raf(update), { passive: true });
    window.addEventListener('resize', raf(update));
  })();

  (function () {
    var track = document.getElementById('sliderTrack');
    var dotsC = document.getElementById('sliderDots');
    var prev  = document.getElementById('prevBtn');
    var next  = document.getElementById('nextBtn');
    if (!track) return;

    var slides = Array.from(track.children);
    var cur = 0;
    var timer = null;
    var DELAY = 6000;

    slides.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Depoimento ' + (i + 1));
      d.addEventListener('click', function () { go(i); restart(); });
      dotsC.appendChild(d);
    });

    var dots = Array.from(dotsC.children);

    function render() {
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === cur); });
    }

    function go(i) { cur = ((i % slides.length) + slides.length) % slides.length; render(); }
    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(function () { go(cur + 1); }, DELAY);
    }

    prev.addEventListener('click', function () { go(cur - 1); restart(); });
    next.addEventListener('click', function () { go(cur + 1); restart(); });

    var tx = 0;
    track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var d = tx - e.changedTouches[0].clientX;
      if (Math.abs(d) > 44) go(d > 0 ? cur + 1 : cur - 1);
      restart();
    }, { passive: true });

    document.getElementById('slider').addEventListener('mouseenter', function () { clearInterval(timer); });
    document.getElementById('slider').addEventListener('mouseleave', restart);

    render();
    restart();
  })();

  (function () {
    var form  = document.getElementById('newsletterForm');
    var input = document.getElementById('newsletterEmail');
    var msg   = document.getElementById('newsletterMsg');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        msg.textContent = 'Por favor, informe um e-mail válido.';
        msg.className = 'newsletter__msg visible error';
        input.focus();
        return;
      }
      msg.textContent = 'Inscrição confirmada! Em breve você recebe novidades da Edição 07.';
      msg.className = 'newsletter__msg visible success';
      form.reset();
    });
  })();

})();