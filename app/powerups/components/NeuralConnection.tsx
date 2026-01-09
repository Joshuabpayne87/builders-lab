"use client";

interface NeuralConnectionProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function NeuralConnection({ fromX, fromY, toX, toY }: NeuralConnectionProps) {
  // Create a smooth curve path
  const controlPointOffset = 50;
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  // Create a curved path using quadratic bezier
  const path = `M ${fromX} ${fromY} Q ${midX} ${midY - controlPointOffset} ${toX} ${toY}`;

  return (
    <g>
      {/* Glow effect (background) */}
      <path
        d={path}
        fill="none"
        stroke="url(#connectionGradient)"
        strokeWidth="4"
        opacity="0.3"
        strokeLinecap="round"
        className="blur-sm"
      />

      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke="url(#connectionGradient)"
        strokeWidth="2"
        opacity="0.8"
        strokeLinecap="round"
        strokeDasharray="5,5"
        className="animate-dash"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="10"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>

      {/* Animated particle traveling along path */}
      <circle r="3" fill="#00f3ff" opacity="0.8">
        <animateMotion dur="3s" repeatCount="indefinite" path={path} />
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>

      <circle r="2" fill="#bd00ff" opacity="0.8">
        <animateMotion dur="2.5s" repeatCount="indefinite" path={path} begin="0.5s" />
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2.5s"
          repeatCount="indefinite"
          begin="0.5s"
        />
      </circle>

      <circle r="2.5" fill="#ff0055" opacity="0.8">
        <animateMotion dur="2.8s" repeatCount="indefinite" path={path} begin="1s" />
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2.8s"
          repeatCount="indefinite"
          begin="1s"
        />
      </circle>
    </g>
  );
}
