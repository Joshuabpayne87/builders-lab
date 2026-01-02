"use client";

import React from 'react';
import { X, Trash2, Calendar, FileText, Share2, ChevronRight } from 'lucide-react';
import { SavedItem, OutputFormat } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedItem[];
  onLoad: (item: SavedItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, items, onLoad, onDelete }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-ink-900/20 backdrop-grayscale transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-paper border-l-4 border-black shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b-2 border-black flex items-center justify-between bg-white">
            <h2 className="text-xl font-serif font-black text-ink-900 uppercase tracking-wide">Archives</h2>
            <button 
              onClick={onClose}
              className="p-2 border-2 border-transparent hover:border-black hover:bg-paper-200 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-black" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-ink-400 p-8 text-center opacity-60">
                <div className="w-20 h-20 bg-white border-2 border-dashed border-ink-300 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-ink-300" />
                </div>
                <p className="font-bold text-ink-900 mb-1 font-serif text-lg">Empty Shelf</p>
                <p className="text-sm font-mono">Unraveled stories will be collected here.</p>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => onLoad(item)}
                  className="group relative bg-white border-2 border-black rounded-lg p-4 hover:shadow-hard-sm transition-all cursor-pointer active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded border border-black text-[10px] font-bold uppercase tracking-wider ${
                      item.format === OutputFormat.BLOG 
                        ? 'bg-paper-200 text-black' 
                        : 'bg-black text-white'
                    }`}>
                      {item.format === OutputFormat.BLOG ? <FileText className="w-3 h-3 mr-1" /> : <Share2 className="w-3 h-3 mr-1" />}
                      {item.format === OutputFormat.BLOG ? 'Blog' : 'Social'}
                    </span>
                    <span className="text-xs font-mono text-ink-400 font-bold">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="font-serif font-bold text-lg text-ink-900 leading-tight mb-2 line-clamp-2 group-hover:underline decoration-2 underline-offset-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs text-ink-600 line-clamp-2 mb-4 font-mono leading-relaxed border-l-2 border-paper-400 pl-2">
                    {item.summary}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-3 border-t-2 border-black/5">
                     <span className="text-xs font-black text-vintageRed uppercase flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Now <ChevronRight className="w-3 h-3 ml-0.5" />
                     </span>
                     <button 
                        onClick={(e) => onDelete(item.id, e)}
                        className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-500 rounded transition-colors"
                        title="Delete"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
