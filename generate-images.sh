#!/bin/bash
set -euo pipefail

API_KEY="sk-LnZ1YzCw8WLuW2GNW9jkiF9dkzMy7RIEGGsjsrCfxpntj1vX"
ENDPOINT="https://apihub.agnes-ai.com/v1/images/generations"
OUT_DIR="/home/edward/Rice/BSM/cvbsm-site/public/photos/generated"
TMP_DIR=$(mktemp -d)

STYLE="Modern industrial photograph. Concrete and steel greys dominate the palette. One single red accent color #e22b1e. No people, no text, no logos. Clean composition, dramatic directional lighting, shallow depth of field. Ultra-realistic, high detail."

declare -A IMAGES
IMAGES[hero]="Still-life scene of stacked BRC welded-wire fence panels leaning against concrete wall, coiled barbed wire, and a steel highway guard-rail section resting on a raw concrete floor. Industrial warehouse setting. ${STYLE}"
IMAGES[brc]="Close-up of a BRC welded-wire mesh panel. Diamond grid pattern, galvanized steel wire, sharp shadows on concrete. ${STYLE}"
IMAGES[wire]="Galvanized barbed-wire coil resting on rough concrete surface. Rust-tinged steel barbs catching directional light. ${STYLE}"
IMAGES[rail]="Highway W-beam guard-rail section standing on concrete floor. Dented galvanized steel, bolt holes visible. ${STYLE}"

declare -A SIZES
SIZES[hero]="2K"
SIZES[brc]="1K"
SIZES[wire]="1K"
SIZES[rail]="1K"

declare -A RATIOS
RATIOS[hero]="16:9"
RATIOS[brc]="4:3"
RATIOS[wire]="4:3"
RATIOS[rail]="4:3"

declare -A TARGET_W
TARGET_W[hero]=1600
TARGET_W[brc]=1200
TARGET_W[wire]=1200
TARGET_W[rail]=1200

declare -A TARGET_H
TARGET_H[hero]=900
TARGET_H[brc]=900
TARGET_H[wire]=900
TARGET_H[rail]=900

for name in hero brc wire rail; do
  echo "=== Generating ${name}.webp ==="
  
  PROMPT="${IMAGES[$name]}"
  SIZE="${SIZES[$name]}"
  RATIO="${RATIOS[$name]}"
  TW="${TARGET_W[$name]}"
  TH="${TARGET_H[$name]}"

  # Build request JSON
  PAYLOAD=$(cat <<EOF
{
  "model": "agnes-image-2.1-flash",
  "prompt": "${PROMPT}",
  "size": "${SIZE}",
  "ratio": "${RATIO}",
  "extra_body": {
    "response_format": "url"
  }
}
EOF
)

  echo "  Requesting ${SIZE} ${RATIO}..."
  RESPONSE=$(curl -s -X POST "$ENDPOINT" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

  # Extract URL
  IMG_URL=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['url'])" 2>/dev/null || true)

  if [ -z "$IMG_URL" ]; then
    echo "  ERROR: No URL in response. Full response:"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
    continue
  fi

  echo "  Downloading: $IMG_URL"
  RAW="${TMP_DIR}/${name}_raw.png"
  curl -s -o "$RAW" "$IMG_URL"

  if [ ! -s "$RAW" ]; then
    echo "  ERROR: Download failed"
    continue
  fi

  # Get original dimensions
  ORIG_SIZE=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$RAW")
  echo "  Original size: $ORIG_SIZE"

  # Resize and convert to webp
  FINAL="${OUT_DIR}/${name}.webp"
  ffmpeg -y -i "$RAW" \
    -vf "scale=${TW}:${TH}:flags=lanczos" \
    -c:v libwebp -quality 85 -compression_level 6 \
    "$FINAL" 2>/dev/null

  FINAL_SIZE=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$FINAL")
  FINAL_BYTES=$(stat -c%s "$FINAL")
  echo "  Saved: ${FINAL} (${FINAL_SIZE}, $(echo "scale=1; $FINAL_BYTES/1024" | bc) KB)"
  echo ""
done

rm -rf "$TMP_DIR"
echo "=== Done ==="
ls -lh "${OUT_DIR}"/*.webp
