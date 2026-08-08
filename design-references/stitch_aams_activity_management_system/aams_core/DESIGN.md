---
name: AAMS Core
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434654'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#4f6073'
  on-secondary: '#ffffff'
  secondary-container: '#d2e4fb'
  on-secondary-container: '#556679'
  tertiary: '#7b2600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a33500'
  on-tertiary-container: '#ffc6b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d2e4fb'
  secondary-fixed-dim: '#b7c8de'
  on-secondary-fixed: '#0b1d2d'
  on-secondary-fixed-variant: '#38485a'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#812800'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  container-max: 1440px
---

## Brand & Style
The design system is engineered for the **Activity Management System (AAMS)**, targeting enterprise users who require high density and clarity for complex task orchestration. The personality is authoritative, precise, and systematic.

The visual direction follows a **Corporate Minimalist** aesthetic, drawing inspiration from high-utility platforms like the AWS Console and Stripe’s dashboard. It prioritizes information hierarchy through crisp layout structures rather than decorative elements. The UI leverages a "Flat-Plus" approach: primarily 2D surfaces that utilize 1px borders for separation, with depth used sparingly to signify interaction states. The emotional goal is to provide a sense of control, efficiency, and industrial-grade reliability.

## Colors
The palette is rooted in **Professional Blue (#0052CC)** to instill trust and focus. **Deep Navy (#1A2B3C)** serves as the secondary color, primarily used for navigation sidebars and high-level headers to create a strong visual anchor.

- **Backgrounds**: Use `#F4F7F9` for the application canvas. This off-white shade reduces eye strain compared to pure white while maintaining a clean appearance.
- **Surfaces**: Use pure `#FFFFFF` for cards, modals, and input fields to make them pop against the background.
- **Status**: Feedback colors (Emerald, Amber, Crimson) are used with high intentionality. Use saturated versions for icons/text and 10% opacity fills for background alerts to maintain the minimalist aesthetic.

## Typography
The system utilizes **Inter** exclusively to ensure a systematic and utilitarian feel across all interfaces. The typeface’s high x-height and neutral character make it ideal for data-heavy activity logs and management tables.

- **Scale**: A tight typographic scale is used to preserve vertical space. 
- **Hierarchy**: Use `Title-LG` for card headers and `Label-MD` (All Caps) for metadata and section headers within sidebars.
- **Data Density**: For tables and logs, `Body-MD` is the default. `Body-SM` should be reserved for secondary information like timestamps or helper text.

## Layout & Spacing
This design system employs a **Fixed-Fluid Hybrid Grid**. Main content areas use a 12-column grid with a 20px gutter, while navigation sidebars are fixed at 240px (expanded) or 64px (collapsed).

- **Spacing Rhythm**: All margins and paddings must be multiples of the 4px base unit. 16px (`md`) is the standard padding for cards and containers.
- **Mobile Adaptation**: On screens smaller than 768px, gutters shrink to 16px and the 12-column grid collapses into a single-column vertical stack.
- **Alignment**: Elements should be left-aligned to follow a "F-pattern" reading flow, essential for scanning activity lists quickly.

## Elevation & Depth
In line with the professional SaaS aesthetic, depth is communicated through **Low-contrast outlines** rather than shadows.

- **Borders**: Standard UI containers use a 1px solid border in `#E2E8F0`. 
- **Hover States**: Use a subtle increase in border contrast (to `#CBD5E1`) and a 2px vertical offset shadow with 4% opacity to indicate interactivity.
- **Active States**: High-priority active elements (like selected nav items) use the Primary Blue color as a 2px left-hand border accent.
- **Modals**: For the only high-elevation elements, use a "Soft Ambient" shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`.

## Shapes
The design system adopts a **Slightly Sharp** geometry to convey precision and technical sophistication. 

- **Radius**: All standard components (buttons, inputs, cards) use a 6px (`0.375rem`) corner radius. This is a departure from the "bubbly" consumer SaaS look, leaning into a more rigid, architectural feel.
- **Exceptions**: Success/Error badges and small tags may use a pill shape (full radius) to distinguish them from actionable buttons.

## Components
Consistent implementation of these components ensures the system remains professional and predictable.

- **Buttons**:
  - *Primary*: Solid Professional Blue with white text. 6px radius.
  - *Secondary*: White fill with 1px `#E2E8F0` border and Deep Navy text.
- **Input Fields**: White background with a 1px light gray border. Use a 2px Professional Blue border for the `:focus` state. Labels should always be positioned above the field using `Label-MD`.
- **Cards**: Pure white background, 1px border, 6px radius. No shadow by default. Headers within cards should have a subtle bottom border.
- **Data Tables**: The core of AAMS. Use `Body-MD` for row content. Header row should have a light gray background (`#F8FAFC`) and `Label-MD` text. Use 1px horizontal dividers only; avoid vertical lines to keep the view clean.
- **Status Chips**: Small, low-saturation backgrounds with high-saturation text (e.g., light emerald background with dark emerald text for "Completed").
- **Sidebar**: Deep Navy background. Icons should be 20px, stroke-based (not filled), with an opacity of 0.7 when inactive and 1.0 when active.