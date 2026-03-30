import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

interface CountUpNumberProps {
  end: number;
  duration?: number;
  start?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  separator?: string;
  className?: string;
  children?: (value: string) => React.ReactNode;
}

/**
 * CountUpNumber component - Animates numbers counting up when scrolled into view
 * Uses Intersection Observer to trigger animation on viewport entry
 *
 * @example
 * <CountUpNumber end={10000} suffix="+" />
 * <CountUpNumber end={95} suffix="%" duration={1500} />
 * <CountUpNumber end={1234567} separator="," />
 */
const CountUpNumber: React.FC<CountUpNumberProps> = ({
  end,
  duration = 2000,
  start = 0,
  decimals = 0,
  suffix = '',
  prefix = '',
  separator = ',',
  className = '',
  children
}) => {
  const { ref, displayValue } = useCountUp({
    end,
    duration,
    start,
    decimals,
    suffix,
    prefix,
    separator
  });

  return (
    <div ref={ref} className={className}>
      {children ? children(displayValue) : displayValue}
    </div>
  );
};

export default CountUpNumber;
