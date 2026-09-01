/* =====================================================================
   밝은태 한의원 — Header + Hero slider
   ===================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================================================================
     HERO SLIDER
     - 전환: 컷(크로스페이드 없음)
     - 활성화될 때마다 Ken Burns + 텍스트 fadeUp 애니메이션 재생
       (is-active 클래스 제거 → 강제 reflow → 재부착)
     ================================================================== */
  (function heroSlider() {
    var hero = document.getElementById('hero');
    if (!hero) return;

    var track = document.getElementById('heroSlides');
    var slides = Array.prototype.slice.call(track.querySelectorAll('[data-slide]'));
    if (slides.length === 0) return;

    var prevBtn = document.getElementById('heroPrev');
    var nextBtn = document.getElementById('heroNext');
    var dotsWrap = document.getElementById('heroDots');

    var INTERVAL = 5500;          // 오토플레이 간격(ms)
    var current = 0;
    var timer = null;

    /* ---- 인디케이터 생성 ---- */
    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hero-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', (i + 1) + '번 슬라이드');
      b.addEventListener('click', function () { goTo(i, true); });
      dotsWrap.appendChild(b);
      return b;
    });

    /* ---- 렌더 (애니메이션 재시작 트릭 포함) ---- */
    function render() {
      slides.forEach(function (s) {
        s.classList.remove('is-active');
        s.hidden = true;
      });
      dots.forEach(function (d) {
        d.classList.remove('is-active');
        d.removeAttribute('aria-selected');
      });

      // 강제 reflow — 클래스/표시 상태 제거를 브라우저에 반영시켜
      // 다음 프레임에 애니메이션이 처음부터 다시 재생되도록 함
      void track.offsetWidth;

      var active = slides[current];
      active.hidden = false;
      active.classList.add('is-active');
      dots[current].classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');
    }

    function goTo(index, userAction) {
      current = (index % slides.length + slides.length) % slides.length;
      render();
      if (userAction) restart();     // 수동 조작 시 오토플레이 타이머 리셋
    }
    function next(userAction) { goTo(current + 1, userAction); }
    function prev(userAction) { goTo(current - 1, userAction); }

    /* ---- 오토플레이 ---- */
    function start() {
      if (timer || prefersReducedMotion || slides.length < 2) return;
      timer = window.setInterval(function () { next(false); }, INTERVAL);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() { stop(); start(); }

    /* ---- 이벤트 ---- */
    if (nextBtn) nextBtn.addEventListener('click', function () { next(true); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(true); });

    // 마우스/포커스 진입 시 일시정지
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', start);

    // 탭이 백그라운드로 가면 정지
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    // 키보드 좌우 이동
    hero.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(true); }
      else if (e.key === 'ArrowRight') { next(true); }
    });

    // 터치 스와이프
    var startX = null;
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) { dx < 0 ? next(true) : prev(true); }
      startX = null;
    });

    render();
    start();
  })();

  /* ==================================================================
     HEADER — 스크롤 시 배경 채우기
     ================================================================== */
  (function headerScroll() {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    var THRESHOLD = 40;
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ==================================================================
     MOBILE NAV
     ================================================================== */
  (function mobileNav() {
    var header = document.getElementById('siteHeader');
    var toggle = document.getElementById('navToggle');
    var gnb = document.getElementById('gnb');
    if (!header || !toggle || !gnb) return;

    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });

    gnb.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', '메뉴 열기');
      }
    });
  })();

  /* ==================================================================
     BACK TO TOP
     ================================================================== */
  (function backToTop() {
    var btn = document.getElementById('utilTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  })();

})();
