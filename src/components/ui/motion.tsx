'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimationProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
}

export function SlideUp({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1.0] 
      }}
    >
      {children}
    </motion.div>
  );
}

export function SlideDown({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1.0] 
      }}
    >
      {children}
    </motion.div>
  );
}

export function SlideRight({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1.0] 
      }}
    >
      {children}
    </motion.div>
  );
}

export function SlideLeft({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1.0] 
      }}
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1.0] 
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.5 
}: AnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1.0] 
      }}
    >
      {children}
    </motion.div>
  );
} 