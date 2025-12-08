
import React, { useState, useEffect, useRef } from 'react';
import { analyzeText } from './services/geminiService';
import { scrapeContentFromUrl } from './services/firecrawlService';
import { AnalysisResponse, AnalysisMode, Recommendation } from './types';

// Icons
const SparkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.97-3.29"/><path d="M19.97 14.71a4 4 0 0 1-1.97 3.29"/></svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const DoubleCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
);

const ArrowUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

const App = () => {
  const [text, setText] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.DEEP);
  const [showMobileAnalysis, setShowMobileAnalysis] = useState(false);
  const [styleGuideContent, setStyleGuideContent] = useState<string>("");
  const [hoveredText, setHoveredText] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());
  
  // URL Import State
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // API Key Management State
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [firecrawlApiKey, setFirecrawlApiKey] = useState("");
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load the style guide content
    fetch('/style_guide.md')
      .then(res => res.text())
      .then(text => setStyleGuideContent(text))
      .catch(err => console.error("Failed to load style guide:", err));

    // Initialize API Keys
    const storedGeminiKey = localStorage.getItem('gemini_api_key');
    const storedFirecrawlKey = localStorage.getItem('firecrawl_api_key');

    // Check for AI Studio environment
    if ((window as any).aistudio) {
        // In AI Studio, keys are often injected via process.env, 
        // but we should check if one is explicitly selected.
        (window as any).aistudio.hasSelectedApiKey().then((hasKey: boolean) => {
            if (hasKey) {
                // Key is selected, we are good to go on the Gemini front
                // Still might need Firecrawl key, but we won't block main usage
                if (storedFirecrawlKey) setFirecrawlApiKey(storedFirecrawlKey);
            } else {
                // Need to select key
                setShowWelcomeModal(true);
            }
        });
    } else {
        // Standard Web Environment
        if (storedGeminiKey) {
            setGeminiApiKey(storedGeminiKey);
            if (storedFirecrawlKey) setFirecrawlApiKey(storedFirecrawlKey);
        } else {
            setShowWelcomeModal(true);
        }
    }
  }, []);

  // Effect to scroll to hovered text
  useEffect(() => {
    if (hoveredText && backdropRef.current && textareaRef.current) {
        const span = backdropRef.current.querySelector('[data-highlight="true"]') as HTMLElement;
        if (span) {
            const top = span.offsetTop;
            textareaRef.current.scrollTo({
                top: Math.max(0, top - 150), 
                behavior: 'smooth'
            });
        }
    }
  }, [hoveredText]);

  // Effect to focus URL input when shown
  useEffect(() => {
    if (showUrlInput && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [showUrlInput]);

  const handleSaveKeys = async () => {
    if ((window as any).aistudio) {
        // AI Studio Flow
        try {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) {
                 await (window as any).aistudio.openSelectKey();
            }
        } catch (e) {
            console.error("AI Studio Key Selection Failed", e);
        }
    } else {
        // Standard Flow
        if (geminiApiKey.trim()) {
            localStorage.setItem('gemini_api_key', geminiApiKey);
        }
    }

    if (firecrawlApiKey.trim()) {
        localStorage.setItem('firecrawl_api_key', firecrawlApiKey);
    }

    setShowWelcomeModal(false);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setAppliedRecs(new Set()); 
    setShowMobileAnalysis(true); 

    try {
      // Pass the state key directly. If empty (AI Studio), service will fallback to process.env
      await analyzeText(text, mode, styleGuideContent, geminiApiKey);
      // We need to fetch the result again? No, analyzeText returns it.
      // Wait, I missed assigning the result in the try block logic above?
      // Ah, I need to call it and set state.
      const result = await analyzeText(text, mode, styleGuideContent, geminiApiKey);
      setAnalysis(result);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScrape = async () => {
    if (!urlInput.trim()) return;
    
    if (!firecrawlApiKey) {
        setScrapeError("Firecrawl API Key missing. Click Settings to configure.");
        return;
    }

    setIsScraping(true);
    setScrapeError(null);

    try {
      const content = await scrapeContentFromUrl(urlInput, firecrawlApiKey);
      addToHistory(text); 
      setText(content);
      setShowUrlInput(false);
      setUrlInput("");
    } catch (err: any) {
      setScrapeError(err.message || "Failed to fetch content.");
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  const addToHistory = (currentText: string) => {
    setHistory(prev => [...prev, currentText]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousText = history[history.length - 1];
    setText(previousText);
    setHistory(prev => prev.slice(0, -1));
  };

  const applyRecommendation = (rec: Recommendation) => {
    if (text.includes(rec.originalText)) {
      addToHistory(text);
      setText(text.replace(rec.originalText, rec.suggestion));
      setAppliedRecs(prev => new Set(prev).add(rec.id));
    }
  };

  const applyAllRecommendations = () => {
    if (!analysis) return;
    addToHistory(text);
    let currentText = text;
    let appliedCount = 0;
    const newAppliedIds = new Set(appliedRecs);

    analysis.recommendations.forEach((rec) => {
      if (currentText.includes(rec.originalText)) {
        currentText = currentText.replace(rec.originalText, rec.suggestion);
        newAppliedIds.add(rec.id);
        appliedCount++;
      }
    });

    if (appliedCount > 0) {
      setText(currentText);
      setAppliedRecs(newAppliedIds);
    } else {
        setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
        const scrollTop = textareaRef.current.scrollTop;
        backdropRef.current.scrollTop = scrollTop;
        setShowBackToTop(scrollTop > 300);
    }
  };

  const scrollToTop = () => {
    if (textareaRef.current) {
        textareaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!text.trim()) {
      const pastedData = e.clipboardData.getData('text');
      const isUrl = /^(https?:\/\/[^\s]+)$/.test(pastedData.trim());
      
      if (isUrl) {
        e.preventDefault();
        setShowUrlInput(true);
        setUrlInput(pastedData.trim());
      }
    }
  };

  const renderBackdrop = () => {
    const className = "font-mono-edit text-base md:text-lg leading-relaxed whitespace-pre-wrap break-words p-6 md:p-12 w-full h-full";
    if (!hoveredText) {
        return (
            <div className={`${className} text-transparent`}>
                {text}{text.endsWith('\n') && <br />}
            </div>
        );
    }
    const parts = text.split(hoveredText);
    return (
        <div className={`${className} text-transparent`}>
            {parts.map((part, i) => (
                <React.Fragment key={i}>
                    {part}
                    {i < parts.length - 1 && (
                        <span className="bg-[#e7e5e4] rounded-sm transition-colors duration-200" data-highlight="true">{hoveredText}</span>
                    )}
                </React.Fragment>
            ))}
             {text.endsWith('\n') && <br />}
        </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F7F5F0] text-[#292524]">
      
      {/* Welcome / Config Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292524]/40 backdrop-blur-sm p-4">
            <div className="bg-[#F7F5F0] w-full max-w-md p-8 border border-[#D6D3D1] shadow-2xl rounded-sm">
                <div className="flex flex-col items-center mb-6">
                    <h2 className="font-serif-display text-3xl italic font-bold mb-2">Editorial AI</h2>
                    <p className="font-sans-tech text-sm text-[#78716C] uppercase tracking-widest">Setup Configuration</p>
                </div>
                
                <div className="space-y-6">
                    {/* Gemini Key Section */}
                    <div>
                        <label className="block font-sans-tech text-xs font-bold uppercase tracking-wider mb-2 text-[#57534E]">
                            Google Gemini API
                        </label>
                        {(window as any).aistudio ? (
                             <button
                                onClick={() => (window as any).aistudio.openSelectKey()}
                                className="w-full py-2 bg-[#E7E5E4] hover:bg-white border border-[#D6D3D1] rounded font-sans-tech text-sm text-[#292524] transition-colors"
                             >
                                Connect Google Cloud Project
                             </button>
                        ) : (
                            <input 
                                type="password" 
                                value={geminiApiKey}
                                onChange={(e) => setGeminiApiKey(e.target.value)}
                                placeholder="Enter your Gemini API Key"
                                className="w-full p-3 bg-white border border-[#D6D3D1] rounded font-mono-edit text-sm focus:outline-none focus:border-[#292524]"
                            />
                        )}
                        <p className="text-[10px] text-[#A8A29E] mt-1.5 font-sans-tech">
                           {(window as any).aistudio ? "Select a billed project to enable Deep Reasoning." : "Required for text analysis."}
                        </p>
                    </div>

                    {/* Firecrawl Key Section */}
                    <div>
                        <label className="block font-sans-tech text-xs font-bold uppercase tracking-wider mb-2 text-[#57534E]">
                            Firecrawl API (Optional)
                        </label>
                        <input 
                            type="password" 
                            value={firecrawlApiKey}
                            onChange={(e) => setFirecrawlApiKey(e.target.value)}
                            placeholder="fc-..."
                            className="w-full p-3 bg-white border border-[#D6D3D1] rounded font-mono-edit text-sm focus:outline-none focus:border-[#292524]"
                        />
                        <p className="text-[10px] text-[#A8A29E] mt-1.5 font-sans-tech">
                            Required only if you want to import content from URLs.
                        </p>
                    </div>

                    <button 
                        onClick={handleSaveKeys}
                        className="w-full py-3 bg-[#292524] text-[#F7F5F0] font-sans-tech text-sm uppercase tracking-widest font-bold hover:bg-[#44403C] transition-colors rounded-sm"
                    >
                        Save & Start Writing
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Left Panel: Editor */}
      <div className={`
        flex-col border-r border-[#D6D3D1] relative h-full transition-all duration-300
        ${showMobileAnalysis ? 'hidden md:flex' : 'flex'} 
        md:w-1/2
      `}>
        <header className="flex-col border-b border-[#D6D3D1] bg-[#F7F5F0] shrink-0 z-20">
            <div className="h-16 flex items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-4">
                    <h1 className="font-serif-display text-xl md:text-2xl tracking-tight italic font-semibold">Editorial AI</h1>
                    <div className="flex gap-1">
                        {history.length > 0 && (
                            <button 
                                onClick={handleUndo}
                                className="p-1.5 text-[#78716C] hover:text-[#292524] hover:bg-[#E7E5E4] rounded-md transition-all"
                                title="Undo last change"
                            >
                                <UndoIcon />
                            </button>
                        )}
                        <button 
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            className={`p-1.5 rounded-md transition-all ${showUrlInput ? 'bg-[#292524] text-[#F7F5F0]' : 'text-[#78716C] hover:text-[#292524] hover:bg-[#E7E5E4]'}`}
                            title="Import from URL"
                        >
                            <LinkIcon />
                        </button>
                        <button 
                            onClick={() => setShowWelcomeModal(true)}
                            className="p-1.5 text-[#78716C] hover:text-[#292524] hover:bg-[#E7E5E4] rounded-md transition-all"
                            title="Settings"
                        >
                            <SettingsIcon />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-[#E7E5E4] p-1 rounded-lg">
                    <button 
                    onClick={() => setMode(AnalysisMode.FAST)}
                    className={`px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-sans-tech uppercase tracking-wider font-semibold rounded-md transition-all ${mode === AnalysisMode.FAST ? 'bg-white shadow-sm text-black' : 'text-[#78716C] hover:text-black'}`}
                    >
                    <span className="flex items-center gap-1 md:gap-2">
                        <SparkIcon /> <span className="hidden sm:inline">Flash</span>
                    </span>
                    </button>
                    <button 
                    onClick={() => setMode(AnalysisMode.DEEP)}
                    className={`px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-sans-tech uppercase tracking-wider font-semibold rounded-md transition-all ${mode === AnalysisMode.DEEP ? 'bg-white shadow-sm text-black' : 'text-[#78716C] hover:text-black'}`}
                    >
                    <span className="flex items-center gap-1 md:gap-2">
                        <BrainIcon /> <span className="hidden sm:inline">Deep Think</span>
                    </span>
                    </button>
                </div>
            </div>

            {/* URL Input Slide-down */}
            <div className={`
                overflow-hidden transition-all duration-300 ease-in-out bg-[#E7E5E4] border-t border-[#D6D3D1]
                ${showUrlInput ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}
            `}>
                <div className="flex items-center gap-2 px-4 py-3 md:px-8">
                    <input 
                        ref={urlInputRef}
                        type="url" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/blog-post"
                        className="flex-1 bg-white border border-[#D6D3D1] rounded-md px-3 py-1.5 text-sm font-sans-tech focus:outline-none focus:border-[#292524] placeholder-[#A8A29E]"
                        onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                    />
                    <button 
                        onClick={handleScrape}
                        disabled={isScraping || !urlInput.trim()}
                        className="bg-[#292524] text-[#F7F5F0] px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#44403C] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isScraping ? (
                            <>Loading...</>
                        ) : (
                            <>Import <DownloadIcon /></>
                        )}
                    </button>
                </div>
                {scrapeError && (
                    <div className="px-4 md:px-8 pb-3 text-xs text-red-600 font-sans-tech font-medium">
                        {scrapeError}
                    </div>
                )}
            </div>
        </header>

        {/* Editor Area with Backdrop for Highlights */}
        <div className="relative flex-1 w-full overflow-hidden bg-[#F7F5F0]">
            {/* Backdrop Layer */}
            <div 
                ref={backdropRef}
                className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
                aria-hidden="true"
            >
                {renderBackdrop()}
            </div>

            {/* Actual Textarea Layer */}
            <textarea
                ref={textareaRef}
                className="absolute inset-0 z-10 w-full h-full p-6 md:p-12 resize-none outline-none font-mono-edit text-base md:text-lg leading-relaxed bg-transparent text-[#292524] placeholder-[#A8A29E] break-words whitespace-pre-wrap"
                placeholder="Start writing, paste text, or import a URL..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onScroll={handleScroll}
                onPaste={handlePaste}
                spellCheck={false}
            />
        </div>

        {/* Analyze Button */}
        <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-30 pointer-events-auto">
            <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className={`
                    group flex items-center gap-2 md:gap-3 px-5 py-3 md:px-6 md:py-4 rounded-full 
                    font-sans-tech text-xs md:text-sm uppercase tracking-widest font-bold 
                    transition-all duration-300 shadow-lg
                    ${isAnalyzing 
                        ? 'bg-[#E7E5E4] text-[#78716C] cursor-not-allowed' 
                        : 'bg-[#292524] text-[#F7F5F0] hover:bg-[#44403C] hover:scale-105'}
                `}
            >
                {isAnalyzing ? (
                    <>Processing...</>
                ) : (
                    <>
                        {analysis ? 'Re-analyze' : 'Analyze'} 
                        {analysis ? <RefreshIcon /> : <ArrowRightIcon />}
                    </>
                )}
            </button>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:bottom-8 z-30 pointer-events-auto">
                <button
                    onClick={scrollToTop}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E7E5E4]/90 backdrop-blur-sm text-[#57534E] rounded-full shadow-md hover:bg-white hover:text-black transition-all font-sans-tech text-xs uppercase tracking-wider font-bold"
                >
                    <ArrowUpIcon /> Top
                </button>
             </div>
        )}
      </div>

      {/* Right Panel: Analysis */}
      <div className={`
        flex-col bg-[#E7E5E4] h-full overflow-y-auto transition-all duration-300
        ${showMobileAnalysis ? 'flex w-full md:w-1/2' : 'hidden md:flex md:w-1/2'}
      `}>
        {/* Mobile Header for Analysis View */}
        <div className="md:hidden flex items-center h-14 px-4 border-b border-[#D6D3D1] bg-[#E7E5E4] shrink-0 sticky top-0 z-20">
            <button 
                onClick={() => setShowMobileAnalysis(false)} 
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#57534E] hover:text-black"
            >
                <ArrowLeftIcon /> Back to Editor
            </button>
        </div>

        {!analysis && !isAnalyzing && !error && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center text-[#78716C]">
                <div className="w-16 h-16 border-2 border-[#D6D3D1] rounded-full flex items-center justify-center mb-6">
                    <span className="font-serif-display italic text-2xl">i</span>
                </div>
                <h3 className="font-sans-tech text-lg font-medium mb-2 uppercase tracking-wide">Ready to Edit</h3>
                <p className="font-serif-display text-xl max-w-md leading-normal">
                    Select your mode and hit analyze. Deep Think mode uses extensive reasoning to find patterns based on the style guide.
                </p>
                {!styleGuideContent && (
                  <p className="mt-4 text-xs font-mono-edit text-orange-800 bg-orange-100/50 px-2 py-1 rounded">
                    Loading Style Guide...
                  </p>
                )}
            </div>
        )}

        {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
                <div className="w-12 h-12 border-t-2 border-l-2 border-[#292524] rounded-full animate-spin mb-6"></div>
                <p className="font-sans-tech text-sm uppercase tracking-widest animate-pulse">
                    {mode === AnalysisMode.DEEP ? "Checking against Style Guide..." : "Analyzing..."}
                </p>
            </div>
        )}

        {error && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-800 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="font-sans-tech text-lg font-medium mb-2 uppercase tracking-wide text-red-900">Analysis Error</h3>
                <p className="font-serif-display text-xl max-w-md leading-normal text-red-800 mb-6">
                   {error.includes("xhr") || error.includes("fetch") ? "The connection timed out while the AI was thinking deep. Please try again." : "Something went wrong with the AI service."}
                </p>
                <button 
                    onClick={handleAnalyze}
                    className="px-6 py-3 bg-[#292524] text-[#F7F5F0] rounded-full font-sans-tech uppercase tracking-widest text-xs font-bold hover:bg-[#44403C]"
                >
                    Try Again
                </button>
            </div>
        )}

        {analysis && (
            <div className="p-6 md:p-10 space-y-8 md:space-y-10 pb-20 md:pb-10">
                {/* Summary Section */}
                <div className="border-b border-[#D6D3D1] pb-6 md:pb-8">
                    <div className="flex items-baseline justify-between mb-4 md:mb-6">
                        <h2 className="font-serif-display text-3xl md:text-4xl italic">Critique</h2>
                    </div>
                    <p className="font-sans-tech text-base md:text-lg leading-relaxed text-[#44403C]">
                        {analysis.summary}
                    </p>
                </div>

                {/* Recommendations List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans-tech text-xs uppercase tracking-widest text-[#78716C]">
                            Recommendations ({analysis.recommendations.length - appliedRecs.size} remaining)
                        </h3>
                        {analysis.recommendations.length > 0 && appliedRecs.size < analysis.recommendations.length && (
                            <button
                                onClick={applyAllRecommendations}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#292524] text-[#F7F5F0] text-[10px] md:text-xs font-sans-tech font-bold uppercase tracking-wider rounded-md hover:bg-[#44403C] transition-colors shadow-sm"
                            >
                                Apply All <DoubleCheckIcon />
                            </button>
                        )}
                    </div>
                    
                    {analysis.recommendations.map((rec) => {
                        const isApplied = appliedRecs.has(rec.id);
                        return (
                            <div 
                                key={rec.id} 
                                className={`
                                    p-5 md:p-6 rounded-none border transition-all duration-300
                                    ${isApplied 
                                        ? 'bg-[#E7E5E4] border-transparent opacity-50 cursor-not-allowed' 
                                        : 'bg-[#F7F5F0] shadow-sm hover:shadow-md border-transparent hover:border-[#D6D3D1] group cursor-default'
                                    }
                                `}
                                onMouseEnter={() => !isApplied && setHoveredText(rec.originalText)}
                                onMouseLeave={() => !isApplied && setHoveredText(null)}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className={`
                                        px-2 py-1 text-[10px] font-mono-edit uppercase tracking-wider border
                                        ${isApplied 
                                            ? 'border-[#78716C] text-[#78716C]'
                                            : `
                                                ${rec.type === 'tone' ? 'border-orange-900 text-orange-900' : ''}
                                                ${rec.type === 'clarity' ? 'border-green-900 text-green-900' : ''}
                                                ${rec.type === 'grammar' ? 'border-red-900 text-red-900' : ''}
                                                ${rec.type === 'structure' ? 'border-blue-900 text-blue-900' : ''}
                                            `
                                        }
                                    `}>
                                        {rec.type} {isApplied && "- APPLIED"}
                                    </span>
                                    
                                    {!isApplied ? (
                                        <button 
                                            onClick={() => applyRecommendation(rec)}
                                            className="text-[#78716C] md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1 text-[10px] md:text-xs font-sans-tech font-bold uppercase tracking-wider hover:text-[#292524] transition-all"
                                        >
                                            Apply <CheckIcon />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1 text-[10px] md:text-xs font-sans-tech font-bold uppercase tracking-wider text-[#78716C]">
                                            <CheckIcon />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mb-4 space-y-2">
                                    <div className={`font-mono-edit text-sm inline-block px-1 break-all ${isApplied ? 'text-[#A8A29E] line-through' : 'line-through decoration-[#EF4444]/50 text-[#78716C] bg-red-50/50'}`}>
                                        {rec.originalText}
                                    </div>
                                    <div className={`font-medium font-mono-edit text-sm inline-block px-1 break-all ${isApplied ? 'text-[#78716C]' : 'text-[#292524] bg-green-50/50'}`}>
                                        {rec.suggestion}
                                    </div>
                                </div>

                                <p className={`font-sans-tech text-sm leading-relaxed ${isApplied ? 'text-[#A8A29E]' : 'text-[#57534E]'}`}>
                                    {rec.reasoning}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
