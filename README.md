# Kartikkumar Bagilavaidya — Portfolio

A responsive static portfolio designed to work locally and on static hosts such as **GitHub Pages, Cloudflare Pages, Netlify, and Vercel**.

## Run locally

From this folder:

```bash
python3 run_server.py
```

Then open:

```text
http://localhost:8000
```

`run_server.py` is only a convenient local web server. The deployed website does **not** require Python to run.

## Automatic gallery

Put photographs directly into:

```text
img/gallery/
```

Supported formats:

```text
.jpg  .jpeg  .png  .gif  .webp  .avif
```

You do **not** need to add filenames to `index.html` or JavaScript.

The website reads `gallery.json`, which is generated from the contents of `img/gallery/`.

### Update it locally

If you add/remove images and are not using the GitHub Action, run:

```bash
python3 tools/generate_gallery.py
```

Then refresh the website.

### GitHub Pages

The repository includes:

```text
.github/workflows/update-gallery.yml
```

When images are added or removed from `img/gallery/`, GitHub Actions automatically regenerates `gallery.json` and commits the updated manifest. This means you only need to add the images and push them to GitHub.

Recommended repository structure:

```text
YOUR_USERNAME.github.io/
├── index.html
├── gallery.json
├── css/
├── js/
├── img/
│   └── gallery/
├── video/
├── tools/
└── .github/
    └── workflows/
```

For GitHub Pages, set **Settings → Pages → Deploy from a branch → main → /(root)**.

## Cloudflare Pages / Netlify / Vercel

The site itself is completely static and does not require `run_server.py` in production. Upload or connect the repository as a normal static site.

If your deployment platform has a build command, you can use:

```bash
python3 tools/generate_gallery.py
```

and publish the repository root as the output directory. The included `gallery.json` also means the current gallery works immediately even when no build command is configured.

## Adding a new photograph

Simply copy the file into:

```text
img/gallery/
```

For GitHub Pages:

```bash
git add img/gallery/
git commit -m "Add gallery photos"
git push
```

The GitHub Action updates the manifest automatically.

## Quick local start

Make the launcher executable once:

```bash
chmod +x run.sh
```

Then start the portfolio with:

```bash
./run.sh
```

Open **http://localhost:8000** in your browser.

You can also choose another port:

```bash
./run.sh 8080
```

Then open **http://localhost:8080**.
