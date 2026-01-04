'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center bg-[#0A0A0A] rounded-xl border border-white/5 m-4">
      <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Application Error</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        We encountered an unexpected error. This has been logged and we're looking into it.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="px-6 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
