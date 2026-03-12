
import { FileData, SearchStats } from '../types';
import { jsPDF } from 'jspdf';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType 
} from 'docx';

export const exportToCSV = (files: FileData[]) => {
  const headers = [
    'Path_Nombre_Archivo', 
    'Errores_Lectura', 
    'OCR_Aplicado', 
    'DETECTADOS_Sin_Contexto', 
    'DETECTADOS_Con_Contexto', 
    'Nro_Resolución', 
    'Fecha_Emisión', 
    'Texto_Visto_Hasta_Considerando'
  ];
  
  const rows = files.map(f => {
    const matchCounts: Record<string, number> = {};
    const matchCountsUnique: Record<string, number> = {};
    
    f.matches.forEach(m => {
      // Unique counts (only triggers)
      matchCountsUnique[m.matchedText] = (matchCountsUnique[m.matchedText] || 0) + 1;
      
      // Total counts (trigger + secondary)
      matchCounts[m.matchedText] = (matchCounts[m.matchedText] || 0) + 1;
      
      if (m.secondaryMatches) {
        m.secondaryMatches.forEach(sm => {
          matchCounts[sm.matchedText] = (matchCounts[sm.matchedText] || 0) + 1;
        });
      }
    });

    const counterStrUnique = Object.entries(matchCountsUnique).map(([text, count]) => `${text} : ${count}`).join(' | ');
    const counterStrTotal = Object.entries(matchCounts).map(([text, count]) => `${text} : ${count}`).join(' | ');

    const uppercaseText = f.text.toUpperCase();
    const resIdx = uppercaseText.indexOf('RESOLUCIÓN');
    const vistoIdx = uppercaseText.indexOf('VISTO');
    
    let resolucion = '';
    if (resIdx !== -1) {
      const endIdx = (vistoIdx !== -1 && vistoIdx > resIdx) ? vistoIdx : (resIdx + 200);
      resolucion = f.text.slice(resIdx, endIdx).trim();
    } else {
      resolucion = f.file.name;
    }

    const considerandoIndex = uppercaseText.indexOf('CONSIDERANDO', vistoIdx !== -1 ? vistoIdx : 0);
    const vistoTexto = (vistoIdx !== -1 && considerandoIndex !== -1) 
      ? f.text.slice(vistoIdx + 5, considerandoIndex).trim().slice(0, 1000) 
      : '';

    const csvSafe = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;

    // Actualización de la fórmula HYPERLINK solicitada
    const hyperlinkFormula = `=HYPERLINK("C:\\Users\\vn\\Desktop\\resoluciones\\${f.file.name}"; "${f.file.name}")`;

    return [
      csvSafe(hyperlinkFormula),
      csvSafe(f.error ? 'SÍ' : 'NO'),
      csvSafe(f.ocrApplied ? 'SÍ' : 'NO'),
      csvSafe(counterStrUnique),
      csvSafe(counterStrTotal),
      csvSafe(resolucion.replace(/(\r\n|\n|\r)/gm, " ")),
      csvSafe(f.metadata.fechaEmision || ''),
      csvSafe(vistoTexto.replace(/(\r\n|\n|\r)/gm, " "))
    ];
  });

  const csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `analisis_detallado_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportErrorReport = (files: FileData[]) => {
  const errorFiles = files.filter(f => f.status === 'error' || f.error);
  if (errorFiles.length === 0) return;

  const headers = ['Archivo', 'Motivo_del_Error'];
  const rows = errorFiles.map(f => [
    `"${f.file.name.replace(/"/g, '""')}"`,
    `"${(f.error || 'Error desconocido, su contenido no es texto leíble').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
  const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `informe_errores_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = async (files: FileData[], stats: SearchStats) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  const renderRichText = (parts: {text: string, color: [number, number, number], bg?: boolean}[], startY: number): number => {
    let currentX = margin + 5;
    let currentY = startY;
    const lineHeight = 6;
    doc.setFontSize(9);

    parts.forEach(part => {
      const words = part.text.split(/(\s+)/);
      words.forEach(word => {
        const wordWidth = doc.getTextWidth(word);
        if (currentX + wordWidth > pageWidth - margin) {
          currentX = margin + 5;
          currentY += lineHeight;
        }

        if (currentY > 280) {
            doc.addPage();
            currentY = 20;
            currentX = margin + 5;
        }

        if (part.bg) {
          doc.setFillColor(255, 255, 0);
          doc.rect(currentX, currentY - 3.5, wordWidth, 4.5, 'F');
        }
        
        doc.setTextColor(part.color[0], part.color[1], part.color[2]);
        doc.text(word, currentX, currentY);
        currentX += wordWidth;
      });
    });
    
    return currentY + lineHeight;
  };

  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text("INFORME DE BÚSQUEDA", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado: ${new Date().toLocaleString('es-AR', { hour12: false })}`, pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("ESTADÍSTICAS GENERALES", margin, 45);
  
  doc.setFontSize(11);
  let y = 55;
  doc.text(`Total archivos procesados: ${stats.totalFiles}`, margin + 5, y); y += 7;
  Object.entries(stats.filesByType).forEach(([ext, count]) => {
    doc.text(`  - ${ext.toUpperCase()}: ${count}`, margin + 10, y); y += 6;
  });
  
  y += 4;
  doc.text(`DETECTADOS, sin computar el contexto: ${stats.totalTermsUnique}`, margin + 5, y); y += 7;
  Object.entries(stats.termsCountUnique).forEach(([term, count]) => {
    doc.text(`  - ${term}: ${count}`, margin + 10, y); y += 6;
  });
  
  y += 4;
  doc.text(`DETECTADOS, computando las repeticiones dentro del contexto: ${stats.totalTerms}`, margin + 5, y); y += 7;
  Object.entries(stats.termsCount).forEach(([term, count]) => {
    doc.text(`  - ${term}: ${count}`, margin + 10, y); y += 6;
  });

  if (stats.errors.length > 0) {
    y += 10;
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(14);
    doc.text("ARCHIVOS CON ERRORES / DAÑADOS", margin, y); y += 10;
    doc.setFontSize(10);
    stats.errors.forEach(err => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`  • ${err}`, margin + 5, y); y += 6;
    });
    doc.setTextColor(0);
  }

  doc.addPage();
  y = 20;
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text("HALLAZGOS DETALLADOS", margin, y); y += 10;

  files.forEach(f => {
    if (f.matches.length === 0) return;
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 255);
    doc.setFont(undefined, 'bold');
    doc.text(`ARCHIVO: ${f.file.name}`, margin, y); y += 6;
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont(undefined, 'normal');
    doc.text(`Fecha Emisión: ${f.metadata.fechaEmision || 'No detectada'}`, margin + 5, y); y += 8;

    f.matches.forEach(m => {
      if (y > 250) { doc.addPage(); y = 20; }
      
      const raw = m.context;
      const regex = /(\[\[ELLIPSIS\]\]|>>>|<<<|\[\[\[|\]\]\])/g;
      const split = raw.split(regex);
      
      const richParts: {text: string, color: [number, number, number], bg?: boolean}[] = [];
      let currentMode: 'normal' | 'trigger' | 'other' = 'normal';

      split.forEach(segment => {
        if (segment === '[[ELLIPSIS]]') {
          richParts.push({ text: '...', color: [220, 38, 38], bg: true });
        } else if (segment === '>>>') {
          currentMode = 'trigger';
        } else if (segment === '<<<') {
          currentMode = 'normal';
        } else if (segment === '[[[') {
          currentMode = 'other';
        } else if (segment === ']]]') {
          currentMode = 'normal';
        } else if (segment.length > 0) {
          const color: [number, number, number] = 
            currentMode === 'trigger' ? [220, 38, 38] :
            currentMode === 'other' ? [37, 99, 235] : [0, 0, 0];
          richParts.push({ text: segment, color });
        }
      });

      y = renderRichText(richParts, y);
      y += 4;
    });
    y += 6;
  });

  doc.save(`informe_analisis_${new Date().getTime()}.pdf`);
};

export const exportToDocx = async (files: FileData[]) => {
  const sections = [{
    properties: {},
    children: [
      new Paragraph({
        text: "INFORME DE BÚSQUEDA",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Generado el: ${new Date().toLocaleString('es-AR', { hour12: false })}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "", spacing: { after: 200 } }),
      ...files.filter(f => f.matches.length > 0).flatMap(f => [
        new Paragraph({
          children: [
            new TextRun({
              text: `ARCHIVO: ${f.file.name}`,
              bold: true,
              color: "0000FF",
              size: 20,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 100 },
        }),
        ...f.matches.map(m => {
            const cleanContext = m.context.replace(/\[\[ELLIPSIS\]\]/g, "...").replace(/>>>|<<<|\[\[\[|\]\]\]/g, "");
            return new Paragraph({
                children: [
                    new TextRun({
                        text: `└─ Hallazgo: ${m.matchedText}`,
                        bold: true,
                        size: 20,
                        font: "Arial",
                    }),
                    new TextRun({
                        text: ` | Contexto: ${cleanContext}`,
                        size: 20,
                        font: "Arial",
                    })
                ],
                alignment: AlignmentType.BOTH,
                spacing: { after: 120 },
                indent: { left: 720 },
            });
        })
      ])
    ],
  }];

  const doc = new Document({ sections });

  Packer.toBlob(doc).then((blob: Blob) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `informe_word_${new Date().getTime()}.docx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
