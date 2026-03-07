# Foundry Card GIF Builder

This builds a looping GIF from:

- `highlights.txt` for the bullet list
- `cards.txt` for the card order
- `assets/*.png` for the right-side preview images

## Expected asset naming

Each PNG should follow this pattern:

`Card Name - Theme.png`

Examples:

- `Gauge - Cool.png`
- `Digital Clock - Midnight.png`
- `Title - Vintage.png`

The builder is forgiving about spacing and case, so these also match:

- `AnalogMeter - Warm.png`
- `button - Military.png`

## Local setup

Create a virtual environment and install dependencies:

```bash
pip install -r requirements.txt
```

## Build the GIF

Put your PNG files in `assets/`, then run:

```bash
python build_gif.py
```

Output goes to:

```text
output/foundry-card.gif
```

## Validate asset names first

```bash
python build_gif.py --check
```

## Optional flags

```bash
python build_gif.py --duration 1000
python build_gif.py --assets ./assets --out ./output/foundry-card.gif
```
