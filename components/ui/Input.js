import React, { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  containerClassName = '',
  type = 'text',
  theme = 'dark',
  icon: Icon,
  ...props 
}, ref) => {
  const baseInputClasses = 'w-full px-4 py-3 rounded-xl focus:outline-none transition-all duration-200 shadow-sm'
  
  const themeClasses = theme === 'dark' 
    ? 'bg-dark-200/50 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-primary'
    : 'bg-white border border-gray-200 text-navy placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent'

  const errorClasses = error 
    ? (theme === 'dark' ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-red-500 focus:ring-red-500 focus:border-red-500') 
    : ''
    
  const iconPadding = Icon ? 'pl-11' : ''

  return (
    <div className={twMerge('w-full', containerClassName)}>
      {label && (
        <label className={twMerge('block text-sm font-semibold mb-2', theme === 'dark' ? 'text-gray-300' : 'text-ink')}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            className={twMerge(baseInputClasses, themeClasses, errorClasses, iconPadding, className)}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            ref={ref}
            className={twMerge(baseInputClasses, themeClasses, errorClasses, iconPadding, 'appearance-none cursor-pointer', className)}
            {...props}
          >
            {props.children}
          </select>
        ) : (
          <input
            type={type}
            ref={ref}
            className={twMerge(baseInputClasses, themeClasses, errorClasses, iconPadding, className)}
            {...props}
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">⚠ {error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
