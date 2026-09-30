import React, { useState } from 'react';
import { Check, Download } from 'lucide-react';

export interface ExportCsvButtonProps {
  onExport: () => void;
  label?: string;
  title?: string;
  className?: string;
}

const DEFAULT_CLASSNAME =
  'flex items-center gap-1.5 tap-target px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-line border border-line-strong text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer';

export const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  onExport,
  label = 'Exportar CSV',
  title = 'Baixar planilha CSV',
  className = DEFAULT_CLASSNAME,
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleClick = () => {
    onExport();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <button type="button" onClick={handleClick} className={className} title={title}>
      {downloaded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Baixado!</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
