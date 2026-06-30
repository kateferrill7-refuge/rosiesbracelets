# Rosie's Bracelets - Setup

This is a static shop site. To keep it simple (no server, no monthly cost), it uses GitHub itself as the "backend": bracelet listings live in `data.json` and photos live in the `images/` folder. When you add, edit, or remove a bracelet through the Manage Shop panel, the page saves those changes directly back into this repo, so every visitor sees the same up-to-date shop.

## One-time setup

1. **Create the repo.** Push these files to a new GitHub repository:
   - `index.html`
   - `data.json`
   - `images/` (folder, can start empty)
   - `README.md`

2. **Turn on GitHub Pages.** In the repo, go to Settings > Pages, set Source to "Deploy from a branch," pick `main` and `/ (root)`, then save. Your site will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`.

3. **Tell the page which repo it is.** Open `index.html`, find this block near the top of the `<script>` tag, and fill in your real GitHub username and repo name:
   ```js
   var GH_OWNER  = 'YOUR-GITHUB-USERNAME';
   var GH_REPO   = 'YOUR-REPO-NAME';
   ```
   Commit and push that change.

4. **Create a GitHub access token** (this lets the Manage Shop panel save changes):
   - Go to GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
   - Set an expiration (e.g. 90 days - you can make a new one anytime).
   - Under Repository access, choose "Only select repositories" and pick this repo.
   - Under Permissions > Repository permissions, set **Contents** to **Read and write**.
   - Generate the token and copy it somewhere safe (you'll paste it into the browser, not into any file).

## Day-to-day use

- Click **Manage Shop** on the live site. The first time, it'll ask you to paste your access token. It's only kept in that browser tab's memory, never saved to the site or repo, so you'll re-enter it each time you reopen the page or refresh.
- **Add a bracelet:** fill in the form, upload a photo, click Save. The photo uploads to the `images/` folder and the listing is added to `data.json`.
- **Sold a bracelet?** Click Remove on its card. That deletes it from `data.json` so it disappears for every visitor, not just you.
- Changes typically take 30-90 seconds to show up live, since GitHub Pages has to rebuild the site after each save. A toast message will confirm the save went through.

## Notes

- Only share the access token with people you trust to manage the shop - anyone with it can edit the repo's contents.
- Customer checkout still goes through PayPal.me - update the placeholder PayPal username and Rosie's email address in `index.html` (search for `YOURPAYPALHERE` and `rosie@rosiesbracelets.com`) before going live.
- Each visitor's shopping cart is stored only in their own browser, so it won't show up for anyone else - that part doesn't need GitHub.
