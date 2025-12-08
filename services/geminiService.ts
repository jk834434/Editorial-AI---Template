
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
    // Attempt to extract useful info from various error shapes (SDK objects, raw JSON, etc.)
    let status = error.status || error.code || 0;
    let message = error.message || '';
    let detailsStr = '';

    // Handle nested error objects from Google API (e.g. { error: { code: 401, message: ..., details: [...] } })
    if (error.error) {
        status = error.error.code || status;
        message = error.error.message || message;
        if (error.error.details) {
            detailsStr = JSON.stringify(error.error.details);
        }
    }

    if (typeof error === 'string') {
        message = error;
    }
    
    // Check for JSON string in message (sometimes SDK wraps the JSON in the message prop)
    try {
        if (message && typeof message === 'string' && message.trim().startsWith('{')) {
            const parsed = JSON.parse(message);
            if (parsed.error) {
                status = parsed.error.code || status;
                message = parsed.error.message || message;
                if (parsed.error.details) {
                    detailsStr = JSON.stringify(parsed.error.details);
                }
            }
        }
    } catch (e) { /* ignore parse error */ }

    // Identify Client/Auth errors
    // 401: Unauthenticated, 403: Forbidden
    const isClientError = status >= 400 && status < 500;
    
    // Explicitly check for Auth/Project errors to fail fast
    // We check both the message and the detailed error reason codes
    if (message.includes("Requested entity was not found") || 
        message.includes("API keys are not supported") || 
        message.includes("CREDENTIALS_MISSING") ||
        message.includes("UNAUTHENTICATED") ||
        detailsStr.includes("CREDENTIALS_MISSING") ||
        status === 401 || 
        status === 403) {
        
        // Throw a specific, clean error for the UI to handle
        const authError = new Error("Authentication Failed: The selected Project likely does not support API Keys (Organization Policy). Please switch to a different Project or enter a valid API Key manually.");
        (authError as any).status = 401;
        throw authError;
    }

    // Only retry on network/server errors (5xx) or transient fetch issues
    const isRetryable = status >= 500 || 
                        message.includes('xhr') || 
                        message.includes('fetch') ||
                        message.includes('network') ||
                        message.includes('aborted');
                        
    if (retries > 0 && isRetryable) {
      console.warn(`Gemini API Error: ${message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    
    // If not retryable or retries exhausted, throw a clean error
    const finalError = new Error(message || "Unknown API Error");
    (finalError as any).status = status;
    throw finalError;
  }
}

export const analyzeText = async (
  text: string, 
  mode: AnalysisMode,
  styleGuideContent: string,
  explicitApiKey?: string
): Promise<AnalysisResponse> => {
  // Safely retrieve env key (handle browsers where process might be undefined)
  const envKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
  
  // Use explicit key if provided, otherwise fall back to environment
  let apiKey = explicitApiKey || envKey;
  
  if (apiKey) {
    apiKey = apiKey.trim();
  }

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
    } catch (error: any) {
      // Logic moved to retryOperation for consistency, but we catch here to log context if needed
      throw error;
    }
  });
};
