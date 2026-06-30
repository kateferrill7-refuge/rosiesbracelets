# Rosie's Bracelets - Setup

This shop stores its bracelet listings and photos in Vercel Blob storage. A small serverless function (`api/save.js`) handles saving, and another (`api/data.js`) handles loading - so the site only ever needs a simple password from you, never a GitHub token.

## One-time setup

1. **Push these files** to your GitHub repo (replacing what's there): `index.html`, `package.json`, `api/save.js`, `api/data.js`, `README.md`. (`data.json` and the `images/` folder are no longer needed - listings now live in Blob storage instead.)

2. **Make sure Blob storage is connected.** In your Vercel project, go to the Storage tab and confirm a Blob store is created and linked to this project. (You've already done this - Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable for you, no copying tokens required.)

3. **Set your admin password.** Vercel project > Settings > Environment Variables:
   - Add `ADMIN_PASSWORD` = any password you want to use to manage the shop.
   - Make sure the Production box is checked.
   - Save.

4. **Redeploy** the project (Deployments > latest > the ⋯ menu > Redeploy) so the new variable takes effect.

That's it - no GitHub token, no repo permissions to configure.

## Day-to-day use

- Click Manage Shop on the live site and enter your `ADMIN_PASSWORD`. It's kept only in that browser tab's memory, so you'll re-enter it if you reload the page.
- Add a bracelet: fill in the form, upload a photo, click Save.
- Sold a bracelet? Click Remove on its card - it disappears for every visitor, not just you.
- Saves are quick (no GitHub rebuild wait this time) - changes should show up within a few seconds.
- To change your password later, just update `ADMIN_PASSWORD` in Vercel and redeploy.

## Notes

- Only share your `ADMIN_PASSWORD` with people you trust to manage the shop.
- Customer checkout goes through your PayPal.me link (@katedesantis764) and confirmation emails go to rosierebecca771@icloud.com - both are already set in `index.html`.
- Each visitor's shopping cart is stored only in their own browser.
