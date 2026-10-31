# Vendored libraries

Self-hosted so visitors' browsers never contact a third-party server to load
the portal (no IP address handed to a CDN, no CDN outage, no CDN compromise),
and so the Content-Security-Policy can allow scripts from this site only.

| File | Library | Version | Licence | Source |
|---|---|---|---|---|
| `gsap.min.js` | GSAP | 3.15.0 | GSAP Standard "no charge" licence (free for commercial use; https://gsap.com/standard-license) | `npm pack gsap@3.15.0`, `dist/gsap.min.js` |
| `qrcode.js` | qrcode-generator by Kazuhiko Arase | 2.0.4 | MIT (notice kept in the file header) | `npm pack qrcode-generator@2.0.4`, `dist/qrcode.js` |

QR Code is a registered trademark of DENSO WAVE INCORPORATED.

QRious (GPL-3.0, unmaintained since 2017) was used before and was replaced
because its licence does not suit a closed web application.

## Updating

```bash
npm pack gsap@<version> qrcode-generator@<version>   # in an empty scratch folder
# extract, copy the two dist files over the ones here, update the table above,
# then load the dashboard and Settings > Two-Factor setup and check both work.
```

Check the GSAP licence page when updating; its terms have changed before.
