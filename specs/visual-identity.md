# Visual Identity

## Design Philosophy

P1x3lz embraces a **minimal, grid-centric aesthetic** that puts gameplay front and center. The visual design draws inspiration from classic arcade games while maintaining modern usability standards.

## Color Palette

### Primary Colors
- **Background**: `#1a1a1a` (Dark charcoal)
- **Grid Lines**: `#333333` (Medium gray)
- **Primary Accent**: `#4299e1` (Bright blue)
- **Secondary Accent**: `#9f7aea` (Purple)
- **Success**: `#48bb78` (Green)
- **Warning**: `#ed8936` (Orange)
- **Error**: `#f56565` (Red)

### Player Color System (Dynamic)

P1x3lz uses a **dynamic color assignment system** that automatically generates unique, contrasting colors for players as they join games. This ensures optimal visibility and supports unlimited player counts.

#### Color Generation Constraints
- **Lightness Range**: 35% - 85% (ensures visibility on dark backgrounds)
- **Saturation Range**: 60% - 100% (maintains vivid, distinguishable colors)
- **Hue Separation**: Minimum 30° between players (prevents similar colors)
- **Forbidden Ranges**: 
  - `20° - 40°` (muddy browns that blend with UI)
  - `200° - 220°` (dark blues too close to accent colors)

#### Color Properties
Each player color includes:
- **Hex Value**: Standard color representation (`#FF5733`)
- **HSL Components**: Hue (0-360), Saturation (0-100), Lightness (0-100)
- **Human Name**: Generated descriptive name ("Vivid Orange", "Light Teal")
- **Contrast Info**: Automatically calculated contrast ratios

#### Visual Requirements
- **Background Contrast**: Minimum 4.5:1 ratio against `#1a1a1a`
- **Text Contrast**: Dynamic black/white stroke based on lightness
- **Distinguishability**: Colors must be visually distinct for colorblind users
- **Brightness Balance**: No colors too dark (<35%) or too light (>85%)

#### Color Picker Interface
When players customize colors, the picker:
- **Validates** selections against existing player colors
- **Prevents** forbidden color ranges and poor contrast
- **Suggests** optimal alternatives for invalid selections
- **Shows** real-time preview with contrast information
- **Displays** color name and accessibility scores

#### Implementation Guidelines
```typescript
// Example usage in game rendering
ctx.fillStyle = player.color.hex;
ctx.strokeStyle = player.color.lightness > 60 ? '#000000' : '#FFFFFF';

// Color accessibility helpers
const contrastRatio = calculateContrast(player.color.hex, '#1a1a1a');
const isColorblindSafe = checkColorblindContrast(color1, color2);
```

#### Fallback Strategy
If color generation fails (rare edge case):
1. Use systematic hue distribution (360° / player count)
2. Apply standard lightness/saturation values
3. Ensure minimum contrast requirements
4. Log warning for manual review

## Typography

### Primary Font: Tiny5
- **Usage**: All text elements, UI labels, game text
- **Characteristics**: Pixel-perfect, retro aesthetic
- **Fallback**: `'Courier New', monospace`
- **Sizes**:
  - Header: 24px
  - Body: 16px
  - Small: 12px
  - Tiny: 8px

## Grid System

### Visual Style (Inspired by style.png)
- **Grid Pattern**: Visible dark lines on darker background
- **Cell Highlighting**: 50% opacity player colors for occupied cells
- **Rock Elements**: Textured gray blocks with subtle depth
- **Particle Effects**: Golden sparkles for conquering regions

### Grid Responsiveness
- **Mobile**: 4x4 to 16x16 optimal
- **Tablet**: 8x8 to 32x32 optimal  
- **Desktop**: 16x16 to 64x64 optimal

## UI Components

### Layout Principles
- **Grid-First**: All layouts respect the grid aesthetic
- **Minimal Chrome**: Reduce non-essential UI elements
- **Dark Theme**: Easy on the eyes for extended play
- **High Contrast**: Ensure accessibility and clarity

### Component Specifications

#### Buttons
- **Style**: Rounded corners (4px), solid backgrounds
- **Primary**: Blue background, white text
- **Secondary**: Transparent background, blue border
- **Disabled**: Gray background, muted text

#### Input Fields
- **Style**: Dark background, subtle border
- **Focus**: Blue border highlight
- **Error**: Red border highlight

#### Chat Messages
- **Player Names**: Use assigned player colors
- **System Messages**: Gray italic text
- **Timestamps**: Small gray text

#### Game Grid
- **Border**: 2px solid gray
- **Cell Size**: Responsive based on viewport
- **Hover Effects**: Subtle highlighting for valid moves
- **Animation**: Smooth color transitions (0.2s ease)

## Animation Guidelines

### Micro-Interactions
- **Hover**: 0.1s color/scale transitions
- **Click**: Brief scale down (0.95x) feedback
- **Region Conquest**: Cascading color fill animation
- **Turn Changes**: Subtle UI state transitions

### Game Animations
- **Cell Claiming**: Quick color fill (0.2s)
- **Region Conquest**: Wave effect spreading (0.5s)
- **Victory**: Celebration particle effects
- **Error States**: Gentle shake animation

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Grid Adaptations
- **Mobile**: Single-column layouts, larger touch targets
- **Desktop**: Multi-column layouts, compact spacing
- **Game Area**: Always maximum available space

## Accessibility

### Requirements
- **Color Contrast**: WCAG AA compliance
- **Font Size**: Scalable for vision accessibility
- **Touch Targets**: Minimum 44px for mobile
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels

### Visual Aids
- **Pattern Overlays**: Optional patterns for color-blind users
- **High Contrast Mode**: Optional enhanced contrast
- **Focus Indicators**: Clear keyboard focus styling

## Brand Elements

### Logo Treatment
- **Style**: Pixel art aesthetic matching Tiny5 font
- **Usage**: Minimal presence, corner placement
- **Colors**: Primary blue or white depending on context

### Loading States
- **Grid Pattern**: Animated grid filling pattern
- **Progress**: Pixel-style progress bars
- **Spinners**: Simple rotating squares

This visual identity ensures P1x3lz maintains its arcade roots while providing a modern, accessible gaming experience.
