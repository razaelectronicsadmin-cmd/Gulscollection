'use client';

import { useCallback, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be under 10 MB.');
        return;
      }

      setError('');
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.error ?? 'Upload failed');
        onChange(data.url);
      } catch (err: any) {
        setError(err.message ?? 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (value) {
    return (
      <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border border-gray-200 group">
        <Image src={value} alt="Product image" fill className="object-cover" unoptimized />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative"
    >
      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
        <input type="file" className="hidden" accept="image/*" onChange={handleInputChange} />
        <div className="flex flex-col items-center gap-2 text-gray-500">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-gray-400" />
              <span className="text-sm font-medium">Click or drag image here</span>
              <span className="text-xs text-gray-400">PNG, JPG, WEBP up to 10 MB</span>
            </>
          )}
        </div>
      </label>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

