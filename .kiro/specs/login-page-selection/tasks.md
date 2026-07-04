# Implementation Plan: Login Page Selection

## Overview

This implementation plan converts the LoginSelectionPage design into a series of coding tasks. The component will be built incrementally, starting with core structure and styling, then adding interactivity, and finally integrating with the routing system. The feature uses TypeScript with React, Tailwind CSS for styling, and Lucide React for icons, consistent with the existing RentHub codebase.

**Tech Stack:**
- React (TypeScript)
- Tailwind CSS (responsive design)
- Lucide React (icons)
- React Router (navigation)
- React Testing Library (unit tests)

---

## Tasks

- [ ] 1. Create LoginSelectionPage component structure and setup
  - Create `src/components/LoginSelectionPage.tsx` with TypeScript interface
  - Define `LoginSelectionPageProps` with callback handlers
  - Set up basic component skeleton with imports
  - Create matching test file `src/components/LoginSelectionPage.test.tsx`
  - _Requirements: 1, 2, 3, 8_

- [ ] 2. Implement page layout and responsive structure
  - Create responsive flexbox layout (vertical on mobile, horizontal on desktop)
  - Apply full viewport coverage with light background color
  - Implement Tailwind breakpoints (md:768px for responsive behavior)
  - Center page content with appropriate padding
  - _Requirements: 4, 5, 6, 7_

- [ ] 3. Add heading and styling
  - Render "Welcome! Where would you like to log in?" as h1 heading
  - Apply prominent font size (text-3xl desktop, text-2xl mobile)
  - Center-align heading text
  - Apply primary text color from design system
  - Add appropriate spacing below heading (mb-12 desktop, mb-8 mobile)
  - _Requirements: 1, 7_

- [ ] 4. Create SelectionButton subcomponent
  - Create reusable button component with variant support
  - Accept props: label, onClick, isLoading, variant ('primary' | 'outline'), ariaLabel, disabled
  - Implement primary variant styling (coral background, white text)
  - Implement outline variant styling (border, transparent background)
  - Add Lucide React ArrowRight icon aligned to right
  - _Requirements: 2, 3, 7_

- [ ] 5. Implement button styling and visual states
  - Apply base button styles (padding, border-radius, font-weight)
  - Implement hover states (color shift, shadow enhancement)
  - Implement focus states (visible ring outline using emerald color)
  - Ensure hover and focus states meet color contrast requirements
  - Add smooth transitions for visual state changes
  - _Requirements: 9_

- [ ] 6. Implement responsive button layout
  - Position buttons side-by-side on desktop/tablet (flex-row with md: breakpoint)
  - Stack buttons vertically on mobile (flex-col)
  - Make buttons equal width on desktop using flex-1
  - Make buttons full-width on mobile
  - Add consistent gap between buttons (gap-6 desktop, gap-4 mobile)
  - Align buttons at same height on desktop
  - _Requirements: 4, 5_

- [ ] 7. Add Landlord Studio button
  - Render Landlord Studio SelectionButton with "Landlord Studio" label
  - Set variant to "primary" (coral background)
  - Apply coral/pink color (bg-rose-500) with white text
  - Set aria-label to descriptive text for accessibility
  - Reference hover and focus states from Task 5
  - _Requirements: 2, 8_

- [ ] 8. Add Tenants button
  - Render Tenants SelectionButton with "Tenants" label
  - Set variant to "outline" (border with transparent background)
  - Apply outline styling (border-gray-300, gray text)
  - Set aria-label to descriptive text for accessibility
  - Reference hover and focus states from Task 5
  - _Requirements: 3, 8_

- [ ] 9. Implement click handling and debouncing
  - Add state management for navigation tracking (isNavigating)
  - Implement debounce logic to prevent multiple rapid clicks
  - Update button disabled state during navigation
  - Call onSelectLandlord callback when Landlord button clicked
  - Call onSelectTenant callback when Tenants button clicked
  - _Requirements: 10_

- [ ] 10. Add loading state and optional loading indicator
  - Accept isLoading prop from parent
  - Show loading indicator during navigation transition
  - Disable buttons while isLoading is true
  - Optional: Display spinner or opacity change during loading
  - _Requirements: 10_

- [ ] 11. Add accessibility attributes
  - Add descriptive aria-labels to both buttons identifying the portal
  - Ensure heading uses semantic h1 element
  - Verify button elements use semantic HTML
  - Support keyboard navigation (Tab through buttons, Enter to activate)
  - Ensure focus states are visually distinguishable
  - _Requirements: 8_

- [ ] 12. Integrate with App.tsx routing
  - Import LoginSelectionPage into App.tsx
  - Add new 'login-selection' tab to AppTab type
  - Create route handling for login-selection page
  - Implement navigation callbacks to handle route transitions
  - Update Navbar to include login-selection tab option
  - Ensure navigation to `/login/landlord` and `/login/tenant` routes
  - _Requirements: 2, 3, 10_

- [ ] 13. Checkpoint - Component renders and basic styling verified
  - Verify LoginSelectionPage renders without errors
  - Confirm responsive layout works (desktop and mobile)
  - Verify all text content displays correctly
  - Check button styling matches design specification
  - Ensure no console errors or warnings
  - _Requirements: 1-10_

- [ ] 14. Write unit tests for component rendering
  - Test that heading "Welcome! Where would you like to log in?" renders
  - Test that Landlord Studio button renders with correct label
  - Test that Tenants button renders with correct label
  - Test that both buttons have ArrowRight icons
  - Test that light background color is applied
  - _Requirements: 1, 2, 3, 7_

- [ ] 15. Write unit tests for button styling
  - Test Landlord Studio button has coral background (bg-rose-500)
  - Test Landlord Studio button has white text
  - Test Tenants button has outline/border style
  - Test Tenants button has dark gray text
  - Test buttons have equal width on desktop viewport
  - Test buttons are full-width on mobile viewport
  - _Requirements: 4, 5, 7, 9_

- [ ] 16. Write unit tests for button interactions
  - Test clicking Landlord Studio button calls onSelectLandlord callback
  - Test clicking Tenants button calls onSelectTenant callback
  - Test rapid clicks are debounced (only one navigation triggered)
  - Test buttons are disabled during isLoading state
  - Test isLoading prop triggers disabled state on both buttons
  - _Requirements: 10_

- [ ] 17. Write unit tests for responsive layout
  - Test buttons display side-by-side on desktop viewport (≥768px)
  - Test buttons stack vertically on mobile viewport (<768px)
  - Test buttons are full-width on mobile
  - Test no horizontal scrolling occurs on mobile viewport
  - Test heading and buttons remain visible on all viewports
  - _Requirements: 4, 5_

- [ ] 18. Write unit tests for accessibility
  - Test heading is marked with h1 semantic element
  - Test Landlord Studio button has descriptive aria-label
  - Test Tenants button has descriptive aria-label
  - Test buttons are keyboard navigable (Tab key focus)
  - Test focus state is visually distinguishable
  - Test color contrast meets accessibility standards
  - _Requirements: 8_

- [ ] 19. Write unit tests for hover and focus states
  - Test hover state changes button color/shadow
  - Test focus state displays visible outline or ring
  - Test focus state meets contrast requirements
  - Test hover and focus states are distinct from default state
  - _Requirements: 9_

- [ ] 20. Checkpoint - Unit tests pass
  - Ensure all unit tests pass without errors
  - Verify test coverage for component functionality
  - Run tests with `npm test` or equivalent
  - Ensure no failing or skipped tests
  - Ask the user if questions arise about test coverage

- [ ] 21. Write integration test for routing
  - Test clicking Landlord Studio navigates to `/login/landlord` route
  - Test clicking Tenants navigates to `/login/tenant` route
  - Test navigation occurs within 500ms requirement
  - Test previous route is not re-rendered after navigation
  - Test error handling if navigation fails
  - _Requirements: 10, 12_

- [ ] 22. Test accessibility with screen reader
  - Verify heading is announced as "Welcome, where would you like to log in? Heading level 1"
  - Verify Landlord button is announced with aria-label text
  - Verify Tenants button is announced with aria-label text
  - Test keyboard navigation works (Tab, Shift+Tab, Enter)
  - Manually test with browser's accessibility tools or screen reader
  - _Requirements: 8_

- [ ] 23. Verify visual design consistency
  - Compare component colors with RentHub color palette (emerald, coral, gray neutrals)
  - Verify typography matches existing components (font-family, weights, sizes)
  - Verify spacing and padding match design system patterns
  - Verify border-radius and shadows match design specification
  - Ensure Lucide React icons match arrow style used elsewhere
  - _Requirements: 7_

- [ ] 24. Test responsive design across devices
  - Test on mobile viewport (320px, 375px, 425px)
  - Test on tablet viewport (768px, 810px, 1024px)
  - Test on desktop viewport (1280px, 1440px)
  - Verify buttons resize and reflow correctly
  - Verify no content cutoff or overflow on any viewport
  - _Requirements: 4, 5_

- [ ] 25. Checkpoint - Integration and navigation verified
  - Verify App.tsx integration is working
  - Ensure LoginSelectionPage appears in correct routing flow
  - Test navigation to login flows completes successfully
  - Confirm no routing errors in console
  - Ask the user if questions arise about integration

- [ ] 26. Final checkpoint - All tests pass and feature complete
  - Run full test suite: unit tests, integration tests, accessibility tests
  - Verify all acceptance criteria from requirements are met
  - Confirm component is responsive on all device sizes
  - Ensure no console errors or warnings in development
  - Ask the user if questions arise or if feature needs adjustments

---

## Notes

- All tasks reference specific requirements for traceability
- No optional test tasks (*) are included because the design has no Correctness Properties section; this is UI rendering and interaction, which requires example-based testing
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Each task builds on previous tasks with no orphaned code
- Component integrates directly into existing App.tsx routing system
- Responsive design uses Tailwind CSS breakpoints (md: = 768px)
- Accessibility compliance follows WCAG 2.1 Level AA standards
- All styling uses RentHub color palette and design system conventions
