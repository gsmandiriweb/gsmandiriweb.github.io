#!/bin/bash
set -euo pipefail

API_KEY="sk-LnZ1YzCw8WLuW2GNW9jkiF9dkzMy7RIEGGsjsrCfxpntj1vX"
ENDPOINT="https://apihub.agnes-ai.com/v1/images/generations"
OUT_DIR="/home/edward/Rice/BSM/cvbsm-site/public/photos/generated"
TMP_DIR=$(mktemp -d)

STYLE="Modern industrial photograph. Concrete and steel greys. Subtle red accent #e22b1e. No people, no text, no logos. Ultra-realistic, high detail. Suitable as a section divider for a construction materials website."

generate() {
  local name="$1" prompt="$2"

  echo "=== Generating ${name} ==="

  PAYLOAD=$(python3 -c "
import json
p = {
    'model': 'agnes-image-2.1-flash',
    'prompt': '''${prompt}''',
    'size': '2K',
    'ratio': '16:9',
    'extra_body': {'response_format': 'url'}
}
print(json.dumps(p))
")

  RESPONSE=$(curl -s --max-time 120 -X POST "$ENDPOINT" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

  IMG_URL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['url'])" 2>/dev/null || true)

  if [ -z "$IMG_URL" ]; then
    echo "  ERROR: $RESPONSE"
    return 1
  fi

  RAW="${TMP_DIR}/${name}_raw.png"
  echo "  Downloading..."
  curl -s --max-time 60 -o "$RAW" "$IMG_URL"

  FINAL="${OUT_DIR}/${name}.webp"
  ffmpeg -y -i "$RAW" \
    -vf "scale=1792:1024:flags=lanczos" \
    -c:v libwebp -quality 85 -compression_level 6 \
    "$FINAL" 2>/dev/null

  SIZE_B=$(stat -c%s "$FINAL")
  KB=$((SIZE_B / 1024))
  DIMS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$FINAL")
  echo "  Saved: ${name}.webp  ${DIMS}  ${KB} KB"
}

# 1. steel-beam.webp — I-beam cross-section macro
generate "steel-beam" \
  "Macro photograph of a steel I-beam cross-section. Close-up showing the H-shaped profile, raw cut steel edges, metal grain texture, and industrial welding marks. Dramatic side lighting emphasizing depth and geometry. ${STYLE}"

# 2. wire-mesh.webp — BRC welded wire mesh pattern
generate "wire-mesh" \
  "Flat-on photograph of welded wire mesh BRC fence panel. Uniform diamond grid pattern repeating across the frame. Galvanized steel wire with visible weld points at each intersection. Strong geometric pattern. ${STYLE}"

# 3. corrugated-metal.webp — corrugated roofing texture
generate "corrugated-metal" \
  "Corrugated galvanized metal roofing sheet texture. Parallel ridges and grooves catching directional light, creating strong horizontal rhythm. Weathered surface with subtle rust spots and scratches. ${STYLE}"

# 4. concrete-wall.webp — raw concrete wall
generate "concrete-wall" \
  "Raw exposed concrete wall surface. Brutalist architectural texture with form-tie holes, subtle aggregate grain, and weathered grey tones. Even diffused lighting for use as a website section background. ${STYLE}"

rm -rf "$TMP_DIR"
echo ""
echo "=== All done ==="
