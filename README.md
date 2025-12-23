# Mental Clarity

A personal productivity and mental wellness tracking application built with Next.js and Electron.

## Features

- **Time-based tracking**: Monitor activities across custom timeframes
- **Mental wellness metrics**: Track clarity, anxiety, stress levels
- **Data visualization**: Heatmaps, charts, and statistics
- **Goal setting**: Define and track daily targets
- **Auto-updates**: Seamless desktop app updates
- **Offline-first**: Works without internet connection
- **Data privacy**: All data stored locally on your device

## Getting Started

### Web Development

Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Desktop Development

Run the Electron desktop app:

```bash
npm run dev:desktop
```

This will start both the Next.js dev server and Electron app.

### Building for Production

```bash
# Build web version
npm run build:web

# Package desktop app (all platforms)
npm run package:desktop
```

## Auto-Updates

Mental Clarity includes automatic update functionality for the desktop app:

- ✅ Updates are checked automatically when the app launches
- ✅ Receive notifications when a new version is available
- ✅ Updates download in the background with progress indicator
- ✅ One-click installation with automatic restart
- ✅ All your data is preserved during updates

### Manual Update Check

You can manually check for updates:
1. Open the app
2. Navigate to **Settings**
3. Scroll to the **Updates** section
4. Click **"Check for Updates"**

### For Developers

See [docs/auto-updater-implementation.md](docs/auto-updater-implementation.md) for implementation details.

## Releasing New Versions

Use the built-in release tools to create new versions:

```bash
# Patch release (bug fixes: 1.0.0 → 1.0.1)
npm run release:patch

# Minor release (new features: 1.0.0 → 1.1.0)
npm run release:minor

# Major release (breaking changes: 1.0.0 → 2.0.0)
npm run release:major

# Interactive release tool
npm run release
```

See [docs/release-checklist.md](docs/release-checklist.md) for the complete release process.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
