export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">TutorMatch</span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
        {children}
      </div>
    </div>
  )
}
