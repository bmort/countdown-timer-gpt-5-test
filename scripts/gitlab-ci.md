# GitLab CI → GitHub Pages

This pipeline builds the Vite app in `web/` and publishes the static site to the `gh-pages` branch of your GitHub repository.

## 1) Mirror this repo to GitLab
- Create a new GitLab project and mirror this GitHub repo, or push it to GitLab as the primary remote.
- Enable GitLab CI/CD for the project.

## 2) Configure CI/CD Variables (GitLab → Settings → CI/CD → Variables)
- `GH_TOKEN` (required): GitHub personal access token with `repo` (classic) or `Contents: write` (fine-grained). Mask & protect it.
- `GH_REPO` (optional): `OWNER/REPO` form. Defaults to `bmort/countdown-timer-gpt-5-test` in `.gitlab-ci.yml`.
- `GH_PAGES_BRANCH` (optional): Defaults to `gh-pages`.
- `BASE_PATH` (optional): Vite base path for GitHub Pages.
  - User/org site (`user.github.io`): set to `/`.
  - Project site: set to `/<repo>/` (default already set for this repo).
- `GH_PAGES_CNAME` (optional): Set to your custom domain to create a `CNAME` file.

## 3) GitHub Pages settings
- On GitHub, open the repo → Settings → Pages:
  - Source: `Deploy from a branch`
  - Branch: `gh-pages` and folder `/root`

## 4) How it works
- `build` job (Node 20): runs `npm ci` and `npm run build` in `web/`, passing `--base=$BASE_PATH` to Vite.
- `deploy:gh-pages` job (Alpine): commits `web/dist/` to an orphan `gh-pages` branch and force pushes to GitHub using `GH_TOKEN`.
- Runs on commits to `main` (see rules). Adjust branch rules if needed.

## 5) Verify locally (optional)
You can emulate the deploy step locally:
```bash
# Build
(cd web && npm ci && npm run build -- --base="/$REPO_NAME/")

# Push dist to gh-pages (requires GH_TOKEN)
export GH_TOKEN=... GH_REPO=OWNER/REPO
rm -rf out && mkdir out && cp -R web/dist/. out/ && cd out
git init && git checkout -b gh-pages
git config user.name local && git config user.email local@example.com
touch .nojekyll && git add -A && git commit -m "local deploy"
git remote add origin "https://x-access-token:${GH_TOKEN}@github.com/${GH_REPO}.git"
git push -f origin gh-pages
```

## Notes
- Using `--base` on the CLI avoids modifying `vite.config.ts`.
- For org/user pages (root domain), set `BASE_PATH=/`.
- The deploy job uses `--force` to keep `gh-pages` as a clean, generated branch.
