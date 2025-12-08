
# Backend Implementation Plan - Editorial AI

## Current Architecture Status
**MVP Stage - Core Functionality Active**
- **Frontend**: React (Vite) with Tailwind CSS.
- **AI Integration**: Direct Gemini API calls from the client.
- **Content Import**: Firecrawl API for scraping Markdown from URLs.
- **Style Guide**: Hybrid model (Static Markdown Asset).

## Authentication (Firebase Auth)
*Currently: Not Implemented*
- **Requirement**: `auth` service.
- **Providers**: Google, Email/Pass, Anonymous.

## Database Schema (Firestore)
*Currently: In-memory state only*

### `users` (Collection)
```json
{
  "uid": "string",
  "email": "string",
  "preferences": {
    "defaultMode": "FAST | DEEP"
  },
  "createdAt": "timestamp"
}
```

### `analyses` (Sub-collection)
```json
{
  "id": "auto-generated",
  "originalText": "string",
  "summary": "string",
  "score": 85,
  "recommendations": [],
  "modelUsed": "gemini-3-pro-preview",
  "timestamp": "timestamp"
}
```

### `scrapedContent` (Collection - Optional)
To log scraping history or cache results.
```json
{
  "url": "string",
  "content": "string (Markdown)",
  "fetchedAt": "timestamp",
  "userId": "string"
}
```

## Storage (Firebase Storage)
- **Use Case**: User avatars or analyzing document files.

## Serverless Logic (Cloud Run / Functions)
*Currently: Client-side only*
- **Endpoint**: `POST /api/analyze` (Gemini)
- **Endpoint**: `POST /api/scrape` (Firecrawl Proxy)
  - **Purpose**: Hide the Firecrawl API Key (`fc-...`) from the client.
  - **Input**: `{ url: string }`
  - **Output**: `{ markdown: string }`

## AI & Backend Integration
- **Gemini API**: Text Analysis (Pro/Flash).
- **Firecrawl API**: Content Scraping.
  - **Key**: Managed via Secret Manager in GCP for backend calls.

## Deployment Configuration
- **Environment Variables**:
  - `VITE_API_KEY`: Google GenAI API Key.
  - `FIRECRAWL_API_KEY`: API Key for Firecrawl.
  - `PROJECT_ID`: GCP Project ID.

## Security Rules (Draft)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
