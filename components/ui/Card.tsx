import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  gold?: boolean
}

export default function Card({ hover, gold, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 shadow-soft ${gold ? 'border border-gold/30' : 'border border-gray-100'} ${hover ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-card cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
