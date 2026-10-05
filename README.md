# Glass Lab

Local React + TypeScript image refraction studio with a WebGL2 shader engine. No accounts, backend, image uploads, or runtime network requests.

## Run locally

Install Node.js 22 or newer, then from this folder:

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://localhost:5173). Use a modern browser with WebGL2 and hardware acceleration enabled.

Production:

```sh
npm run build
npx vite preview --configLoader native
```

The built app is in `dist/`. Serve it over HTTP; opening index.html directly with file:// is unsupported. For pnpm 11+, approve the esbuild install script if prompted, or use npm.

## Use

Drop a PNG, JPEG, or WebP onto the app, or click Replace image. Settings are retained when replacing an image. Choose a preset, adjust sliders or numeric fields, and double-click sliders to restore defaults. Rotate fluted/reeded patterns 90 degrees for horizontal ridges. Drag the canvas to pan; use the wheel or toolbar to zoom and Fit to recenter. Compare reveals a draggable original/processed divider. Undo/redo tracks effect settings (not image replacements or viewport state).

Custom maps use red for horizontal and green for vertical displacement. Mid-gray is neutral; map alpha is ignored. Rotation and offsets transform the map; spacing controls procedural patterns. Seed affects deterministic procedural roughness. Preview backgrounds are inspection-only.

Export PNG renders at exact source dimensions through the same shader used by preview. Transparent areas are retained. The preview is capped at 1600 pixels on its longest side; all effect distances use source-image pixels, so full export retains the same pattern scale and strength. Fine detail can be more visible in the exported file.

## Architecture

- `src/renderer.ts`: WebGL2 texture upload, alpha-aware sampling, blur and color separation, source-pixel uniforms, GPU limit enforcement.
- `src/maps.ts`: deterministic shader displacement fields for the eight presets.
- `src/presets.ts`: typed settings and preset defaults.
- `src/Controls.tsx`: reusable slider and numeric controls with bounded input and resets.
- `src/main.tsx`: controls, image decoding, history, inspection viewport, upload and status UI.
- `src/export.ts`: exact-resolution render and transparent PNG download.
- `src/style.css`: responsive dark interface.

The source is uploaded as premultiplied RGBA for alpha-correct bilinear filtering and blur. The shader converts to straight alpha at its output; the WebGL canvas uses `premultipliedAlpha: false`. Out-of-image samples are transparent. PNG export excludes DOM backgrounds and comparison overlays.

## Checks

`npm run build` performs strict TypeScript checking and a production build. Open `/verify.html` on the dev or preview server to run GPU integration checks: alpha, all eight distinct distortion fields, deterministic seeds, identity rendering, PNG round-trip dimensions and alpha, and GPU size rejection. This requires an actual WebGL2 browser; it reports PASS/FAIL in the page.

## Limits

Images must fit the GPU texture, renderbuffer, and viewport limits. No silent export downscaling or tiled rendering is used. Very large supported images can still exhaust GPU memory and are reported as errors. Softness uses a 9-position weighted sampling kernel, not a full Gaussian convolution. Color separation retains the central sample's alpha to avoid colored fringes outside the silhouette. Effects remain inside the original canvas dimensions; displaced content beyond the canvas can be clipped. Files and settings live in browser memory and are lost on refresh. Eight procedural presets use local shader fields; no external assets are loaded.

