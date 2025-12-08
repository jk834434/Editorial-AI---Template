export interface Recommendation {
  id: string;
  type: 'tone' | 'grammar' | 'structure' | 'clarity';
  originalText: string;
  suggestion: string;
  reasoning: string;
}

export interface AnalysisResponse {
  summary: string;
  score: number;
  recommendations: Recommendation[];
}

export interface StyleGuide {
  name: string;
  content: string;
}

export enum AnalysisMode {
  FAST = 'FAST',
  DEEP = 'DEEP'
}
