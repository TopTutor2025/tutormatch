'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
          {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
          <input
            ref={ref}
            className={`w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm bg-white placeholder-gray-400 outline-none transition-all
              focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10
              disabled:bg-gray-50 disabled:text-gray-400
              ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}
              ${icon ? 'pl-10' : ''}
              ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input
