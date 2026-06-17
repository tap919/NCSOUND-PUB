import { useState, useRef } from 'react';
import { Upload as UploadIcon, FileAudio, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadProps {
  bucket: string;
  accept?: string;
  maxSizeMB?: number;
  label: string;
  onUploaded: (url: string, path: string) => void;
}

export function FileUpload({ bucket, accept = 'audio/wav,audio/mpeg,audio/flac', maxSizeMB = 100, label, onUploaded }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (selected: File) => {
    if (selected.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    setFile(selected);
    setUploading(true);

    try {
      // Get signed upload URL from server
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket,
          fileName: selected.name,
          contentType: selected.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Upload file directly to Supabase Storage via signed URL
      const uploadRes = await fetch(data.url, {
        method: 'PUT',
        body: selected,
        headers: { 'Content-Type': selected.type },
      });
      if (!uploadRes.ok) throw new Error('Storage upload failed');

      toast.success('File uploaded');
      onUploaded(data.url.split('?')[0], data.path);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-neutral-700 hover:border-orange-500 bg-neutral-950 p-6 text-center transition-colors relative">
      {file ? (
        <div className="flex items-center justify-between bg-neutral-900 p-3 border border-neutral-800">
          <div className="flex items-center gap-3">
            <FileAudio className="w-6 h-6 text-orange-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</p>
              <p className="text-[10px] text-neutral-500">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
            </div>
          </div>
          {uploading ? (
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <button type="button" onClick={() => { setFile(null); }} className="text-neutral-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
          <UploadIcon className="mx-auto h-8 w-8 text-neutral-600 group-hover:text-orange-500 transition-colors mb-2" />
          <p className="text-xs font-bold uppercase tracking-widest text-white mb-1">{label}</p>
          <p className="text-[10px] text-neutral-500 font-sans">Max {maxSizeMB}MB · WAV/MP3/FLAC</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}
