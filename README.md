# Turkey for Compression Moulding Enthusiasts

A travel guide website for planning a trip across Turkey around compression moulding
(composites, SMC/BMC, rubber, phenolic/melamine parts, pressed ceramics and tiles),
plus normal tourism.

Plain HTML, CSS and JavaScript. No installation or build step.

## How to open it

Use the free *Live Server* extension in VS Code. The page refreshes by itself
every time you save a file.

> Why not just double-click `index.html`? The pages open, but browsers block a
> double-clicked page from reading the data files in `data/`, so the map and city
> guide would be empty. Live Server (or publishing on GitHub Pages) fixes this.

1. In VS Code, click the **Extensions** icon on the left (four small squares), or press `Ctrl+Shift+X`.
2. Search for **Live Server** (by Ritwick Dey) and click **Install**.
3. Open the `turkey-compression-guide` folder (**File > Open Folder…**).
4. Right-click `index.html` in the file list and choose **Open with Live Server**.

## Where things live

| What | File |
| --- | --- |
| Pages | `index.html`, `map.html`, `cities.html`, `itinerary.html`, `technique.html`, `events.html`, `tips.html` |
| All styling, colours and fonts | `css/style.css` |
| Header menu and footer (shared by every page) | `js/app.js` |
| Map | `js/map.js` |
| Itinerary builder and budget | `js/itinerary.js` |
| Language switch | `js/i18n.js` and `data/i18n.json` |
| Places shown on the map and in the guide | `data/places.json` |

## Design rules

- **Font:** Helvetica only (`"Helvetica Neue", Helvetica, Arial, sans-serif`).
- **Colours:** only the six colours at the top of `css/style.css`:
  `#0B6B3A` green, `#064D2A` deep green, `#FFFFFF` white, `#F7F5EE` ivory,
  `#C9A227` gold, `#111111` black.
- Gold is never used for text on a white background (it is too faint to read).

## Editing content

Instructions for editing places and translations will be added in later stages.

## Publishing for free on GitHub Pages

Step-by-step instructions will be added in Stage 6.
