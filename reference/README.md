# reference/ — NOT DEPLOYED

Files in this directory are kept for design/reference only. They sit **outside**
Vite's `publicDir` (`public/`), so `vite build` never copies them into `dist/`
and Vercel never serves them.

## `login.html`

The original organization login mockup (email + password + "Remember me" +
"Forgot password?"). It was moved here from `public/` on purpose.

**Why it was un-deployed**

The deployed site (`https://kya-scene-gules.vercel.app/`) was flagged by Google
Safe Browsing as containing pages that "try to trick visitors into sharing
personal info". This page was the cause: it renders a complete credential-login
UI with `autocomplete="current-password"`, accepts any email/password without
validation, and immediately redirects — the exact visual signature of a
phishing kit, even though the handler never transmitted or stored anything
(`event.preventDefault()` then discard).

It reached production when it was moved from the repo root into `public/`, which
is what made `/login.html` publicly servable for the first time.

**Do not move this file back into `public/`.** Doing so re-exposes a
credential-login page and will very likely re-trigger the Safe Browsing flag.

The live organization flow now starts at `public/organization-setup.html`,
which is a demo form that persists to `localStorage` only.

**Known-stale internals (harmless, file is not served):** its relative links
(`signup.html`, `organization-setup.html`) and its redirect target no longer
resolve from this directory, and its markup still contains the password field,
"Remember me", "Forgot password?" and "Log In" copy. That is expected for an
inert reference artifact — none of it is deployed.
