<!-- 451fcf28-beca-4054-9828-ea40e91708ad 5ee6b702-6f95-4f70-b410-a511e1720fb8 -->
# Services Page CTA Implementation Plan

## Overview

Transform the services page from a collapsible FAQ-style layout to a call-to-action focused design. Remove service descriptions and replace them with WhatsApp "Chat with Conveyancer" buttons for each service.

## Current State

- Services displayed as collapsible cards with descriptions
- Uses `openIds` state to manage expand/collapse
- TouchableOpacity with chevron icons for interaction
- Paragraph component displays descriptions when expanded

## Implementation Steps

### 1. Update Imports

**File**: [app/services.tsx](app/services.tsx)

- Remove unused imports:
  - `useState` (no longer needed for openIds)
  - `TouchableOpacity` (replaced with Button)
  - `Paragraph` (descriptions removed)
- Add required imports:
  - `Linking` from `react-native` (for WhatsApp links)
  - `Platform` from `react-native` (for platform detection)
  - `Button` and `BtnText` from `../components/Button`
  - `theme` from `../config/theme.json`

### 2. Remove State Management

- Remove `openIds` state declaration (line 19)
- Remove `setOpenIds` usage

### 3. Add WhatsApp Handler Function

Create `openWhatsApp` function that:

- Takes `serviceTitle` as parameter
- Constructs WhatsApp message: `"Hi Pather & Pather, I'd like to chat with a conveyancer about {serviceTitle}."`
- Uses `theme.whatsappNumber` from config
- Formats URL: `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`
- Uses Platform-specific handling:
  - Web: `window.open(url, '_blank')`
  - Native: `Linking.openURL(url)`
- Follows same pattern as [components/Navigation.tsx](components/Navigation.tsx) QuickNavBar

### 4. Update Service Card UI

Replace the collapsible card structure with:

- **Service Title**: Larger, more prominent (increase fontSize from `$4` to `$5`), use brand color (`$brand`)
- **WhatsApp Button**: 
  - Use WhatsApp brand color (#25D366)
  - Include WhatsApp icon (`logo-whatsapp` from Ionicons)
  - Text: "Chat with Conveyancer"
  - Full width button within card
  - Hover style: slightly darker green (#20BA5A)

### 5. Simplify Service Item Type

- Keep `ServiceItem` type but `description` field can remain (not used in UI)
- Or remove `description` from type if cleaning up

### 6. Update Card Structure

Replace current structure:

```tsx
<TouchableOpacity>...</TouchableOpacity>
{open ? <Paragraph>...</Paragraph> : null}
```

With:

```tsx
<YStack gap="$3">
  <Text>Service Title</Text>
  <Button>Chat with Conveyancer</Button>
</YStack>
```

## Technical Details

### WhatsApp URL Pattern

```typescript
const msg = `Hi Pather & Pather, I'd like to chat with a conveyancer about ${serviceTitle}.`;
const url = `https://wa.me/${theme.whatsappNumber}?text=${encodeURIComponent(msg)}`;
```

### Button Styling

- Background: #25D366 (WhatsApp green)
- Border: #25D366
- Hover: #20BA5A
- Icon: `logo-whatsapp` size 20
- Text: White, bold

### Service Title Styling

- Font size: `$5` (larger than current `$4`)
- Color: `$brand` (#0A5C3B)
- Weight: 700 (bold)

## Files to Modify

1. [app/services.tsx](app/services.tsx) - Main implementation

## Testing Checklist

- [ ] All service titles display correctly
- [ ] WhatsApp buttons appear for each service
- [ ] Clicking button opens WhatsApp with correct message
- [ ] Message includes service title
- [ ] Works on both web and native platforms
- [ ] No console errors
- [ ] No unused imports or variables
- [ ] UI is clean and action-focused
- [ ] Banner section remains unchanged
- [ ] Footer (QuickNavBar) remains functional

### To-dos

- [ ] Update imports: remove useState, TouchableOpacity, Paragraph; add Linking, Platform, Button, BtnText, theme
- [ ] Remove openIds state management
- [ ] Create openWhatsApp function with service title parameter and platform-specific URL handling
- [ ] Replace collapsible card structure with title + WhatsApp button layout
- [ ] Apply proper styling: larger service titles, WhatsApp green buttons with icons
- [ ] Remove unused code and ensure no linting errors