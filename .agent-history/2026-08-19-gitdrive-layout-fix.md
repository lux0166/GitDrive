# Technical Changelog: GitDrive Repository Page Layout & CSS Sync

- **Date**: 2026-08-19
- **Scope**: Layout structure, CSS Module synchronization, 2-pane code explorer.

## Root Cause Analysis
1. In `RepoDetailPage.tsx`, the class names referenced `styles.repoHeader`, `styles.repoTitleRow`, `styles.repoIcon`, etc., but `RepoDetailPage.module.css` had mismatched class names (`repoHeaderCard`, `headerTitleSection`). This caused the browser to render unstyled raw markup.
2. `Shell.module.css` used `width: calc(100vw - var(--sidebar-width))` with `overflow-x: hidden` on high-resolution displays (2560x919), causing the sidebar to collapse or push offscreen.

## Changes Applied
1. **`RepoDetailPage.tsx` & `RepoDetailPage.module.css`**:
   - Rebuilt as a true **2-Pane Code Explorer**:
     - Left pane: File Explorer tree with folder/file icons, branch indicator, and file sizes.
     - Right pane: Full-height code editor with Line Numbers Gutter, monospace formatting, and copy button.
   - Synchronized 100% of CSS class names between TSX and CSS module.
   - Implemented styled Commits Timeline and Unified Diff Viewer.
2. **`Shell.module.css`**:
   - Fixed `.sidebar` to `width: 240px; min-width: 240px; max-width: 240px; flex-shrink: 0;`.
   - Updated `.layout` to `width: 100%` and `.mainWrapper` to `flex: 1; min-width: 0;`.

## Empirical Verification
- Production build: `npm run build` -> Exit code 0.
- Browser test: Verified with `browser_subagent` on `http://localhost:5173/`, captured screenshots and recording (`gitdrive_repo_layout_fixed_1787118211779.webp`).
