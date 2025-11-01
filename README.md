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
- `npm run export` – shorthand for `next build`; the GitHub Pages workflow handles exporting and flattening.

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
3. GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and publishes the `out/` folder to the `gh-pages` branch. Nó tự đặt `NEXT_PUBLIC_BASE_PATH` theo tên repo, chạy script `scripts/inject-version.js` để chèn version vào service worker, rồi flatten thư mục export và copy `404.html` nhằm hỗ trợ routing cho SPA. (Workflow đã dùng các bản action mới nhất v3/v4 của Pages artifact/deploy.)
4. Enable GitHub Pages in repository settings, selecting the `gh-pages` branch and the root directory.

Trong CI, version được set thành định dạng `v<run_number>-<commit>`, hiển thị ở góc dưới trái.

> `npm run export` thực chất gọi `next build`, trước đó script `prebuild` sẽ tự chạy `node scripts/inject-version.js` để cập nhật `public/service-worker.js` và tạo `public/version.json` theo biến `NEXT_PUBLIC_APP_VERSION`.

## Progressive Web App

- The project ships with a custom service worker (`public/service-worker.js`) and a manifest located at `public/manifest.webmanifest`.
- When you run `npm run export` (locally or in CI), the service worker and manifest are emitted with the correct base path so the site is installable as a PWA on GitHub Pages.
- On first load the app registers the service worker and enables offline caching for core assets.
