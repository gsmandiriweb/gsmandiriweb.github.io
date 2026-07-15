/**
 * Cinematic Scroll Experience
 * Handles word-by-word reveals, parallax, and scroll-driven animations
 */

export function initCinematic() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Word-by-word headline animation
  initWordReveal();
  
  // Section cinematic transitions
  initSectionReveal();
  
  // Image reveals
  initImageReveal();
  
  // Staggered content
  initStaggerReveal();
  
  // Parallax layers
  initParallax();
  
  // Scroll glow effect
  initScrollGlow();
  
  // Count-up numbers
  initCountUp();
}

function initWordReveal() {
  // Find headlines with data-word-reveal attribute
  document.querySelectorAll('[data-word-reveal]').forEach((el) => {
    const text = el.textContent || '';
    const words = text.split(/\s+/).filter(Boolean);
    
    // Wrap each word in span
    el.innerHTML = words.map((word) => `<span class="word">${word}</span>`).join(' ');
    el.classList.add('word-reveal');
  });

  // Observe for intersection
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  document.querySelectorAll('.word-reveal').forEach((el) => observer.observe(el));
}

function initSectionReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -15% 0px', threshold: 0.05 }
  );

  document.querySelectorAll('.section-cinematic').forEach((el) => observer.observe(el));
}

function initImageReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );

  document.querySelectorAll('.image-reveal').forEach((el) => observer.observe(el));
}

function initStaggerReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
  );

  document.querySelectorAll('.stagger-cinematic').forEach((el) => observer.observe(el));
}

function initParallax() {
  const parallaxElements = document.querySelectorAll('[data-parallax-speed]');
  if (!parallaxElements.length) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    
    parallaxElements.forEach((el) => {
      const speed = parseFloat((el as HTMLElement).dataset.parallaxSpeed) || 0.2;
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const offset = (window.innerHeight / 2 - centerY) * speed;
      
      (el as HTMLElement).style.transform = `translateY(${offset}px)`;
    });
    
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}

function initScrollGlow() {
  // Create glow element
  const glow = document.createElement('div');
  glow.className = 'scroll-glow';
  document.body.appendChild(glow);

  let mouseX = 50, mouseY = 50;
  let scrollProgress = 0;

  function updateGlow() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
    
    // Update glow position based on scroll
    glow.style.setProperty('--glow-x', `${mouseX}%`);
    glow.style.setProperty('--glow-y', `${scrollProgress * 100}%`);
    
    // Show glow when scrolling
    glow.classList.toggle('active', scrollProgress > 0.01 && scrollProgress < 0.99);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 100;
    mouseY = (e.clientY / window.innerHeight) * 100;
  }, { passive: true });

  window.addEventListener('scroll', () => requestAnimationFrame(updateGlow), { passive: true });
  updateGlow();
}

function initCountUp() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.count || '0', 10);
          animateCount(el, target);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
}

function animateCount(el: HTMLElement, target: number) {
  const duration = 2000;
  const start = performance.now();
  const startVal = 0;

  function update(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startVal + (target - startVal) * eased);
    
    el.textContent = current.toLocaleString('id-ID');
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
