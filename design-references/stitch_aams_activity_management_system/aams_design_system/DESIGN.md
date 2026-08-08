---
name: AAMS Design System
colors:
  surface: '#16130c'
  surface-dim: '#16130c'
  surface-bright: '#3d3930'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b14'
  surface-container: '#231f18'
  surface-container-high: '#2e2922'
  surface-container-highest: '#39342c'
  on-surface: '#eae1d5'
  on-surface-variant: '#d1c5b1'
  inverse-surface: '#eae1d5'
  inverse-on-surface: '#343028'
  outline: '#9a907d'
  outline-variant: '#4e4636'
  surface-tint: '#ecc159'
  primary: '#fff3e1'
  on-primary: '#3f2e00'
  primary-container: '#ffd369'
  on-primary-container: '#775a00'
  inverse-primary: '#775a00'
  secondary: '#c2c7d0'
  on-secondary: '#2c3138'
  secondary-container: '#474c54'
  on-secondary-container: '#b7bcc6'
  tertiary: '#e2f9ff'
  on-tertiary: '#00363f'
  tertiary-container: '#80e7fd'
  on-tertiary-container: '#006877'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf98'
  primary-fixed-dim: '#ecc159'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5a4300'
  secondary-fixed: '#dee2ed'
  secondary-fixed-dim: '#c2c7d0'
  on-secondary-fixed: '#171c23'
  on-secondary-fixed-variant: '#42474f'
  tertiary-fixed: '#a4eeff'
  tertiary-fixed-dim: '#6dd5ea'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e5a'
  background: '#16130c'
  on-background: '#eae1d5'
  surface-variant: '#39342c'
typography:
  display-lg:
    fontFamily: syne
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: syne
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: hankenGrotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: hankenGrotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: hankenGrotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: hankenGrotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is engineered for a premium, production-grade SaaS experience that balances institutional authority with cutting-edge technology. The personality is **sophisticated, editorial, and precise**, drawing heavy inspiration from high-end developer tools and modern productivity software.

The aesthetic utilizes a **Dark-mode First** approach to minimize eye strain and maximize the impact of the accent colors. It blends **Minimalism** with subtle **Glassmorphism** to create a sense of digital depth. The UI should evoke a feeling of "quiet power"—efficient, focused, and high-performance.

Key visual principles:
- **Intentionality:** Every element serves a functional purpose; decoration is minimal.
- **Editorial Polish:** High-impact typography and generous whitespace.
- **Subtle Technicality:** Micro-depth and thin borders create a structured, "engineered" feel without the weight of traditional skeuomorphism.

## Colors
The palette is built upon a foundation of deep, atmospheric neutrals contrasted by a singular, high-energy accent.

- **Primary Background (Urban Shadow):** `#222831` serves as the canvas for the entire application.
- **Accent (Gilded Light):** `#FFD369` is used sparingly for primary actions, active navigation states, and critical highlights to draw focus.
- **Surface & Borders:** A middle-tier gray (`#393E46`) is used for component backgrounds and subtle separators.
- **Typography:** Primary text is a soft off-white (`#EEEEEE`) to reduce contrast fatigue, while secondary metadata uses muted grays (`#ADB5BD`).
- **Status Tones:** We utilize desaturated, "mature" versions of green, amber, and red to indicate status without breaking the sophisticated dark aesthetic.

## Typography
The typography system creates a "Rude/Mirage" contrast—pairing high-impact, bold display faces with clean, technical sans-serifs.

- **Headlines:** Use **Syne** (serving as the 'Rude' style equivalent) for all display and headline levels. It should be set with tight letter spacing and heavy weights to create a commanding presence.
- **Body & UI:** Use **Hanken Grotesk** (serving as the 'Blue Mirage' style equivalent) for all functional text. It is optimized for legibility in data-heavy SaaS environments.
- **Scale:** Maintain generous line heights (1.5x - 1.6x) for body text to ensure a spacious, editorial feel. 
- **Hierarchy:** Use the `label-md` style for eyebrows, table headers, and small metadata tags, often pairing it with uppercase styling and increased letter spacing.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict adherence to an 8px spacing system. 

- **Density:** High whitespace is a core requirement. Content should never feel "cramped."
- **Grid:** Use a 12-column grid for desktop views. Margins should be a minimum of 32px on desktop to provide breathing room.
- **Breakpoints:**
  - **Mobile:** 0-600px (1-column layout, 16px margins).
  - **Tablet:** 601-1024px (Fluid columns, 24px margins).
  - **Desktop:** 1025px+ (12-columns, max-width 1440px, centered).
- **Reflow:** On mobile, complex tables should transition to card-based layouts to maintain the premium feel without sacrificing usability.

## Elevation & Depth
This design system avoids heavy, muddy shadows in favor of **Tonal Layers** and **Glassmorphism**.

- **Surface Layering:** The primary background is the lowest level. Cards and containers use a slightly lighter fill (`#393E46`) or a semi-transparent blur (20px blur, 10% opacity white overlay).
- **Micro-Depth:** Depth is conveyed through a 1px solid border (`#393E46` or `rgba(255,255,255,0.1)`) rather than drop shadows.
- **Active Glow:** Primary buttons and active states may use a very soft, low-spread outer glow using the Gilded Light color (`rgba(255, 211, 105, 0.15)`) to simulate a "backlit" tech effect.

## Shapes
The shape language is consistent and approachable, using **Rounded (0.5rem)** as the base unit.

- **Components:** Buttons, input fields, and small chips utilize the standard `0.5rem` radius.
- **Containers:** Larger surfaces like cards and modals should use `rounded-lg` (1rem) to create a distinct nesting hierarchy.
- **Icons:** Use linear icons with a 2px stroke weight to match the technical precision of the typography.

## Components
Consistent implementation of these components ensures the "High-end Startup" aesthetic.

- **Buttons:** 
  - *Primary:* Gilded Light background, Urban Shadow text. No shadow, 1px inset border for sharpness.
  - *Secondary:* Ghost style with a thin border and subtle hover state (background opacity change).
- **Cards:** 
  - Apply the glassmorphic treatment: `backdrop-filter: blur(12px); background: rgba(57, 62, 70, 0.5);`.
  - Border: 1px solid `rgba(238, 238, 238, 0.05)`.
- **Input Fields:** 
  - Dark background (`#1A1F26`), subtle 1px border. 
  - Active state: Border changes to Gilded Light with a faint 2px outer glow.
- **Chips/Badges:** 
  - Small, uppercase text (`label-md`). 
  - Status badges use a low-opacity background of their respective status color (e.g., Success is soft green text on 10% green background).
- **Navigation:** 
  - Vertical sidebar for high-density SaaS utility. Active links are marked by a vertical Gilded Light bar on the left and a slight text weight increase.
- **Data Tables:**
  - Minimalist. No vertical lines. Horizontal lines should be very faint (`rgba(255,255,255,0.05)`). Header row uses `label-md` typography.