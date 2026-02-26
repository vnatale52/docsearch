
import React, { useState, useCallback, useEffect } from 'react';
import { Search, FileText, Download, Trash2, Moon, Sun, AlertCircle, FileSearch, CheckCircle2, BarChart3, Clock, Settings2, ShieldAlert, HelpCircle } from 'lucide-react';
import { FileData, SearchResult, SearchStats } from './types';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import StatsOverview from './components/StatsOverview';
import { processFiles } from './services/fileProcessor';
import { exportToCSV, exportToPDF, exportToDocx, exportErrorReport } from './services/exportService';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [searchTerms, setSearchTerms] = useState<string>('\\b(?<![0-9/])0*4\\s*[-/]\\s*2014\\b; sumatoria; banco; bank; leasing');
  const [useRegex, setUseRegex] = useState<boolean>(false);
  const [enableOCR, setEnableOCR] = useState<boolean>(false);
  const [contextChars, setContextChars] = useState<number>(240);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('es-AR', { 
        timeZone: 'America/Argentina/Buenos_Aires', 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const downloadReadme = () => {
    const readmeContent = `# DocSearch Pro v4.0

DocSearch Pro es una herramienta avanzada de búsqueda y análisis de documentos diseñada para procesar archivos locales (PDF, DOCX, XLSX, TXT) de forma rápida y segura, directamente en el navegador.

## 🚀 Características Principales

- **Búsqueda Multiformato**: Soporte nativo para archivos PDF, Word (.docx), Excel (.xlsx, .xls) y Texto Plano (.txt).
- **Análisis Inteligente**: Extracción automática de metadatos como la Fecha de Emisión y Número de Resolución.
- **Búsqueda Avanzada**: Soporte para múltiples términos de búsqueda y expresiones regulares (Regex).
- **Privacidad Total**: El procesamiento se realiza localmente en el navegador; los documentos nunca se suben a un servidor externo.
- **Exportación Profesional**: Generación de informes detallados en formatos PDF, Word (Docx) y CSV (Excel).
- **Interfaz Moderna**: Diseño limpio con soporte para Modo Oscuro y visualización de estadísticas en tiempo real.
- **OCR Integrado**: Capacidad de procesar PDFs escaneados mediante reconocimiento óptico de caracteres.

## 🔍 Uso de Expresiones Regulares (REGEX)

El sistema permite realizar búsquedas potentes utilizando Regex. Una expresión regular es una secuencia de caracteres que conforma un patrón de búsqueda.

### Ejemplo de Expresión Mixta:
\`\\b(?<![0-9/])0*4\\s*[-/]\\s*2014\\b; sumatoria; banco; bank; leasing\`

Esta expresión combina un patrón **REGEX** con **términos literales**, separados por punto y coma (\`;\`):

1.  **Patrón REGEX (\`\\b(?<![0-9/])0*4\\s*[-/]\\s*2014\\b\`)**:
    -   \`\\b\`: Asegura que la coincidencia sea una palabra completa.
    -   \`(?<![0-9/])\`: (Lookbehind negativo) Evita que el patrón coincida si hay un número o barra antes (ej. evita coincidir en "10/04/2014").
    -   \`0*4\`: Busca el número 4, permitiendo ceros a la izquierda (ej. "4" o "04").
    -   \`\\s*[-/]\\s*\`: Busca un guion o una barra inclinada, permitiendo espacios opcionales alrededor.
    -   \`2014\`: Busca el año 2014.
    -   *En resumen*: Busca menciones a "04-2014" o "4/2014" que no formen parte de una fecha más larga.

2.  **Términos Literales**: \`sumatoria\`, \`banco\`, \`bank\`, \`leasing\`. Estos se buscan exactamente como están escritos (insensible a mayúsculas).

## 📷 Limitaciones del OCR

El Reconocimiento Óptico de Caracteres (OCR) es una tecnología potente pero dependiente de la calidad de la fuente:

-   **Calidad de Imagen**: Si el documento escaneado tiene baja resolución, ruido digital o manchas, la precisión del texto extraído disminuirá significativamente.
-   **Gráficos y Tablas**: El OCR puede tener dificultades para interpretar texto dentro de gráficos complejos o tablas con bordes poco definidos.
-   **Fuentes No Estándar**: Tipografías muy estilizadas o texto manuscrito pueden generar errores de lectura.
-   **Inclinación**: Documentos escaneados con una inclinación excesiva pueden afectar la detección de líneas de texto.

## 🛡️ Tratamiento de Logos y Ruido

La aplicación incluye un sistema de filtrado inteligente para elementos gráficos recurrentes y metadatos de paginación que no forman parte del contenido normativo:

- **Filtrado de Logo "comarb"**: Se ha implementado un tratamiento específico para el logo de la Comisión Arbitral. El sistema detecta y elimina automáticamente cualquier ocurrencia de la palabra "comarb" generada por el motor de OCR o presente en la capa de texto.
- **Filtrado de Números de Página**: Se eliminan automáticamente las referencias a números de página aislados (ej. "Página 1", "Pag. 2" o números solitarios en una línea) para evitar que interfieran en la extracción de contexto.
- **Preservación de Continuidad**: Al ignorar estos elementos, el motor de búsqueda asegura que el texto que precede y subsigue al logo o número de página se analice como una unidad continua, evitando falsos negativos o fragmentación de hallazgos.
- **Tratamiento Multicapa**: El logo es ignorado tanto en la extracción de texto nativo como en el procesamiento por OCR.

> **Nota sobre Proximidad de Términos**: Si un mismo término hallado se repite muy cercanamente al término original (dentro del radio de contexto configurado), parte del contexto que rodea al término aparecerá duplicado en el reporte, ya que cada ocurrencia genera su propio bloque de hallazgo independiente para garantizar la trazabilidad individual.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Estilos**: Tailwind CSS 4
- **Iconos**: Lucide React
- **Procesamiento de Documentos**:
  - pdf.js para archivos PDF.
  - mammoth para archivos Word.
  - xlsx para hojas de cálculo.
  - tesseract.js para OCR.
- **Exportación**:
  - jspdf para informes PDF.
  - docx para informes Word.

## 📄 Licencia

Este proyecto se encuentra amparado bajo los términos de la licencia MIT.
`;
    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (newFiles: File[]) => {
    const formattedFiles: FileData[] = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      text: '',
      status: 'pending',
      matches: [],
      metadata: {
        extension: f.name.split('.').pop() || 'unknown',
        size: f.size
      }
    }));
    setFiles(prev => [...prev, ...formattedFiles]);
  };

  const clearFiles = () => {
    setFiles([]);
    setStats(null);
  };

  const handleSearch = async () => {
    if (!searchTerms.trim()) return;
    setIsProcessing(true);
    
    const terms = searchTerms.split(';').map(t => t.trim()).filter(t => t);
    const { updatedFiles, searchStats } = await processFiles(files, terms, useRegex, contextChars, enableOCR);
    
    setFiles(updatedFiles);
    setStats(searchStats);
    setIsProcessing(false);
  };

  const filteredFiles = files.filter(f => 
    f.status !== 'completed' || f.matches.length > 0
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-[#f1f5f9] text-slate-900'}`}>
      {/* Header Premium */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md ${isDarkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} px-6 lg:px-10 py-4 shadow-sm`}>
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <FileSearch className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">DocSearch <span className="text-indigo-600">Pro</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Intelligence Engine v4.0 <span className="ml-6 normal-case font-medium opacity-80">Desarrollado por Vincenzo Natale &nbsp;&nbsp; vnatale52@gmail.com</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-bold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {currentTime}
            </div>
            <button 
              onClick={downloadReadme}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[11px] font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
              title="Descargar README.md"
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Descargar Readme.md</span>
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar de Configuración - Estilizada */}
          <div className="lg:col-span-3 space-y-6 sticky top-24">
            <section className={`p-6 rounded-3xl shadow-xl border overflow-hidden relative ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600"></div>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 dark:bg-slate-700 rounded-lg">
                  <Settings2 className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-wider">Parámetros</h2>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest group-hover:text-indigo-500 transition-colors">Términos de Búsqueda</label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchTerms}
                      onChange={(e) => setSearchTerms(e.target.value)}
                      placeholder="Separados por ';'"
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`}
                    />
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  </div>
                </div>

                <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${useRegex ? 'border-indigo-500 bg-indigo-500/5' : 'border-transparent'}`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tighter">Motor Regex</span>
                    <span className="text-[10px] text-slate-400">Patrones avanzados</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${enableOCR ? 'border-indigo-500 bg-indigo-500/5' : 'border-transparent'}`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-tighter">Aplicar OCR</span>
                    <span className="text-[10px] text-slate-400">PDFs escaneados</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enableOCR} onChange={(e) => setEnableOCR(e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black text-slate-400 uppercase leading-snug tracking-tighter mb-1">
                      Caracteres de Contexto (Anteceden y Subsiguen) :
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-indigo-600 tabular-nums">{contextChars}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">CHARS</span>
                    </div>
                  </div>
                  <input 
                    type="range" min="0" max="2000" step="20"
                    value={contextChars}
                    onChange={(e) => setContextChars(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <FileUpload onFilesAdded={handleFileUpload} />

                <button 
                  onClick={handleSearch}
                  disabled={isProcessing || !searchTerms || files.length === 0}
                  className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Analizar Ahora
                    </>
                  )}
                </button>
              </div>
            </section>
            
            {files.length > 0 && (
              <button 
                onClick={clearFiles}
                className={`w-full py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all border ${isDarkMode ? 'text-rose-400 border-rose-900/50 hover:bg-rose-950/20' : 'text-rose-500 border-rose-100 hover:bg-rose-50'}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar todo
              </button>
            )}
          </div>

          {/* Área de Resultados - Maximizada */}
          <div className="lg:col-span-9 space-y-8">
            {stats && <StatsOverview stats={stats} isDarkMode={isDarkMode} />}
            
            <section className={`rounded-3xl shadow-2xl border overflow-hidden transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`px-8 py-6 border-b flex flex-wrap gap-4 items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Consola de Hallazgos</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Detalle integral por documento</p>
                  </div>
                </div>
                {stats && (
                  <div className="flex flex-wrap gap-3">
                    {stats.errors.length > 0 && (
                      <button 
                        onClick={() => exportErrorReport(files)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-900 shadow-sm transition-all hover:bg-rose-500 hover:text-white active:scale-95"
                      >
                        <ShieldAlert className="w-4 h-4" /> Informe Errores
                      </button>
                    )}
                    <button 
                      onClick={() => exportToCSV(files)}
                      className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" /> CSV
                    </button>
                    <button 
                      onClick={() => exportToPDF(files, stats)}
                      className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                    <button 
                      onClick={() => exportToDocx(files)}
                      className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" /> Word
                    </button>
                  </div>
                )}
              </div>
              
              <div className="min-h-[500px] w-full">
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-slate-300">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                      <FileSearch className="w-12 h-12 opacity-40" />
                    </div>
                    <p className="text-xl font-bold text-slate-400">Esperando carga de archivos</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-300 mt-2">Soporta: PDF, DOCX, XLSX, TXT</p>
                  </div>
                ) : filteredFiles.length === 0 && stats ? (
                  <div className="flex flex-col items-center justify-center py-32">
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <p className="text-xl font-bold text-slate-500">Búsqueda Impecable</p>
                    <p className="text-sm text-slate-400 mt-2">No se detectaron los términos buscados en la muestra actual.</p>
                  </div>
                ) : (
                  <ResultsTable files={filteredFiles} isDarkMode={isDarkMode} />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
