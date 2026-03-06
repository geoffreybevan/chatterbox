# Chatterbox

A lightweight AI chat application built with **Angular 19** and **Angular Material**. Users can input prompts, submit them to the HuggingFace Inference API, and see responses displayed in a clean conversational UI.

## Features

- **Prompt input** with auto-resizing textarea and Enter-to-send
- **AI responses** via HuggingFace Inference API (Llama 3.1 8B)
- **Dynamic response display** with chat-style message bubbles
- **Loading states** with spinner indicator while the AI responds
- **Error handling** with dismissible error banner
- **Chat history** persisted in localStorage across sessions
- **Lazy-loaded messages** to keep the DOM lean with large conversation histories
- **Clear button** to reset the conversation

## Tech Stack

- Angular 19 (standalone components, signals, control flow)
- Angular Material (Material 3 theme)
- Angular CDK (text field, scrolling)
- HuggingFace Inference API (OpenAI-compatible endpoint)
- SCSS
- TypeScript (strict mode)
- Yarn (package manager)

## Prerequisites

- [Node.js](https://nodejs.org/) v20.19.0 or v22.12.0 or later (LTS recommended)
- [Yarn](https://yarnpkg.com/) v1.22 or later (or npm v9+)
- A free [HuggingFace](https://huggingface.co/) account and API token

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-username>/chatterbox.git
   cd chatterbox
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Add your HuggingFace API key**

   Edit the name of the example environment file by removing example from the filename:

   ```bash
   src/environments/environment.ts.example --> src/environments/environment.ts
   ```

   Open `src/environments/environment.ts` and replace the placeholder:

   ```ts
   export const environment = {
     production: false,
     huggingFaceApiKey: 'YOUR_HUGGINGFACE_API_KEY', // <- Replace with your actual key
     huggingFaceModel: 'meta-llama/Llama-3.1-8B-Instruct',
   };
   ```

   **Important:** `environment.ts` is excluded from git (see `.gitignore`), so your API keys will never be committed to the repository.

   Get a free token at https://huggingface.co/settings/tokens

4. **Start the dev server**

   ```bash
   yarn start
   ```

5. Open **http://localhost:4200** in your browser.

## Usage

- Type a message and press **Enter** (or click the send button) to chat with the AI.
- Press **Shift + Enter** to add a new line without sending.
- Click the **trash icon** to clear the conversation and localStorage history.

## Build

```bash
yarn build
```

Build artifacts are output to the `dist/` directory.
