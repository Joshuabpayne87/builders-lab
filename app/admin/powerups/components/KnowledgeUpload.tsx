"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";

interface KnowledgeContent {
  file_url?: string;
  file_type: string;
  file_size: number;
  processed_text: string;
  chunks: { text: string; index: number }[];
}

interface KnowledgeUploadProps {
  content: any;
  onChange: (content: KnowledgeContent) => void;
}

export default function KnowledgeUpload({ content, onChange }: KnowledgeUploadProps) {
  const [processedText, setProcessedText] = useState(content.processed_text || "");
  const [fileType, setFileType] = useState(content.file_type || "txt");

  // Update parent whenever text changes
  useEffect(() => {
    // Simple chunking: split by paragraphs, max ~8000 chars per chunk
    const chunks = chunkText(processedText);

    onChange({
      file_url: content.file_url || "",
      file_type: fileType,
      file_size: new Blob([processedText]).size,
      processed_text: processedText,
      chunks,
    });
  }, [processedText, fileType]);

  const chunkText = (text: string): { text: string; index: number }[] => {
    if (!text.trim()) return [];

    const maxChunkSize = 8000;
    const paragraphs = text.split(/\n\n+/);
    const chunks: { text: string; index: number }[] = [];
    let currentChunk = "";

    for (const para of paragraphs) {
      if ((currentChunk + para).length > maxChunkSize && currentChunk) {
        chunks.push({ text: currentChunk.trim(), index: chunks.length });
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + para;
      }
    }

    if (currentChunk) {
      chunks.push({ text: currentChunk.trim(), index: chunks.length });
    }

    return chunks;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, only handle text files directly
    // PDF/DOCX processing will be added with the upload API
    if (file.type === "text/plain" || file.type === "text/markdown") {
      const text = await file.text();
      setProcessedText(text);
      setFileType(file.type === "text/markdown" ? "md" : "txt");
    } else {
      alert(
        "File upload processing not yet implemented. Please paste text manually for now."
      );
    }

    // Reset file input
    e.target.value = "";
  };

  const chunks = chunkText(processedText);
  const wordCount = processedText.trim().split(/\s+/).length;
  const estimatedTokens = Math.ceil(wordCount * 1.3);

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Knowledge Source
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Upload a file or paste text content that the AI should have access to.
        </p>

        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5 hover:bg-white/10 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.md,.pdf,.docx,.doc,.json,.csv,.yaml"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 bg-pink-600/20 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-500">
                TXT, MD, PDF, DOCX, JSON, CSV, YAML (Max 10MB)
              </p>
            </div>
          </label>
        </div>

        {/* Note about processing */}
        <div className="flex items-start gap-2 mt-3 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <strong>Note:</strong> PDF and DOCX processing will be added soon. For now,
            please use text files or paste content manually below.
          </div>
        </div>
      </div>

      {/* Manual Text Input */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Text Content <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Paste or type the knowledge content. This could be brand guidelines, company
          documentation, reference materials, etc.
        </p>
        <textarea
          value={processedText}
          onChange={(e) => setProcessedText(e.target.value)}
          placeholder="Paste your knowledge content here...

Examples:
- Brand voice guidelines
- Product documentation
- Company policies
- Reference materials
- Style guides
- Technical specifications"
          rows={16}
          className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-white/20 resize-none font-mono text-sm"
          required
        />
        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
          <span>{processedText.length.toLocaleString()} characters</span>
          <span>
            ~{wordCount.toLocaleString()} words • ~{estimatedTokens.toLocaleString()}{" "}
            tokens
          </span>
        </div>
      </div>

      {/* File Type */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Content Type
        </label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
        >
          <option value="txt">Plain Text (TXT)</option>
          <option value="md">Markdown (MD)</option>
          <option value="pdf">PDF Document</option>
          <option value="docx">Word Document (DOCX)</option>
          <option value="json">JSON Data</option>
          <option value="csv">CSV Data</option>
          <option value="yaml">YAML Config</option>
        </select>
      </div>

      {/* Chunking Info */}
      {processedText && chunks.length > 0 && (
        <div className="bg-pink-600/10 border border-pink-600/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <FileText className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-pink-300 mb-2">
                Content Processing
              </h4>
              <div className="space-y-1 text-xs text-slate-300">
                <p>
                  Content will be split into <strong>{chunks.length}</strong>{" "}
                  {chunks.length === 1 ? "chunk" : "chunks"} for optimal processing.
                </p>
                {chunks.length > 1 && (
                  <ul className="mt-2 space-y-1 list-disc list-inside text-slate-400">
                    {chunks.map((chunk, i) => (
                      <li key={i}>
                        Chunk {i + 1}: {chunk.text.length.toLocaleString()} chars (~
                        {Math.ceil(chunk.text.split(/\s+/).length * 1.3)} tokens)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {processedText && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Content Preview
          </label>
          <div className="bg-black/60 border border-white/10 rounded-lg p-4 max-h-60 overflow-y-auto">
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono">
              {processedText.substring(0, 1000)}
              {processedText.length > 1000 && "..."}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
