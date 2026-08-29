/* =============================================================================
   IMPORTANT FIX (read this first):
   This single script.js file is shared by index.html, blog.html and
   aari-class.html — but several elements it looks for (#reviewDots,
   #bookForm, the testimonial rotator, etc.) only exist on index.html.

   Previously, code like `document.getElementById('reviewDots').appendChild(...)`
   ran directly with no check. On blog.html / aari-class.html that element
   is null, so `.appendChild` on null threw an error immediately — and because
   this is one flat script running top-to-bottom, EVERYTHING written after
   that crash point never ran, including the hamburger menu and the dark-mode
   toggle. That's why the toggle looked "unclickable" on those pages: its
   click listener was never attached at all.

   Fix: every block below now checks "does this element exist on the current
   page?" before doing anything with it. Safe to include on any page.
============================================================================= */

// ---------------------------------------------------------------------------
// Reveal-on-scroll animation (fades/slides elements with class "reveal" into
// view as they enter the viewport)
// ---------------------------------------------------------------------------
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}

// ---------------------------------------------------------------------------
// Services section tabs (Hair / Skin / Bridal / Nails / Spa / Re works)
// ---------------------------------------------------------------------------
document.querySelectorAll('.tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const group = tab.parentElement;
    group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.svc-cat').forEach(c => c.classList.remove('active'));
    const target = document.querySelector('.svc-cat[data-cat="' + tab.dataset.cat + '"]');
    if (target) target.classList.add('active');
  });
});

// ---------------------------------------------------------------------------
// Gallery filter tabs
// ---------------------------------------------------------------------------
document.querySelectorAll('.gal-tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gal-tabs .tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const cat = tab.dataset.gal;
    document.querySelectorAll('.gal-item').forEach(item => {
      item.classList.toggle('hide', cat !== 'all' && item.dataset.gal !== cat);
    });
  });
});

// ---------------------------------------------------------------------------
// Testimonials rotator — only present on index.html (#reviewQuote etc.)
// ---------------------------------------------------------------------------
const rq = document.getElementById('reviewQuote');
const rn = document.getElementById('reviewName');
const ra = document.getElementById('reviewAvatar');
const rd = document.getElementById('reviewDots');

if (rq && rn && ra && rd) {
  const reviews = [
    { quote: "\u201CThe bridal trial looked exactly like my wedding day photos. No surprises, no stress \u2014 just what we planned together.\u201D", name: "Divya S.", role: "Bride, 2025", initial: "D" },
    { quote: "\u201CI've sent every woman in my family here. They remember how you like your tea, and how you like your fringe.\u201D", name: "Priya R.", role: "Regular since 2019", initial: "P" },
    { quote: "\u201CIt's the only salon where I've never felt rushed out of the chair. Worth the short wait on Saturdays.\u201D", name: "Meera K.", role: "Regular since 2021", initial: "M" }
  ];
  let ri = 0;

  function showReview(i) {
    ri = i;
    rq.textContent = reviews[i].quote;
    rn.innerHTML = reviews[i].name + ' <span>' + reviews[i].role + '</span>';
    ra.textContent = reviews[i].initial;
    [...rd.children].forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  reviews.forEach((_, i) => {
    const b = document.createElement('button');
    if (i === 0) b.classList.add('active');
    b.setAttribute('aria-label', 'Show review ' + (i + 1));
    b.addEventListener('click', () => showReview(i));
    rd.appendChild(b);
  });

  setInterval(() => showReview((ri + 1) % reviews.length), 6000);
}

// ---------------------------------------------------------------------------
// Booking form validation — only present on index.html (#bookForm)
// ---------------------------------------------------------------------------
const form = document.getElementById('bookForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    const checks = [
      { id: 'f-name', test: () => document.getElementById('name').value.trim().length > 1 },
      { id: 'f-mobile', test: () => /^\d{10}$/.test(document.getElementById('mobile').value.trim()) },
      { id: 'f-email', test: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.getElementById('email').value.trim()) },
      { id: 'f-service', test: () => document.getElementById('service').value !== "" },
      { id: 'f-date', test: () => document.getElementById('date').value !== "" },
      { id: 'f-time', test: () => document.getElementById('time').value !== "" }
    ];
    checks.forEach(c => {
      const el = document.getElementById(c.id);
      const ok = c.test();
      el.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    if (valid) {
      document.getElementById('formFields').style.display = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    }
  });
}

// ---------------------------------------------------------------------------
// Mobile nav (hamburger drawer) — present on every page's header
// ---------------------------------------------------------------------------
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose = document.getElementById('mobileClose');

if (hamburger && mobileNav && mobileOverlay && mobileClose) {
  function openNav() { mobileNav.classList.add('open'); mobileOverlay.classList.add('open'); }
  function closeNav() { mobileNav.classList.remove('open'); mobileOverlay.classList.remove('open'); }
  hamburger.addEventListener('click', openNav);
  mobileClose.addEventListener('click', closeNav);
  mobileOverlay.addEventListener('click', closeNav);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
}

// ---------------------------------------------------------------------------
// Dark / light mode toggle — present on every page's header
// (session only — no persistence in artifacts/localStorage)
// ---------------------------------------------------------------------------
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (themeToggle && themeIcon) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeIcon.innerHTML = isDark
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
      : '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>';
  });
}

// ---------------------------------------------------------------------------
// Swipeable carousels (gallery + reels): arrow buttons + mouse drag-to-scroll
// ---------------------------------------------------------------------------
document.querySelectorAll('.carousel').forEach(car => {
  const track = car.querySelector('.gal-grid, .reel-grid');
  const prev = car.querySelector('.car-prev');
  const next = car.querySelector('.car-next');
  if (!track) return;

  function cardStep() {
    const first = track.firstElementChild;
    if (!first) return 260;
    const style = getComputedStyle(track);
    return first.getBoundingClientRect().width + parseFloat(style.gap || 16);
  }
  function updateArrows() {
    const max = track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max;
  }
  prev && prev.addEventListener('click', () => track.scrollBy({ left: -cardStep() * 2, behavior: 'smooth' }));
  next && next.addEventListener('click', () => track.scrollBy({ left: cardStep() * 2, behavior: 'smooth' }));
  track.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();

  // mouse drag-to-scroll (touch devices already swipe natively)
  let isDown = false, startX = 0, startScroll = 0, dragged = false;
  track.addEventListener('mousedown', (e) => {
    isDown = true; dragged = false;
    track.classList.add('dragging');
    startX = e.pageX; startScroll = track.scrollLeft;
  });
  window.addEventListener('mouseup', () => { isDown = false; track.classList.remove('dragging'); });
  window.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('dragging'); });
  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 4) dragged = true;
    track.scrollLeft = startScroll - dx;
  });
  // prevent click-through (e.g. reel play button) right after a drag
  track.addEventListener('click', (e) => { if (dragged) { e.stopPropagation(); e.preventDefault(); } }, true);
});

// ---------------------------------------------------------------------------
// Reel play button feedback (prototype has no real video source yet)
// ---------------------------------------------------------------------------
document.querySelectorAll('.reel-play').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    btn.style.transform = 'scale(0.85)';
    setTimeout(() => btn.style.transform = '', 150);
  });
});

// ---------------------------------------------------------------------------
// Back to top button — present on every page's footer area
// ---------------------------------------------------------------------------
const topBtn = document.getElementById('topBtn');
if (topBtn) {
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('show', window.scrollY > 500);
  });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ---------------------------------------------------------------------------
// Reels carousel (play/pause, arrow scrolling) — only present on index.html
// (#reelGrid)
// ---------------------------------------------------------------------------
(function () {
  const grid = document.getElementById('reelGrid');
  if (!grid) return;

  const prevBtn = document.querySelector('.car-prev');
  const nextBtn = document.querySelector('.car-next');
  const cards = Array.from(grid.querySelectorAll('.reel-card'));

  // ---- Play / pause on click ----
  cards.forEach((card) => {
    const video = card.querySelector('.reel-video');
    const playBtn = card.querySelector('.reel-play');
    const iconPlay = card.querySelector('.icon-play');
    const iconPause = card.querySelector('.icon-pause');
    if (!video || !playBtn || !iconPlay || !iconPause) return;

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        // pause any other playing reel first
        cards.forEach((c) => {
          const v = c.querySelector('.reel-video');
          if (v && v !== video && !v.paused) {
            v.pause();
            c.querySelector('.icon-play').style.display = '';
            c.querySelector('.icon-pause').style.display = 'none';
            c.classList.remove('is-active');
          }
        });
        video.play();
        iconPlay.style.display = 'none';
        iconPause.style.display = '';
        card.classList.add('is-active');
      } else {
        video.pause();
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
        card.classList.remove('is-active');
      }
    });

    // reset icon when a video ends (loop is on, but keep this in case loop is removed)
    video.addEventListener('ended', () => {
      iconPlay.style.display = '';
      iconPause.style.display = 'none';
      card.classList.remove('is-active');
    });
  });

  // ---- Arrow scrolling ----
  function scrollByCard(direction) {
    const cardWidth = cards[0]?.getBoundingClientRect().width || 200;
    grid.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
  }

  function updateArrowState() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = grid.scrollWidth - grid.clientWidth - 2;
    prevBtn.disabled = grid.scrollLeft <= 0;
    nextBtn.disabled = grid.scrollLeft >= maxScroll;
  }

  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));
  grid.addEventListener('scroll', updateArrowState, { passive: true });
  window.addEventListener('resize', updateArrowState);
  updateArrowState();
})();
