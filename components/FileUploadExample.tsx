"use client";

import { useFileUpload } from "@/hooks/useFileUpload";
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

/**
 * Example File Upload Component
 * Shows how to use the useFileUpload hook for images
 */
export default function FileUploadExample() {
  const {
    upload,
    remove,
    uploading,
    uploadProgress,
    uploadedFiles,
    error,
  } = useFileUpload({
    bucket: "user-images",
    folder: "uploads",
    maxSizeMB: 10,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    onSuccess: (result) => {
      console.log("Upload successful:", result);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await upload(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6" />
        File Upload Example
      </h2>

      {/* Upload Input */}
      <div className="mb-6">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <ImageIcon className="w-12 h-12 text-slate-400 mb-4" />
            <p className="mb-2 text-sm text-slate-300">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 10MB</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Uploading...</span>
            <span className="text-sm text-slate-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">File uploaded</p>
                    <p className="text-xs text-slate-500 font-mono truncate max-w-xs">
                      {file.path}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => file.path && remove(file.path)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
