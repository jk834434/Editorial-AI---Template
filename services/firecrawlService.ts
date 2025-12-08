
export interface ScrapeResult {
  markdown: string;
  metadata?: any;
}

// Helper to strip Markdown syntax for a plain text experience
function removeMarkdown(md: string): string {
  try {
    let text = md;

    // 1. Remove headers (e.g., # Header, ## Header)
    text = text.replace(/^#+\s+/gm, '');

    // 2. Remove bold/italic (e.g., **text**, *text*, __text__, _text_)
    // We run this twice to handle nested or mixed cases reasonably well
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');

    // 3. Remove images (e.g., ![alt](url)) - keep alt text if present
    text = text.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1');

    // 4. Remove links (e.g., [text](url)) - keep text
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

    // 5. Remove blockquotes (e.g., > text)
    text = text.replace(/^>\s+/gm, '');

    // 6. Remove code block fences (```) but keep content
    text = text.replace(/```/g, '');

    // 7. Remove inline code backticks (`text`)
    text = text.replace(/`([^`]+)`/g, '$1');

    // 8. Remove horizontal rules (---, ***)
    text = text.replace(/^[-*_]{3,}\s*$/gm, '');

    // 9. Remove unordered list markers (*, -, +)
    // We replace them with nothing or a simple space to keep the item flow
    text = text.replace(/^[\s-]*[-*+]\s+/gm, '');

    return text.trim();
  } catch (e) {
    console.warn("Failed to strip markdown, returning original:", e);
    return md;
  }
}

export const scrapeContentFromUrl = async (targetUrl: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Firecrawl API Key is required for URL imports.");
  }

  const endpoint = 'https://api.firecrawl.dev/v1/scrape';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ['markdown'],
        onlyMainContent: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Scrape failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Firecrawl v1 response structure: { success: true, data: { markdown: "...", ... } }
    if (!data.success || !data.data || !data.data.markdown) {
      throw new Error("Invalid response format from scraper");
    }

    // Return the cleaned plain text
    return removeMarkdown(data.data.markdown);
  } catch (error) {
    console.error("Firecrawl Service Error:", error);
    throw error;
  }
};
