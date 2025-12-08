# Editorial AI

**Editorial AI** is a focused, distraction-free writing assistant designed to humanize AI-generated text. Unlike standard grammar checkers, it uses deep reasoning models to analyze tone, structure, and "AI tells" (words and patterns commonly used by LLMs) to help you write with more character and specificity.

Built with **React**, **Tailwind CSS**, and the **Google Gemini API**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

- **Split-Screen Workflow**: Write on the left, receive critiques on the right.
- **Deep Reasoning Engine**: Uses `gemini-3-pro-preview` with a high thinking budget to cross-reference text against a complex style guide.
- **Interactive Editing**:
  - **Highlighting**: Hover over a recommendation to see exactly where it applies in your text.
  - **Auto-Scroll**: The editor automatically scrolls to the relevant section when reviewing feedback.
  - **One-Click Fixes**: Apply individual suggestions or all of them at once.
- **Content Import**:
  - Paste text directly.
  - **URL Import**: Enter a blog post URL to scrape and strip formatting (powered by Firecrawl).
  - **Intelligent Paste**: Automatically detects if you paste a bare URL and opens the import tray.
- **Dynamic Style Guide**: The AI critiques based on `style_guide.md`. Modify this file to change the editor's personality.

## 🛠️ Tech Stack

- **Frontend**: React 19 (ES Modules)
- **Styling**: Tailwind CSS (via CDN for lightweight setup, or PostCSS for production)
- **AI**: Google GenAI SDK (`@google/genai`)
- **Scraping**: Firecrawl API
- **Fonts**: Cormorant Garamond (Serif), Space Grotesk (Sans), Space Mono (Editor)

## 🚀 Getting Started

### Prerequisites

1.  **Node.js** (v18+)
2.  **Google AI Studio API Key**: Get one [here](https://aistudiocdn.com/google-ai-studio).
3.  **Firecrawl API Key** (Optional): For the URL import feature. Get one [here](https://firecrawl.dev).

### Installation

1.  **Fork or Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/editorial-ai.git
    cd editorial-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root directory (or use Replit Secrets):
    ```env
    API_KEY=your_google_gemini_api_key
    FIRECRAWL_API_KEY=your_firecrawl_api_key
    ```
    *Note: The application expects `process.env.API_KEY` to be available.*

4.  **Run the application**:
    ```bash
    npm run dev
    ```

## 📖 How to Customize

### The Style Guide
The core intelligence of the app lives in `style_guide.md` at the root of the project. This file contains the "Anti-Patterns" the AI looks for.

To change how the AI critiques your writing:
1. Open `style_guide.md`.
2. Add your own rules (e.g., "Avoid passive voice," "Don't use the word 'synergy'").
3. The app automatically loads this file on startup.

### Analysis Models
The app uses two modes defined in `services/geminiService.ts`:
- **Flash (Fast)**: Uses `gemini-2.5-flash` for quick grammar and tone checks.
- **Deep Think (Pro)**: Uses `gemini-3-pro-preview` with `thinkingBudget: 32768` for complex structural critique.

## 🤝 Contributing

Contributions are welcome!
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.