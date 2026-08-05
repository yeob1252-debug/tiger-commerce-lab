"""캐릭터 파츠 4종(head/body/arms/prop) 배경 제거 + 여백 크롭 스크립트.

원본 assets/characters/tiger-part-*.png 는 RGBA 모드지만 전 픽셀 alpha=255로
저장되어 있어(실제 투명 채널 없음, 흰 배경이 그대로 픽셀로 박혀 있음) 카드에
올리면 사각형 배경으로 보인다. rembg로 실제 배경을 제거하고, 투명 픽셀 기준
바운딩박스로 크롭한 뒤 assets/characters/cutout/ 에 저장한다(기존 hero/
surprised/curious 처리와 동일한 방식, 원본 파일은 건드리지 않는다).
"""
import os
from rembg import remove
from PIL import Image

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE, "assets", "characters")
DST_DIR = os.path.join(SRC_DIR, "cutout")
NAMES = ["tiger-part-head", "tiger-part-body", "tiger-part-arms", "tiger-part-prop"]
PADDING_RATIO = 0.035

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

    alpha = img.getchannel("A")
    hist = alpha.histogram()
    print(f"{name}: saved {dst_path} size={img.size} opaque255={hist[255]} transparent0={hist[0]}")

print("done")
