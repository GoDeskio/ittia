# Bit Components

This directory contains reusable components managed by Bit.

## Available Components

### Button (`my-scope/button`)
A reusable Button component with neumorphic design.

**Props:**
- `children`: React.ReactNode - Button content
- `onClick`: () => void - Click handler
- `variant`: 'primary' | 'secondary' | 'danger' - Button style variant
- `size`: 'small' | 'medium' | 'large' - Button size
- `disabled`: boolean - Disabled state
- `type`: 'button' | 'submit' | 'reset' - Button type

**Usage:**
```tsx
import { Button } from '@my-scope/button';

<Button variant="primary" size="medium" onClick={handleClick}>
  Click me
</Button>
```

### Card (`my-scope/card`)
A reusable Card component with neumorphic design.

**Props:**
- `children`: React.ReactNode - Card content
- `title`: string - Optional card title
- `className`: string - Additional CSS classes
- `onClick`: () => void - Click handler for clickable cards
- `style`: CSSProperties - Inline styles
- `isPressed`: boolean - Pressed state styling
- `noHover`: boolean - Disable hover effects

**Usage:**
```tsx
import { Card } from '@my-scope/card';

<Card title="My Card" onClick={handleClick}>
  <p>Card content goes here</p>
</Card>
```

## Bit Commands

Use these npm scripts to work with Bit components:

- `npm run bit:status` - Check component status
- `npm run bit:list` - List all components
- `npm run bit:build` - Build all components
- `npm run bit:test` - Test all components
- `npm run bit:compile` - Compile components
- `npm run bit:snap "message"` - Create a snap (development version)
- `npm run bit:tag "message"` - Create a tag (release version)
- `npm run bit:start` - Start Bit development server
- `npm run bit:export` - Export components to remote scope

## Development Workflow

1. Make changes to components
2. Test locally: `npm run bit:test`
3. Compile: `npm run bit:compile`
4. Create a snap: `npm run bit:snap "Your change description"`
5. Export to remote: `npm run bit:export` (when ready)

## Adding New Components

To add new components to Bit:

```bash
bit add src/components/YourComponent --main index.tsx
```

Or use the helper script and modify it for your component.