# Game Types

## Overview

P1x3lz features a variety of grid-based arcade games, each designed to feel familiar while offering unique strategic depth. Games are inspired by classic arcade titles that players know and love, reimagined for competitive multiplayer play.

## Game Categories

### Turn-Based Strategy
Games where players take sequential turns, emphasizing strategic planning and tactical positioning.

### Real-Time Action
Fast-paced games where all players act simultaneously, testing reflexes and quick decision-making.

### Team-Based Games
Cooperative or competitive team modes where players work together or against opposing teams.

## Design Philosophy

### Familiar Foundations
All P1x3lz games draw inspiration from beloved classic games:

- **Tetris**: Block placement and line clearing mechanics
- **Pong**: Simple physics and competitive scoring
- **Snake**: Growth mechanics and collision avoidance
- **Bomberman**: Area control and strategic destruction
- **Tron**: Territory claiming and movement trails
- **Minesweeper**: Risk/reward decision making
- **Connect 4**: Pattern matching and blocking
- **Chess/Checkers**: Strategic piece movement
- **Go**: Territory control and enclosure mechanics
- **Risk**: Area expansion and conflict resolution

### Modern Multiplayer Twist
Each game type takes familiar mechanics and adapts them for:
- **Simultaneous Multiplayer**: Multiple players on the same grid
- **Real-Time Competition**: Live action with immediate feedback
- **Scalable Complexity**: Options to increase difficulty
- **Team Collaboration**: Cooperative play modes
- **Spectator Friendly**: Easy to watch and understand

## Available Game Types

### Conquer (Launch Title)
**Inspiration**: Go, Risk, Territory Control Games

A turn-based territory control game where players claim cells and capture regions through strategic enclosure.

**Core Mechanics**:
- Click empty cells to claim them in your color
- Form closed regions to capture all cells within
- Use rocks as boundaries to help close regions
- Control majority of grid to win

**Game Modes**:
- Free-for-All (2-8 players)
- Team Mode (2v2, 3v3, 4v4)
- AI Opposition available

**Unique Options**:
- Rock density (0-90% of grid)
- Turn blocks (1-4 cells per turn)
- Team collaboration mode

**Complexity**: Medium
**Game Length**: 10-20 minutes
**Skill Elements**: Strategic planning, territory management, blocking opponents

*See [Conquer Specification](games/conquer.md) for complete details.*

## Future Game Types

### Pixel Snake (Planned)
**Inspiration**: Snake, Tron, Light Cycles

Real-time game where players control growing pixel trails on a shared grid.

**Core Mechanics**:
- Control a continuously moving pixel trail
- Grow longer by collecting food items
- Avoid colliding with walls, other snakes, or yourself
- Last snake alive wins

**Planned Features**:
- Power-ups for temporary abilities
- Speed boosters and traps
- Team modes with shared colors
- Tournament bracket play

### Block Blast (Planned)
**Inspiration**: Tetris, Puyo Puyo, Bomberman

Turn-based puzzle game with explosive chain reactions.

**Core Mechanics**:
- Place tetris-like pieces on the grid
- Create complete lines to clear them
- Chain reactions score bonus points
- Block opponents' placement areas

**Planned Features**:
- Custom piece sets
- Gravity effects
- Special explosive blocks
- Collaborative team clearing

### Grid Wars (Planned)
**Inspiration**: Chess, Checkers, Tactics Games

Strategic piece movement and capture game.

**Core Mechanics**:
- Place and move pieces with unique abilities
- Capture opponent pieces through combat
- Control key grid positions
- Eliminate all enemy pieces to win

**Planned Features**:
- Multiple piece types with special moves
- Environmental hazards
- King-of-the-hill variants
- Draft modes for piece selection

### Pixel Pong (Planned)
**Inspiration**: Pong, Breakout, Air Hockey

Fast-paced ball physics game on a grid.

**Core Mechanics**:
- Control paddles to hit bouncing balls
- Score by getting balls past opponents
- Multiple balls in play simultaneously
- Power-ups affect ball behavior

**Planned Features**:
- Variable paddle sizes
- Curved ball trajectories
- Barrier destruction modes
- Team relay formats

### Mine Sweeper Royale (Planned)
**Inspiration**: Minesweeper, Battle Royale

Competitive mine detection with area control.

**Core Mechanics**:
- Reveal safe cells to claim territory
- Avoid hidden mines that eliminate players
- Use clues to deduce mine locations
- Control the most safe territory to win

**Planned Features**:
- Dynamic mine placement
- Mine defusal abilities
- Safe zone shrinking over time
- Information sharing restrictions

## Game Development Guidelines

### Implementation Priority
1. **Core Mechanics**: Focus on solid, bug-free gameplay first
2. **Multiplayer Balance**: Ensure fair competition for all players
3. **Performance**: Maintain smooth 60fps on target devices
4. **Accessibility**: Support keyboard, touch, and assistive technologies
5. **Visual Polish**: Clean, readable graphics that scale well

### Design Constraints
- **Grid-Based**: All games must use the grid system
- **2-32 Players**: Support wide range of player counts
- **Mobile-Friendly**: Touch controls must be intuitive
- **Quick Games**: Target 5-30 minute game sessions
- **Spectator Mode**: Games should be watchable by observers

### AI Implementation
Each game type should eventually support AI players:
- **Multiple Difficulties**: Easy, Medium, Hard, Expert
- **Distinct Strategies**: Different AI personalities
- **Fair Competition**: AI should provide challenging but beatable opposition
- **Educational Value**: Help players learn game mechanics

### Customization Options
All games should support:
- **Grid Size Scaling**: Adapt to different grid dimensions
- **Speed Settings**: Adjust game pace for different skill levels
- **Visual Themes**: Optional cosmetic variations
- **Rule Variants**: Modified victory conditions or special rules

## Game Selection Strategy

### Launch Focus
Start with **Conquer** as the flagship game because:
- **Simple to Learn**: Intuitive click-to-claim mechanics
- **Deep Strategy**: Emergent complexity from simple rules
- **Scalable**: Works well with 2-8 players
- **Visual Appeal**: Clear territory control is satisfying to watch
- **AI-Friendly**: Relatively easy to implement computer opponents

### Expansion Path
Add new games based on:
1. **Player Feedback**: What mechanics do players enjoy most?
2. **Technical Learning**: Each game teaches new development skills
3. **Audience Growth**: Different games appeal to different player types
4. **Platform Maturity**: More complex games as the platform stabilizes

### Community Input
- **Player Suggestions**: Accept and evaluate community game ideas
- **Prototype Testing**: Quick proof-of-concept builds for validation
- **Tournament Feedback**: Observe what games work best competitively
- **Accessibility Testing**: Ensure new games work for all players

This diverse game portfolio ensures P1x3lz appeals to a wide audience while maintaining the core grid-based identity that makes the platform unique.
