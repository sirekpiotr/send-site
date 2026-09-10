#!/bin/bash
#
# frame-shots.sh — raw screenshots in, web-ready device shots out.
#
# Drop screenshots into raw/ and run this. Each comes back inside a silver
# iPhone bezel on a transparent ground, in assets/.
#
#   ./tools/frame-shots.sh
#
# ── WHY THIS DOES NOT USE THE FRAMES CLI ────────────────────────────────────
# The sibling sites frame with the Apple Frames CLI, which is the better tool
# when it is installed: it uses Apple's own product artwork. It is not on this
# machine, and the bezel below is not a guess — the geometry is the one already
# derived from a real iPhone 17 Pro Max for this app's App Store artboards
# (corner radius, band width and bezel thickness measured in points and scaled
# by the screenshot's own width). Silver, #A8A8AE, because that is what the
# other Sirek Apps sites use; three product pages that each frame their phone
# differently look like three different companies.
#
# The output is a transparent PNG, so one file sits correctly on the site's
# light and dark backgrounds instead of carrying a white rectangle into one of
# them. Nothing is cropped: the frame is drawn *around* the screenshot.
#
# If the frames CLI is ever installed, prefer it — and delete this.

set -euo pipefail
cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "Google Chrome is needed to rasterise the frame."; exit 1; }

# Wide enough to stay sharp at 2× on the size the page draws it, small enough
# that four of them do not make the page heavier than the app.
WIDTH="${FRAME_WIDTH:-900}"
BAND="${FRAME_COLOR:-#A8A8AE}"

PORT=8791
python3 -m http.server "$PORT" --directory . >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true; rm -f _frame_*.html' EXIT
sleep 1

shopt -s nullglob
for shot in raw/*.png raw/*.jpg; do
  name="$(basename "${shot%.*}")"

  # Measured on the device: a 440pt-wide screen, 55pt corner radius, 4.5pt of
  # bezel and a 1.6pt band, all scaled by the screenshot's own width.
  python3 - "$shot" "$WIDTH" "$BAND" "$name" <<'PY'
import sys
from PIL import Image

path, width, band, name = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
w, h = Image.open(path).size
scale = width / w
PT, R_PT, BEZ_PT, BAND_PT = 440.0, 55.0, 4.5, 1.6
k = width / PT
radius, bezel, band_w = R_PT * k, BEZ_PT * k, BAND_PT * k
sh, sw = h * scale, width

open(f"_frame_{name}.html", "w").write(f"""<!doctype html><meta charset="utf-8">
<style>
  html,body {{ margin:0; padding:0; background:transparent; }}
  .band {{
    width:{sw + 2*(bezel+band_w):.1f}px; height:{sh + 2*(bezel+band_w):.1f}px;
    box-sizing:border-box; padding:{band_w:.1f}px;
    border-radius:{radius + bezel + band_w:.1f}px; background:{band};
  }}
  .bezel {{
    width:100%; height:100%; box-sizing:border-box; padding:{bezel:.1f}px;
    border-radius:{radius + bezel:.1f}px; background:#0A0A0B;
  }}
  .screen {{
    width:100%; height:100%; border-radius:{radius:.1f}px; overflow:hidden;
  }}
  img {{ display:block; width:100%; height:100%; }}
</style>
<div class="band"><div class="bezel"><div class="screen">
  <img src="{path}">
</div></div></div>
""")
print(f"{sw + 2*(bezel+band_w):.0f} {sh + 2*(bezel+band_w):.0f}")
PY

  read -r ow oh < <(python3 - "$shot" "$WIDTH" <<'PY'
import sys
from PIL import Image
w, h = Image.open(sys.argv[1]).size
width = int(sys.argv[2]); k = width / 440.0
pad = (4.5 + 1.6) * k
print(f"{width + 2*pad:.0f} {h * (width/w) + 2*pad:.0f}")
PY
)

  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --default-background-color=00000000 \
    --window-size="$ow,$oh" \
    --screenshot="assets/$name.png" \
    --virtual-time-budget=2000 \
    "http://127.0.0.1:$PORT/_frame_$name.html" >/dev/null 2>&1

  echo "framed $name → assets/$name.png"
done
