'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  currentImage?: string;
  businessSlug: string;
  folder?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function ImageUploader({
  currentImage,
  businessSlug,
  folder,
  onUpload,
  onRemove,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Use JPEG, PNG, WebP, or GIF.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum 5MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessSlug', businessSlug);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch('/admin/api/site-config/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      {currentImage ? (
        <div className="relative group">
          <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden">
            <Image
              src={currentImage}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center aspect-video bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 hover:bg-zinc-750 transition-colors">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">Click to upload image</span>
              <span className="text-xs text-zinc-500">
                JPEG, PNG, WebP, GIF (max 5MB)
              </span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {currentImage && (
        <label className="flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 rounded-md cursor-pointer transition-colors text-zinc-300 text-sm">
          <Upload className="w-4 h-4" />
          Replace Image
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
