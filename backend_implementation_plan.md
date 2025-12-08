
# Replit Deployment & Backend Plan - Editorial AI

## 1. Current App & Deployment Status
**Status**: Open Source Ready / MVP
**Type**: Single Page Application (React)
**Readiness**: "Fork & Run" compatible.
- The app is fully functional with client-side logic.
- External APIs (Gemini, Firecrawl) are integrated.
- **Key Management**: API keys are now managed via a client-side settings modal, stored in `localStorage` for the user's session.

## 2. Runtime & Process Model
- **Language**: Node.js (v20+)
- **Framework**: React (Vite)
- **Run Command**: `npm run dev` (Development) or `npm run build && npm run preview` (Production).
- **Port**: Listens on port `3000` or `$PORT` provided by Replit.

## 3. Authentication & User Management
*Currently: Client-side / Local State only*
- **Future Plan**: Firebase Auth or Supabase Auth if multi-user persistence is added.
- **Current Access**: Anyone with access to the deployed URL can use the app (shared API quota).

## 4. Data Layer
*Currently: In-memory & Local Storage*
- **Style Guide**: Loaded dynamically from `style_guide.md` at runtime.
- **History**: Session-based history stack for Undo functionality.
- **Secrets**: API Keys are stored in browser `localStorage`.

## 5. External Services
| Service | Purpose | Integration Method |
| :--- | :--- | :--- |
| **Google Gemini API** | Text analysis, critique, and rewriting. | `@google/genai` SDK |
| **Firecrawl API** | Scraping Markdown from URLs. | REST API (`fetch`) |

## 6. Replit Secrets & Environment Variables
For a purely client-side "Fork & Run" experience, we now allow users to enter keys in the UI. 
However, for a robust deployment, you can still pre-configure:

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `API_KEY` | **OPTIONAL** | Google Gemini API Key. If set, it pre-fills the client. |

*Note: The `style_guide.md` file is NOT a secret; it is part of the repo and defines the AI's behavior.*

## 7. Deployment Files & Config
- **package.json**: Defines dependencies (`react`, `vite`, `@google/genai`).
- **vite.config.ts**: Configures the build process.
- **index.html**: Entry point.
- **style_guide.md**: Logic configuration asset.

## 8. API Surface
Since this is currently a Client-Side App (CSA), there are no backend routes hosted by us. The frontend calls:
- `POST https://generativelanguage.googleapis.com/...` (Gemini)
- `POST https://api.firecrawl.dev/v1/scrape` (Firecrawl)

## 9. Security & Hardening
- **API Key Exposure**: Keys are stored in the user's browser `localStorage`. This is standard for "Bring Your Own Key" (BYOK) client apps but not for SaaS.
- **CORS**: Not applicable (client calls external APIs directly).

## 10. Monitoring & Debugging
- **Console Logs**: Check the browser DevTools console for API errors.
- **App Errors**: The UI displays specific messages for Network Timeouts (XHR errors) vs. General Failures.

## 11. Scaling Considerations
- **Stateless**: The app is completely stateless.
- **Rate Limits**:
  - **Gemini**: Subject to the quota of the provided `API_KEY`.
  - **Firecrawl**: Subject to the credit limit of the `FIRECRAWL_API_KEY`.
