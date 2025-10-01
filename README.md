# Code Diff Highlighter

A lightweight Chrome extension for developers and QA engineers to quickly compare two code snippets (old vs. new) and highlight only the new or changed lines in the updated code. Unchanged lines remain unhighlighted for a clean, focused view. Perfect for code reviews, bug fixes, or spotting diffs during agile sprints.

Built with vanilla JavaScript (no external libs), it's fast, privacy-friendly, and stores sessions locally.

## Features
- **Line-Level Diffing**: Uses Longest Common Subsequence (LCS) algorithm to detect added, changed, and removed lines.
- **Smart Change Detection**: Employs Levenshtein distance to classify similar lines as "changed" (yellow highlight) vs. fully new (green).
- **Focused Highlighting**: Only new/changed lines are colored—unchanged lines are plain for easy scanning.
- **Auto-Save Sessions**: Inputs persist across popup closes (debounced every 500ms) so you can switch windows without losing your old code.
- **Diff Stats**: Quick summary of added/changed/removed counts.
- **Lightweight & Offline**: No network calls; works entirely in-browser. Handles up to ~2,000 lines smoothly.
- **Persistent Storage**: Uses Chrome's `localStorage` for session data—clears on demand.

## Screenshots
![Popup Interface](<img width="663" height="626" alt="Screenshot_2" src="https://github.com/user-attachments/assets/4514e7d9-6f15-4bb6-af05-befd7083b80e" />
)  
*Empty popup ready for input.*

![Highlighted Diff](<img width="684" height="754" alt="Screenshot_1" src="https://github.com/user-attachments/assets/b750572b-d923-4fd4-94ed-0737dc2b7d74" />
)  
*Example: Old code (left) vs. New (right) with green added and yellow changed lines.*

*(Add actual screenshots to `/screenshots/` folder after uploading.)*

## Installation
1. **Developer Mode (Testing)**:
   - Download or clone this repo.
   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" (top-right toggle).
   - Click "Load unpacked" and select the extension folder (contains `manifest.json`).
   - Pin the extension to your toolbar for quick access.

2. **Chrome Web Store (Publishing)**:
   - Zip the extension files (exclude `node_modules` if any—none here).
   - Sign up for a [Chrome Web Store Developer account](https://chrome.google.com/webstore/devconsole) ($5 one-time fee).
   - Upload the ZIP, add description/screenshots, and submit for review (usually 1-3 days).
   - Once live, share the store link!

## Usage
1. Click the extension icon to open the popup.
2. Paste your **old code** into the top textarea.
3. Switch tabs/windows to grab the **new code** (it auto-saves—won't vanish!).
4. Paste the **new code** into the bottom textarea.
5. Hit **Compare & Highlight**—view the diff in the output pane.
6. **Clear All** to reset.

**Example**:
- Old: `function greet() { console.log('Hi'); }`
- New: `function greet() { console.log('Hello World!'); }`
- Result: Changed line highlighted yellow (similarity >70%).

**Pro Tip**: For large files (>2k lines), split into chunks to avoid brief UI lag.

## Performance Notes
- **Line Limits**: No hard cap, but optimized for <2,000 lines (1-5s). Larger diffs may take 10-30s due to JS algo.
- **Browser**: Tested on Chrome 120+ (2025 stable). Works in Edge; Firefox via WebExt.

## Contributing
Love it? Fork and PR improvements! Ideas:
- Word-level diffs.
- Syntax highlighting (e.g., via Prism.js).
- Export diffs as HTML/PDF.
- Theme support (dark mode).

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-diff`).
3. Commit changes (`git commit -m 'Add word-level diff'`).
4. Push (`git push origin feature/amazing-diff`).
5. Open a Pull Request.


Star if it saves your sanity! ⭐
