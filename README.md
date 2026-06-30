# Rosie's Bracelets - Setup

This shop uses GitHub as its database: listings live in `data.json` and photos live in `images/`. When you add, edit, or remove a bracelet, those changes get saved into the GitHub repo, so every visitor sees the same up-to-date shop. A small serverless function (`api/save.js`) does the actual saving, so you only ever need a simple password, not a GitHub token, in the browser.

## One-time setup (on Vercel)

You're already deployed on Vercel at `rosiesbracelets.vercel.app`, connected to the GitHub repo `kateferrill7-refuge/rosiesbracelets`. To finish setup:

1. **Push these files** to that repo (replacing what's there): `index.html`, `data.json`, `images/` folder, `api/save.js`, `README.md`.

2. **Create a GitHub access token** (this is the one secret credential, and it lives only in Vercel's settings, never in the browser):
   - On GitHub: Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token.
   - Set an expiration (90 days is fine; you can regenerate later).
   - Repository access: "Only select repositories" -> pick `kateferrill7-refuge/rosiesbracelets`.
   - Permissions > Repository permissions > Contents -> Read and write.
   - Generate, then copy the token.

3. **Add two environment variables in Vercel:**
   - Go to your Vercel project > Settings > Environment Variables.
   - Add `GH_TOKEN` = the token you just copied.
   - Add `ADMIN_PASSWORD` = any password you want to use to manage the shop (make it something only you know).
   - Save, then redeploy the project (Vercel > Deployments > click the three dots on the latest one > Redeploy) so the new variables take effect.

That's it - no token ever touches the website itself.

## Day-to-day use

- Click Manage Shop on the live site and enter your `ADMIN_PASSWORD`. It's kept only in that browser tab's memory, so you'll re-enter it if you reload the page.
- Add a bracelet: fill in the form, upload a photo, click Save.
- Sold a bracelet? Click Remove on its card - it disappears from `data.json` for every visitor, not just you.
- Saves typically take 30-90 seconds to show up live, since the site rebuilds after each change. A toast message confirms when it's done.
- If you ever want to change your password, just update `ADMIN_PASSWORD` in Vercel's environment variables and redeploy.

## Notes

- Only share your `ADMIN_PASSWORD` with people you trust to manage the shop.
- Customer checkout goes through your PayPal.me link (@katedesantis764) and confirmation emails go to rosierebecca771@icloud.com - both are already set in `index.html`.
- Each visitor's shopping cart is stored only in their own browser.
