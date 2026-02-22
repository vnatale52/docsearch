
import React from 'react';
import { Upload, Info } from 'lucide-react';

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded }) => {
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="relative group"
    >
      <input 
        type="file" 
        multiple 
        onChange={onFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="p-2.5 border-2 border-dashed border-slate-300 group-hover:border-indigo-500 group-hover:bg-indigo-50 transition-all rounded-xl text-center">
        <Upload className="w-5 h-5 mx-auto mb-1 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        <h3 className="text-xs font-bold mb-0.5">Cargar documentos</h3>
        <p className="text-[9px] text-slate-500 mb-1.5 leading-none">Suelte o haga clic aquí</p>
        <div className="flex flex-wrap justify-center gap-1 opacity-80">
          <span className="px-1 py-0.5 text-[8px] font-bold bg-slate-100 rounded text-slate-600">PDF</span>
          <span className="px-1 py-0.5 text-[8px] font-bold bg-slate-100 rounded text-slate-600">DOCX</span>
          <span className="px-1 py-0.5 text-[8px] font-bold bg-slate-100 rounded text-slate-600">XLSX</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-start gap-1.5 text-[8px] text-slate-500 px-1 leading-tight">
        <Info className="w-2 h-2 mt-0.5 flex-shrink-0" />
        <p>Procesamiento local 100% privado.</p>
      </div>
    </div>
  );
};

export default FileUpload;
