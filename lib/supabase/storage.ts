import { createClient } from "./client";

/**
 * Supabase Storage Helper Service
 * Handles file uploads, downloads, and deletions for user content
 */

export type BucketName = "user-images" | "user-videos" | "user-documents" | "user-avatars";

export interface UploadOptions {
  bucket: BucketName;
  file: File;
  userId?: string;
  folder?: string;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const supabase = createClient();
  const { bucket, file, userId, folder } = options;

  try {
    // Get current user if userId not provided
    let userIdToUse = userId;
    if (!userIdToUse) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }
      userIdToUse = user.id;
    }

    // Create file path: userId/folder/filename
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${timestamp}.${fileExt}`;
    const filePath = folder
      ? `${userIdToUse}/${folder}/${fileName}`
      : `${userIdToUse}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("Upload exception:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: BucketName, path: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Delete exception:", error);
    return { success: false, error: error.message || "Delete failed" };
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * List all files in a user's folder
 */
export async function listUserFiles(bucket: BucketName, userId?: string, folder?: string) {
  const supabase = createClient();

  try {
    // Get current user if userId not provided
    let userIdToUse = userId;
    if (!userIdToUse) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: "User not authenticated", files: [] };
      }
      userIdToUse = user.id;
    }

    const path = folder ? `${userIdToUse}/${folder}` : userIdToUse;

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("List error:", error);
      return { success: false, error: error.message, files: [] };
    }

    return { success: true, files: data };
  } catch (error: any) {
    console.error("List exception:", error);
    return { success: false, error: error.message || "List failed", files: [] };
  }
}

/**
 * Get signed URL for private files (valid for 1 hour)
 */
export async function getSignedUrl(bucket: BucketName, path: string, expiresIn: number = 3600) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Signed URL error:", error);
      return { success: false, error: error.message, url: null };
    }

    return { success: true, url: data.signedUrl };
  } catch (error: any) {
    console.error("Signed URL exception:", error);
    return { success: false, error: error.message || "Failed to create signed URL", url: null };
  }
}

/**
 * Download a file as a blob
 */
export async function downloadFile(bucket: BucketName, path: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      console.error("Download error:", error);
      return { success: false, error: error.message, blob: null };
    }

    return { success: true, blob: data };
  } catch (error: any) {
    console.error("Download exception:", error);
    return { success: false, error: error.message || "Download failed", blob: null };
  }
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): { valid: boolean; error?: string } {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }
  return { valid: true };
}
