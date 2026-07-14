// Scroll-driven decorative motion for the BSM homepage, powered by GSAP +
// ScrollTrigger. CONTENT VISIBILITY IS OWNED ELSEWHERE: section reveals
// (.reveal / .stagger / .gallery-reveal / .flow-core) are handled by an
// IntersectionObserver + CSS in the page, which can never trap content
// invisible. This script only adds flourishes that do NOT hide anything:
// the one-stop hub ring rotation and a subtle hero parallax. If GSAP fails to
// load, the page is fully visible and just a touch less animated.
// prefers-reduced-motion: we bail out entirely and leave content as-is.
export async function initScrollAnim(): Promise<void> {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  const { gsap } = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);

  // --- One-stop hub: the brushed-steel ring around .flow-core turns as the
  //     flow passes through view, embodying "satu sumber suplai". Pure rotation
  //     — never hides the core (visibility is owned by the IO/CSS reveal). ---
  gsap.utils.toArray<HTMLElement>('.flow-core').forEach((core) => {
    const ring = core.querySelector<HTMLElement>('.flow-ring');
    if (!ring) return;
    gsap.fromTo(
      ring,
      { rotation: -120 },
      {
        rotation: 0,
        ease: 'power2.out',
        duration: 1.4,
        scrollTrigger: { trigger: core, start: 'top 82%', once: true },
      }
    );
  });

  // --- Subtle hero parallax — media drifts slower than the page scrolls.
  //     (The hero itself is revealed by the IO, not by GSAP.) ---
  const heroMedia = document.querySelector<HTMLElement>('.hero-media');
  if (heroMedia) {
    gsap.to(heroMedia, {
      yPercent: -6,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
}
