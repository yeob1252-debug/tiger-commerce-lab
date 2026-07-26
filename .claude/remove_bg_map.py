"""한국 지도 이미지 배경 제거 스크립트."""
import os
from rembg import remove
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "assets", "characters", "map-korea.png")
DST_DIR = os.path.join(BASE, "assets", "characters", "cutout")
DST = os.path.join(DST_DIR, "map-korea.png")
PADDING_RATIO = 0.02

os.makedirs(DST_DIR, exist_ok=True)

with open(SRC, "rb") as f:
    input_bytes = f.read()

output_bytes = remove(input_bytes)

with open(DST, "wb") as f:
    f.write(output_bytes)

img = Image.open(DST).convert("RGBA")
bbox = img.getbbox()
if bbox:
    left, top, right, bottom = bbox
    w, h = right - left, bottom - top
    pad_x = int(w * PADDING_RATIO)
    pad_y = int(h * PADDING_RATIO)
    left = max(0, left - pad_x)
    top = max(0, top - pad_y)
    right = min(img.width, right + pad_x)
    bottom = min(img.height, bottom + pad_y)
    img = img.crop((left, top, right, bottom))
img.save(DST)
print(f"saved {DST} size={img.size}")
