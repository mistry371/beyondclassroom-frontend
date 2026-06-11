import React from 'react'
import { twMerge } from 'tailwind-merge'

const variantStyles = {
  primary: 'bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-lg shadow-primary/20 hover:shadow-primary/40',
  secondary: 'bg-white text-navy border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm',
  outline: 'bg-transparent text-primary border-primary/50 hover:bg-primary/10 hover:border-primary',
  ghost: 'bg-transparent text-gray-500 border-transparent hover:text-navy hover:bg-gray-100',
  danger: 'bg-red-500/10 text-red-500 border-red-500/50 hover:bg-red-500/20'
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
  icon: 'p-2'
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false,
  disabled = false,
  type = 'button',
  ...props 
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={twMerge(
        'inline-flex items-center justify-center gap-2 font-bold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  )
}
