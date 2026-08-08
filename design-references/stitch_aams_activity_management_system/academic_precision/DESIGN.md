---
name: Academic Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444653'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#003853'
  on-tertiary: '#ffffff'
  tertiary-container: '#005074'
  on-tertiary-container: '#68c4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#c9e6ff'
  tertiary-fixed-dim: '#89ceff'
  on-tertiary-fixed: '#001e2f'
  on-tertiary-fixed-variant: '#004c6e'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
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
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  layout-margin-mobile: 16px
  layout-margin-desktop: 40px
  gutter: 24px
---

## Brand & Style
The design system is built for an Academic Management System (AAMS), prioritizing clarity, institutional trust, and high-velocity utility. The aesthetic leans into **Corporate / Modern** minimalism, utilizing significant white space to reduce cognitive load for administrators and students alike. 

The visual narrative is "Stability through Structure." It employs a systematic approach to density, ensuring that complex data feels organized rather than overwhelming. The interface feels light and airy, but is grounded by a rigorous adherence to grid alignments and a sophisticated Navy Blue primary anchor.

## Colors
The palette is dominated by **#F8FAFC** (Background) and **#FFFFFF** (Surface) to create a tiered "light-on-light" depth model. 

- **Primary Navy (#1E40AF):** Used for primary actions, active navigation states, and brand identifiers. It must always maintain a 4.5:1 contrast ratio against the background.
- **Secondary Slate (#64748B):** Reserved for supporting text and icon iconography to soften the visual hierarchy compared to the primary blue.
- **Borders (#E2E8F0):** Used strictly for structural definition. Do not use borders on cards that utilize shadows unless they signify a "selected" state.

## Typography
The system uses **Inter** exclusively to maintain a utilitarian, tech-forward feel. 

- **Weight Selection:** To compensate for light backgrounds, the standard body weight is 400. Semantic "Medium" labels use 500, and headings use 600 or 700 to ensure clear visual anchoring.
- **Readability:** Line heights are slightly generous (1.5x for body) to ensure long-form academic content remains legible. 
- **Scale:** Large display sizes use tight negative letter-spacing to maintain a modern, "compact" feel.

## Layout & Spacing
The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Spacing Rhythm:** Based on a 4px baseline. Most internal component spacing should adhere to 8px (sm) or 16px (md).
- **Surface Padding:** White surfaces (cards) should use a minimum of 24px (lg) padding to maintain an airy, premium feel. 
- **Containers:** Content should be constrained to a max-width of 1280px on large displays to prevent excessive line lengths.

## Elevation & Depth
This design system uses a combination of **Tonal Layers** and **Ambient Shadows** to define hierarchy.

- **Level 0 (Background):** #F8FAFC.
- **Level 1 (Cards/Surfaces):** Pure #FFFFFF with a 1px border of #E2E8F0.
- **Level 2 (Active/Hover):** A soft, diffused shadow. Use `0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)`.
- **Level 3 (Modals/Popovers):** Higher elevation shadow with a 15% opacity blur to draw focus.

## Shapes
The shape language is "Soft-Modern." 

- **Standard Elements:** Buttons, input fields, and small components use 8px (`0.5rem`) corners.
- **Large Elements:** Cards and containers use 12px-16px (`1rem`) to provide a friendlier, approachable institutional feel.
- **Interactive States:** Avoid sharp corners entirely to maintain the SaaS-optimized aesthetic.

## Components
- **Buttons:** Primary buttons are solid Navy (#1E40AF) with white text. Secondary buttons use a white background with a #E2E8F0 border and Navy text.
- **Inputs:** Use a 1px #E2E8F0 border that transitions to a 2px #1E40AF border on focus. Include a soft blue outer glow (ring) on focus.
- **Cards:** Always pure white. Use 24px internal padding. Title inside cards should use `title-lg`.
- **Chips/Badges:** Use "light" semantic fills (e.g., Light Blue background with Dark Blue text) for status indicators to keep the interface from becoming too heavy.
- **Data Tables:** Use #F8FAFC for the header background and 1px #E2E8F0 horizontal dividers. Avoid vertical lines to maintain a clean look.
- **Navigation:** Vertical sidebars should use a subtle gray background (#F1F5F9) to distinguish from the primary content area white cards.