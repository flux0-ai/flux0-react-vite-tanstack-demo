# flux0-react-vite-tanstack-demo

A Vite + React + TypeScript demo showcasing real-time streaming with `@flux0-ai/react` integrated into a TanStack Router + TanStack Query application. Demonstrates session-based chat, tool call rendering, and SDK generation from Flux0's OpenAPI spec.

## Features

- **Real-time streaming** of messages and tool calls via `@flux0-ai/react[https://github.com/flux0-ai/flux0-react]`.
- **TanStack Router** for typed routing and layout management.
- **TanStack Query** for efficient data fetching and caching.
- **OpenAPI SDK generation** with `openapi-typescript` and `openapi-react-query`.
- Session creation, listing, and navigation.
- Tool call rendering with support for custom widgets.
- Persistent sessions — refresh to reload previous events.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set your Agent ID

Create a `.env` file and set your existing agent ID from your Flux0 server:

```env
VITE_AGENT_ID=<your-agent-id>
```

### 3. Start the dev server

```bash
npm run dev
```

Ensure your Flux0 server is running on port `8080` (or update `vite.config.ts` if different).

## How It Works

- On **new session**: creates a session via `/api/sessions`, navigates to `/session/{id}`, and begins streaming.
- On `/session/{id}`: loads prior events from the server and continues streaming.
- Refreshing the page preserves the session and reloads previous messages.
- Messages and tool calls are rendered in real time as they stream in.
