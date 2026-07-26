"""캐릭터 3종 이미지 배경 제거 + 여백 크롭 스크립트.

assets/characters/{hero,surprised,curious}.png 를 읽어 rembg로 배경을 제거하고,
투명 픽셀 기준 바운딩박스로 크롭한 뒤 assets/characters/cutout/ 에 저장한다.
"""
import os
from rembg import remove
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE, "assets", "characters")
DST_DIR = os.path.join(SRC_DIR, "cutout")
NAMES = ["found-it", "emphasize", "welcome"]
PADDING_RATIO = 0.035  # 크롭 후 사방에 남길 여백 비율

os.makedirs(DST_DIR, exist_ok=True)

for name in NAMES:
    src_path = os.path.join(SRC_DIR, f"{name}.png")
    dst_path = os.path.join(DST_DIR, f"{name}.png")

    with open(src_path, "rb") as f:
        input_bytes = f.read()

    output_bytes = remove(input_bytes)

    with open(dst_path, "wb") as f:
        f.write(output_bytes)

    img = Image.open(dst_path).convert("RGBA")
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
    img.save(dst_path)
    print(f"{name}: saved {dst_path} size={img.size}")

print("done")
