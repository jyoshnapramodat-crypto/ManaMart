import React, { useState, useRef } from 'react';
import api from '../services/api';
import {
  UploadCloud,
  FileCheck2,
  FileText,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function DocumentUploadInput({
  label,
  description,
  docType,
  required = false,
  value, // { docType, fileName, originalName, fileUrl, mimeType, size } or null
  onChange,
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Only JPG, PNG, WEBP, or PDF files are accepted.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);
    formData.append('docType', docType);

    setUploading(true);
    try {
      const res = await api.post('/auth/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.file) {
        onChange(res.data.file);
      } else {
        setError(res.data.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || 'Server error while uploading document.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
    setError(null);
  };

  const isImage = value?.mimeType?.startsWith('image/') || value?.fileName?.match(/\.(jpg|jpeg|png|webp)$/i);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <FileCheck2 className="w-3 h-3" />
            Uploaded
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              {isImage ? <FileCheck2 className="w-4 h-4 text-emerald-700" /> : <FileText className="w-4 h-4 text-emerald-700" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">
                {value.originalName || value.fileName}
              </p>
              <p className="text-[10px] text-slate-500">
                {value.size ? `${(value.size / 1024).toFixed(1)} KB` : 'Attached'} • {value.docType || docType}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0 ml-2">
            {value.fileUrl && (
              <a
                href={value.fileUrl.startsWith('http') ? value.fileUrl : `${api.defaults.baseURL || ''}${value.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
                title="Preview Document"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Remove file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-1.5 ${
            uploading
              ? 'bg-slate-50 border-slate-300 cursor-wait'
              : 'border-slate-300 hover:border-[#064E3B] bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
              <span className="text-xs font-bold text-slate-700">Uploading verification document...</span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center">
                <UploadCloud className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Click to browse & upload file
              </span>
              <span className="text-[10px] text-slate-400">
                PDF, JPG, PNG or WEBP (Max 5MB)
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-red-600 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
