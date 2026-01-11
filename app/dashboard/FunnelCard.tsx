import Link from "next/link";
import { LayoutGrid, ArrowRight } from "lucide-react";

export function FunnelCard() {
  return (
    <Link 
      href="/apps/funnels"
      className="group block h-full bg-indigo-600/10 hover:bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl p-5 transition-all relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-all"></div>
      
      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-indigo-400" strokeWidth={1.5} />
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-white mb-1">Launch Funnels</h3>
          <p className="text-[11px] text-slate-400 leading-tight">
            Build high-converting sales architectures with ease.
          </p>
        </div>

        <div className="mt-auto pt-2">
            <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Start Building →
            </span>
        </div>
      </div>
    </Link>
  );
}
