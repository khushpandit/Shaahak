import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  animate?: boolean;
}

export function ProgressCircle({
  value,
  max,
  size = 120,
  strokeWidth = 12,
  color = "hsl(var(--primary))",
  label,
  className,
  labelClassName,
  animate = true,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(0, value), max);
  const percentage = (progress / max) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg
        className="progress-circle"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : strokeDashoffset}
          className={animate ? "transition-all duration-1000 ease-out" : ""}
          style={animate ? { strokeDashoffset } : {}}
        />
      </svg>
      <div className={cn("absolute inset-0 flex items-center justify-center", labelClassName)}>
        {label}
      </div>
    </div>
  );
}
