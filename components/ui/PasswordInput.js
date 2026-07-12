'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Password input with a show/hide toggle (#8). Drop-in replacement for a
 * password <input>. Pass any input props (value, onChange, placeholder, etc.).
 */
export default function PasswordInput({ className = '', wrapperClassName = '', ...props }) {
  const [show, setShow] = useState(false)
  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}
