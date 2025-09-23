
"use client";

import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) return;

    const duration = 1000;
    const startTime = performance.now();

    const animateCount = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = Math.floor(progress * end);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setCount(end); // Ensure it ends on the exact value
      }
    };

    requestAnimationFrame(animateCount);

  }, [value]);

  return <div className={className}>{count.toLocaleString()}</div>;
}
