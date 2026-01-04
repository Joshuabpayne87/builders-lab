'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html>
      <body className="bg-black text-white flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          A critical error occurred. Please try refreshing the page or contact support if the issue persists.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-slate-200 transition-colors"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
