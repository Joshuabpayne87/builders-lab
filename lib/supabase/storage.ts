import { createClient } from "./client";

export type BucketName = 'user-images' | 'user-videos' | 'user-documents' | 'user-avatars';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Uploads a base64 image to Supabase storage.
 */
export async function uploadBase64Image({
  base64,
  fileName,
  bucket = 'user-images'
}: {
  base64: string;
  fileName: string;
  bucket?: BucketName;
}): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Remove the prefix (e.g., "data:image/png;base64,") if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    // Convert base64 to Blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    // Define the path: userId/timestamp-fileName
    const filePath = `${user.id}/${Date.now()}-${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { success: true, url: data.publicUrl, path: filePath };
  } catch (error: any) {
    console.error("Storage upload error:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
}

/**
 * Uploads a file to Supabase storage.
 */
export async function uploadFile({
  file,
  bucket,
  folder,
  path: customPath
}: {
  file: File;
  bucket: BucketName;
  folder?: string;
  path?: string;
}): Promise<UploadResult> {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    let filePath: string;
    if (customPath) {
      filePath = customPath;
    } else if (folder) {
      filePath = `${user.id}/${folder}/${fileName}`;
    } else {
      filePath = `${user.id}/${fileName}`;
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { success: true, url: data.publicUrl, path: filePath };
  } catch (error: any) {
    console.error("File upload error:", error);
    return { success: false, error: error.message || "Upload failed" };
  }
}

/**
 * Deletes a file from Supabase storage.
 */
export async function deleteFile(
  bucket: BucketName,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("File deletion error:", error);
    return { success: false, error: error.message || "Deletion failed" };
  }
}