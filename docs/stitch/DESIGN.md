---
name: Fresh Market Grotesk
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3d4a41'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6d7a70'
  outline-variant: '#bccabe'
  surface-tint: '#006d43'
  primary: '#006d43'
  on-primary: '#ffffff'
  primary-container: '#00a86b'
  on-primary-container: '#00331d'
  inverse-primary: '#59de9b'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#00a773'
  on-tertiary-container: '#003320'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#78fbb6'
  primary-fixed-dim: '#59de9b'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005232'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The brand personality focuses on effortless clarity, thrift, freshness, and domestic order. Designed to alleviate the cognitive load and sensory friction of supermarket aisles, the visual environment balances utilitarian organization with inviting vitality. The user experience channels domestic calm, trust in budget calculations, and immediate tactile reward when ticking off items.

The design movement merges **Modern Tactile Minimalist** with contemporary mobile platform conventions (iOS Human Interface & Android Material 3 hybrid). It uses ample breathing room, subtle micro-elevations, crisp borders, and squircle surfaces. High readability under glare or motion is paramount, with vivid accents guiding the eye toward real-time totals and budget controls.

## Colors

The color system delivers high contrast, freshness, and instantaneous financial feedback:

- **Primary Emerald/Mint (`#00A86B`):** Represents freshness, completed items, savings, and affirmative actions. Use for primary action buttons, active navigation states, and confirmed items.
- **Secondary Sunlit Gold (`#FFB800`):** Communicates active promotions, pending calculations, item count callouts, and budget alerts without triggering anxiety.
- **Tertiary Crisp Mint (`#10B981`):** Serves as an accent for subtle success indicators, badges, and positive micro-states.
- **Neutral Base Slate (`#1E293B`):** Anchors headlines, primary text, and dense numeric data for contrast against supermarket glare.
- **Background & Surfaces:** Off-white canvas (`#F8FAFC`) paired with pure white cards (`#FFFFFF`) and warm muted stroke layers (`#E2E8F0`) to create clear spatial tiers.
- **Semantic Accents:** Urgent warnings or deletions use crisp Coral (`#EF4444`); item discounts and bulk deals use Amber (`#F59E0B`).

## Typography

The design system employs **Plus Jakarta Sans** across all roles to ensure geometric balance, legibility at high scanning speeds, and a welcoming tone.

- **Numerical & Financial Formatting:** All currency representations in Brazilian Real (R$) use tabular figures (`font-variant-numeric: tabular-nums`) with heavy weight (`700` or `800`) to guarantee aligned decimal alignment during dynamic cart updates.
- **Hierarchy Rules:** High-level totals and aisle category headings dominate via weight rather than extreme size.
- **Mobile Constraints:** Display levels scale dynamically down on smaller screens, keeping headings compact to avoid truncating item titles or brand names.

## Layout & Spacing

Layouts follow an adaptable 4-column structure on mobile devices, transitioning to an 8-column layout on tablets and a 12-column fixed grid on desktop screens (max width 1200px).

- **Margins & Safe Zones:** Mobile devices utilize a default outer margin of `1rem` (16px) with an explicit bottom clearance (minimum 80px) to accommodate fixed summary bars and thumb-friendly checkout actions.
- **Gutter Distribution:** A constant `1rem` column gutter ensures comfortable separation between dual-column product tiles or grouped aisle filters.
- **Compact Vertical Rhythm:** Item rows utilize `space-md` gaps to maximize vertical density while keeping tap targets above 48px in height.

## Elevation & Depth

Visual depth is achieved through layered tonal surfaces complemented by soft, colored ambient shadows:

- **Level 0 (Canvas):** Soft neutral base (`#F8FAFC`). No shadow.
- **Level 1 (List Cards & Tiles):** White cards (`#FFFFFF`) with a 1px structural stroke in `#E2E8F0` and an ambient drop shadow: `0px 2px 8px -2px rgba(30, 41, 59, 0.05)`.
- **Level 2 (Active/Dragging & Modals):** Lifted interactive items feature enhanced depth: `0px 8px 24px -4px rgba(30, 41, 59, 0.10)`.
- **Floating Totalizer / Sticky Bottom Bar:** Suspended above content with a slight backdrop filter blur (`blur(12px)`) at 90% opacity, supported by `0px -4px 16px rgba(0, 0, 0, 0.04)`.

## Shapes

The interface embraces an approachable, ergonomic shape language:

- **Base Radius (0.5rem / 8px):** Form fields, action pills, segmented controls, and nested badges.
- **Large Radius (1rem / 16px):** Standard product cards, modal sheets, and floating summary blocks.
- **Extra Large Radius (1.5rem / 24px):** Primary sticky buttons and major category hero containers.
- **Pill Form (Full Radius):** Quantity increment stepper counters, category chips, and price tag tags.

## Components

### Buttons
- **Primary:** Background in `#00A86B`, text `#FFFFFF`, font weight `700`. Subtle active downscale (`scale(0.98)`) for tactile feedback.
- **Secondary / Action:** Soft mint container (`#E8F5E9`) with `#00A86B` label.
- **Utility / Tertiary:** Transparent background, slate text (`#475569`), with a soft border (`#CBD5E1`).

### Chips & Filters
Pill-shaped containers (`height: 36px`) for aisle filters (e.g., "Hortifrúti", "Padaria", "Carnes"). Active state uses emerald green fill with white text; inactive state uses white fill with a soft border (`#E2E8F0`) and neutral text (`#475569`).

### List Items & Shopping Rows
Individual item cards feature:
- Left: Customized circular checkbox (`24px`) with a green affirmative check and haptic spring response.
- Center: Product title (`body-lg`, semi-bold) with quantity metadata (`body-sm`, muted). Checked items shift to muted grey with a clean strikethrough transition.
- Right: Inline steppers (`-`, `qty`, `+`) paired with real-time Brazilian Real price calculations (`R$ 0,00`).

### Checkboxes & Selection Controls
Rounded-circle controls with a minimum 48px hit area. When unchecked, a 2px border in `#CBD5E1` sits against white. When checked, the background fills with `#00A86B` showing an animated white checkmark.

### Input Fields
Inputs use a white base, 1px border (`#E2E8F0`), and generous horizontal padding (`1rem`). On focus, they display a 2px outer ring in primary emerald (`#00A86B`) with zero ambient displacement.

### Totalizer Bar (Specialty Component)
A persistent bottom component anchored above the system gesture bar. Features split metadata: left section displays item count and total budget tracker; right section presents the running cart sum (`currency-display`, R$) over an emerald CTA ("Finalizar Compra").
