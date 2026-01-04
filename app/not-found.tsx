import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
        <Search className="w-8 h-8 text-slate-400" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-300 mb-4">Page Not Found</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-white/90 rounded-xl font-semibold transition-all hover:scale-105"
      >
        <Home className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  )
}
