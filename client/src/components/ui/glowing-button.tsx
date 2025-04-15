import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlowingButtonProps extends ButtonProps {
  glowColor?: string;
  hoverScale?: number;
  pulseAnimation?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function GlowingButton({
  children,
  className,
  glowColor = 'rgba(110, 71, 212, 0.6)',
  hoverScale = 1.02,
  pulseAnimation = false,
  iconLeft,
  iconRight,
  ...props
}: GlowingButtonProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale,
      }}
      animate={pulseAnimation ? {
        boxShadow: [
          `0 0 5px ${glowColor}`,
          `0 0 15px ${glowColor}`,
          `0 0 5px ${glowColor}`
        ]
      } : {}}
      transition={pulseAnimation ? {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse'
      } : {
        duration: 0.2
      }}
      className="relative rounded-lg overflow-hidden"
    >
      <Button
        className={cn(
          "btn-glow relative z-10 overflow-hidden transition-all",
          className
        )}
        {...props}
      >
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2">{iconRight}</span>}
      </Button>
      <div 
        className="absolute inset-0 -z-10 opacity-50 blur-sm"
        style={{ backgroundColor: glowColor }}
      />
    </motion.div>
  );
}
