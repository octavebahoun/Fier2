import os

filepath = '/home/precieux/excellence team/essaie/Fieri/src/pages/Home.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports to include useEffect
content = content.replace(
    "import React, { useState, useRef } from 'react';",
    "import React, { useState, useRef, useEffect } from 'react';"
)

# 2. Add the AnimatedCounter component
animated_counter_code = """// Smoothly animated count-up numbers triggered when visible
function AnimatedCounter({ value, duration = 1.8 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [count, setCount] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    const numericMatch = String(value).match(/^(\\d+)(.*)$/);
    if (!numericMatch) {
      setCount(value);
      return;
    }

    const target = parseInt(numericMatch[1], 10);
    const suffix = numericMatch[2] || '';
    let start = 0;
    
    if (start === target) {
      setCount(value);
      return;
    }

    const totalFrames = Math.max(30, Math.floor(60 * duration));
    let frame = 0;

    const counterInterval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // easeOutQuad easing
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * (target - start) + start);

      setCount(`${current}${suffix}`);

      if (frame >= totalFrames) {
        setCount(value);
        clearInterval(counterInterval);
      }
    }, 1000 / 60);

    return () => clearInterval(counterInterval);
  }, [value, isInView, duration]);

  return <span ref={ref}>{count}</span>;
}
"""

content = content.replace(
    "// Reusable Scroll Reveal component leveraging Framer Motion",
    animated_counter_code + "\n// Reusable Scroll Reveal component leveraging Framer Motion"
)

# 3. Update Section 4 stats items block
old_stats_block = """            {stats.items.map((stat, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.05} direction="up">
                <div className="text-center p-4">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-primary mb-2 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-text-secondary uppercase tracking-widest font-semibold">
                    {stat.label}
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}"""

new_stats_block = """            {stats.items.map((stat, index) => (
              <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
                <div className="text-center p-6 rounded-2xl bg-bg-secondary/20 hover:bg-bg-secondary/50 border border-transparent hover:border-accent-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-secondary mb-2 tracking-tight transition-colors duration-300 group-hover:text-[#FFB800] drop-shadow-[0_0_15px_rgba(245,166,35,0.06)]">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-xs sm:text-sm text-text-secondary uppercase tracking-widest font-semibold transition-colors duration-300 group-hover:text-text-primary">
                    {stat.label}
                  </div>
                </div>
              </FadeInWhenVisible>
            ))}"""

if old_stats_block in content:
    content = content.replace(old_stats_block, new_stats_block)
else:
    import re
    # Fallback to replace the mapping block inside Section 4
    print("Warning: Direct stats replace failed, using regex fallback.")
    pattern = r'\{stats\.items\.map.*?\}\s*\}\s*\)\s*\)\}'
    content = re.sub(r'\{stats\.items\.map\(.*?\}\s*\}\s*\)\s*\)\}', new_stats_block, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Stats animation inject successfully completed!")
