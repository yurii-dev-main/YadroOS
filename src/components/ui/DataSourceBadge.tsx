import React, { useState } from 'react';
import { Database, FileSpreadsheet, HardDrive, Play } from 'lucide-react';

export type DataSourceType = 'mock' | 'excel' | 'db' | 'api';

interface DataSourceBadgeProps {
  source: DataSourceType;
  label?: string;
  onSourceChange?: (source: DataSourceType) => void;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  source,
  label,
  onSourceChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSourceIcon = (type: DataSourceType) => {
    switch (type) {
      case 'mock':
        return <Play className="w-3 h-3" />;
      case 'excel':
        return <FileSpreadsheet className="w-3 h-3" />;
      case 'db':
        return <HardDrive className="w-3 h-3" />;
      case 'api':
        return <Database className="w-3 h-3" />;
    }
  };

  const getSourceLabel = (type: DataSourceType) => {
    if (label) return label;
    switch (type) {
      case 'mock':
        return 'Demo Data';
      case 'excel':
        return 'Excel Import';
      case 'db':
        return 'Database';
      case 'api':
        return 'Live API';
    }
  };

  const sources: DataSourceType[] = ['mock', 'excel', 'db', 'api'];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => onSourceChange && setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded border border-slate-700 bg-slate-900/80 text-slate-300 transition ${onSourceChange ? 'hover:bg-slate-800 cursor-pointer' : 'cursor-default'}`}
      >
        <span className="text-slate-500">Source:</span>
        <span className="flex items-center gap-1 text-primary">
          {getSourceIcon(source)}
          {getSourceLabel(source)}
        </span>
      </button>

      {isOpen && onSourceChange && (
        <div className="absolute left-0 mt-1 w-40 rounded-md bg-slate-900 border border-slate-700 shadow-lg z-50">
          <div className="py-1">
            {sources.map((src) => (
              <button
                type="button"
                key={src}
                onClick={() => {
                  onSourceChange(src);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-xs ${source === src ? 'text-primary bg-slate-800' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                {getSourceIcon(src)}
                {getSourceLabel(src)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
