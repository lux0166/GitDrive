# Technical Changelog: Settings Page Layout & Button Text Wrap Fix

- **Date**: 2026-08-19
- **Scope**: SettingsPage.tsx & SettingsPage.module.css.

## Root Cause Analysis
In `global.css`, `button` elements have `white-space: nowrap !important; justify-content: center;`.
In `SettingsPage.tsx`, each LAN operating mode option was rendered as a `<button className={styles.modeOption}>`.
Because of global button styles:
1. The paragraph `<p className={styles.modeDesc}>` inside the button inherited `white-space: nowrap !important` and was forced onto a single horizontal line of 1200+ pixels.
2. The button inherited `justify-content: center`, expanding the content both to the left (bleeding into the sidebar) and to the right (crashing into the second column card).
3. The radio circle was pushed out of alignment.

## Solution Applied
1. Changed `<button>` to `<div role="button" tabIndex={0}>` in `SettingsPage.tsx`.
2. Applied `white-space: normal !important; justify-content: flex-start !important; text-align: left;` and `overflow-wrap: break-word; word-break: break-word;` in `SettingsPage.module.css`.
3. Set `.grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }` and added `min-width: 0;` on all card containers to guarantee strict boundary containment.

## Verification
- Unit Tests: 7/7 passed.
- Production Build: `npm run build` -> Exit code 0.
- Browser Subagent: Verified Dark Mode (`settings_layout_fixed_dark_1787121022721.png`), Light Mode (`settings_layout_fixed_light_1787121029978.png`), and recording `gitdrive_settings_layout_fixed_1787121012435.webp`.
- Git Commit: `a46e5ad` pushed to `origin/main`.
