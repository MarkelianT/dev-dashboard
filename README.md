# Dev Dashboard

A modern, purple-themed developer dashboard built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- GitHub profile card
- Recent repositories
- GitHub activity with date-range filter (`Today`, `Last 7 days`, `Last month`)
- PulseTrack project time tracker
- Toggl sync mode (live data via API proxy)
- Focus timer with quick presets
- Tech news feed (Norwegian tech sources)
- Weather card (Oslo)
- Dark/light mode toggle with persisted preference

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS (v4)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Environment Variables

Create a local env file (`.env.local`) from `.env.example`:

```bash
cp .env.example .env.local
```

Set values:

```env
VITE_TOGGL_TOKEN=your_toggl_api_token_here
VITE_TOGGL_API_BASE=/toggl/api/v9
```

## Toggl Integration

This project supports two PulseTrack modes:

- `Local`: manually added entries stored in `localStorage`
- `Toggl`: live synced entries from Toggl Track

### Important security note

Do **not** commit real API tokens in a public GitHub repository.  
Use `.env.local` for local testing and keep `.env.local` out of version control.

## Project Structure

```text
src/
  components/
    FocusTimer.tsx
    GithubCard.tsx
    GithubCommitsCard.tsx
    ProjectTimeTracker.tsx
    RangeDropdown.tsx
    RepoList.tsx
    TechNews.tsx
    ThemeToggleCard.tsx
    WeatherCard.tsx
  lib/
    dateRange.ts
    fetchJson.ts
  App.tsx
  index.css
```

## Notes

- Theme preference is saved in `localStorage` (`dev-dashboard-theme`)
- PulseTrack local entries are saved in `localStorage`
- Toggl requests are proxied through Vite (`/toggl`) to avoid browser CORS issues
