
export interface SearchResult {
  fileName: string;
  term: string;
  matchedText: string; // Store the actual text found (important for Regex)
  context: string;
  page?: number;
}

export interface FileData {
  id: string;
  file: File;
  text: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  matches: SearchResult[];
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
  totalTerms: number;
  termsCount: Record<string, number>;
  errors: string[];
}
