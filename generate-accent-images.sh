#!/bin/bash
set -euo pipefail

API_KEY="sk-LnZ1YzCw8WLuW2GNW9jkiF9dkzMy7RIEGGsjsrCfxpntj1vX"
ENDPOINT="https://apihub.agnes-ai.com/v1/images/generations"
OUT_DIR="/home/edward/Rice/BSM/cvbsm-site/public/photos/generated"
TMP_DIR=$(mktemp -d)

STYLE="Modern industrial photograph. Concrete and steel greys. One single red accent #e22b1e. No people, no text, no logos. Ultra-realistic, high detail."

generate() {
  local name="$1" prompt="$2" size="$3" ratio="$4" tw="$5" th="$6" fmt="$7"
  
  echo "=== Generating ${name} ==="
  
  PAYLOAD=$(python3 -c "
import json
p = {
    'model': 'agnes-image-2.1-flash',
    'prompt': '''${prompt}''',
    'size': '${size}',
    'ratio': '${ratio}',
    'extra_body': {'response_format': 'url'}
}
print(json.dumps(p))
")

  RESPONSE=$(curl -s --max-time 90 -X POST "$ENDPOINT" \
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

  FINAL="${OUT_DIR}/${name}.${fmt}"

  if [ "$fmt" = "png" ]; then
    # Generate on white bg, then remove white → transparent
    NOBG="${TMP_DIR}/${name}_nobg.png"
    ffmpeg -y -i "$RAW" \
      -vf "scale=${tw}:${th}:flags=lanczos,colorkey=white:0.1:0.05" \
      -pix_fmt rgba \
      "$NOBG" 2>/dev/null
    cp "$NOBG" "$FINAL"
  elif [ "$fmt" = "webp" ] && [[ "$name" == glow-* ]]; then
    # Glow: generate on black bg, remove black → transparent, keep reds
    NOBG="${TMP_DIR}/${name}_nobg.png"
    ffmpeg -y -i "$RAW" \
      -vf "scale=${tw}:${th}:flags=lanczos,colorkey=black:0.15:0.05" \
      -pix_fmt rgba \
      "$NOBG" 2>/dev/null
    # Convert to webp with alpha
    ffmpeg -y -i "$NOBG" \
      -c:v libwebp -quality 90 -compression_level 6 \
      -pix_fmt yuva420p \
      "$FINAL" 2>/dev/null
  else
    ffmpeg -y -i "$RAW" \
      -vf "scale=${tw}:${th}:flags=lanczos" \
      -c:v libwebp -quality 85 -compression_level 6 \
      "$FINAL" 2>/dev/null
  fi

  SIZE_B=$(stat -c%s "$FINAL")
  KB=$((SIZE_B / 1024))
  DIMS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$FINAL")
  echo "  Saved: ${name}.${fmt}  ${DIMS}  ${KB} KB"
}

# 1. bg-steel.webp — abstract brushed steel & concrete
generate "bg-steel" \
  "Abstract brushed steel and concrete texture. Neutral industrial greys with subtle metallic sheen. Soft directional lighting. Usable as a seamless full-bleed website section background. ${STYLE}" \
  "2K" "16:9" 1600 900 "webp"

# 2. bg-blueprint.webp — technical blueprint
generate "bg-blueprint" \
  "Technical blueprint line drawing of BRC welded-wire mesh geometry and highway guard-rail cross-section. Very faint white thin lines on muted grey-blue background. Schematic engineering drawing feel. Minimal, clean, architectural. No text, no labels, no logos." \
  "2K" "16:9" 1600 900 "webp"

# 3. red-accent.png — transparent red brush stroke
generate "red-accent" \
  "A single bold abstract red brush stroke / streak on a pure white background. Dynamic diagonal motion. Solid red color #e22b1e. Paint texture visible. No other elements. No text." \
  "1K" "1:1" 800 800 "png"

# 4. metal-cards.webp — subtle metallic panel texture
generate "metal-cards" \
  "Subtle metallic panel texture with fine light scratches and brushed aluminium surface. Neutral silver-grey. Can be used behind product cards as a website background. ${STYLE}" \
  "2K" "16:9" 1600 900 "webp"

# 5. glow-red.webp — soft radial red glow, transparent
generate "glow-red" \
  "Soft radial red glow emanating from center on a pure black background. Warm red #e22b1e fading to transparent edges. Atmospheric light effect, bokeh-like. No objects, no text." \
  "1K" "1:1" 800 800 "webp"

rm -rf "$TMP_DIR"
echo ""
echo "=== All done ==="
