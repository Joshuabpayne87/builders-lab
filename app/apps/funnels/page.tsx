'use client';

import FunnelChat from './components/FunnelChat';
import FunnelPreview from './components/FunnelPreview';
import { FunnelProvider } from './FunnelContext';

export default function FunnelsPage() {
  return (
    <FunnelProvider>
      <div className="flex flex-col h-[calc(100vh-4rem)] lg:flex-row bg-slate-950 overflow-hidden">
        {/* Left Panel: Chat / Manager */}
        <div className="w-full lg:w-[400px] xl:w-[450px] h-[50vh] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-800 flex-shrink-0 z-20 shadow-xl">
          <FunnelChat />
        </div>

        {/* Right Panel: Preview / Builder */}
        <div className="flex-1 h-[50vh] lg:h-full bg-slate-900 relative">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="relative h-full z-10">
            <FunnelPreview />
          </div>
        </div>
      </div>
    </FunnelProvider>
  );
}
