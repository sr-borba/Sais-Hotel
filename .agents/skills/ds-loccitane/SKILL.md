# ds-loccitane

Design System skill for **Spa L'Occitane en Provence @ Sais Hotel**.

Loads brand context, token rules, and co-branding constraints so any agent working on Spa materials applies the 2026 L'Occitane brandbook correctly without manual re-briefing.

---

## When to invoke

Use this skill whenever you're creating or editing:

- HTML / CSS for Spa materials (cardápio, menu digital, sinalização, presentations)
- Social media templates for the Spa
- Any co-branded piece that combines Sais Hotel identity with L'Occitane en Provence

Do **not** invoke for general Sais Hotel materials that don't involve L'Occitane branding.

---

## Brand identity quick reference

### Register
**Brand** — design IS the product. Every visual and verbal decision communicates the Provençal experience.

### Positioning
> "O ritual de beleza natural que transporta a luz da Provence para a beira-mar — savoir-faire da Haute-Provence, hospitalidade alagoana do Sais."

### Archetypes
- **Primary — Lover**: sensorial pleasure, natural beauty, the five senses as language
- **Secondary — Sage / Caregiver**: Provençal expertise, heritage, biodiversity — nearly 50 years of know-how

### Voice
- Tone: contained (not effusive), sensorial, atemporal, warm
- Use: *ritual, gesto, savoir-faire, Haute-Provence, luz, aroma, pele, herança*
- Avoid: "tratamento" without sensorial context, corporate spa jargon, superlatives
- Never: "promoção", "oferta imperdível", discount language — the brand invites, never pressures
- Signature: *"A luz da Provença, em ritual, à beira-mar."*

---

## Color tokens (`oc-spa-tokens.css`)

Import this file **after** `sais-tokens.css` in any Spa HTML. All `--oc-*` tokens are defined there.

### Fundamentals (official Maison 2026)

| Token | Hex | Pantone | Rule |
|-------|-----|---------|------|
| `--oc-soleil-jaune` | `#FFC700` | 7548C | **Dogmatic restricted use** — accents only, never dominant |
| `--oc-noir-terres` | `#3E2B2E` | Black 5C | Logo, headings, signage — replaces old dark blue |
| `--oc-beige-pierres` | `#F2E9DB` | 9224C | Fabrics, surfaces, product photography backgrounds |
| `--oc-blanc-brule` | `#FBF9F6` | — | Body background, presentations, frames |
| `--oc-blanc-brule-moyen` | `#F9F5F0` | — | Product photography background |

### Semantic text tokens (defined in DS HTML — add to your stylesheets)

```css
--oc-text-ink:   #3E2B2E; /* 16.5:1 — headings, emphasis */
--oc-text-body:  #5C4A4D; /*  7.7:1 — body paragraphs   */
--oc-text-muted: #7A6568; /*  5.1:1 — captions, labels  */
--oc-text-faint: #9E8E90; /*  3.0:1 — decorative display type only */
```

### Complementary (Cézanne-inspired)

```
--oc-lichen:               #9C774C   (Pantone 2318C)
--oc-pierre-fontaine:      #A58671   (Pantone 4047C)
--oc-terre-oxyde:          #A56E5C   (Pantone 6034C)
--oc-roussillon-orageux:   #8E4C43   (Pantone 7600C)
--oc-lavande-valensolaire: #5B3845   (Pantone 7645C)
--oc-olivier-feuille:      #7D7C67   (Pantone 4222C)
--oc-chant-grillon:        #738287   (Pantone 4187C)
--oc-nuit-haute-provencale:#232B38   (Pantone 303C)
--oc-garrigue:             #53624B   (Pantone 2409C)
--oc-verveine-soir:        #A2A468   (Pantone 5777C)
```

---

## Typography (official Maison fonts — local assets only, not in this repo)

| Token | Family | Use |
|-------|--------|-----|
| `--oc-font-serif` | LOccitane Serif | Display editorial, large headings, quotes |
| `--oc-font-serif-condensed` | LOccitane Serif Condensed | Uppercase display, section titles (weight 500) |
| `--oc-font-sans` | LOccitane Sans | Body text, UI, menus, captions |

**Font files** live at `P:\06 - MARKETING\Material_Tropicalis2022\Comunicação\Sais Hotel\L'Occinatne en Provence\LOGOS\2026\Tipografia\Web Font Suite\`. They are licensed Maison assets — do not commit to this repository.

`@font-face` declarations with correct relative paths are already in `oc-spa-tokens.css`.

### Typography rules
- Minimum font size: **0.75rem (12px)** — no text below this threshold
- Display letter-spacing: **≥ −0.01em** (never tighter)
- `text-wrap: balance` on all headings and display titles
- Body line-length cap: **65–75ch**

---

## Layout rules

- **No `border-left` accent stripes** — use tinted backgrounds, full borders, or leading numbers/icons
- **`border-radius: 0`** throughout — retilíneo, consistent with ds-sais
- Spacing: generous. Content sections `padding: 5.5rem 3rem`. Slides `padding: 4rem 3rem`.
- Soleil Jaune as accent: use `border-top: 2px solid var(--oc-soleil-jaune)` on callout blocks — never `border-left`
- The `.accent-line` bar (2px × 36px Soleil Jaune) sits at top-center of every major section

---

## Co-branding with ds-sais

| Role | ds-sais token | OC Spa token |
|------|--------------|--------------|
| Dark / headings | `--sais-dark` #2B1A0D | `--oc-noir-terres` #3E2B2E |
| Light background | `--sais-areia` #EBE3CF | `--oc-beige-pierres` #F2E9DB |
| Base background | `--sais-cream` #F5F0E4 | `--oc-blanc-brule` #FBF9F6 |
| Accent | `--sais-gold` #8B7240 | `--oc-soleil-jaune` #FFC700 (restricted) |
| Display font | Domaine Display | `--oc-font-serif-condensed` |
| Body font | Domaine Sans Text | `--oc-font-sans` |

> **Critical:** `--sais-gold` (#8B7240) ≠ `--oc-soleil-jaune` (#FFC700). Never substitute one for the other. The OC yellow is more saturated and has dogmatic restricted use.

---

## Logo rules

- **Colors**: Noir des Terres or Blanc Brûlé only. Never Soleil Jaune as logo color.
- **Minimum size**: 29mm (main logo). Below 29mm: use "small logo" version.
- **Monogram "Lo"**: independent trademark — 10mm circle (main), 6–10mm (petit), never below 5mm. Relief only, never flat sticker.
- **Don'ts**: no rotation, distortion, condensation, shadow, glow, outline, or geometric frames. Never omit "EN PROVENCE".
- **SVG files**: `spa-loccitane/logos/` in this repo (see pendências — stacked "SPA" version still missing).

---

## Logo files in this repo

| File | Use |
|------|-----|
| `spa-loccitane/logos/Logotipo.svg` | Horizontal wordmark — dark on light or light on dark with CSS filter |
| `spa-loccitane/logos/Monograma.svg` | "Lo" monogram / decorative watermark |

CSS filter for logo on dark backgrounds:
```css
filter: brightness(0) invert(1); /* → white */
filter: brightness(0) invert(0.88) sepia(0.1); /* → warm beige */
```

---

## Open pendências (as of 2026-07-01)

1. **Stacked "SPA" logo** — request from L'Occitane or recreate from .ai source
2. **Beige travertin ≠ Beige des Pierres?** — confirm HEX equivalence before using local PNGs as official
3. **Monogram "Lo" vector** — request separate file from L'Occitane (current SVG may be full signature, not independent mark)
4. **Condensed font .woff2** — convert `LOccitaneSerifCondensed-Medium.ttf` via fontsquirrel
5. **In-location photography** — Spa Sais has no original photography; only generic Maison assets available

---

## Files in this repo

```
spa-loccitane/
  DS-SPA-LOCCITANE-2026.html   ← Design System reference (visual, editorial layout)
  DS-SPA-LOCCITANE-2026.md     ← Design System reference (text/tokens documentation)
  oc-spa-tokens.css            ← @font-face + --oc-* CSS custom properties
  logos/
    Logotipo.svg               ← SPA L'Occitane wordmark (SVG)
    Monograma.svg              ← L'Occitane monogram (SVG)
PRODUCT.md                     ← Brand register and design principles (impeccable context)
```

> Fonts are NOT in this repo — licensed Maison assets. See font path note above.
