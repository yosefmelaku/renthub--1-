# Design Document: Login Page Selection

## Overview

The Login Page Selection (or LoginSelectionPage) is the first entry point for new RentHub users. It presents a clean, welcoming interface that allows users to select between two distinct portals: Landlord Studio (for property owners) and Tenants (for renters). The component combines visual clarity with responsive design to ensure an optimal user experience across all device sizes (mobile, tablet, desktop).

This page serves as the bridge between the public-facing RentHub interface and role-specific login flows. It establishes visual consistency with the RentHub design system by using the established color palette (emerald, coral, neutral grays) and Lucide React icons, ensuring cohesion with components like Navbar and existing LoginPage.

**Key Goals:**
- Simplify user onboarding by providing clear portal selection
- Ensure visual consistency with RentHub design system
- Support all device sizes with responsive, touch-friendly design
- Maintain accessibility standards for all users
- Provide clear interactive feedback (hover, focus states)

---

## Architecture

### Component Hierarchy

```
LoginSelectionPage (Container)
├── Heading ("Welcome! Where would you like to log in?")
├── ButtonContainer (responsive layout)
│   ├── LandlordButton
│   │   ├── ButtonText ("Landlord Studio")
│   │   └── ArrowIcon (Lucide React)
│   └── TenantsButton
│       ├── ButtonText ("Tenants")
│       └── ArrowIcon (Lucide React)
└── Background (light color covering full viewport)
```

### Data Flow

```
User loads LoginSelectionPage
       ↓
Component renders with responsive layout
       ↓
User clicks button (with debouncing to prevent multi-click)
       ↓
onClick handler triggered
       ↓
Optional: Show loading indicator (brief transition)
       ↓
Navigate to role-specific login flow (via React Router or navigation system)
```

### Integration Points

- **Routing System**: Connects to the existing navigation/routing system to direct users to `/login/landlord` or `/login/tenant` routes
- **Design System Tokens**: Uses RentHub color palette (emerald-600, coral/pink accent colors, gray neutrals)
- **Icon Library**: Leverages Lucide React for arrow icon consistency
- **Responsive Framework**: Utilizes Tailwind CSS breakpoints for responsive behavior

---

## Components and Interfaces

### 1. LoginSelectionPage Component

**Purpose:** Main component that renders the full selection page

**Props:**
```typescript
interface LoginSelectionPageProps {
  onSelectLandlord: () => void;      // Navigate to landlord login
  onSelectTenant: () => void;        // Navigate to tenant login
  isLoading?: boolean;               // Show loading state during navigation
}
```

**Key Responsibilities:**
- Render centered heading
- Display two selection buttons in responsive layout
- Manage button click events with debouncing
- Apply light background and full viewport coverage
- Ensure accessibility attributes (aria-labels, semantic HTML)

**Behavior:**
- On component mount: Render page with heading and two buttons
- On desktop/tablet: Display buttons side-by-side with equal width
- On mobile: Stack buttons vertically, full-width
- On button click: Debounce rapid clicks, show optional loading indicator, call navigation callback
- On keyboard navigation: Display visible focus state on buttons
- On mouse hover: Display hover state with visual change (color/shadow)

### 2. SelectionButton Subcomponent

**Purpose:** Reusable button component for portal selection

**Props:**
```typescript
interface SelectionButtonProps {
  label: string;                     // "Landlord Studio" or "Tenants"
  onClick: () => void;
  isLoading?: boolean;
  variant: 'primary' | 'outline';    // primary = filled coral, outline = border style
  ariaLabel: string;                 // Accessibility text
  disabled?: boolean;
}
```

**Styling:**
- **Primary variant** (Landlord Studio):
  - Background: Coral/pink color (e.g., `bg-rose-500` or similar RentHub accent)
  - Text: White, bold
  - Border: None or subtle
  - Hover: Darker coral shade
  - Focus: Visible focus outline or ring

- **Outline variant** (Tenants):
  - Background: Transparent or light gray/white
  - Border: Gray border (e.g., `border-gray-300`)
  - Text: Gray/dark gray, bold
  - Hover: Light background tint, border darkens
  - Focus: Visible focus outline or ring

- **Shared styling:**
  - Icon: Lucide React ArrowRight, positioned to the right of text
  - Border radius: Rounded (e.g., `rounded-lg` or `rounded-xl`)
  - Padding: Generous padding for touch targets (minimum 44px height on mobile per accessibility)
  - Font: Bold, medium size (e.g., `font-semibold`, `text-base` or `text-lg`)
  - Transition: Smooth color and shadow transitions on hover/focus

### 3. Layout Components

**Desktop/Tablet Layout (≥768px):**
- Heading: Centered at top with generous bottom margin
- Button Container: Flexbox row with gap between buttons
- Each button: Equal width (e.g., `flex-1` with max-width constraint)
- Buttons aligned at same height

**Mobile Layout (<768px):**
- Heading: Centered with slightly smaller font size
- Button Container: Flexbox column with gap between buttons
- Each button: Full width with consistent height
- Buttons stack vertically

---

## Data Models

### Navigation States

```typescript
type LoginSelectionState = 
  | 'idle'           // Page ready for user interaction
  | 'loading'        // Transitioning to login flow
  | 'error';         // Navigation error (rarely needed)

type SelectedPortal = 'landlord' | 'tenant' | null;
```

### Color Tokens

Based on RentHub design system:

```typescript
const colors = {
  background: {
    light: '#ffffff',           // or '#f9fafb' for off-white
  },
  button: {
    primary: {
      background: '#f43f5e',    // Coral/pink (or emerald-600 alternative)
      text: '#ffffff',
      hover: '#e11d48',
      focus: '#be123c',
    },
    outline: {
      background: '#ffffff',    // or 'transparent'
      border: '#d1d5db',        // gray-300
      text: '#374151',          // gray-700
      hover: '#f3f4f6',         // gray-100
      focusRing: '#10b981',     // emerald-600 (consistent with RentHub)
    },
  },
  text: {
    primary: '#111827',         // gray-900
  },
};
```

---

## Correctness Properties

**Note:** This feature is primarily a UI component with layout, styling, and interaction requirements. Property-based testing (PBT) is **not appropriate** for this feature because:

1. The component has **no pure logic** to test universally across many inputs
2. **Rendering behavior** is fixed regardless of input (same button labels, fixed layout rules)
3. **Interaction handling** is deterministic with specific callbacks
4. Testing relies on **example-based assertions** and visual verification

**Testing Approach:** This feature will be validated through example-based unit tests, integration tests, and visual/accessibility regression tests rather than property-based testing.

---

## Error Handling

### Click Handler Debouncing

**Issue:** Rapid clicking may trigger multiple navigations if not handled
**Solution:** Implement debounce or disable buttons during transition
**Implementation:**
```typescript
const [isNavigating, setIsNavigating] = useState(false);

const handleSelectPortal = useCallback((portal: 'landlord' | 'tenant') => {
  if (isNavigating) return; // Prevent multiple clicks
  setIsNavigating(true);
  // Brief delay to show loading state
  setTimeout(() => {
    if (portal === 'landlord') {
      onSelectLandlord();
    } else {
      onSelectTenant();
    }
  }, 300);
}, [isNavigating, onSelectLandlord, onSelectTenant]);
```

### Navigation Failures

**Issue:** Navigation to login flow fails silently
**Solution:** Implement error boundary or catch navigation errors
**Implementation:**
```typescript
const handleNavigation = useCallback(async (portal: 'landlord' | 'tenant') => {
  try {
    // Navigate based on portal selection
    if (portal === 'landlord') {
      navigate('/login/landlord');
    } else {
      navigate('/login/tenant');
    }
  } catch (error) {
    console.error('Navigation failed:', error);
    setIsNavigating(false); // Re-enable buttons
    // Optionally show error toast/message
  }
}, [navigate]);
```

### Accessibility Failures

**Issue:** Keyboard navigation or screen readers can't identify buttons
**Solution:** Include proper aria-labels and semantic HTML
**Implementation:**
```typescript
<button
  aria-label="Login as a property owner in Landlord Studio"
  onClick={handleSelectLandlord}
  className="..."
>
  Landlord Studio
  <ArrowRight className="ml-2" />
</button>
```

---

## Testing Strategy

### Unit Tests (Example-Based)

**Test File:** `LoginSelectionPage.test.tsx`

#### 1. Rendering Tests
- ✓ Heading "Welcome! Where would you like to log in?" renders
- ✓ "Landlord Studio" button renders with correct label
- ✓ "Tenants" button renders with correct label
- ✓ Both buttons have arrow icons
- ✓ Light background color is applied to page
- ✓ Page covers full viewport (no overflow)

#### 2. Button Styling Tests
- ✓ Landlord Studio button has coral/pink background
- ✓ Landlord Studio button has white text
- ✓ Tenants button has outline/border style
- ✓ Tenants button text is dark gray
- ✓ Buttons have equal width on desktop
- ✓ Buttons are full-width on mobile

#### 3. Interaction Tests
- ✓ Clicking Landlord Studio button calls `onSelectLandlord` callback
- ✓ Clicking Tenants button calls `onSelectTenant` callback
- ✓ Rapid clicks are debounced (only one navigation triggered)
- ✓ Buttons are disabled during loading state
- ✓ Loading indicator appears when `isLoading` prop is true

#### 4. Responsive Layout Tests
- ✓ On desktop (≥768px): Buttons display side-by-side
- ✓ On mobile (<768px): Buttons stack vertically
- ✓ On mobile: Buttons are full-width
- ✓ No horizontal scrolling on mobile viewport

#### 5. Accessibility Tests
- ✓ Heading is marked with `<h1>` tag
- ✓ Landlord Studio button has descriptive aria-label
- ✓ Tenants button has descriptive aria-label
- ✓ Buttons are keyboard navigable (Tab key)
- ✓ Focus state is visually distinguishable
- ✓ Color contrast meets WCAG AA standards
- ✓ Touch targets are minimum 44x44px on mobile

#### 6. Hover and Focus State Tests
- ✓ Hover state changes button color/shadow
- ✓ Focus state displays visible outline or ring
- ✓ Focus state meets contrast requirements
- ✓ Hover and focus states are distinct from default state

#### 7. Visual Regression Tests
- ✓ Desktop layout matches snapshot
- ✓ Tablet layout matches snapshot
- ✓ Mobile layout matches snapshot
- ✓ Hover state matches snapshot
- ✓ Focus state matches snapshot
- ✓ Loading state matches snapshot

### Integration Tests

**Test File:** `LoginSelectionPage.integration.test.tsx`

#### 1. Navigation Integration
- ✓ Clicking Landlord Studio navigates to `/login/landlord` route
- ✓ Clicking Tenants navigates to `/login/tenant` route
- ✓ Navigation completes within 500ms
- ✓ Previous route is not re-rendered after navigation

#### 2. Loading State Integration
- ✓ Loading indicator appears during navigation
- ✓ Buttons are disabled while loading
- ✓ Loading state clears after navigation completes
- ✓ Error is caught if navigation fails

### Accessibility Regression Tests

**Manual and Automated:**
- ✓ Axe accessibility scan passes
- ✓ Screen reader announces heading and button labels correctly
- ✓ Keyboard navigation works (Tab through buttons, Enter to activate)
- ✓ Color contrast passes WCAG AA standard
- ✓ No focus traps or inaccessible regions

### Test Implementation Example

```typescript
// Unit test example
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginSelectionPage } from './LoginSelectionPage';

describe('LoginSelectionPage', () => {
  it('renders the heading', () => {
    render(<LoginSelectionPage onSelectLandlord={() => {}} onSelectTenant={() => {}} />);
    expect(screen.getByText('Welcome! Where would you like to log in?')).toBeInTheDocument();
  });

  it('renders both buttons with correct labels', () => {
    render(<LoginSelectionPage onSelectLandlord={() => {}} onSelectTenant={() => {}} />);
    expect(screen.getByRole('button', { name: /landlord studio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tenants/i })).toBeInTheDocument();
  });

  it('calls onSelectLandlord when Landlord Studio button is clicked', () => {
    const onSelectLandlord = jest.fn();
    render(<LoginSelectionPage onSelectLandlord={onSelectLandlord} onSelectTenant={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /landlord studio/i }));
    expect(onSelectLandlord).toHaveBeenCalledTimes(1);
  });

  it('debounces rapid clicks', () => {
    const onSelectLandlord = jest.fn();
    const { rerender } = render(
      <LoginSelectionPage onSelectLandlord={onSelectLandlord} onSelectTenant={() => {}} />
    );
    const button = screen.getByRole('button', { name: /landlord studio/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    // Only one call should be registered
    expect(onSelectLandlord).toHaveBeenCalledTimes(1);
  });

  it('disables buttons during loading', () => {
    const { rerender } = render(
      <LoginSelectionPage onSelectLandlord={() => {}} onSelectTenant={() => {}} isLoading={false} />
    );
    let buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).not.toBeDisabled());

    rerender(<LoginSelectionPage onSelectLandlord={() => {}} onSelectTenant={() => {}} isLoading={true} />);
    buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('displays buttons side-by-side on desktop', () => {
    render(<LoginSelectionPage onSelectLandlord={() => {}} onSelectTenant={() => {}} />);
    const container = screen.getByRole('region', { name: /button container/i });
    expect(container).toHaveClass('flex-row'); // or similar desktop layout class
  });

  it('stacks buttons vertically on mobile', () => {
    window.innerWidth = 500; // Mock mobile viewport
    render(<LoginSelectionPage onSelectLandlord={() => {}} onSelectTenant={() => {}} />);
    const container = screen.getByRole('region', { name: /button container/i });
    expect(container).toHaveClass('flex-col', 'md:flex-row'); // Responsive classes
  });
});
```

---

## Visual Design Specifications

### Typography

- **Heading:**
  - Font: Sans-serif (consistent with RentHub)
  - Size: Large (e.g., `text-3xl` to `text-4xl` on desktop, `text-2xl` on mobile)
  - Weight: Bold (e.g., `font-bold`)
  - Color: Primary text (`text-gray-900`)
  - Alignment: Center

- **Button Labels:**
  - Font: Sans-serif (consistent with RentHub)
  - Size: Medium-large (e.g., `text-base` to `text-lg`)
  - Weight: Semibold (e.g., `font-semibold`)
  - Color: White (primary button), Gray-700 (outline button)

### Spacing & Layout

- **Page Padding:**
  - Desktop: `px-8 py-16` or similar (e.g., 32px horizontal, 64px vertical)
  - Mobile: `px-4 py-8` or similar (e.g., 16px horizontal, 32px vertical)

- **Heading to Buttons Gap:**
  - Desktop: `gap-12` or `mb-12` (48px)
  - Mobile: `gap-8` or `mb-8` (32px)

- **Button Gap:**
  - Desktop: `gap-6` (24px between buttons)
  - Mobile: `gap-4` (16px between buttons)

- **Button Dimensions:**
  - Height: `py-3` to `py-4` (minimum 44px on mobile for touch accessibility)
  - Width: Equal width on desktop, full width on mobile
  - Padding: `px-6` to `px-8` (balanced horizontal padding)

### Border & Shadow

- **Buttons:**
  - Border radius: `rounded-lg` or `rounded-xl` (consistent rounding)
  - Box shadow: Subtle shadow on hover (e.g., `shadow-md`)
  - Outline button border: `border-gray-300`, width `border`

- **Focus Ring:**
  - Ring width: `ring-2` or `ring-4`
  - Ring color: `ring-emerald-500` (or primary color)
  - Ring offset: `ring-offset-2` for visibility

### Color Palette

| Element | Color | Tailwind Class | Hex Value |
|---------|-------|--------|-----------|
| Background | White | `bg-white` | #FFFFFF |
| Heading Text | Gray-900 | `text-gray-900` | #111827 |
| Primary Button Background | Coral/Rose | `bg-rose-500` | #f43f5e |
| Primary Button Text | White | `text-white` | #FFFFFF |
| Primary Button Hover | Dark Coral | `hover:bg-rose-600` | #e11d48 |
| Outline Button Background | White | `bg-white` | #FFFFFF |
| Outline Button Border | Gray-300 | `border-gray-300` | #d1d5db |
| Outline Button Text | Gray-700 | `text-gray-700` | #374151 |
| Outline Button Hover | Gray-50 | `hover:bg-gray-50` | #f9fafb |
| Focus Ring | Emerald-500 | `ring-emerald-500` | #10b981 |
| Icon Color | Inherits text color | — | — |

---

## Responsive Breakpoints

| Device | Viewport | Layout | Button Style |
|--------|----------|--------|--------------|
| Mobile | < 768px | Vertical (stacked) | Full-width, stacked, single column |
| Tablet | 768px - 1024px | Horizontal (side-by-side) | Equal width, 2 columns |
| Desktop | > 1024px | Horizontal (side-by-side) | Equal width, centered, max-width constraint |

---

## Implementation Notes

### File Structure

```
src/components/
├── LoginSelectionPage.tsx          (Main component)
├── LoginSelectionPage.test.tsx     (Unit tests)
├── LoginSelectionPage.module.css   (Optional: scoped styles)
└── SelectionButton.tsx              (Subcomponent, if extracted)
```

### Dependencies

- `react` - Component framework
- `lucide-react` - Icons (ArrowRight)
- `react-router-dom` - Navigation (if not using context-based navigation)
- `@testing-library/react` - Unit testing
- `@testing-library/jest-dom` - Jest matchers

### Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers: iOS Safari 14+, Chrome Android 90+
- Requires CSS Grid/Flexbox support

### Performance Considerations

- Component is lightweight (no data fetching, minimal state)
- Navigation callback should complete within 500ms
- No lazy loading required
- No infinite loops or memory leaks

---

## Accessibility Compliance

### WCAG 2.1 Level AA

| Criterion | Implementation | Status |
|-----------|---|---|
| **1.4.3 Contrast (Minimum)** | Text/button contrast ≥ 4.5:1 | ✓ Required in CSS |
| **2.1.1 Keyboard** | All buttons keyboard accessible via Tab + Enter | ✓ Native HTML |
| **2.1.4 Character Key Shortcuts** | No character-based shortcuts used | ✓ N/A |
| **2.4.3 Focus Order** | Focus order logical (left-to-right, top-to-bottom) | ✓ Natural DOM order |
| **2.4.7 Focus Visible** | Visible focus indicator on all interactive elements | ✓ CSS focus ring |
| **3.2.4 Consistent Identification** | Button labels consistent with other RentHub components | ✓ Design system |
| **4.1.2 Name, Role, Value** | Buttons have accessible name via aria-label or text content | ✓ Required in code |
| **4.1.3 Status Messages** | Loading/error states announced to screen readers | ✓ aria-live if applicable |

### Screen Reader Testing

- Heading should be announced as "Welcome, where would you like to log in? Heading level 1"
- Landlord button should be announced as "Landlord Studio, button"
- Tenants button should be announced as "Tenants, button"
- Icons should be ignored (aria-hidden or not announced)

---

## Future Enhancements

1. **Animation:** Add smooth transitions or entrance animations
2. **Personalization:** Display user's previous choice to returning users
3. **Error Recovery:** Add retry logic if navigation fails
4. **Skeleton Loading:** Show placeholder during page load
5. **Analytics:** Track which portal is selected most frequently
6. **Internationalization:** Support multiple languages for heading and button labels

