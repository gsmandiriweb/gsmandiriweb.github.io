#!/bin/bash
set -euo pipefail

API_KEY="sk-LnZ1YzCw8WLuW2GNW9jkiF9dkzMy7RIEGGsjsrCfxpntj1vX"
ENDPOINT="https://apihub.agnes-ai.com/v1/images/generations"
OUT_DIR="/home/edward/Rice/BSM/cvbsm-site/public/photos/generated"
TMP_DIR=$(mktemp -d)

STYLE="Modern industrial. Concrete and steel greys. One single red accent #e22b1e. No people, no text, no logos. Ultra-realistic, high detail."

generate() {
  local name="$1" prompt="$2" size="$3" ratio="$4" tw="$5" th="$6" fmt="$7" transparent="$8"
  
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

  if [ "$transparent" = "yes" ]; then
    # Generate on black bg → remove black → transparent
    NOBG="${TMP_DIR}/${name}_nobg.png"
    ffmpeg -y -i "$RAW" \
      -vf "scale=${tw}:${th}:flags=lanczos,colorkey=black:0.15:0.05" \
      -pix_fmt rgba \
      "$NOBG" 2>/dev/null
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

# 1. smoke-red.webp — transparent red smoke/mist
generate "smoke-red" \
  "Subtle red smoke or mist effect, wispy and atmospheric, swirling tendrils of dark red and crimson smoke on a pure black background. Industrial moody atmosphere. Red accent color #e22b1e fading through the smoke. No objects, no text." \
  "1K" "1:1" 800 800 "webp" "yes"

# 2. sparks.webp — transparent sparks/embers
generate "sparks" \
  "Subtle orange-red sparks and glowing embers floating and falling, industrial welding spark shower on a pure black background. Bright points of light with motion blur trails. Hot metal sparks, #e22b1e and orange tones. No objects, no text." \
  "1K" "1:1" 800 800 "webp" "yes"

# 3. grid-light.webp — light through industrial grid
generate "grid-light" \
  "Abstract dramatic light rays streaming through an industrial steel grid or lattice structure. Volumetric god-rays cutting through darkness. Grey steel structure silhouetted with subtle red #e22b1e highlights on the light beams. Moody atmospheric lighting. ${STYLE}" \
  "2K" "16:9" 1600 900 "webp" "no"

# 4. concrete-crack.webp — concrete texture with cracks
generate "concrete-crack" \
  "Close-up of aged concrete surface with fine cracks, industrial wear marks, and weathered texture. Grey tones with subtle surface variation. Raw brutalist concrete wall or floor. ${STYLE}" \
  "2K" "16:9" 1600 900 "webp" "no"

# 5. wire-detail.webp — extreme BRC mesh close-up
generate "wire-detail" \
  "Extreme close-up abstract photograph of welded wire mesh BRC fence panel. Geometric diamond grid pattern filling the frame. Galvanized steel wire intersections with welding points visible. Abstract repetitive industrial pattern. ${STYLE}" \
  "1K" "4:3" 1200 900 "webp" "no"

# 6. steel-plate.webp — brushed steel plate texture
generate "steel-plate" \
  "Brushed steel plate surface with subtle directional scratches and soft reflections. Industrial metal texture, neutral silver-grey tones. Clean metallic surface usable as a background. ${STYLE}" \
  "2K" "16:9" 1600 900 "webp" "no"

rm -rf "$TMP_DIR"
echo ""
echo "=== All done ==="
