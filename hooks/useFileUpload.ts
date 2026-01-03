import { useState } from "react";
import { uploadFile, deleteFile, BucketName, UploadResult } from "@/lib/supabase/storage";

interface UseFileUploadOptions {
  bucket: BucketName;
  folder?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const { bucket, folder, maxSizeMB = 10, allowedTypes, onSuccess, onError } = options;

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Validate file size
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        const errorMsg = `File size must be less than ${maxSizeMB}MB`;
        setError(errorMsg);
        onError?.(errorMsg);
        setUploading(false);
        return { success: false, error: errorMsg };
      }

      // Validate file type
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        const errorMsg = `File type not allowed. Allowed: ${allowedTypes.join(", ")}`;
        setError(errorMsg);
        onError?.(errorMsg);
        setUploading(false);
        return { success: false, error: errorMsg };
      }

      // Simulate progress (since Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload file
      const result = await uploadFile({
        bucket,
        file,
        folder,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadedFiles((prev) => [...prev, result]);
        onSuccess?.(result);
      } else {
        setError(result.error || "Upload failed");
        onError?.(result.error || "Upload failed");
      }

      setUploading(false);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Upload failed";
      setError(errorMsg);
      onError?.(errorMsg);
      setUploading(false);
      return { success: false, error: errorMsg };
    }
  };

  const remove = async (path: string) => {
    try {
      const result = await deleteFile(bucket, path);
      if (result.success) {
        setUploadedFiles((prev) => prev.filter((f) => f.path !== path));
      }
      return result;
    } catch (err: any) {
      const errorMsg = err.message || "Delete failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const reset = () => {
    setUploadedFiles([]);
    setError(null);
    setUploadProgress(0);
  };

  return {
    upload,
    remove,
    reset,
    uploading,
    uploadProgress,
    uploadedFiles,
    error,
  };
}
