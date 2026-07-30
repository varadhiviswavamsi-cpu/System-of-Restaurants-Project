Deploy notes — how to publish this Vite app to common static hosts

This project is a Vite single-page app. The repository contains build & routing files for several popular hosts; follow the platform-specific notes below.

1) Common build command
- Build: npm run build
- Output folder: dist

2) Netlify
- Files added: netlify.toml + public/_redirects
- In Netlify UI, connect your repo and set the build command to "npm run build" and publish directory to "dist". Netlify will use public/_redirects to rewrite routes to index.html for SPA.

3) Vercel
- File added: vercel.json
- Vercel detects npm run build automatically. Build output directory is set to "dist". No further action usually required; connect your repo in Vercel and deploy.

4) Cloudflare Pages
- We added a GitHub Action workflow that can deploy to Cloudflare Pages, but you must create a Pages project or provide the project name and set the CLOUDFLARE_TOKEN and CLOUDFLARE_ACCOUNT_ID secrets in GitHub.
- Alternatively, connect your repo from the Cloudflare Pages dashboard and set build command "npm run build" and output directory "dist".

5) GitHub Pages
- We added a GitHub Action (./github/workflows/deploy-gh-pages.yml) that builds and publishes ./dist to the gh-pages branch using the default GITHUB_TOKEN. Enable GitHub Pages to serve from the gh-pages branch in the repository settings.
- Note: If you publish to https://<org>.github.io/<repo>/, you may need to set Vite's base path (build.base in vite.config.ts) to "/<repo>/" so asset URLs are correct. Example: in package.json you can add a script to build for GH pages:
  "build:ghpages": "vite build --base /System-of-Restaurants-Project/"

6) SPA routing rewrites
- For SPA client-side routes (e.g., /auth/callback) we added public/_redirects (Netlify style), vercel.json rewrite, and static.json for other hosts. If your host has a different rewrite format, add the appropriate config in the host dashboard.

7) Redirect URIs for OAuth
- Make sure your Supabase/Google OAuth redirect URI matches the deployed site:
  - e.g., https://your-domain/auth/callback
  - Add this URL to Supabase Auth redirect settings and to the Google OAuth client redirect URIs.

8) Secrets
- For Cloudflare Pages GitHub Action, set these repo secrets in GitHub Settings → Secrets: CLOUDFLARE_TOKEN, CLOUDFLARE_ACCOUNT_ID. For GH Pages action, GITHUB_TOKEN is available by default.
