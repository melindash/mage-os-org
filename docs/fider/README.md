# Fider branding

See [Demo explanation and self-hosting runbook](DEMO-AND-SELF-HOSTING.md) for the vote migration design, deployment template, PikaPods migration, backups, upgrades and recovery.

An independent [dated CSS backup](backups/mage-os-2026-09-24.css) and [SHA-256 checksum](backups/mage-os-2026-09-24.sha256) are also stored here.

Paste `mage-os.css` into **Site Settings → Advanced → Custom CSS**. It retains the existing `.header-emphasis` rule and replaces the demo's previous custom stylesheet.

1. Back up the current Custom CSS field.
2. Paste the complete contents of `mage-os.css` and save.
3. Upload `mage-os-mark.png` as the logo in **Site Settings → General**. The SVG is extracted from the website's existing logo.
4. Check feedback, a request detail, roadmap, sign-in and submission forms in light and dark modes.
5. Check keyboard focus and a narrow browser viewport before publishing beyond the demo.

The stylesheet uses the website's orange palette, warm neutral text, navy dark background, system font stack and rounded buttons. It does not alter posts, votes, statuses or authentication.

## Rollback

Restore the saved Custom CSS. The demo's original CSS at preparation time was:

```css
.header-emphasis {
  color: rgb(245, 119, 22);
}
```

## Verification status

- Saved to the PikaPods demo running Fider 0.37.0. Light and dark desktop pixel screenshots reviewed, including the uploaded logo and live vote counts. The served stylesheet exactly matches `mage-os.css`.
- A static 390px preview frame had a 390px document width and 370px request cards, with no horizontal overflow.
- Full responsive and form interaction checks remain pending. The separate responsive lifecycle verifier did not establish a usable browser connection during preparation.
- Applied through an administrator browser session; the API key does not authenticate appearance-settings routes.
- Confirmed all 55 posts remain present. The current total is 148 votes across the entire board, including the imported historical votes and the pre-existing post.
