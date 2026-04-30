interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'pink' | 'gold' | 'green' | 'red' | 'blue' | 'gray'
  className?: string
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  pink: 'bg-pink-100 text-pink-700',
  gold: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-50 text-gray-500',
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
