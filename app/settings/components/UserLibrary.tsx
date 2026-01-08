"use client";

import { useState, useEffect } from "react";
import { 
  Image as ImageIcon, 
  Trash2, 
  ExternalLink, 
  Download, 
  Loader2,
  Database,
  Search,
  Grid,
  List as ListIcon,
  StickyNote
} from "lucide-react";
import { listAllSessions, deleteSession } from "@/lib/session-client";
import type { Session } from "@/lib/session-service";
import { toast } from "sonner";

export default function UserLibrary() {
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const loadLibrary = async () => {
    try {
      setLoading(true);
      // Fetch more items for the library
      const data = await listAllSessions(100);
      // Include saved images, transformations, articles, and notes
      const libraryItems = data.filter(s => 
        s.session_type === 'saved_image' || 
        s.session_type === 'transformation' ||
        s.session_type === 'article' ||
        s.session_type === 'note'
      );
      setItems(libraryItems);
    } catch (err) {
      console.error("Failed to load library:", err);
      toast.error("Failed to load library items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this item from your library?")) return;
    
    try {
      await deleteSession(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to delete item");
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === "all" || 
      (filter === "images" && item.session_type === "saved_image") ||
      (filter === "notes" && item.session_type === "note") ||
      (filter === "text" && (item.session_type === "article" || item.session_type === "transformation"));
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.app_name.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-white/50 mb-4" />
        <p className="text-slate-500 text-sm">Accessing Memory Core...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Library Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/5 w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
            {[
              { id: 'all', label: 'All' },
              { id: 'images', label: 'Images' },
              { id: 'notes', label: 'Notes' },
              { id: 'text', label: 'Text' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                  filter === tab.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? 'bg-white/10 text-white' : 'text-slate-500'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? 'bg-white/10 text-white' : 'text-slate-500'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
          <Database className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Library Empty</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">
            Save generations from your apps to see them appear here in your permanent collection.
          </p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className={`group relative bg-white/5 border border-white/5 hover:border-white/20 rounded-xl overflow-hidden transition-all ${
                viewMode === "list" ? "flex items-center p-3 gap-4" : "flex flex-col"
              }`}
            >
              {/* Preview Area */}
              <div className={`${viewMode === "list" ? "w-16 h-16" : "aspect-video"} bg-black/40 relative flex-shrink-0`}>
                {item.session_type === 'saved_image' ? (
                  <img src={item.data.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    {item.session_type === 'note' ? <StickyNote className="w-8 h-8 text-amber-500/50" /> : <ImageIcon className="w-8 h-8" />}
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md text-[8px] font-black uppercase text-white tracking-widest">
                  {item.app_name.replace('-', ' ')}
                </div>
              </div>

              {/* Content Area */}
              <div className={`p-4 flex-1 min-w-0 ${viewMode === "list" ? "p-0" : ""}`}>
                <h4 className="text-xs font-bold text-white mb-1 truncate">{item.title}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-1 mb-3">
                  {new Date(item.created_at).toLocaleDateString()} • {item.session_type.replace('_', ' ')}
                </p>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (item.session_type === 'note') {
                        // For notes, maybe we show them in a modal or just log for now
                        alert(item.data.content);
                      } else {
                        window.open(item.data.url || item.data.audioUrl, '_blank');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all"
                  >
                    <ExternalLink className="w-3 h-3" /> {item.session_type === 'note' ? 'VIEW' : 'OPEN'}
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
