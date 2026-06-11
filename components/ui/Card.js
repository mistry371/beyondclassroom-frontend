import React from 'react'
import { twMerge } from 'tailwind-merge'
import { motion } from 'framer-motion'

export default function Card({ 
  children, 
  className = '', 
  animated = false,
  delay = 0,
  hover = false,
  ...props 
}) {
  const baseClasses = 'bg-dark-100/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl'
  const hoverClasses = hover ? 'hover:-translate-y-1 hover:shadow-primary/20 hover:border-white/20 transition-all duration-300' : ''
  
  const Component = animated ? motion.div : 'div'
  const animationProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5 }
  } : {}

  return (
    <Component 
      className={twMerge(baseClasses, hoverClasses, className)} 
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  )
}
