import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  decimals?: number;
  delay?: number;
  start?: number;
  suffix?: string;
  prefix?: string;
}

export const useCountUp = ({
  end,
  duration = 2000,
  decimals = 0,
  delay = 0,
  start = 0,
  suffix = '',
  prefix = '',
}: UseCountUpOptions) => {
  const [count, setCount] = useState(start);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Create Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of element is visible
        rootMargin: '0px',
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const timer = setTimeout(() => {
      const startTime = Date.now();
      const startValue = start;
      const endValue = end;
      const diff = endValue - startValue;

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);

        // Easing function for smooth animation (easeOutExpo)
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        const currentCount = startValue + diff * easeOutExpo;
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(endValue);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [hasStarted, start, end, duration, delay]);

  const formattedCount = decimals > 0 ? count.toFixed(decimals) : Math.round(count);
  const value = `${prefix}${formattedCount}${suffix}`;

  // Return both old API (count, elementRef) and new API (value, ref) for compatibility
  return {
    count: formattedCount,
    elementRef: ref,
    value,
    ref
  };
};

// Helper hook for counting up text values (like "10,000+", "95%", etc.)
export const useCountUpText = (
  targetText: string,
  duration = 2000,
  delay = 0
) => {
  const numberMatch = targetText.match(/[\d,]+/);
  const prefix = targetText.match(/^[^\d]*/)?.[0] || '';
  const suffix = targetText.match(/[^\d]*$/)?.[0] || '';

  const numericValue = parseInt(numberMatch?.[0]?.replace(/,/g, '') || '0');

  const { count, elementRef, value, ref } = useCountUp({
    end: numericValue,
    duration,
    delay,
    start: 0,
    prefix,
    suffix,
  });

  // Format with comma separators if original had them
  const formatWithCommas = (num: string | number) => {
    const numStr = num.toString();
    return numberMatch?.[0]?.includes(',')
      ? numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : numStr;
  };

  const formattedText = `${prefix}${formatWithCommas(count)}${suffix}`;

  return {
    text: formattedText,
    elementRef,
    value: formattedText,
    ref
  };
};
