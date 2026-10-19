# Cycle GitHub demo

An 18-second animated product demo for the repository README. The GIF plays inline and shows the actual application with fictional calendar data supplied by an isolated, in-memory API. The renderer never opens `data/cycle.db`.

## Creative

Audience: people considering a small, self-hosted period calendar. The opening angle is control over where calendar data is stored. The demonstration supplies the proof: logging dates, undoing a tap, and displaying a forecast. The final action is to explore the GitHub repository.

| Time | On-screen headline | Product action |
| --- | --- | --- |
| 0–3 seconds | Your cycle. Your server. | Establish Cycle and its calendar. |
| 3–9 seconds | Tap to log. Tap to undo. | Log September 14–18, undo the final date, and restore it. |
| 9–13 seconds | See what’s coming next. | Move to October and show the estimated October 12–16 forecast. |
| 13–18 seconds | Make room for Cycle. | Show “Explore Cycle on GitHub” and `github.com/dermute/cycle`. |

The footer identifies fictional demo data and estimated forecasts. Copy is grounded in `README.md`, `index.html`, and `app.js`; colors and the brand mark follow `styles.css`. No testimonials, audience statistics, or performance claims are used. This is a first creative draft, with no campaign results yet.

The creative workflow uses Corey Haines’s [ad-creative skill](https://github.com/coreyhaines31/marketingskills/tree/main/skills/ad-creative), Mode 1 (generate from scratch), adapted to a landscape GitHub demo. The animation uses browser-rendered application footage and captions.

## Render again

Requires Docker and network access to install rendering tools inside a disposable container. Run from the repository root:

```sh
mkdir -p /tmp/cycle-promo
docker run --rm \
  -v "$PWD:/project" \
  -v /tmp/cycle-promo:/render \
  -w /render \
  -e NODE_PATH=/render/node_modules \
  -e CYCLE_SOURCE=/project \
  -e CYCLE_OUTPUT=/project/docs \
  -e CYCLE_SCRATCH=/render/frames \
  mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -lc 'npm install --prefix /render playwright@1.63.0 --no-audit --no-fund && apt-get update -qq && apt-get install -y -qq ffmpeg && node /project/scripts/render-promo.cjs'
```

The script renders frames at 1280×720 and 24 fps, then writes `cycle-promo.gif` (896×504, 10 fps) here. Its clock is fixed at September 22, 2026, and every run starts with the same fictional August period. It checks for browser errors, the resulting logged dates, and five forecast days in October before encoding the GIF.
