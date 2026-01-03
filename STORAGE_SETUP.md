# Supabase Storage Setup Guide

Complete guide for setting up user file storage buckets in Builder's Lab.

## 📦 What's Included

**4 Storage Buckets:**
- `user-images` - Photos, graphics, screenshots (10MB limit)
- `user-videos` - Video uploads (100MB limit)
- `user-documents` - PDFs, docs, text files (20MB limit)
- `user-avatars` - Profile pictures (2MB limit, public)

**Features:**
- ✅ Row Level Security (RLS) - Users can only access their own files
- ✅ Admin access - Admins can view all files
- ✅ File type validation
- ✅ Size limits per bucket
- ✅ Automatic file organization by user ID
- ✅ Easy-to-use React hooks

---

## 🚀 Setup Instructions

### Step 1: Create Storage Buckets in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/storage-setup.sql`
4. Paste into the SQL Editor
5. Click **Run**

You should see:
```
✅ Storage buckets created successfully!
Buckets: user-images, user-videos, user-documents, user-avatars
RLS policies applied for user isolation
```

### Step 2: Verify Buckets Created

1. Go to **Storage** in Supabase Dashboard
2. You should see 4 buckets:
   - user-images
   - user-videos
   - user-documents
   - user-avatars

### Step 3: Test Upload (Optional)

Try uploading a file manually in the Supabase dashboard to verify the bucket works.

---

## 💻 Usage in Your Code

### Basic Upload Example

```typescript
import { uploadFile } from "@/lib/supabase/storage";

async function handleUpload(file: File) {
  const result = await uploadFile({
    bucket: "user-images",
    file: file,
    folder: "profile-photos", // Optional subfolder
  });

  if (result.success) {
    console.log("File uploaded:", result.url);
    console.log("File path:", result.path);
  } else {
    console.error("Upload failed:", result.error);
  }
}
```

### Using the React Hook

```typescript
"use client";

import { useFileUpload } from "@/hooks/useFileUpload";

export default function MyComponent() {
  const { upload, uploading, uploadedFiles, error } = useFileUpload({
    bucket: "user-images",
    folder: "uploads",
    maxSizeMB: 10,
    allowedTypes: ["image/jpeg", "image/png"],
    onSuccess: (result) => {
      console.log("Upload successful:", result.url);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await upload(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/jpeg,image/png"
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
      {uploadedFiles.map((file) => (
        <img key={file.path} src={file.url} alt="Uploaded" />
      ))}
    </div>
  );
}
```

### Full Example Component

Check out `components/FileUploadExample.tsx` for a complete upload UI with:
- Drag & drop support
- Progress indicator
- Error handling
- File list with delete
- Styled with your dark glassmorphism theme

---

## 📝 Available Functions

### Upload Functions

#### `uploadFile(options)`
Upload a file to storage.

```typescript
const result = await uploadFile({
  bucket: "user-images",
  file: fileObject,
  userId: "optional-user-id", // Auto-detected if not provided
  folder: "optional-subfolder",
});
```

**Returns:**
```typescript
{
  success: boolean;
  url?: string;        // Public URL to access the file
  path?: string;       // Storage path (for deletion)
  error?: string;
}
```

### Delete Functions

#### `deleteFile(bucket, path)`
Delete a file from storage.

```typescript
const result = await deleteFile("user-images", "userId/folder/file.jpg");
```

### List Functions

#### `listUserFiles(bucket, userId?, folder?)`
List all files in a user's folder.

```typescript
const result = await listUserFiles("user-images", undefined, "uploads");
// Returns: { success: boolean, files: [], error?: string }
```

### URL Functions

#### `getPublicUrl(bucket, path)`
Get public URL for a file.

```typescript
const url = getPublicUrl("user-avatars", "userId/avatar.jpg");
```

#### `getSignedUrl(bucket, path, expiresIn?)`
Get temporary signed URL for private files (default: 1 hour).

```typescript
const result = await getSignedUrl("user-documents", "userId/doc.pdf", 3600);
// Returns: { success: boolean, url?: string, error?: string }
```

### Validation Functions

#### `validateFileSize(file, maxSizeMB)`
```typescript
const result = validateFileSize(file, 10);
if (!result.valid) {
  console.error(result.error);
}
```

#### `validateFileType(file, allowedTypes)`
```typescript
const result = validateFileType(file, ["image/jpeg", "image/png"]);
if (!result.valid) {
  console.error(result.error);
}
```

---

## 🔒 Security (RLS Policies)

### User Isolation
- Users can only upload/view/delete **their own files**
- Files are automatically organized by user ID
- No user can access another user's files

### Admin Access
- Admins (with `role: "admin"` in metadata) can view all files
- Useful for moderation and support

### Public vs Private
- **user-avatars**: Public bucket (anyone can view)
- **user-images, user-videos, user-documents**: Private (only owner + admin)

---

## 📊 Bucket Limits

| Bucket | Size Limit | Allowed Types |
|--------|-----------|---------------|
| user-images | 10MB | JPEG, PNG, GIF, WebP, SVG |
| user-videos | 100MB | MP4, WebM, QuickTime, AVI |
| user-documents | 20MB | PDF, DOC, DOCX, TXT, CSV |
| user-avatars | 2MB | JPEG, PNG, WebP |

---

## 🗂️ File Organization

Files are organized by user ID:

```
user-images/
  ├── userId-1/
  │   ├── uploads/
  │   │   ├── 1234567890.jpg
  │   │   └── 1234567891.png
  │   └── profile/
  │       └── 1234567892.jpg
  └── userId-2/
      └── ...
```

---

## 🎨 Example Use Cases

### 1. User Profile Picture Upload

```typescript
const { upload } = useFileUpload({
  bucket: "user-avatars",
  maxSizeMB: 2,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
});

// Upload avatar
await upload(avatarFile);
```

### 2. Document Upload for CRM

```typescript
const { upload } = useFileUpload({
  bucket: "user-documents",
  folder: "contracts",
  maxSizeMB: 20,
  allowedTypes: ["application/pdf"],
});

await upload(contractPDF);
```

### 3. Video Upload for Content

```typescript
const { upload } = useFileUpload({
  bucket: "user-videos",
  folder: "tutorials",
  maxSizeMB: 100,
  allowedTypes: ["video/mp4", "video/webm"],
  onSuccess: (result) => {
    // Save video URL to database
    saveTutorialToDB({ videoUrl: result.url });
  },
});

await upload(videoFile);
```

---

## 🔧 Troubleshooting

### Upload fails with "Not authenticated"
- Make sure user is logged in
- Check that auth session is valid

### Upload fails with "Unauthorized"
- Verify RLS policies are created (run SQL script)
- Check user ID matches folder structure

### File not visible after upload
- For private buckets, use `getSignedUrl()` instead of `getPublicUrl()`
- Verify user has permission to view the file

### "Bucket not found" error
- Run the SQL setup script in Supabase
- Check bucket name matches exactly (case-sensitive)

---

## 🎯 Next Steps

1. ✅ Run the SQL setup script
2. ✅ Test file upload in your app
3. ✅ Add upload UI to your components
4. ✅ Integrate with existing features (CRM, profile, etc.)

For questions or issues, check the Supabase Storage documentation:
https://supabase.com/docs/guides/storage
