'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, X, Loader2, Star, Plus, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function MultiImageUpload({
  values = [],
  onChange,
  maxImages = 8,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlField, setShowUrlField] = useState(false);

  const uploadSingleFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error(`"${file.name}" is not an image file.`);
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`"${file.name}" exceeds 10 MB limit.`);
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Upload failed');
    return data.url;
  };

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setError('');
      setUploading(true);

      const files = Array.from(fileList);
      const remainingSlots = maxImages - values.length;

      if (remainingSlots <= 0) {
        setError(`Maximum of ${maxImages} images reached.`);
        setUploading(false);
        return;
      }

      const filesToUpload = files.slice(0, remainingSlots);
      const uploadedUrls: string[] = [];

      try {
        for (const file of filesToUpload) {
          const url = await uploadSingleFile(file);
          uploadedUrls.push(url);
        }
        onChange([...values, ...uploadedUrls]);
      } catch (err: any) {
        setError(err.message ?? 'An error occurred during upload.');
      } finally {
        setUploading(false);
      }
    },
    [values, maxImages, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = ''; // reset so same file can be uploaded again if needed
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (values.includes(trimmed)) {
      setError('This image URL is already in the list.');
      return;
    }
    onChange([...values, trimmed]);
    setUrlInput('');
    setShowUrlField(false);
    setError('');
  };

  const handleRemove = (index: number) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = values[index];
    const rest = values.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  return (
    <div className="space-y-3">
      {/* Uploaded Images Grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {values.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={`relative aspect-square rounded-lg overflow-hidden border transition-all group ${
                idx === 0 
                  ? 'border-[#C9A66B] ring-2 ring-[#C9A66B]/30' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={url}
                alt={`Product image ${idx + 1}`}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Cover/Primary Badge */}
              {idx === 0 ? (
                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-sm bg-[#183629] text-[#C9A66B] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Star size={10} className="fill-[#C9A66B]" />
                  Cover
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 hover:bg-black text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Make this the primary cover image"
                >
                  Set Primary
                </button>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                title="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dropzone & Action Bar */}
      {values.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="relative"
        >
          <label className="flex flex-col items-center justify-center w-full py-6 px-4 border-2 border-dashed border-gray-300 hover:border-[#C9A66B] hover:bg-amber-50/20 rounded-lg cursor-pointer transition-all">
            <input
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleInputChange}
              disabled={uploading}
            />
            <div className="flex flex-col items-center gap-1.5 text-gray-500 text-center">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-[#C9A66B]" />
                  <span className="text-xs font-medium text-gray-700">Uploading pictures…</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-[#C9A66B]" />
                  <span className="text-xs font-semibold text-gray-700">
                    Click to browse or drop multiple images
                  </span>
                  <span className="text-[11px] text-gray-400">
                    PNG, JPG, WEBP up to 10 MB each ({values.length}/{maxImages} uploaded)
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {/* URL Toggle / Input */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <button
          type="button"
          onClick={() => setShowUrlField(!showUrlField)}
          className="inline-flex items-center gap-1.5 text-[#183629] hover:text-[#C9A66B] font-medium transition-colors cursor-pointer"
        >
          <LinkIcon size={13} />
          <span>{showUrlField ? 'Hide URL input' : '+ Add image via external URL'}</span>
        </button>
        <span className="text-[11px] text-gray-400">
          The first picture serves as the catalog cover photo.
        </span>
      </div>

      {showUrlField && (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or cloud URL"
            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C9A66B]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-[#183629] text-[#F3E9D7] text-xs font-semibold rounded-lg hover:bg-black transition-colors cursor-pointer shrink-0"
          >
            Add URL
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

