import React, { useEffect, useState, useRef } from 'react';
import { useInView, animate, useReducedMotion } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 1.6 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [displayValue, setDisplayValue] = useState('0');
  const shouldReduceMotion = useReducedMotion();
  
  // Extract number and suffix (e.g. 5000+ -> 5000 and +)
  const match = String(value).match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : '';

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(target + suffix);
      return;
    }
    if (isInView && target > 0) {
      const controls = animate(0, target, {
        duration: duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest) + suffix);
        }
      });
      return () => controls.stop();
    } else {
      setDisplayValue('0' + suffix);
    }
  }, [isInView, target, duration, suffix, shouldReduceMotion]);

  return <span ref={ref}>{displayValue}</span>;
}

