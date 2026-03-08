#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
DEFAULT_CARDS = ROOT / "cards.txt"
DEFAULT_HIGHLIGHTS = ROOT / "highlights.txt"
DEFAULT_ASSETS = ROOT / "assets"
DEFAULT_OUTPUT = ROOT / "output" / "foundry-card.gif"

CANVAS_SIZE = (1793, 960)
BG_COLOR = (0, 0, 0, 255)
TEXT_MAIN = (230, 238, 242)
TEXT_SUB = (220, 220, 220)
TEXT_ACTIVE = (255, 255, 255)
BULLET_COLOR = (107, 187, 255)

CARD_ALIASES = {
    "uptime card": "uptime",
    "uptime": "uptime",
}


def normalize_text(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"\.[a-z0-9]+$", "", value)
    value = value.replace("&", "and")
    value = re.sub(r"[^a-z0-9]+", "", value)
    return value


def normalize_card_name(card_name: str) -> str:
    alias = CARD_ALIASES.get(card_name.strip().lower(), card_name)
    return normalize_text(alias)


@dataclass
class AssetMatch:
    card_name: str
    theme: str
    path: Path


class AssetResolver:
    def __init__(self, assets_dir: Path) -> None:
        self.assets_dir = assets_dir
        self.files = sorted([p for p in assets_dir.iterdir() if p.is_file() and p.suffix.lower() == ".png"])
        self.index: dict[str, list[tuple[Path, str]]] = {}
        for path in self.files:
            stem = path.stem
            left, theme = self._split_stem(stem)
            key = normalize_text(left)
            self.index.setdefault(key, []).append((path, theme))

    @staticmethod
    def _split_stem(stem: str) -> tuple[str, str]:
        if " - " in stem:
            left, right = stem.split(" - ", 1)
            return left.strip(), right.strip()
        if "-" in stem:
            left, right = stem.split("-", 1)
            return left.strip(), right.strip()
        return stem.strip(), ""

    def resolve(self, card_name: str) -> AssetMatch:
        key = normalize_card_name(card_name)
        matches = self.index.get(key, [])
        if not matches:
            raise FileNotFoundError(
                f"No PNG asset found for '{card_name}'. Expected something like '{card_name} - Theme.png' in {self.assets_dir}"
            )
        if len(matches) > 1:
            names = ", ".join(path.name for path, _ in matches)
            raise RuntimeError(f"Multiple PNGs matched '{card_name}': {names}")
        path, theme = matches[0]
        return AssetMatch(card_name=card_name, theme=theme, path=path)

    def check(self, cards: list[str]) -> list[str]:
        errors: list[str] = []
        used: set[Path] = set()
        for card in cards:
            try:
                match = self.resolve(card)
                used.add(match.path)
            except Exception as exc:  # noqa: BLE001
                errors.append(str(exc))

        unused = [p.name for p in self.files if p not in used]
        if unused:
            errors.append("Unused PNG files: " + ", ".join(unused))
        return errors


def read_lines(path: Path) -> list[str]:
    lines = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        line = re.sub(r"^\d+\.\s*", "", line)
        lines.append(line)
    return lines


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def fit_image(image: Image.Image, max_size: tuple[int, int]) -> Image.Image:
    image = image.copy()
    image.thumbnail(max_size, Image.LANCZOS)
    return image


def draw_bullet_list(draw: ImageDraw.ImageDraw, items: Iterable[str], x: int, y: int, font: ImageFont.ImageFont, line_gap: int) -> int:
    bullet_font = load_font(font.size if hasattr(font, "size") else 28, bold=True)
    current_y = y
    for item in items:
        draw.text((x, current_y), "•", fill=BULLET_COLOR, font=bullet_font)
        draw.text((x + 28, current_y), item, fill=TEXT_SUB, font=font)
        current_y += line_gap
    return current_y


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left


def center_x(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, canvas_width: int) -> int:
    return max(0, (canvas_width - text_width(draw, text, font)) // 2)


def build_frame(highlights: list[str], cards: list[str], current_idx: int, resolver: AssetResolver) -> Image.Image:
    image = Image.new("RGBA", CANVAS_SIZE, BG_COLOR)
    draw = ImageDraw.Draw(image)

    title_font = load_font(80, bold=True)
    section_font = load_font(58, bold=True)
    list_font = load_font(34)
    list_active_font = load_font(34, bold=True)
    right_title_font = load_font(58, bold=True)

    draw.text((center_x(draw, "Foundry Card", title_font, CANVAS_SIZE[0]), 28), "Foundry Card", fill=TEXT_MAIN, font=title_font)

    left_x = 70
    y = 155
    draw.text((left_x, y), "Highlights", fill=TEXT_MAIN, font=section_font)
    y = draw_bullet_list(draw, highlights, left_x, y + 68, list_font, 46)

    y += 22
    draw.text((left_x, y), "Cards", fill=TEXT_MAIN, font=section_font)
    y += 58
    for idx, card in enumerate(cards):
        is_active = idx == current_idx
        bullet = "◆" if is_active else "•"
        bullet_font = load_font(28, bold=True)
        card_font = list_active_font if is_active else list_font
        card_color = TEXT_ACTIVE if is_active else TEXT_SUB
        draw.text((left_x + 4, y), bullet, fill=BULLET_COLOR, font=bullet_font)
        draw.text((left_x + 24, y - 2), card, fill=card_color, font=card_font)
        y += 36

    match = resolver.resolve(cards[current_idx])
    heading = f"{match.card_name} - {match.theme}" if match.theme else match.card_name
    heading_x = 990
    draw.text((heading_x, 160), heading, fill=TEXT_MAIN, font=right_title_font)

    card_img = Image.open(match.path).convert("RGBA")
    card_img = fit_image(card_img, (520, 420))
    img_x = 995 + max(0, (520 - card_img.width) // 2)
    img_y = 330 + max(0, (420 - card_img.height) // 2)
    image.alpha_composite(card_img, (img_x, img_y))

    return image


def save_gif(frames: list[Image.Image], out_path: Path, duration: int) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # Build every frame as a fully rendered standalone image so GitHub does not
    # need to reconstruct later frames from prior frame deltas.
    palette_frames = [frame.convert("RGB").convert("P", palette=Image.ADAPTIVE) for frame in frames]

    # Duplicate the first frame so the animation starts on a clean static frame.
    palette_frames.insert(0, palette_frames[0].copy())

    # Keep the duplicated first frame on screen a bit longer.
    durations = [max(duration, 1500)] + [duration] * (len(palette_frames) - 1)

    palette_frames[0].save(
        out_path,
        save_all=True,
        append_images=palette_frames[1:],
        duration=durations,
        loop=0,
        optimize=False,
        disposal=2,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build the Foundry Card animated GIF from text files and PNG assets.")
    parser.add_argument("--cards", type=Path, default=DEFAULT_CARDS, help=f"Cards text file (default: {DEFAULT_CARDS.name})")
    parser.add_argument("--highlights", type=Path, default=DEFAULT_HIGHLIGHTS, help=f"Highlights text file (default: {DEFAULT_HIGHLIGHTS.name})")
    parser.add_argument("--assets", type=Path, default=DEFAULT_ASSETS, help="Assets folder containing PNG files")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT, help="Output GIF path")
    parser.add_argument("--duration", type=int, default=1200, help="Milliseconds per frame")
    parser.add_argument("--check", action="store_true", help="Validate cards/assets and exit without generating the GIF")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if not args.cards.exists():
        print(f"Missing cards file: {args.cards}", file=sys.stderr)
        return 1
    if not args.highlights.exists():
        print(f"Missing highlights file: {args.highlights}", file=sys.stderr)
        return 1
    if not args.assets.exists():
        print(f"Missing assets folder: {args.assets}", file=sys.stderr)
        return 1

    cards = read_lines(args.cards)
    highlights = read_lines(args.highlights)
    resolver = AssetResolver(args.assets)

    problems = resolver.check(cards)
    if problems:
        print("Asset check:")
        for item in problems:
            print(f"- {item}")
        if args.check:
            return 1
        # Continue only if problems are just 'Unused PNG files'.
        blocking = [p for p in problems if not p.startswith("Unused PNG files:")]
        if blocking:
            return 1

    if args.check:
        print("All listed cards matched a PNG asset.")
        return 0

    frames = [build_frame(highlights, cards, idx, resolver) for idx in range(len(cards))]
    save_gif(frames, args.out, args.duration)
    print(f"Saved GIF to: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
