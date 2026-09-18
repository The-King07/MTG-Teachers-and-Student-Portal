# TalentVerse

A creative universe where artists, writers, musicians, and makers share their talents — a full social platform with accounts, posts, likes, comments, and follows.

Originally exported from a Figma Make design (https://www.figma.com/design/gJZO66AGZGnmaGBX0O9vcZ/Create-Backend-for-Frontend).

## Features

- **Accounts** — register, sign in, edit profile (name, bio)
- **Posts** — publish work with title, description, image, category, and tags
- **Social** — like posts, leave comments, follow creators
- **Discover** — search posts and filter by category (masonry grid)
- **Real persistence** — all data is stored in the browser's `localStorage` (key `talentverse_db_v1`) and survives page reloads and browser restarts
- **Polished UI** — animated particle hero, glassmorphism cards, spring like-animations, toast notifications

## Running locally

```bash
npm i
npm run dev
```

Then open the printed URL (usually http://localhost:5173).

## Demo accounts

| Email | Creator |
| --- | --- |
| nova@example.com | Nova Chen — digital artist |
| lumix@example.com | Marcus Osei — photographer |
| kai@example.com | Kai Rivera — music producer |
| priya@example.com | Priya Nair — poet & writer |

Seed accounts accept any password. You can also create your own account.

## Resetting data

All data lives under the `talentverse_db_v1` key in localStorage. Clear it in DevTools (Application → Local Storage) to restore the original seed content. The store also exposes `store.resetToSeed()`.

## Architecture

- `src/app/store` — data store with localStorage persistence and seed data
- `src/app/services/api` — async service layer mirroring a REST API (`/api/auth/*`, `/api/users/*`, `/api/posts/*`), so it can be swapped for a real Express backend later without touching the UI
- `src/app/context/AuthContext` — session/auth state (token persisted in localStorage)
- `src/app/pages` — Landing, Auth, Feed, Profile, CreatePost, PostDetail

Built with React, Vite, Tailwind CSS v4, Motion, and lucide-react. Includes shadcn/ui components (MIT) and Unsplash photos.
