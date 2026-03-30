import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number; // milliseconds
  start?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  separator?: string;
  useCommas?: boolean; // Format with thousands separator
}

export const useCountUp = (options: UseCountUpOptions) => {
  const {
    end,
    duration = 2000,
    start = 0,
    decimals = 0,
    suffix = '',
    prefix = '',
    separator = ',',
    useCommas = false
  } = options;
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
            hasAnimated.current = true;
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of element is visible
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endTime = startTime + duration;
    const range = end - start;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + range * easeOut;

      setCount(currentValue);

      if (now < endTime) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, start, end, duration]);

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const shouldAddSeparator = useCommas || separator;
    if (shouldAddSeparator) {
      const [whole, decimal] = fixed.split('.');
      const withSeparator = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
      return decimal ? `${withSeparator}.${decimal}` : withSeparator;
    }
    return fixed;
  };

  const displayValue = typeof end === 'number'
    ? `${prefix}${formatNumber(count)}${suffix}`
    : end; // If end is not a number (like "5h"), return as-is

  return { displayValue, ref: elementRef };
};
