ZENITH Logotype

Files:
- `zenith-logotype.svg` — vector SVG (transparent background), deep navy #0B2A4A, stylized "E" as three horizontal bars.
- `zenith-logotype.png` — placeholder; use the conversion script below to generate a high-resolution PNG.

How to generate a high-resolution PNG locally:

1. Install dependencies (in project root):

```powershell
npm install sharp
```

2. Run the conversion script:

```powershell
node scripts/convert-svg-to-png.js
```

This will output `src/assets/zenith-logotype.png` at ~3000x800 px (transparent background).

Notes:
- The SVG uses the `Poppins` font family in its style block. If `Poppins` isn't available locally, the renderer will fall back to `Montserrat`/`Arial`.
- For a pixel-perfect brand lockup, provide a vector (SVG) version from your designer; I can replace the generated SVG with an exact one if you upload it.
