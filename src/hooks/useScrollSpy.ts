import { useState, useEffect, useRef } from 'react';

export interface SectionConfig {
  id: string;
  category: string;
}

export function useScrollSpy(
  sections: SectionConfig[],
  offset: number = 140
) {
  const [activeCategory, setActiveCategory] = useState<string>(sections[0]?.category || 'HOME');
  const isProgrammaticScroll = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Skip updates during programmatic scroll animation to avoid jitter
      if (isProgrammaticScroll.current) return;

      const scrollY = window.scrollY;

      // At top of page
      if (scrollY < 120) {
        if (sections[0] && activeCategory !== sections[0].category) {
          setActiveCategory(sections[0].category);
        }
        return;
      }

      // Check sections from bottom to top
      for (let i = sections.length - 1; i >= 0; i--) {
        const { id, category } = sections[i];
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If section top is near/above offset and bottom is still visible
          if (rect.top <= offset && rect.bottom > 80) {
            setActiveCategory(category);
            break;
          }
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [sections, offset]);

  // Smooth scroll trigger function
  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    isProgrammaticScroll.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (category === 'HOME') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const matched = sections.find(s => s.category === category);
      if (matched) {
        const el = document.getElementById(matched.id);
        if (el) {
          const headerOffset = 90; // account for sticky navbar height
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }
    }

    // Reset flag after smooth scroll animation ends (~800ms)
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 800);
  };

  return {
    activeCategory,
    setActiveCategory,
    scrollToCategory
  };
}
