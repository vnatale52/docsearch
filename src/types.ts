
export interface SearchResult {
  fileName: string;
  term: string;
  matchedText: string; // Store the actual text found (important for Regex)
  context: string;
  page?: number;
  secondaryMatches: { term: string; matchedText: string }[];
}

export interface FileData {
  id: string;
  file: File;
  text: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  matches: SearchResult[];
  ocrApplied?: boolean;
  metadata: {
    fechaEmision?: string;
    resolucionNro?: string;
    extension: string;
    size: number;
  };
}

export interface SearchStats {
  totalFiles: number;
  filesByType: Record<string, number>;
  totalTerms: number; // This will remain as the "computando repeticiones" count
  totalTermsUnique: number; // New: "sin computar el contexto"
  termsCount: Record<string, number>; // Total counts
  termsCountUnique: Record<string, number>; // Unique counts
  errors: string[];
  ocrFilesCount: number;
}
