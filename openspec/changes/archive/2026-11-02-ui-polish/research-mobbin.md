# Mobbin references — ui-polish (2026-11-02)

Visual estimates from iOS screens, not measured CSS.

## Ambient glow
- Spotify playlist orange · https://mobbin.com/screens/e2697a6f-9951-4d66-adcd-2b3ee0e69de3
- Spotify playlist purple · https://mobbin.com/screens/e454259a-0b01-4765-9db4-b198062ddbcb
- Apple Music lyrics · https://mobbin.com/screens/d09f35c1-c150-4580-b8a9-08fc8b7858fa

The glow is one vertical linear wash. It is saturated behind the artwork, falls to the ground colour by about 45–55% of
the screen height, and ends exactly on the ground colour. There is no radial halo, no visible edge and no glow
around the cover.

## Card material
- Apple Music widgets · https://mobbin.com/screens/f16650b2-d584-4420-803b-b3df68385ec3
- Apple Music artist card · https://mobbin.com/screens/a79ba4f1-223e-4792-87c6-c21cd657cbc4
- Apple Books Home · https://mobbin.com/screens/f4688b5b-bbd4-43aa-9da7-edd780d338fb

Flat translucent fill, radius ~20–24px, a ~1px low-contrast border, no inner glow and no coloured outer shadow. Covers
get a tight, neutral drop shadow.

## Type hierarchy
- Detail: Spotify playlist (above), Apple Music album https://mobbin.com/screens/f090ae7c-0fc2-49a9-9b83-28a416f4c5ea,
  Letterboxd https://mobbin.com/screens/f41976a6-dc7b-47f1-b2c6-5e28640d8f77
- Rows: Spotify https://mobbin.com/screens/e0e5c85e-1854-4ba0-bd09-c1c80a7b4d95, Apple Books
  https://mobbin.com/screens/ef128c0e-e5bc-4425-9a74-20895f9ef4d2, Letterboxd https://mobbin.com/screens/f87bd30e-5ee1-4ae7-b709-864c811e9931

| Role | Size and weight |
|---|---|
| Title | 28–34px, 700, -0.02em, line-height ~1.1 |
| Section header | 20–22px, 600–700 (or an 11–12px caps label) |
| Row title | 16–17px, 600, line-height 1.25 |
| Meta | 13px, 400, muted, one line with dot separators |
| Caps label | 11px, 600, +0.08em, muted |

Each step is about 1.2x. There are no sizes between 14 and 16 and none below 11. Weight carries the hierarchy more
than size does.

## Chips / filters
- Spotify https://mobbin.com/screens/e0e5c85e-1854-4ba0-bd09-c1c80a7b4d95, Pinterest
  https://mobbin.com/screens/f19eb118-a528-4b5e-9c95-77dfd923d293, Letterboxd tabs
  https://mobbin.com/screens/ed3357be-d60a-40a2-9608-fa4997929f24

Pills ~36px tall with a ≥44px touch target, 14px medium text and a tonal fill with no border or glow. The selected
state uses an accent or inverted fill.

## Empty states
- Letterboxd https://mobbin.com/screens/f64404c2-85aa-45ea-8ef1-bdf469344c95: text only, a ~20px muted headline and a
  ~13px line, centred.
