# Sree AI

Sree AI is a responsive AI assistant interface built with React, TypeScript, and Vite. It brings chat, coding help, document analysis, image generation, email drafting, and web search into one workspace.

## Features

- **AI chat** with selectable models and streaming responses
- **Code assistance** for generating, reviewing, and debugging code
- **Analysis and research** workflows for questions and uploaded materials
- **Image tools** for creating or transforming images
- **Email assistance** for drafting professional messages
- **Web search** with results and citations
- **File and URL input** with drag-and-drop support
- **Conversation tools** including search, export, and sharing
- **Responsive interface** for desktop, tablet, and mobile screens

AI services and some features depend on the Devv backend SDK and the provider access configured for the project. Installing the front-end dependencies alone may not configure external services.

## Technology

- React 18
- TypeScript 5.7
- Vite 6
- Tailwind CSS 3
- React Router
- Zustand
- Radix UI and shadcn-style components
- `@devvai/devv-code-backend` for AI and related integrations

## Requirements

Install a current Node.js LTS release, which includes npm. You also need internet access the first time you install the project's dependencies.

## Run locally

1. Open a terminal in the project folder (the folder containing `package.json`).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local address printed in the terminal. Vite normally uses `http://localhost:5173`.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project structure

```text
src/
├── components/   Reusable interface and feature components
├── hooks/        Custom React hooks
├── lib/          Shared utilities
├── pages/        Home, chat, and not-found pages
└── store/        Authentication and conversation state
```

## Deployment

The production build is written to `dist/`. Deploy that folder using a static hosting provider that supports Vite builds. If deploying to a subpath, configure Vite's `base` value to match the deployment path. Features that call the Devv backend or other providers also need their required service configuration and access in the deployment environment.

## Notes

- The repository should contain the source files and project configuration. Do not commit `node_modules/` or secrets such as API keys and passwords.
- The project currently has no `package-lock.json`; `npm install` will generate one. Committing the lockfile helps keep dependency installs consistent across machines.
- Choose and add a license before presenting the project as open source if you want to specify how others may reuse the code.
