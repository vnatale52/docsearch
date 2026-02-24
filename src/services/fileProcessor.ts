
import { FileData, SearchResult, SearchStats } from '../types';
import { createWorker } from 'tesseract.js';

declare const pdfjsLib: any;
declare const mammoth: any;

const extractText = async (file: File, enableOCR: boolean): Promise<{ text: string; pages?: string[]; ocrApplied?: boolean }> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  try {
    switch (extension) {
      case 'pdf':
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        let pages: string[] = [];
        let isScanned = true;
        let ocrWasApplied = false;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          
          if (pageText.trim()) {
            isScanned = false;
          }
          
          fullText += pageText + '\n';
          pages.push(pageText);
        }

        if (isScanned && enableOCR) {
          fullText = '';
          pages = [];
          ocrWasApplied = true;
          const worker = await createWorker('spa');
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
            const { data: { text } } = await worker.recognize(canvas);
            fullText += text + '\n';
            pages.push(text);
          }
          await worker.terminate();
        }

        if (!fullText.trim()) {
          if (enableOCR) {
             throw new Error("Error: No se pudo extraer texto incluso con OCR.");
          } else {
             throw new Error("Error, su contenido no es texto leíble (posible PDF escaneado sin OCR)");
          }
        }
        return { text: fullText, pages, ocrApplied: ocrWasApplied };

      case 'docx':
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (!result.value.trim()) throw new Error("Error, su contenido no es texto leíble");
        return { text: result.value };

      case 'xlsx':
      case 'xls':
        const workbook = (window as any).XLSX.read(arrayBuffer, { type: 'buffer' });
        let excelText = '';
        workbook.SheetNames.forEach((sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          excelText += (window as any).XLSX.utils.sheet_to_txt(worksheet) + '\n';
        });
        if (!excelText.trim()) throw new Error("Error, su contenido no es texto leíble");
        return { text: excelText };

      case 'txt':
      default:
        const decoder = new TextDecoder();
        const text = decoder.decode(arrayBuffer);
        if (!text.trim()) throw new Error("Error, su contenido no es texto leíble o está vacío");
        return { text };
    }
  } catch (err: any) {
    throw new Error(err.message || "Error de acceso o lectura: archivo dañado o formato incompatible");
  }
};

const formatDateToDDMMYYYY = (dateStr: string): string => {
  const months: Record<string, string> = {
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
    julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
  };
  
  const cleanStr = dateStr.toLowerCase().trim().replace(/\s+/g, ' ');
  const parts = cleanStr.split(/\s+de\s+/);
  
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]] || '00';
    const year = parts[2];
    return `${day}-${month}-${year}`;
  }
  return dateStr;
};

const extractFechaEmision = (text: string): string | undefined => {
  const datePattern = /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i;
  const commaDatePattern = /,\s*(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i;
  
  const match = text.match(commaDatePattern) || text.match(datePattern);
  if (match) {
    const rawDate = match[0].replace(/^,\s*/, '');
    return formatDateToDDMMYYYY(rawDate);
  }
  return undefined;
};

export const processFiles = async (
  files: FileData[], 
  terms: string[], 
  useRegex: boolean, 
  contextChars: number,
  enableOCR: boolean
): Promise<{ updatedFiles: FileData[], searchStats: SearchStats }> => {
  const updatedFiles = [...files];
  const stats: SearchStats = {
    totalFiles: files.length,
    filesByType: {},
    totalTerms: 0,
    termsCount: {},
    errors: [],
    ocrFilesCount: 0
  };

  for (let fileData of updatedFiles) {
    fileData.status = 'processing';
    fileData.error = undefined;
    try {
      let { text, pages, ocrApplied } = await extractText(fileData.file, enableOCR);
      
      // Filtro de ruido: Ignorar el logo "comarb" si es detectado por OCR o texto
      const noisePatterns = [/comarb/gi];
      noisePatterns.forEach(pattern => {
        text = text.replace(pattern, '');
        if (pages) {
          pages = pages.map(p => p.replace(pattern, ''));
        }
      });

      fileData.text = text;
      fileData.ocrApplied = ocrApplied;
      if (ocrApplied) stats.ocrFilesCount++;
      fileData.metadata.fechaEmision = extractFechaEmision(text.slice(0, 5000));
      
      const ext = fileData.metadata.extension;
      stats.filesByType[ext] = (stats.filesByType[ext] || 0) + 1;

      fileData.matches = [];
      
      const otherPatterns = terms.map(t => useRegex ? t : t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const combinedRegex = new RegExp(`(${otherPatterns.join('|')})`, 'gi');

      for (const term of terms) {
        let pattern: RegExp;
        if (useRegex) {
          pattern = new RegExp(term, 'gi');
        } else {
          const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          pattern = new RegExp(escaped, 'gi');
        }

        let match;
        while ((match = pattern.exec(text)) !== null) {
          const matchedString = match[0];
          const start = Math.max(0, match.index - contextChars);
          const end = Math.min(text.length, match.index + matchedString.length + contextChars);
          
          const snippetText = text.slice(start, end).replace(/\n/g, ' ');
          const triggerIndexInSnippet = match.index - start;

          let resultSnippet = '';
          if (start > 0) resultSnippet += '[[ELLIPSIS]] ';

          const matchesInSnippet: {start: number, end: number, isTrigger: boolean, matchedText: string}[] = [];
          combinedRegex.lastIndex = 0;
          let snippetMatch;
          
          const secondaryMatches: { term: string; matchedText: string }[] = [];

          while ((snippetMatch = combinedRegex.exec(snippetText)) !== null) {
            const isExactTrigger = snippetMatch.index === triggerIndexInSnippet;
            const matchedText = snippetMatch[0];
            
            matchesInSnippet.push({
              start: snippetMatch.index,
              end: snippetMatch.index + matchedText.length,
              isTrigger: isExactTrigger,
              matchedText: matchedText
            });

            if (!isExactTrigger) {
              // Find which term matched this text
              let matchingTerm = term; // Fallback
              for (const t of terms) {
                const tPattern = new RegExp(useRegex ? t : t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                if (tPattern.test(matchedText)) {
                  matchingTerm = t;
                  break;
                }
              }
              
              secondaryMatches.push({ term: matchingTerm, matchedText: matchedText });
              stats.totalTerms++;
              stats.termsCount[matchingTerm] = (stats.termsCount[matchingTerm] || 0) + 1;
            }
          }

          let currentPos = 0;
          matchesInSnippet.sort((a, b) => a.start - b.start).forEach(m => {
            resultSnippet += snippetText.slice(currentPos, m.start);
            if (m.isTrigger) {
              resultSnippet += `>>>${snippetText.slice(m.start, m.end)}<<<`;
            } else {
              resultSnippet += `[[[${snippetText.slice(m.start, m.end)}]]]`;
            }
            currentPos = m.end;
          });
          resultSnippet += snippetText.slice(currentPos);
          
          if (end < text.length) resultSnippet += ' [[ELLIPSIS]]';

          let pageNum = undefined;
          if (pages) {
            let currentAccum = 0;
            for (let p = 0; p < pages.length; p++) {
              currentAccum += pages[p].length;
              if (match.index <= currentAccum) {
                pageNum = p + 1;
                break;
              }
            }
          }

          fileData.matches.push({
            fileName: fileData.file.name,
            term: term,
            matchedText: matchedString,
            context: resultSnippet,
            page: pageNum,
            secondaryMatches: secondaryMatches
          });

          stats.totalTerms++;
          stats.termsCount[term] = (stats.termsCount[term] || 0) + 1;
        }
      }

      fileData.status = 'completed';
    } catch (error: any) {
      fileData.status = 'error';
      fileData.error = error.message;
      stats.errors.push(`${fileData.file.name}: ${error.message}`);
    }
  }

  return { updatedFiles, searchStats: stats };
};
