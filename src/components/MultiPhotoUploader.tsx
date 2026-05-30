import React, { useRef, useState } from "react";
import { Upload, X, Eye, FileText } from "lucide-react";
import api from "../api/axios";

type PhotoItem = {
  url: string;
  name: string;
};

const resolveFileUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  let base = api.defaults.baseURL || "http://localhost:3000";
  if (base.startsWith("/")) {
    base = window.location.origin;
  } else {
    base = base.replace(/\/api$/, "").replace(/\/api\/$/, "");
  }
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
};

type MultiPhotoUploaderProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  label?: string;
};

export default function MultiPhotoUploader({
  value,
  onChange,
  label = "Photos",
}: MultiPhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Backward compatible parsing of value
  const getPhotos = (): PhotoItem[] => {
    if (!value) return [];
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        // Fallback if parsing fails
      }
    }
    // Return single photo fallback
    return [{ url: value, name: "Legacy Photo" }];
  };

  const photos = getPhotos();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);

    const newPhotos = [...photos];
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await api.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res.data?.url) {
          newPhotos.push({
            url: res.data.url,
            name: res.data.name || file.name,
          });
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert(`Failed to upload ${file.name}`);
      }
    }

    onChange(JSON.stringify(newPhotos));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (indexToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== indexToRemove);
    onChange(updated.length ? JSON.stringify(updated) : "");
  };

  const triggerPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <button
          type="button"
          onClick={triggerPicker}
          disabled={uploading}
          className="btn btn-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1 border border-indigo-200"
        >
          <Upload size={14} />
          {uploading ? "Uploading..." : "Upload Photos"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,application/pdf"
          className="hidden"
        />
      </div>

      {photos.length === 0 ? (
        <div
          onClick={triggerPicker}
          className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
        >
          <Upload
            className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors"
            size={28}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No files uploaded. Click here to upload photos/documents (e.g. driver pic, insurance card, license).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, idx) => {
            const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(photo.url);
            return (
              <div
                key={idx}
                className="relative group border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/50 flex flex-col h-32 justify-between"
              >
                {isImage ? (
                  <div className="w-full h-20 bg-white dark:bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={resolveFileUrl(photo.url)}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="w-full h-20 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-400">
                    <FileText size={24} />
                    <span className="text-[10px] mt-1 truncate max-w-[90%]">
                      {photo.name}
                    </span>
                  </div>
                )}

                {/* Actions overlay / footer */}
                <div className="p-1 px-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span
                    className="truncate text-slate-500 max-w-[65%]"
                    title={photo.name}
                  >
                    {photo.name}
                  </span>
                  <div className="flex gap-1">
                    <a
                      href={resolveFileUrl(photo.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                      title="View file"
                    >
                      <Eye size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded text-rose-600"
                      title="Remove file"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
