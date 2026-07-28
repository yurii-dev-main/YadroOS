import { useState, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { accountingService } from '../services/accounting.service';

interface ImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal = ({ onClose, onSuccess }: ImportModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a valid .csv or .xlsx file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a valid .csv or .xlsx file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      await accountingService.bulkImportTransactions(file);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Import Transactions</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Close
          </button>
        </div>

        <div
          className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={handleFileChange}
          />
          {file ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
              <p className="mt-1 text-xs text-slate-400">Click or drag to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-slate-300">Drag and drop your file here</p>
              <p className="mt-1 text-xs text-slate-500">Supports .csv, .xlsx</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-rose-500/10 p-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? 'Importing...' : 'Import File'}
          </Button>
        </div>
      </div>
    </div>
  );
};
