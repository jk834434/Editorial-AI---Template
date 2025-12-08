
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse, AnalysisMode } from "../types";

// Fallback in case file loading fails
const FALLBACK_STYLE_GUIDE = `
1. VOICE & TONE: Authoritative but accessible. No jargon.
2. CONCISENESS: Cut unnecessary words. Use active voice.
3. HUMANITY: Avoid "AI-sounding" phrases like "delve", "tapestry", "landscape".
`;

const recommendationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief executive summary of the critique, specifically focusing on whether the text sounds artificial or human." },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique identifier" },
          type: { type: Type.STRING, enum: ['tone', 'grammar', 'structure', 'clarity'] },
          originalText: { type: Type.STRING, description: "The specific segment of text that was flagged." },
          suggestion: { type: Type.STRING, description: "The rewritten, more human version." },
          reasoning: { type: Type.STRING, description: "Reference the specific rule or pattern from the Style Guide that triggered this." }
        },
        required: ["id", "type", "originalText", "suggestion", "reasoning"]
      }
    }
  },
  required: ["summary", "recommendations"]
};

// Helper to retry failed API calls (common with experimental models or timeouts)
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Retry on 5xx errors or network-related XHR errors (code 6/aborted)
    const isRetryable = error.status >= 500 || 
                        error.message?.includes('xhr') || 
                        error.message?.includes('fetch') ||
                        error.message?.includes('network') ||
                        error.message?.includes('aborted');
                        
    if (retries > 0 && isRetryable) {
      console.warn(`Gemini API Error: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const analyzeText = async (
  text: string, 
  mode: AnalysisMode,
  styleGuideContent: string,
  explicitApiKey?: string
): Promise<AnalysisResponse> => {
  // Use explicit key if provided (manual entry), otherwise fall back to process.env (AI Studio injection)
  const apiKey = explicitApiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the settings.");
  }

  // Instantiate here to ensure we use the latest key
  const ai = new GoogleGenAI({ apiKey });

  const modelName = mode === AnalysisMode.DEEP ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
  
  const effectiveStyleGuide = styleGuideContent || FALLBACK_STYLE_GUIDE;

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: recommendationSchema,
  };

  if (mode === AnalysisMode.DEEP) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  // The style guide provided is a list of "AI Tells" (things to avoid).
  // We frame the prompt to use the guide as an exclusion list.
  const prompt = `
    You are a specialized Editor designed to humanize text.
    
    Below is a reference document titled "AI Detection Guide". It lists common patterns, words, and structures that make text look AI-generated (e.g., "delve", "tapestry", "underscoring", specific headers).
    
    YOUR TASK:
    Analyze the user's TEXT TO ANALYZE. 
    Cross-reference it against the AI Detection Guide. 
    Identify any usage of the "banned" or "suspicious" patterns found in the guide.
    Suggest changes to remove these AI artifacts and make the text sound more natural, specific, and human.

    REFERENCE DOCUMENT (AI Detection Guide):
    """
    ${effectiveStyleGuide}
    """

    TEXT TO ANALYZE:
    "${text}"

    Provide specific recommendations to fix these issues. Focus on the most impactful improvements.
  `;

  return retryOperation(async () => {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: config
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response from AI");
      }

      return JSON.parse(responseText) as AnalysisResponse;
    } catch (error) {
      console.error("Gemini Analysis Request Failed:", error);
      throw error;
    }
  });
};
