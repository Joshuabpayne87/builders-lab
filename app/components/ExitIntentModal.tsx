'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateSessionSummary } from '@/app/assistant/actions'
import { toast } from 'sonner'
import { 
  LogOut, 
  BrainCircuit, 
  X, 
  ArrowRight, 
  Loader2, 
  CheckCircle2 
} from 'lucide-react'

export function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Show only once per session
    const hasSeen = sessionStorage.getItem('exit_modal_seen')
    if (hasSeen) return

    const handleMouseLeave = (e: MouseEvent) => {
      // If mouse leaves the top of the window (likely to close tab)
      if (e.clientY <= 0) {
        setIsVisible(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('exit_modal_seen', 'true')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateSessionSummary()
      if (result.success && result.summary) {
        setSummary(result.summary)
        setIsComplete(true)
        toast.success("Memory Synchronized")
      } else {
        toast.error(result.error || "Nothing to summarize yet")
        handleClose()
      }
    } catch (e) {
      toast.error("Failed to generate summary")
      handleClose()
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-purple-500/10">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Session Sync</h3>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Agent Knowledge Base</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {!isComplete ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">Before you go...</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Want a quick AI summary of today's work? I'll analyze everything you've built so you can pick up exactly where you left off next time.
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      SYNCHRONIZING MEMORY...
                    </>
                  ) : (
                    <>
                      YES, SUMMARIZE SESSION
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-semibold hover:bg-white/10 transition-all"
                >
                  NO THANKS, I'M DONE
                </button>
              </div>
            </>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-green-400 mb-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm uppercase tracking-widest">Memory Stored Successfully</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {summary}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                GOT IT, SEE YOU LATER
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
