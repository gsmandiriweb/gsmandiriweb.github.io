// Scroll-driven motion for the BSM homepage, powered by GSAP + ScrollTrigger.
// Safety model (unchanged from prior build):
//  - .reveal elements are VISIBLE by default (CSS fallback). GSAP sets the
//    hidden start state itself only after it has successfully loaded, so a
//    failed/blocked import can never leave content invisible.
//  - prefers-reduced-motion: we bail out entirely and leave content as-is.
//  - Reveals fire once (toggleActions none) — no re-animation on scroll-up.
export async function initScrollAnim(): Promise<void> {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const { gsap } = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);

  const reveals = gsap.utils.toArray<HTMLElement>('.reveal');
  if (reveals.length) {
    gsap.set(reveals, { autoAlpha: 0, y: 28 });
    reveals.forEach((el) => {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }

  // Staggered children for grouped plates (advantages, coverage nodes, posts).
  gsap.utils.toArray<HTMLElement>('.stagger').forEach((group) => {
    const kids = gsap.utils.toArray<HTMLElement>(group.children);
    gsap.set(kids, { autoAlpha: 0, y: 20 });
    gsap.to(kids, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 84%', once: true },
    });
  });

  // Gauge needle: sweeps as the proof / stat strip passes through view.
  const needle = document.querySelector<SVGGElement>('.gauge-needle');
  if (needle) {
    gsap.fromTo(
      needle,
      { rotation: -30, svgOrigin: '70 70' },
      {
        rotation: 70,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-stats',
          start: 'top 82%',
          end: 'bottom 35%',
          scrub: 0.6,
        },
      }
    );
  }

  // Subtle hero parallax — media drifts slower than the page scrolls.
  const heroMedia = document.querySelector<HTMLElement>('.hero-media');
  if (heroMedia) {
    gsap.to(heroMedia, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // Section gear dividers ease in with a slight turn.
  gsap.utils.toArray<HTMLElement>('.gear-divider').forEach((el) => {
    gsap.fromTo(
      el.querySelector('.steel-gear'),
      { rotation: -25, autoAlpha: 0 },
      {
        rotation: 0,
        autoAlpha: 1,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }
    );
  });

  ScrollTrigger.refresh();
}
