
import React, { useState, useEffect, useMemo } from 'react';
import { Info, CheckCircle2, XCircle, Play, BookOpen, Sparkles, Code } from 'lucide-react';

interface RegexHelperProps {
  regex: string;
  onRegexChange: (newRegex: string) => void;
  isDarkMode: boolean;
}

const PRESETS = [
  { name: 'Resolución (Nro/Año)', pattern: '\\d{1,4}/\\d{4}', description: 'Busca números de resolución estándar como 123/2023' },
  { name: 'Fecha (DD/MM/AAAA)', pattern: '\\d{2}/\\d{2}/\\d{4}', description: 'Busca fechas en formato día/mes/año' },
  { name: 'CUIT', pattern: '\\d{2}-\\d{8}-\\d{1}', description: 'Busca números de CUIT con guiones' },
  { name: 'Importe ($)', pattern: '\\$\\s*\\d+(\\.\\d{3})*(,\\d{2})?', description: 'Busca montos de dinero con signo $' },
  { name: 'Palabra Exacta', pattern: '\\b(termino)\\b', description: 'Busca una palabra exacta evitando coincidencias parciales' },
  { name: 'Resolución 04/2014', pattern: '\\b(?<![0-9/])0*4\\s*[-/]\\s*2014\\b', description: 'Patrón específico para la resolución 04 de 2014' },
];

const RegexHelper: React.FC<RegexHelperProps> = ({ regex, onRegexChange, isDarkMode }) => {
  const [testText, setTestText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState<string[]>([]);

  // Validar Regex en tiempo real
  useEffect(() => {
    if (!regex) {
      setIsValid(true);
      setError('');
      return;
    }

    try {
      // Separar por punto y coma si el usuario usa el formato de la app
      const patterns = regex.split(';').map(p => p.trim()).filter(p => p);
      for (const p of patterns) {
        new RegExp(p);
      }
      setIsValid(true);
      setError('');
    } catch (e: any) {
      setIsValid(false);
      setError(e.message);
    }
  }, [regex]);

  // Probar Regex (Sandbox)
  useEffect(() => {
    if (!isValid || !regex || !testText) {
      setMatches([]);
      return;
    }

    try {
      const patterns = regex.split(';').map(p => p.trim()).filter(p => p);
      let allMatches: string[] = [];
      
      patterns.forEach(p => {
        const re = new RegExp(p, 'gi');
        const found = testText.match(re);
        if (found) allMatches = [...allMatches, ...found];
      });
      
      setMatches(Array.from(new Set(allMatches)));
    } catch (e) {
      setMatches([]);
    }
  }, [regex, testText, isValid]);

  // Explicador Dinámico (Simplificado)
  const explanation = useMemo(() => {
    if (!regex || !isValid) return null;
    
    const parts: { pattern: string; meaning: string }[] = [];
    if (regex.includes('\\b')) parts.push({ pattern: '\\b', meaning: 'Límite de palabra: Asegura que el patrón no esté pegado a otras letras o números.' });
    if (regex.includes('\\d')) parts.push({ pattern: '\\d', meaning: 'Dígito: Coincide con cualquier número del 0 al 9.' });
    if (regex.includes('\\D')) parts.push({ pattern: '\\D', meaning: 'No-Dígito: Coincide con cualquier carácter que NO sea un número.' });
    if (regex.includes('\\s')) parts.push({ pattern: '\\s', meaning: 'Espacio: Coincide con espacios, tabulaciones o saltos de línea.' });
    if (regex.includes('\\S')) parts.push({ pattern: '\\S', meaning: 'No-Espacio: Coincide con cualquier carácter que NO sea un espacio.' });
    if (regex.includes('\\w')) parts.push({ pattern: '\\w', meaning: 'Alfanumérico: Letras, números o guion bajo.' });
    if (regex.includes('.')) parts.push({ pattern: '.', meaning: 'Comodín: Coincide con cualquier carácter (excepto saltos de línea).' });
    if (regex.includes('+')) parts.push({ pattern: '+', meaning: 'Cuantificador: Busca 1 o más repeticiones del elemento anterior.' });
    if (regex.includes('*')) parts.push({ pattern: '*', meaning: 'Cuantificador: Busca 0 o más repeticiones del elemento anterior.' });
    if (regex.includes('?')) parts.push({ pattern: '?', meaning: 'Opcional: El elemento anterior puede aparecer o no (0 o 1 vez).' });
    if (regex.includes('{')) parts.push({ pattern: '{n,m}', meaning: 'Rango: Especifica exactamente cuántas repeticiones buscar.' });
    if (regex.includes('|')) parts.push({ pattern: '|', meaning: 'Alternativa: Funciona como un operador "O" entre dos patrones.' });
    if (regex.includes('^')) parts.push({ pattern: '^', meaning: 'Inicio: El patrón debe estar al comienzo de la línea.' });
    if (regex.includes('$')) parts.push({ pattern: '$', meaning: 'Fin: El patrón debe estar al final de la línea.' });
    if (regex.includes('(?<')) parts.push({ pattern: '(?<', meaning: 'Lookbehind: Verifica lo que hay atrás sin incluirlo en el resultado.' });
    if (regex.includes('(?=')) parts.push({ pattern: '(?=', meaning: 'Lookahead: Verifica lo que hay adelante sin incluirlo en el resultado.' });
    if (regex.includes('[')) parts.push({ pattern: '[]', meaning: 'Clase de caracteres: Coincide con cualquier carácter dentro de los corchetes.' });
    
    return parts.length > 0 ? parts : null;
  }, [regex, isValid]);

  return (
    <div className={`mt-4 space-y-4 p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
      
      {/* 1. Validador de Sintaxis */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Sintaxis</span>
        </div>
        {isValid ? (
          <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" /> Válido
          </div>
        ) : (
          <div className="flex items-center gap-1 text-rose-500 text-[10px] font-bold uppercase">
            <XCircle className="w-3 h-3" /> Error
          </div>
        )}
      </div>
      {!isValid && error && (
        <p className="text-[9px] text-rose-400 font-mono bg-rose-500/5 p-2 rounded-lg border border-rose-500/20">
          {error}
        </p>
      )}

      {/* 4. Explicador Dinámico - MEJORADO: Ahora más visible y estructurado */}
      {explanation && (
        <div className={`p-3 rounded-xl border animate-in fade-in slide-in-from-top-1 duration-300 ${
          isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-400/70">Análisis del Patrón</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {explanation.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 group">
                <code className={`px-1.5 py-0.5 rounded font-bold text-[10px] min-w-[24px] text-center ${
                  isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'
                }`}>
                  {item.pattern}
                </code>
                <span className={`text-[10px] leading-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {item.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Biblioteca de Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biblioteca de Patrones</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onRegexChange(preset.pattern)}
              className={`text-left p-2 rounded-xl border text-[9px] transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 text-slate-300' 
                  : 'bg-white border-slate-200 hover:border-indigo-500 text-slate-600'
              }`}
            >
              <div className="font-black uppercase text-indigo-500 mb-0.5">{preset.name}</div>
              <div className="opacity-70 truncate">{preset.pattern}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Probador de Regex (Sandbox) */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Probador (Sandbox)</span>
          </div>
          {matches.length > 0 && (
            <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              {matches.length} COINCIDENCIAS
            </span>
          )}
        </div>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Pega aquí un texto de prueba para validar tu Regex..."
          className={`w-full p-3 rounded-xl border text-[10px] outline-none transition-all h-20 resize-none ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:border-indigo-500'
          }`}
        />
        {matches.length > 0 && (
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1">
            {matches.map((m, i) => (
              <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded border border-indigo-500/20 text-[9px] font-mono">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 text-[9px] text-slate-400 italic leading-tight">
        <Info className="w-3 h-3 mt-0.5 shrink-0" />
        <span>Puedes usar punto y coma (;) para buscar múltiples patrones simultáneamente.</span>
      </div>
    </div>
  );
};

export default RegexHelper;
