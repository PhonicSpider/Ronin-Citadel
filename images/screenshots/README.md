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

---

# Ronin Portier tool-page screenshots

Same pattern as above, for the `/firewall` page. `portier-overview.png` (the hero
image and first Screenshots-section entry) is already in place. The six feature
tiles below are referenced in `js/tool-page-config.js` but the files don't exist
yet — each degrades cleanly to text-only until you drop the image in.

## Files the page looks for

| Filename                  | Feature tile              | What to capture |
|----------------------------|---------------------------|------------------|
| `portier-rules.png`        | System-Wide Rule Browser  | The **Firewall Rules** tab with a good mix of rows — ideally several with a real value in the Process column, so the live lookup is obvious at a glance. |
| `portier-ports.png`        | Portier Ports              | The **Portier Ports** tab with 2-3 saved profiles, showing the status icon, TCP/UDP/Out checkmarks, and a Process value for at least one active row. |
| `portier-search.png`       | Live Process Lookup        | Type a port number or process name into the top search bar and capture the filtered grid underneath it, so the search-to-result connection reads clearly. |
| `portier-addrule.png`      | Add & Edit Rules           | The right-hand panel in **ADD NEW RULE** state with the Name/Ports fields filled in and a protocol checked, right before clicking Apply. |
| `portier-inspector.png`    | Foreign Rule Inspector     | Select a rule Portier didn't create (in the Firewall Rules tab) so the right panel shows the read-only inspector with **Use as Template** / **Remove**, ideally with a process name visible. |
| `portier-conflict.png`     | Port Conflict Detection    | Trigger the "Port Conflict Detected" dialog by applying a rule whose ports overlap an existing one — capture the dialog itself (Windows Snipping Tool works fine for a native dialog). |

## Capture tips

- Same crop behavior as Disk Manager's tiles: landscape, full width at 180px tall
  (centered), so keep the important content centered rather than at the edges.
- Run the app maximized (or close to it) before capturing so the grid columns
  aren't cramped.
- For `portier-rules.png` and `portier-ports.png`, resize the window a bit wider
  than default first — the Process column is the whole point of the shot, so it
  needs to be visible without scrolling.
- The `screenshots` array in `js/tool-page-config.js` has two more entries
  commented out (`portier-ports.png`, `portier-search.png`) for a wider walkthrough
  once you've captured them — uncomment as you add each file.
