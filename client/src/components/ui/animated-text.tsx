import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  variant?: 'gradient' | 'typewriter' | 'fadeIn' | 'revealUp';
  delay?: number;
  duration?: number;
  gradient?: [string, string];
}

export function AnimatedText({
  text,
  className,
  variant = 'gradient',
  delay = 0,
  duration = 0.5,
  gradient = ['#6e47d4', '#f45d96'],
}: AnimatedTextProps) {
  const letterRef = useRef<HTMLSpanElement>(null);

  if (variant === 'typewriter') {
    return (
      <span className={cn('inline-block', className)}>
        <motion.span
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ 
            duration: duration * text.length * 0.1, 
            delay, 
            ease: 'linear'
          }}
          className="inline-block whitespace-nowrap overflow-hidden"
        >
          {text}
        </motion.span>
      </span>
    );
  }

  if (variant === 'fadeIn') {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration, delay }}
        className={className}
      >
        {text}
      </motion.span>
    );
  }

  if (variant === 'revealUp') {
    return (
      <span className={cn('inline-block overflow-hidden', className)}>
        <motion.span
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ duration, delay, ease: 'easeOut' }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </span>
    );
  }

  // Default gradient animation
  return (
    <span 
      className={cn(
        'inline-block bg-gradient-to-r bg-clip-text text-transparent', 
        className
      )}
      style={{ 
        backgroundImage: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})` 
      }}
    >
      {text}
    </span>
  );
}
