
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle2, Search, Calendar, Info, FileText as FileIcon } from 'lucide-react';
import { FileData } from '../types';

interface ResultsTableProps {
  files: FileData[];
  isDarkMode: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ files, isDarkMode }) => {
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedFileId(expandedFileId === id ? null : id);
  };

  const getTermBreakdown = (matches: any[]) => {
    const breakdown: Record<string, number> = {};
    matches.forEach(m => {
      // Count the trigger term
      breakdown[m.term] = (breakdown[m.term] || 0) + 1;
      
      // Count secondary matches terms
      if (m.secondaryMatches) {
        m.secondaryMatches.forEach((sm: any) => {
          breakdown[sm.term] = (breakdown[sm.term] || 0) + 1;
        });
      }
    });
    return breakdown;
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse table-auto">
        <thead>
          <tr className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'bg-slate-900/50 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>
            <th className="px-6 py-6 w-16 text-center"></th>
            <th className="px-6 py-6 min-w-[200px]">Documento</th>
            <th className="px-6 py-6 w-48 text-center">F. Emisión</th>
            <th className="px-6 py-6 w-[450px] text-center">Resumen de Hallazgos</th>
            <th className="px-6 py-6 w-20 text-center">OCR</th>
            <th className="px-6 py-6 w-28 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}`}>
          {files.map((file) => {
            const termBreakdown = getTermBreakdown(file.matches);
            const totalDetected = Object.values(termBreakdown).reduce((a, b) => a + b, 0);
            const hasMatches = totalDetected > 0;
            
            return (
              <React.Fragment key={file.id}>
                <tr 
                  onClick={() => toggleExpand(file.id)}
                  className={`group cursor-pointer transition-all duration-300 ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-indigo-50/40'}`}
                >
                  <td className="px-6 py-6 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedFileId === file.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 rotate-0' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 -rotate-90'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl flex-shrink-0 shadow-sm transition-transform group-hover:scale-110 ${file.metadata.extension === 'pdf' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                        <FileIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-black break-words leading-tight mb-1 truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{file.file.name}</div>
                        <div className="flex gap-2">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase tracking-widest ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>{file.metadata.extension}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{(file.metadata.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {file.metadata.fechaEmision ? (
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black font-mono whitespace-nowrap ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        {file.metadata.fechaEmision}
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">N/A</span>
                    )}
                  </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest transition-all ${hasMatches ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                          {hasMatches ? `DETECTADOS: ${totalDetected}` : 'SIN HALLAZGOS'}
                        </div>
                        {hasMatches && (
                          <div className="flex flex-wrap justify-center gap-2 max-w-[400px]">
                            {Object.entries(termBreakdown).map(([term, count], idx) => (
                              <div key={idx} className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all hover:border-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                                <span className="text-indigo-500">{term}</span> <span className="text-slate-400 font-bold ml-1">×{count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${file.ocrApplied ? (isDarkMode ? 'bg-blue-950/20 border-blue-900 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600') : (isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-400')}`}>
                        {file.ocrApplied ? 'SÍ' : 'NO'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                    <div className="flex justify-center">
                      {file.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                      {file.status === 'error' && <AlertCircle className="w-6 h-6 text-rose-500" />}
                      {file.status === 'processing' && (
                        <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {file.status === 'pending' && <div className="w-6 h-6 rounded-full border-3 border-slate-300 dark:border-slate-700"></div>}
                    </div>
                  </td>
                </tr>
                {expandedFileId === file.id && (
                  <tr className={`transition-all duration-500 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-50/40'}`}>
                    <td colSpan={6} className="px-4 py-8">
                      <div className="space-y-6 w-full max-w-[100%] mx-auto">
                        {/* Cabecera Detail Premium */}
                        <div className={`p-6 rounded-3xl border flex items-center justify-between w-full shadow-lg backdrop-blur-sm ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                          <div className="flex items-center gap-6">
                            <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                              <Info className="w-6 h-6" />
                            </div>
                            <div>
                              <div className={`text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Expediente: {file.file.name}</div>
                              <div className="flex gap-4 mt-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                  Extensión: <span className="text-indigo-500">{file.metadata.extension}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                  Peso: <span className="text-emerald-500">{(file.metadata.size / 1024).toFixed(2)} KB</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {file.metadata.fechaEmision && (
                            <div className="text-right border-l-2 pl-10 border-slate-200 dark:border-slate-700">
                              <div className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Fecha Emisión</div>
                              <div className="text-2xl font-black font-mono text-emerald-600 tabular-nums">{file.metadata.fechaEmision}</div>
                            </div>
                          )}
                        </div>

                        {file.matches.length > 0 ? (
                          <div className="space-y-4 w-full">
                            <div className="flex items-center gap-3 px-2">
                              <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                              <h4 className={`text-xs font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hallazgos Detectados ({file.matches.length})</h4>
                            </div>
                            <div className="grid gap-4 w-full">
                              {file.matches.map((m, i) => (
                                <div key={i} className={`group/hallazgo p-8 rounded-3xl border w-full transition-all hover:shadow-2xl ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-100 hover:shadow-indigo-500/5'}`}>
                                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/50">
                                    <div className="flex items-center gap-5">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-500/20">
                                        {i+1}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Término Hallado</span>
                                        <span className={`text-lg font-black font-mono ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{m.matchedText}</span>
                                      </div>
                                    </div>
                                    {m.page && (
                                      <div className={`px-4 py-2 rounded-2xl border flex flex-col items-center ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Página</span>
                                        <span className="text-xl font-black text-slate-600 dark:text-slate-300 leading-tight">{m.page}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className={`text-base lg:text-lg leading-relaxed font-semibold w-full px-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {renderContext(m.context)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Sin coincidencias relevantes</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const renderContext = (context: string) => {
  const parts = context.split(/(\[\[ELLIPSIS\]\]|>>>|<<<|\[\[\[|\]\]\])/);
  let isTrigger = false;
  let isOther = false;

  return (
    <span className="whitespace-pre-wrap break-words opacity-100 inline-block w-full">
      {parts.map((p, i) => {
        if (p === '[[ELLIPSIS]]') return (
          <span key={i} className="text-rose-600 bg-rose-50 dark:bg-rose-900/20 font-black px-2 py-0.5 rounded-lg mx-1 inline-block opacity-100 shadow-sm">
            ...
          </span>
        );
        if (p === '>>>') { isTrigger = true; return null; }
        if (p === '<<<') { isTrigger = false; return null; }
        if (p === '[[[') { isOther = true; return null; }
        if (p === ']]]') { isOther = false; return null; }
        
        if (isTrigger) return (
          <span key={i} className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg font-black shadow-lg shadow-indigo-500/20 mx-0.5 opacity-100">
            {p}
          </span>
        );
        if (isOther) return (
          <span key={i} className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg font-black shadow-lg shadow-emerald-500/10 mx-0.5 opacity-100">
            {p}
          </span>
        );
        return <span key={i} className="opacity-100 tracking-tight">{p}</span>;
      })}
    </span>
  );
};

export default ResultsTable;
