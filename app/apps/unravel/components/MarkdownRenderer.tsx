"use client";

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Split by newlines to handle basic block structures
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentKey = 0;
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(<ul key={`list-${currentKey++}`} className="list-disc pl-6 mb-6 space-y-2 text-ink-800 marker:text-black">{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  const parseInline = (text: string) => {
    // Basic bold parsing: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-black bg-paper-200 px-1 rounded-sm">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={index} className="text-3xl font-serif font-black text-black mt-10 mb-6 border-b-4 border-black pb-3 uppercase tracking-tight">{trimmed.slice(2)}</h1>);
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={index} className="text-2xl font-serif font-bold text-black mt-8 mb-4 border-l-4 border-vintageRed pl-3">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={index} className="text-xl font-serif font-bold text-ink-800 mt-6 mb-3">{trimmed.slice(4)}</h3>);
    } 
    // Blockquote
    else if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={index} className="border-l-4 border-black pl-6 italic text-ink-700 my-8 bg-paper-100 py-4 pr-4 font-serif text-lg shadow-hard-sm">
          "{parseInline(trimmed.slice(2))}"
        </blockquote>
      );
    }
    // List Items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(<li key={`li-${index}`} className="pl-2">{parseInline(trimmed.slice(2))}</li>);
    }
    // Empty lines
    else if (trimmed === '') {
      flushList();
    }
    // Paragraphs
    else {
      flushList();
      elements.push(<p key={index} className="mb-6 text-lg leading-loose text-ink-800 font-mono">{parseInline(trimmed)}</p>);
    }
  });

  flushList(); // Final flush

  return <div>{elements}</div>;
};

export default MarkdownRenderer;
