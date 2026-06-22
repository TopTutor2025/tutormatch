export const dynamic = 'force-dynamic'

import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-dark min-h-screen bg-[#060a08] flex flex-col relative overflow-hidden">
      {/* Bagliori */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[460px] h-[400px] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />

      <nav className="relative z-10 px-5 md:px-6 py-4">
        <Link href="/" className="flex items-center w-fit">
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-white">prof</span>
            <span className="text-pink-500">live</span>
            <span className="text-white">.app</span>
          </span>
        </Link>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6">
        {children}
      </div>
    </div>
  )
}
