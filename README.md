# Random GitHub

A browser extension that takes you to a random active GitHub repo. Built for people new to GitHub — including non-coders.

## Modes

- 🍀 **I'm Feeling Lucky** — anywhere on GitHub (active repos only)
- ✏️ **Words** — docs, typos, translations, awesome lists
- 🌱 **Beginner code** — repos with good-first-issue labels
- 🔧 **Deeper code** — repos asking for help past the first PR

When you land on a repo, a small card shows what kind of project it is and a 🎲 **Try another** button.

## Install (developer mode)

### Chrome / Edge / Brave

1. Open `chrome://extensions`
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked** and select this folder
4. Click the puzzle-piece icon in the toolbar and pin **Random GitHub**

### Firefox (121+)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select `manifest.json` from this folder

## Privacy

- One GitHub API call per click. No accounts, no tokens, no servers, no analytics.
- A small per-tab note (which mode you came from) is stored in session storage and cleared when the tab closes.
