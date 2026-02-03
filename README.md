# zippy

Time allocation tracker for splitting daily work hours across project codes.

## Features

- Secure login with persistent sessions
- Track daily time entries with customizable time codes
- Split time across multiple codes with descriptions
- Weekly and monthly reports with copy-to-clipboard
- Multi-user support
- Auto-sync data to backend server
- Export/import data as JSON
- Estonian timezone (Europe/Tallinn)

## Tech Stack

React 18 + TypeScript + Vite, Tailwind CSS v4, shadcn/ui, Zustand, date-fns, Express, bcrypt

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a user (username, password, display name):
```bash
npm run setup-user myuser mypassword "My Name"
```

3. Start the app (runs both frontend and backend):
```bash
npm run dev
```

## Configuration

Edit `server/config.js` to change:
- `sessionDurationHours` - How long sessions stay active (default: 168 hours / 7 days)
- `port` - Server port (default: 3001)

## Testing

```bash
npm test
```

## Build

```bash
npm run build
```
