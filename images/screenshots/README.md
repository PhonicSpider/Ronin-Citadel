# Disk Manager tool-page screenshots

Drop screenshots for the `/disk-manager` page here. Each feature tile on the page
shows the image named below above its explanation. Until a file exists, that tile
renders cleanly as text only (a missing image is dropped automatically, no broken
icon), so you can add them one at a time.

## Files the page looks for

| Filename            | Feature tile         | What to capture |
|---------------------|----------------------|-----------------|
| `disk-scan.png`     | MFT Scanning         | A finished scan: the tree populated with sizes, and the console showing the MFT scan lines and the "Scan complete" summary. |
| `disk-analysis.png` | Search & Analysis    | One of the analysis tabs. The Duplicates tab (with a "reclaimable" total) or the Largest Files tab with the free-space target highlight both read well. |
| `disk-cleanup.png`  | Age-Based Cleanup    | The Cleanup tab after Preview: the rule fields filled in (pattern + older-than days) and the matched-files grid with its count and total size. |
| `disk-fileops.png`  | Safe File Operations | The action panel in Delete mode with "Send to Recycle Bin" ticked, plus the Command Preview box showing the exact command. |
| `disk-tools.png`    | Windows Tools        | The Tools tab with an expander open (for example Disk Health / CHKDSK) and some live output in the console. |

The Tree & Treemap tile already uses `../cards/tree-view.webp`. To swap it for a
treemap-with-age-heatmap shot, save that as `disk-treemap.png` and point the
`img` for the "Tree & Treemap" feature at it in `js/tool-page-config.js`.

## Capture tips

- Landscape shots work best. The tile crops to full width at 180px tall (centered),
  so keep the important content roughly centered.
- PNG is fine. Match the filename exactly (case-sensitive on the server).
- The optional wider walkthrough shots referenced (commented) in the `screenshots`
  array can also live here: `disk-treemap.png`, `disk-cleanup.png`.
