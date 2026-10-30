# IdeaBinder — react-notes-app

A custom React frontend application for creating, searching, and managing sticky notes and ideas, featuring third-party API integration, dynamic search filtering, and modular component architecture built with Vite.

**Live site:** https://oelctric.github.io/react-notes-app/

**Pitch video:** _coming soon_

## Features

- **Search** — the header search queries the [DummyJSON posts API](https://dummyjson.com/docs/posts) and shows results as note cards, with a loading preloader, a "Nothing found" state, an error message if the request fails, and a "Show more" button.
- **Guest mode** — the app works without an account. Guests can write, edit and search notes, which are saved in this browser only (up to 10).
- **Accounts** — sign up and log in through modal forms with live validation. Signing in moves any notes written as a guest into the account. Accounts add unlimited notes, bookmarks (Saved Notes), the profile page, and image attachments and drawings. Auth is mocked for stage 1; the token is kept in `localStorage`.
- **Note editor** — auto-saving editor with headings, bold/italic/strikethrough/code, checklists, bulleted and numbered lists, tables, note colors, and tags. Clearing a note and closing it deletes it.
- **Profile** — My Notes, Saved Notes and Tags tabs, with your account stats.
- **Responsive** — layouts from 320px to 1440px, with a menu button on small screens.

## Tech

- React 19 + React Router 7, bundled with Vite
- Native `fetch()` for API requests (`src/utils/api.js`)
- BEM-named CSS, one stylesheet per component
- Roboto and Roboto Condensed served locally from `src/vendor/fonts`

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run lint     # ESLint
npm run deploy   # build and publish dist/ to GitHub Pages (gh-pages branch)
```

## Project structure

```
src/
├── assets/images/        logo and icons
├── vendor/               local font files + @font-face rules
├── components/           one folder per component (JSX + CSS)
├── contexts/             CurrentUserContext
├── hooks/useForm.js      form state + validation
├── utils/
│   ├── api.js            DummyJSON search + mock notes storage
│   ├── auth.js           mock register/login/token check
│   └── constants.js
├── index.css
└── main.jsx
```

## Stage 2

`utils/auth.js` and the notes functions in `utils/api.js` return promises shaped like real backend responses, so they can be swapped for network requests without changing the components.
