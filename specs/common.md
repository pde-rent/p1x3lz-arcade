# Common Gameplay Elements

## Overview

This document defines the shared gameplay mechanics, options, and design patterns that apply across all P1x3lz game types. Every game in the platform builds upon these foundational elements.

**Important**: Core types and interfaces are defined in [core-types.md](core-types.md) and imported here for consistency.

## Core Game Concepts

### Grid-Based Design
All P1x3lz games revolve around a customizable grid system:

- **Variable Size**: Grids range from 4x4 to 64x64 cells
- **Cell-Based Actions**: All interactions happen on discrete grid cells
- **Grid Ownership**: Cells can be owned by players or remain neutral
- **Visual Consistency**: All grids share the same visual appearance

### Turn-Based vs Real-Time
Games can operate in two fundamental modes:

#### Turn-Based Games
- **Sequential Turns**: Players take actions in a predetermined order
- **Turn Timer**: Optional time limit per turn (default: 30 seconds)
- **Turn Indicators**: Clear visual feedback for whose turn it is
- **Turn History**: Track of previous moves for replay/analysis

#### Real-Time Games
- **Simultaneous Actions**: All players can act at the same time
- **Collision Resolution**: System for handling conflicting actions
- **Speed Settings**: Adjustable game speed multiplier (0.5x - 2.0x)
- **Action Cooldowns**: Per-action timing restrictions

## Universal Game Options

### Base Options Class

### Option Validation Rules
- Grid width/height must be within game-specific bounds
- Player count must respect min/max constraints
- Speed multiplier affects animation timing, not game logic
- Chat settings apply to both lobby and in-game phases

## Player Mechanics

### Player States

### Color Assignment
- **Default Colors**: Warcraft 3-inspired palette (12 colors)
- **Automatic Assignment**: First-come, first-served basis
- **Manual Selection**: Players can change colors if available
- **Team Colors**: In team mode, colors represent team affiliation
- **Visual Accessibility**: High contrast mode available

### Player Actions

## Victory Conditions

### Common Win Types

### Scoring System
- **Territory Score**: Cells owned by player
- **Bonus Points**: Game-specific achievements
- **Time Bonus**: Faster completion rewards
- **Efficiency Rating**: Actions per point scored

### Ranking Algorithm
1. **Primary**: Victory condition achievement
2. **Secondary**: Final score/territory
3. **Tertiary**: Time to completion
4. **Quaternary**: Efficiency rating

## Grid Interaction Patterns

### Cell Types

### Interaction Methods
- **Click/Tap**: Primary interaction on desktop/mobile
- **Keyboard Navigation**: Arrow keys + Enter for accessibility
- **Drag & Drop**: For games requiring piece movement
- **Multi-Select**: Shift+click for batch operations

### Visual Feedback
- **Hover States**: Highlight valid moves
- **Invalid Actions**: Red flash or shake animation
- **Confirmation**: Brief highlight for successful actions
- **Turn Indicators**: Clear visual cues for active player

## Animation Standards

### Timing Guidelines
- **Immediate Feedback**: 0-100ms for input acknowledgment
- **State Changes**: 200-300ms for cell ownership changes
- **Complex Animations**: 500-1000ms for region conquest
- **Victory Sequences**: 2-3 seconds for celebration

### Animation Types

### Performance Considerations
- **Frame Rate**: Maintain 60fps on target devices
- **Particle Limits**: Maximum 100 active particles
- **Animation Pooling**: Reuse animation objects
- **Reduced Motion**: Respect user accessibility preferences

## Real-Time Scoreboard

### Scoreboard Requirements
All games must display a real-time scoreboard that shows each player's current score and relevant game-specific metrics:

- **Visual Design**: Light, transparent overlay with slightly dark background
- **Positioning**: Top-right corner, non-intrusive to gameplay
- **Format**: One row per player showing "PlayerName: Score"
- **Color Coding**: Player name displayed in their assigned color
- **Real-Time Updates**: Score updates immediately as game state changes

### Game-Specific Score Formats
Each game type displays relevant metrics in the scoreboard:

#### Conquer Game
- **Format**: `PlayerName: XT Y%`
- **XT**: Number of tiles/cells currently owned
- **Y%**: Percentage of total grid controlled
- **Example**: `Alice: 23T 15%`

#### Chess Game
- **Format**: `PlayerName: XP`
- **XP**: Number of pieces remaining on board
- **Example**: `Bob: 12P`

#### Bomber Game
- **Format**: `PlayerName: XK YL`
- **XK**: Number of kills (eliminated players)
- **YL**: Lives remaining
- **Example**: `Charlie: 2K 3L`

#### Snake Game
- **Format**: `PlayerName: XK YL`
- **XK**: Number of kills (eliminated snakes)
- **YL**: Current snake length
- **Example**: `Diana: 1K 15L`

### Implementation Requirements
- **Generic Interface**: Common scoring interface for all game types
- **Efficient Updates**: Minimal performance impact on game rendering
- **Accessibility**: Scoreboard readable with high contrast mode
- **Responsive Design**: Scales appropriately on mobile devices

## Audio System

### Sound Categories
- **UI Sounds**: Click, hover, notification
- **Game Actions**: Place piece, move, capture
- **Ambient**: Background music, environment
- **Victory**: Success, failure, achievement

### Audio Options
- **Master Volume**: 0-100%, default 50%
- **Music Toggle**: Background music on/off
- **SFX Toggle**: Sound effects on/off
- **Spatial Audio**: 3D positioning for applicable sounds

## Input Handling

### Device Support
- **Mouse**: Primary pointer input
- **Touch**: Mobile and tablet support
- **Keyboard**: Full accessibility navigation
- **Gamepad**: Future controller support

### Input Validation
- **Bounds Checking**: Ensure clicks within valid areas
- **Turn Validation**: Only current player can act (turn-based)
- **Rate Limiting**: Prevent spam clicking
- **Offline Queue**: Store actions during connection loss

## Performance Standards

### Target Performance
- **Load Time**: <3 seconds initial load
- **Frame Rate**: 60fps on target devices
- **Memory Usage**: <100MB for game state
- **Network**: <1KB per action in multiplayer

### Optimization Techniques
- **Object Pooling**: Reuse grid cells and UI elements
- **Lazy Loading**: Load game assets on demand
- **State Compression**: Minimize data structures
- **Render Optimization**: Only redraw changed regions

## Accessibility Requirements

### Visual Accessibility
- **Color Blind Support**: Pattern overlays available
- **High Contrast**: Enhanced visibility mode
- **Font Scaling**: Support 200% zoom
- **Focus Indicators**: Clear keyboard navigation

### Motor Accessibility
- **Large Touch Targets**: Minimum 44px on mobile
- **Hold Alternatives**: No required long-press actions
- **Gesture Alternatives**: All swipe actions have button equivalents
- **Customizable Controls**: Adjustable timing and sensitivity

### Cognitive Accessibility
- **Clear Instructions**: Simple, visual tutorials
- **Undo System**: Allow taking back actions
- **Pause Function**: Stop action in real-time games
- **Progress Indicators**: Show game completion status

This common framework ensures consistency across all P1x3lz games while allowing for creative game-specific mechanics and features. 