# OneTwo Dating App - Design Guidelines

## Design Philosophy
Embrace the duality concept through stark black and white contrast. The Yin Yang symbol represents balance, harmony, and the complementary nature of connections. Design should be minimal, focused, and eliminate all unnecessary elements.

## Visual Identity

### Logo & Branding
- **Primary Logo**: Yin Yang symbol (☯️) - clean, modern interpretation
- **App Name**: "OneTwo" displayed in modern, geometric sans-serif
- Logo placement: Always centered on pages for symmetry and balance

### Color System
**Strict Duotone Palette:**
- Primary Black: `#000000` (pure black for text, backgrounds, primary elements)
- Primary White: `#FFFFFF` (pure white for backgrounds, text on dark)
- Gray: `#808080` (only for subtle borders/dividers if absolutely necessary)

**NO other colors permitted** - this creates striking visual impact and reinforces the Yin Yang concept.

### Typography
**Font Selection:**
- Primary: Modern geometric sans-serif (Inter, Poppins, or Outfit)
- Headings: 600-700 weight
- Body: 400-500 weight
- Inputs: 400 weight

**Hierarchy:**
- H1 (App name "OneTwo"): 48px / Bold
- H2 (Page titles): 32px / Semibold  
- H3 (Step labels): 20px / Medium
- Body text: 16px / Regular
- Input labels: 14px / Medium
- Button text: 16px / Semibold

### Spacing System
Use consistent 8px grid system:
- Micro spacing: 8px, 16px
- Standard spacing: 24px, 32px
- Large spacing: 48px, 64px
- Section spacing: 80px, 96px

## Page-Specific Design

### Home Page (`/`)
**Layout:** Centered vertical stack
- Yin Yang logo (120px diameter) at top
- "OneTwo" wordmark below logo (48px)
- Welcome text centered (16px, light weight)
- Two full-width buttons stacked vertically (16px gap between)

**Background:** Pure white (#FFFFFF)
**Content:** Pure black (#000000)

**Buttons:**
- "Créer un compte": Black background, white text, rounded corners (8px)
- "J'ai déjà un compte": White background, black text, black 2px border, rounded corners (8px)
- Height: 56px, width: 100% (max 400px centered)

### Signup Page (`/signup`)
**Layout:** Single-column form, left-aligned labels
- Page title "Créer votre compte" at top (32px)
- 4 sequential steps displayed in vertical flow
- Each step clearly numbered ("Étape 1", "Étape 2", etc.) in gray (#808080)
- Input fields: white background, thin black border (1px), 48px height, 8px border radius
- Placeholder text: light gray (#C0C0C0)
- Final "Créer" button: black background, white text, 56px height, full width

**Step Visual Treatment:**
- Step numbers in small, muted text
- Field labels in black, medium weight
- Generous spacing between steps (32px)

### Login Page (`/login`)
**Layout:** Centered form
- "Connexion" heading (32px, semibold)
- "Bon retour parmi nous !" subheading (16px, regular)
- Email and password fields stacked
- "Se connecter" button (primary style)
- "Retour" button below (secondary style)

**Visual Treatment:**
- Clean, spacious form design
- Consistent with signup page input styling
- Buttons with 16px vertical gap

## Component Library

### Input Fields
- Background: White
- Border: 1px solid black
- Border radius: 8px
- Height: 48px
- Padding: 16px
- Font: 16px regular
- Focus state: 2px black border (no color change)
- Error state: Red text below field (exception to black/white for critical errors only)

### Buttons
**Primary (Black):**
- Background: Black
- Text: White
- Border: None
- Hover: Slightly lighter black (#1A1A1A)
- Active: Pressed effect (scale 0.98)

**Secondary (White/Outline):**
- Background: White
- Text: Black
- Border: 2px solid black
- Hover: Light gray background (#F5F5F5)
- Active: Pressed effect

All buttons: 8px border radius, 56px height, 16px semibold text

### Form Validation
- Error messages: Small red text below field (only exception to black/white)
- Success states: Subtle checkmark icon (black) at field end
- Required fields: Asterisk (*) in black next to label

## Layout & Responsive Design

### Container
- Max width: 480px (mobile-optimized)
- Horizontal padding: 24px
- Centered on viewport

### Breakpoints
- Mobile (default): 320px - 768px
- Tablet/Desktop: 768px+ (same design, larger max-width container up to 480px)

### Vertical Rhythm
- Consistent spacing between form sections: 32px
- Page top/bottom padding: 48px
- Button spacing: 16px

## Interaction Design

### Animations
**Minimal and purposeful only:**
- Button press: Scale 0.98, 100ms ease
- Page transitions: Simple fade, 200ms
- Input focus: Border thickens smoothly, 150ms
- NO distracting animations - maintain zen-like simplicity

### Navigation Flow
- Smooth transitions between pages
- Clear back navigation (always visible on login page)
- Form submission: Loading state on button (text changes to "Chargement...")

## Accessibility
- High contrast (black/white) ensures WCAG AAA compliance
- All inputs have visible labels
- Focus states clearly visible (thicker borders)
- Touch targets minimum 48px height
- Form errors announced clearly

## Images
**No images except logo** - The Yin Yang symbol is the only visual element. This reinforces minimalism and ensures instant load times.

**Logo Implementation:**
- Use SVG for crisp rendering at any size
- Black and white only (no gradients)
- Clean, balanced proportions matching traditional Yin Yang aesthetics

## Overall Aesthetic
Zen minimalism meets modern dating. Every pixel serves a purpose. The stark black/white creates visual drama while the Yin Yang symbolizes the app's core promise: finding your complementary match. Clean, uncluttered, focused solely on the essential user journey of account creation and login.