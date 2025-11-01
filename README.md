# Launchpad Gallery (Next.js)

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000) by default.

## Scripts

- `npm run dev` – start the Next.js dev server with hot reload.
- `npm run build` – produce an optimized production bundle.
- `npm run start` – run the compiled production build.
- `npm run lint` – lint the project with the Next.js ESLint preset.
- `npm run export` – generate the static site inside the `out/` directory (used for GitHub Pages).

## Project Structure

- `app/` – App Router entrypoints (`layout.tsx`, `page.tsx`, global styles).
- `components/launchpad/` – React components that render the launchpad UI.
- `hooks/` – Reusable React hooks (`useLaunchpadState`, `useMediaQuery`).
- `lib/` – Domain utilities, constants, data mappers, and storage helpers.
- `public/` – Static assets (icons, manifest, service worker, app data JSON).

Settings and user data are persisted in `localStorage`, matching the behaviour of the original vanilla implementation.

## Deploying to GitHub Pages

1. Set the repository’s default branch in the workflow (below assumes `main`).
2. Optional: create a `.env` file for local builds with `NEXT_PUBLIC_BASE_PATH=""` (empty) to mirror production and `NEXT_PUBLIC_APP_VERSION=<your version>` if you want to override the default package version.
3. GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes the `out/` folder to the `gh-pages` branch. It automatically sets `NEXT_PUBLIC_BASE_PATH` to the repository name so asset paths resolve correctly on Pages, then flattens the exported directory structure and copies `404.html` to provide single-page-app routing on GitHub Pages. (The workflow uses the latest v3/v4 releases of the Pages artifact/deploy actions so it complies with the GitHub-deprecated `upload-artifact@v3`.)
4. Enable GitHub Pages in repository settings, selecting the `gh-pages` branch and the root directory.

During CI the workflow exposes the version as `v<run_number>` which is shown in the bottom-left badge in the UI.

## Progressive Web App

- The project ships with a custom service worker (`public/service-worker.js`) and a manifest located at `public/manifest.webmanifest`.
- When you run `npm run export` (locally or in CI), the service worker and manifest are emitted with the correct base path so the site is installable as a PWA on GitHub Pages.
- On first load the app registers the service worker and enables offline caching for core assets.
