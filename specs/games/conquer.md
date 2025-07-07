# Conquer Game Specification

## Concept Overview
- **Brief Description**: Turn-based territory control game inspired by Go and Risk where players compete to claim cells and capture regions through strategic enclosure
- **Game Type**: Turn-Based Strategy
- **Players**: 2-8 players (Free-for-All or Team Mode)
- **Duration**: 10-20 minutes
- **Complexity**: Medium
- **AI Support**: Yes (Easy, Medium, Hard, Expert)

## Game Mode
- **Play Style**: One Man Army (Free-for-All) or Team-Based
- **Team Configuration**: 2v2, 3v3, 4v4, or mixed team sizes
- **Shared Resources**: Team members share territory and can help close regions

## Level Design
- **Grid Configuration**: 8x8 to 32x32 grid, scales with player count
- **Environmental Elements**: Randomly placed rock obstacles
- **Procedural Generation**: Random rock placement with balanced distribution
- **Balanced Layout**: Symmetric rock placement ensuring equal opportunities
- **Edge Behavior**: Grid edges act as solid walls (cannot place beyond boundaries)

## Game-Specific Models

### Player Extension
```typescript
interface ConquerPlayer extends Player {
  territoryCells: Position[];       // Cells currently owned by player
  regionsCaptures: number;          // Number of regions captured
  cellsPlaced: number;              // Total cells placed this game
  lastPlacementTurn: number;        // Turn number of last move
  canPlace: number;                 // Remaining cell placements this turn
}
```

### Grid Extension
```typescript
interface ConquerGrid extends Grid {
  rocks: Position[];                // Rock positions (obstacles)
  rocksPercentage: number;          // Percentage of grid filled with rocks
  regions: Region[];                // Identified closed regions
  lastRegionUpdate: number;         // Turn when regions were last calculated
}
```

### Options Extension
```typescript
interface ConquerOptions extends GameOptions {
  rocksPercentage: number;          // Percentage of grid filled with rocks (default: 20)
  turnBlocks: number;               // Number of cells placeable per turn (default: 1)
  sharedRegions: boolean;           // Team members can help close regions (default: true)
  /**
   * How grid edges behave. Conquer uses 'wall' (cannot place beyond boundaries).
   */
  edgeBehavior: 'wall';
  
  // Inherited base options
  ...DEFAULT_GAME_OPTIONS
}
```

### Additional Type Definitions
```typescript
// Region capture information
interface Region {
  id: string;
  cells: Position[];
  conqueredBy: Player;
  conqueredAt: number;               // Turn number when captured
  value: number;                    // Territory value of the region
}

// Move representation for Conquer
interface ConquerMove {
  positions: Position[];            // Cells to place (1-4 based on turnBlocks)
  playerId: string;
  turnNumber: number;
  timestamp: number;
}
```

### Game-Specific Events
```typescript
enum ConquerEventType {
  CELL_PLACED = 'cell_placed',
  REGION_CAPTURED = 'region_captured',
  TERRITORY_GAINED = 'territory_gained',
  TURN_PASSED = 'turn_passed',
  PLAYER_ELIMINATED = 'player_eliminated'
}

interface ConquerEvent extends GameEvent {
  type: ConquerEventType;
  playerId: string;
  positions?: Position[];
  region?: Region;
  territoryGained?: number;
}
```

### Game-Specific State
```typescript
interface ConquerGameState extends GameState {
  grid: ConquerGrid;
  players: Map<string, ConquerPlayer>;
  currentTurnPlayer: ConquerPlayer;
  turnNumber: number;
  territoryCounts: Map<string, number>;     // Player ID -> territory count
  lastMove?: ConquerMove;
  gamePhase: 'placement' | 'endgame';       // Current game phase
}
```

## Rules

### Turn Actions
- **Turn Structure**: Players take turns in clockwise order from game master
- **Valid Actions**: Place 1-4 cells per turn (based on Turn Blocks setting), pass turn, or surrender
- **Action Limits**: Cannot place on occupied cells, rocks, or outside grid boundaries
- **Region Detection**: Automatic detection and capture of enclosed regions after each placement

### Movement Mechanics
- **Cell Claiming**: Click empty cells to claim them in your color
- **Region Capture**: Completely enclosed areas are automatically captured
- **Territory Scoring**: Each owned cell contributes to final score
- **Turn Blocks**: Number of cells placeable per turn (configurable 1-4)

### Region Conquest Rules
When a player creates a closed region:
1. **Boundary Detection**: System identifies completely enclosed areas using flood-fill algorithm
2. **Valid Boundaries**: Only the player's own tiles or rocks count as boundaries - grid edges do NOT count
3. **Edge Touching**: Regions that touch the grid edge cannot be captured (incomplete enclosure)
4. **Orphan Conversion**: Any opponent tiles (orphans) within a captured region are converted to the capturing player
5. **Score Updates**: Both the capturing player's score increases and losing players' scores decrease accordingly
6. **Animation**: Cascading color fill effect shows region capture
7. **Territory Transfer**: All empty cells and opponent cells within the region become the player's color

### Detailed Capture Mechanics
- **Complete Enclosure Required**: A region must be completely surrounded by the player's own tiles or rocks
- **No Edge Boundaries**: Grid boundaries do not count as valid enclosure - regions touching edges remain uncaptured
- **Opponent Tile Capture**: Enemy tiles trapped within an enclosed region are converted to the capturing player
- **Immediate Score Impact**: Scores are updated instantly when regions are captured
- **Multi-Cell Regions**: Large enclosed areas are captured as a single region
- **Nested Regions**: Smaller regions within larger territories can be captured independently

## Events

### Core Events
- **User Input Events**: Cell placement, turn pass, surrender
- **Game State Events**: Region capture, territory changes, turn advancement
- **Validation Events**: Move legality checking, region detection

### Event Flow
```typescript
class ConquerGameEngine {
  private processTurn(player: ConquerPlayer, move: ConquerMove): TurnResult {
    // 1. Validate move legality
    const validation = this.validateMove(move, player);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // 2. Place cells
    const placedCells = this.placeCells(player, move.positions);
    
    // 3. Detect new regions
    const newRegions = this.detectNewRegions(player, placedCells);
    
    // 4. Capture regions
    const capturedCells = this.captureRegions(newRegions);
    
    // 5. Update scores
    this.updateTerritoryScores();
    
    // 6. Check victory conditions
    const winCondition = this.checkWinCondition();
    
    // 7. Advance turn
    this.advanceTurn();
    
    return {
      success: true,
      placedCells,
      capturedRegions: newRegions,
      capturedCells,
      winCondition
    };
  }
}
```

## Victory Conditions

### Primary Win Condition
- **Objective**: Control majority of the grid (>50% of total cells)
- **Measurement**: Territory count when no more meaningful moves possible
- **Timing**: Checked after each turn and when players pass/surrender

### Alternative Win Conditions
- **Elimination**: All other players surrender or are eliminated
- **Time Limit**: Highest territory score when time expires
- **Insurmountable Lead**: Mathematically impossible for others to catch up

### Tie-Breaking
- **Scoring System**: Points = territory controlled + (regions captured × 10)
- **Ranking**: 1st by territory, 2nd by regions captured, 3rd by cells placed

## AI Implementation

### AI Strategy
```typescript
class ConquerAI extends AIPlayer {
  private territoryEvaluator = new TerritoryEvaluator();
  private regionAnalyzer = new RegionAnalyzer();
  
  async makeMove(gameState: ConquerGameState): Promise<ConquerMove> {
    const gameAnalysis = this.analyzeGameState(gameState);
    const strategy = this.selectStrategy(gameAnalysis);
    
    switch (strategy) {
      case 'EXPAND':
        return this.expandTerritory(gameState);
      case 'CAPTURE':
        return this.captureRegion(gameState);
      case 'DEFEND':
        return this.defendTerritory(gameState);
      case 'DISRUPT':
        return this.disruptOpponent(gameState);
      default:
        return this.getRandomValidMove(gameState);
    }
  }
}
```

### Difficulty Scaling
- **Easy**: Random moves with occasional territory-focused choices
- **Medium**: Basic territory expansion with some region awareness
- **Hard**: Strategic region building and opponent blocking
- **Expert**: Advanced pattern recognition and multi-move planning

## Team Mode

### Team Configuration
```typescript
interface ConquerTeam extends Team {
  sharedTerritory: Position[];      // Cells controlled by team
  teamScore: number;                // Combined team score
  teamColor: PlayerColor;           // Dynamic team color assignment
  chatChannel: string;              // Private team chat ID
}

// Team setup uses dynamic color assignment
function createTeamConfiguration(teamCount: number): ConquerTeam[] {
  const teams: ConquerTeam[] = [];
  for (let i = 0; i < teamCount; i++) {
    const teamColor = COLOR_MANAGER.assignPlayerColor(`team${i}`, gameId);
    teams.push({
      id: `team${i}`,
      players: [],
      color: teamColor,
      name: `Team ${teamColor.name}`,
      sharedTerritory: [],
      teamScore: 0,
      chatChannel: `team_${i}_chat`
    });
  }
  return teams;
}
```

### Team Mechanics
- **Shared Colors**: Team members share the same visual color (dynamically assigned)
- **Cooperative Regions**: Teammates can help close each other's regions
- **Team Chat**: Private communication channel for strategy
- **Combined Scoring**: Team score is sum of all member territories
- **Joint Victory**: Entire team wins together

## Visual Design

### Rendering
```typescript
class ConquerRenderer {
  renderGrid(grid: ConquerGrid, ctx: CanvasRenderingContext2D): void {
    const cellSize = this.getCellSize();
    
    // Render base grid
    this.renderBaseGrid(ctx, cellSize);
    
    // Render rocks
    grid.rocks.forEach(rock => {
      this.renderRock(rock, ctx, cellSize);
    });
    
    // Render owned cells
    grid.cells.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.owner) {
          this.renderOwnedCell(cell, ctx, cellSize);
        }
      });
    });
  }
  
  private renderOwnedCell(cell: Cell, ctx: CanvasRenderingContext2D, cellSize: number): void {
    const { x, y, owner } = cell;
    
    // Use dynamic player color with transparency
    ctx.fillStyle = owner.color.hex + '80'; // 50% opacity
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    
    // Add border in player color
    ctx.strokeStyle = owner.color.hex;
    ctx.lineWidth = 1;
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
  }
}
```

### Animations
- **Cell Placement**: Quick color fill animation (0.2s)
- **Region Capture**: Wave effect spreading from capture point (0.5s)
- **Territory Updates**: Smooth color transitions for captured regions
- **Victory**: Celebration particle effects in winner's color

## Performance Optimization

### Core Optimizations
- **Update Frequency**: Turn-based, only update on player actions
- **Memory Management**: Efficient grid representation, region caching
- **Network Efficiency**: Delta compression for grid state changes

### Scalability
- **Large Grids**: Spatial indexing for region detection on large grids
- **Many Players**: Efficient territory calculation algorithms
- **Region Detection**: Optimized flood-fill with early termination

This comprehensive specification provides the foundation for implementing Conquer as a strategic territory control game within the P1x3lz platform, maintaining consistency with other turn-based games while supporting both individual and team play.
