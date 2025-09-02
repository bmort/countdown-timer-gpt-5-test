# Record a Demo GIF

Quick tips to capture a short UI demo and produce a small, sharp GIF for the README.

## Tools
- macOS (Homebrew): `brew install ffmpeg gifski gifsicle`
- Windows (Chocolatey): `choco install ffmpeg gifski`
- Linux (Debian/Ubuntu): `sudo apt-get install ffmpeg` and install `gifski` via `cargo install gifski` or package manager

## 1) Record
- QuickTime (macOS): File → New Screen Recording → capture the app window.
- OBS Studio: record a short clip at 60s or less.

## 2) Trim and (optionally) crop
Keep it brief (5–10s), focus the area, and scale later.

```bash
# Trim to a specific segment (adjust -ss start and -to end)
ffmpeg -ss 00:00:02 -to 00:00:10 -i input.mov -an -c:v libx264 -crf 20 -preset veryfast trimmed.mp4

# Optional crop (replace values with your region)
# ffmpeg -i trimmed.mp4 -filter:v "crop=width:height:x:y" -c:a copy cropped.mp4
```

## 3) Convert to GIF
Two solid options; pick one.

### Option A: ffmpeg palette (good quality + small size)
```bash
ffmpeg -i trimmed.mp4 \
  -vf "fps=18,scale=900:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=full[p];[s1][p]paletteuse=new=1" \
  -loop 0 web/public/demo.gif
```

### Option B: ffmpeg → gifski (great dithering)
```bash
ffmpeg -i trimmed.mp4 -vf "fps=18,scale=900:-1:flags=lanczos" -f image2pipe -vcodec png - | \
  gifski --quality 80 --fps 18 -o web/public/demo.gif -
```

## 4) Optimize (optional)
```bash
gifsicle -O3 web/public/demo.gif -o web/public/demo.gif
```

## Tips for small, clean GIFs
- Keep under ~5–7 MB: shorten duration, reduce width (e.g., 720–900px), lower FPS (15–20).
- Prefer solid backgrounds and minimal motion.
- Show only the essential flow (open → interact → done).

## Add to repo
```bash
# Place the output here so README can reference it
# README path uses: web/public/demo.gif

git add web/public/demo.gif
git commit -m "Add demo GIF"
```
