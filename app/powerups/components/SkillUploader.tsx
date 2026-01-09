"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface SkillUploaderProps {
  onUploadComplete: () => void;
}

export default function SkillUploader({ onUploadComplete }: SkillUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const mdFile = files.find(file => file.name.endsWith('.md'));

    if (mdFile) {
      await uploadFile(mdFile);
    } else {
      alert("Please upload a .md (markdown) file");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadedFile(file);

    try {
      // Read file content
      const content = await file.text();

      // Parse skill name from filename (remove .md extension)
      const skillName = file.name.replace('.md', '').replace(/[-_]/g, ' ');

      // Send to API
      const res = await fetch('/api/powerups/upload-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          content,
          skillName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload skill');
      }

      // Success
      alert(`Skill "${data.powerup.name}" uploaded successfully!`);
      onUploadComplete();
      setUploadedFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Failed to upload skill: ${error.message}`);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 border-b border-white/10">
      <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
        Upload Skills
      </h3>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all
          ${isDragging
            ? 'border-pink-500 bg-pink-500/10'
            : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
          }
          ${isUploading ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">
                Processing skill...
              </p>
              <p className="text-xs text-slate-500">
                {uploadedFile?.name}
              </p>
            </>
          ) : uploadedFile ? (
            <>
              <FileText className="w-8 h-8 text-green-400" />
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-300 font-medium">
                  {uploadedFile.name}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-pink-400" />
              <div>
                <p className="text-sm text-slate-300 font-medium mb-1">
                  Drop your .md file here
                </p>
                <p className="text-xs text-slate-500">
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Upload markdown (.md) skill files to add them to your knowledge brain
      </p>
    </div>
  );
}
