import React, { useState, useEffect, useRef } from 'react';


export default function PerspectiveGrid({
  ringCount = 12,          // Number of depth sections
  rayCountX = 18,          // Horizontal ray density
  rayCountY = 8,           // Vertical ray density
  depthExponent = 1.6,     // Smooth depth spacing
  minScale = 0.25,         // Depth limit of the back wall
  hoverEffect = true,      // Interactive mouse parallax
  parallaxIntensity = 45,  // Responsive displacement range
}) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [targetMousePos, setTargetMousePos] = useState({ x: 0.5, y: 0.5 });

  // Smooth easing interpolator (Lerp)
  useEffect(() => {
    if (!hoverEffect) return;

    let animationFrameId;
    const updatePosition = () => {
      setMousePos((prev) => {
        const dx = targetMousePos.x - prev.x;
        const dy = targetMousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.06, // Soft easing speed
          y: prev.y + dy * 0.06,
        };
      });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetMousePos, hoverEffect]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !hoverEffect) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTargetMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setTargetMousePos({ x: 0.5, y: 0.5 });
  };

  // Vanishing point coordinates (center +/- parallax shift)
  const cx = 500 + (mousePos.x - 0.5) * parallaxIntensity;
  const cy = 480 + (mousePos.y - 0.5) * parallaxIntensity;

  // 1. Calculate rectangular rings (walls/depth outline)
  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    const t = i / (ringCount - 1);
    const scale = minScale + (1 - minScale) * Math.pow(t, depthExponent);

    const topLeft = [cx * (1 - scale), cy * (1 - scale)];
    const topRight = [cx + (1000 - cx) * scale, cy * (1 - scale)];
    const bottomRight = [cx + (1000 - cx) * scale, cy + (1000 - cy) * scale];
    const bottomLeft = [cx * (1 - scale), cy + (1000 - cy) * scale];

    rings.push({
      points: `${topLeft[0]},${topLeft[1]} ${topRight[0]},${topRight[1]} ${bottomRight[0]},${bottomRight[1]} ${bottomLeft[0]},${bottomLeft[1]}`,
      opacity: 0.03 + 0.14 * Math.pow(t, 2), // Ring lines grow slightly brighter near foreground
    });
  }

  const backWallPoints = rings[0]?.points;

  // 2. Rays projection + inner grid lines
  const rays = [];
  const backWallGridLines = [];

  // Ceiling and floor grid rays
  for (let i = 0; i <= rayCountX; i++) {
    const t = i / rayCountX;
    const xOuter = t * 1000;

    // Points on the back wall boundary
    const xInner = cx + (xOuter - cx) * minScale;
    const yCeilingInner = cy * (1 - minScale);
    const yFloorInner = cy + (1000 - cy) * minScale;

    // Ceiling ray
    rays.push({ x1: xOuter, y1: 0, x2: xInner, y2: yCeilingInner, key: `ray-top-${i}`, isOrange: i % 3 === 0 });
    // Floor ray
    rays.push({ x1: xOuter, y1: 1000, x2: xInner, y2: yFloorInner, key: `ray-bottom-${i}`, isOrange: i % 3 === 0 });

    // Vertical lines on the back wall
    backWallGridLines.push({
      x1: xInner,
      y1: yCeilingInner,
      x2: xInner,
      y2: yFloorInner,
      key: `back-vert-${i}`,
      isOrange: i % 3 === 0
    });
  }

  // Lateral wall grid rays
  for (let i = 1; i < rayCountY; i++) {
    const t = i / rayCountY;
    const yOuter = t * 1000;

    const xLeftInner = cx * (1 - minScale);
    const xRightInner = cx + (1000 - cx) * minScale;
    const yInner = cy + (yOuter - cy) * minScale;

    // Left wall ray
    rays.push({ x1: 0, y1: yOuter, x2: xLeftInner, y2: yInner, key: `ray-left-${i}`, isOrange: i % 2 === 0 });
    // Right wall ray
    rays.push({ x1: 1000, y1: yOuter, x2: xRightInner, y2: yInner, key: `ray-right-${i}`, isOrange: i % 2 === 0 });

    // Horizontal lines on the back wall
    backWallGridLines.push({
      x1: xLeftInner,
      y1: yInner,
      x2: xRightInner,
      y2: yInner,
      key: `back-horiz-${i}`,
      isOrange: i % 2 === 0
    });
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="absolute inset-0 overflow-hidden bg-transparent select-none pointer-events-auto"
    >
      <svg
        className="w-full h-full opacity-70"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          {/* Neon Fieri Blue gradient */}
          <linearGradient id="neon-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1B6FD8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1B6FD8" stopOpacity="0.04" />
          </linearGradient>

          {/* Neon Fieri Burnt Orange gradient */}
          <linearGradient id="neon-orange" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5821F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F5821F" stopOpacity="0.04" />
          </linearGradient>

          {/* Depth glow centered at vanishing point */}
          <radialGradient id="depth-glow" cx={`${cx / 10}%`} cy={`${cy / 10}%`} r="35%">
            <stop offset="0%" stopColor="#1B6FD8" stopOpacity="0.12" />
            <stop offset="45%" stopColor="#F5821F" stopOpacity="0.04" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Vanishing Depth Glow */}
        <rect x="0" y="0" width="1000" height="1000" fill="url(#depth-glow)" />

        {/* 2. Solid/Translucent back wall plate */}
        {backWallPoints && (
          <polygon
            points={backWallPoints}
            fill="#0D1120" // Blends with `--bg-secondary`
            stroke="rgba(27, 111, 216, 0.2)"
            strokeWidth="1.2"
            className="transition-colors duration-500"
          />
        )}

        {/* 3. Back wall mesh lines */}
        <g strokeWidth="1" fill="none">
          {backWallGridLines.map((line) => (
            <line
              key={line.key}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.isOrange ? "rgba(245, 130, 31, 0.16)" : "rgba(27, 111, 216, 0.14)"}
            />
          ))}
        </g>

        {/* 4. Depth projection ray lines */}
        <g strokeWidth="1.1" fill="none">
          {rays.map((ray) => (
            <line
              key={ray.key}
              x1={ray.x1}
              y1={ray.y1}
              x2={ray.x2}
              y2={ray.y2}
              stroke={ray.isOrange ? "url(#neon-orange)" : "url(#neon-blue)"}
            />
          ))}
        </g>

        {/* 5. Concentric room section rings */}
        <g strokeWidth="1.1" fill="none">
          {rings.map((ring, index) => (
            index > 0 && (
              <polygon
                key={`ring-${index}`}
                points={ring.points}
                stroke={`rgba(27, 111, 216, ${ring.opacity})`}
              />
            )
          ))}
        </g>
      </svg>

      {/* Vignette mask that softly blends the grid at the top and bottom of the footer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, #0D1120 0%, transparent 22%, transparent 78%, #0D1120 100%)`
        }}
      />
    </div>
  );
}