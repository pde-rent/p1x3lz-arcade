# Snake Game Specification

## Concept Overview
- **Brief Description**: Multiplayer real-time Snake where players control growing snakes competing for food while avoiding collisions
- **Game Type**: Real-Time
- **Players**: 2-8 players
- **Duration**: 3-10 minutes
- **Complexity**: Simple
- **AI Support**: Yes (Easy, Medium, Hard, Expert)

## Game Mode
- **Play Style**: One Man Army (Free-for-All)
- **Team Configuration**: N/A (individual competition)
- **Shared Resources**: Food items spawn randomly for all players

## Level Design
- **Grid Configuration**: 15x15 to 30x30 grid, scales with player count
- **Environmental Elements**: Food pellets, optional obstacles/walls
- **Procedural Generation**: Random food spawning, optional random obstacle placement
- **Balanced Layout**: Equal starting positions, fair food distribution
- **Edge Behavior**: By default edges are pass-through (wrap), can be set to walls

## Game-Specific Models

### Player Extension
```typescript
interface SnakePlayer extends Player {
  snake: SnakeSegment[];           // Array of snake body segments
  direction: Direction;            // Current movement direction
  nextDirection: Direction;        // Queued direction change
  length: number;                  // Current snake length
  speed: number;                   // Movement speed multiplier
  alive: boolean;                  // Alive/dead state
  score: number;                   // Points from food eaten
  kills: number;                   // Number of snakes eliminated
  lastMove: number;                // Timestamp of last movement
  baseSpeed: number;               // Original speed for percentage calculations
  speedBoostActive: boolean;       // Whether speed boost is active
  speedBoostExpires: number;       // When speed boost expires
}
```

### Grid Extension
```typescript
interface SnakeGrid extends Grid {
  food: Position[];                // Active food positions
  obstacles: Position[];           // Static obstacle positions
  foodSpawnRate: number;           // Food spawning frequency
  maxFood: number;                 // Maximum concurrent food items
  safeZones: Position[];           // Starting safe areas
  lastFoodSpawn: number;           // Timestamp of last food spawn
  nextSpeedIncrease: number;       // Time for next global speed increase
}
```

### Options Extension
```typescript
interface SnakeOptions extends GameOptions {
  gameSpeed: number;               // Initial game update frequency (ticks per second, default: 10)
  foodSpawnRate: number;           // Food spawning interval in seconds (default: 2)
  speedIncreaseInterval: number;   // Every X seconds, snake movement speed increases by 5% (default: 30)
  maxFood: number;                 // Maximum food on grid (3-15)
  obstacles: boolean;              // Enable random obstacles
  obstaclePercentage: number;      // Obstacle density (0-20%)
  powerUps: boolean;               // Enable power-up items
  /**
   * How grid edges behave. Snake defaults to 'wrap', other games default to 'wall'.
   * 'wrap' = pass-through (exit one side, reappear opposite)
   * 'wall' = collision death on edge contact
   */
  edgeBehavior: 'wrap' | 'wall';
  collisionSelf: boolean;          // Self-collision causes death
  collisionOthers: boolean;        // Other snake collision causes death
  speedBoost: boolean;             // Allow temporary speed increases
  /**
   * Mode determining how many segments are added per food eaten.
   * 'logarithmic' – growth slows down as snake length increases (default, extends game duration).
   * 'arithmetic'  – constant growth (+1 per food) for faster scaling.
   */
  lengthGrowthMode: 'logarithmic' | 'arithmetic';
  
  // Inherited base options
  ...DEFAULT_GAME_OPTIONS
}
```

### Additional Type Definitions
```typescript
// Direction enum for snake movement
enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

// Single segment of a snake body
interface SnakeSegment {
  x: number;
  y: number;
  timestamp: number;               // When this segment was added
}

// Leaderboard entry structure
interface PlayerScore {
  playerId: string;
  score: number;
  kills: number;
  length: number;
  survivalTime: number;
}

// Growth mode enumeration for snake length calculations
type LengthGrowthMode = 'logarithmic' | 'arithmetic';

// Food item with enhanced properties
interface FoodItem {
  position: Position;
  value: number;                   // Points awarded for eating
  spawnTime: number;               // When food was spawned
  type: 'normal' | 'bonus';        // Food type
}
```

### Game-Specific Events
```typescript
enum SnakeEventType {
  FOOD_EATEN = 'food_eaten',
  SNAKE_COLLISION = 'snake_collision',
  SNAKE_DEATH = 'snake_death',
  SNAKE_DEATH_FOOD = 'snake_death_food', // Emitted after body-to-food conversion
  DIRECTION_CHANGE = 'direction_change',
  SPEED_BOOST = 'speed_boost',
  SPEED_INCREASE = 'speed_increase',      // Global speed increase
  FOOD_SPAWN = 'food_spawn',
  OBSTACLE_HIT = 'obstacle_hit'
}

interface SnakeEvent extends GameEvent {
  type: SnakeEventType;
  playerId: string;
  position?: Position;
  direction?: Direction;
  targetPlayerId?: string;         // For collision events
  foodValue?: number;              // Points from food eaten
  newLength?: number;              // Snake length after growth
  speedMultiplier?: number;        // New speed multiplier
}
```

### Game-Specific State
```typescript
interface SnakeGameState extends GameState {
  grid: SnakeGrid;
  snakes: Map<string, SnakePlayer>;
  food: FoodItem[];
  obstacles: Position[];
  gameSpeed: number;
  globalSpeedMultiplier: number;   // Current global speed multiplier
  lastUpdate: number;
  foodSpawnTimer: number;
  aliveCount: number;
  leaderboard: PlayerScore[];
  gamePhase: 'early' | 'mid' | 'late'; // Game progression phase
}
```

## Rules

### Real-Time Controls
- **Input Handling**: Arrow keys (↑↓←→) or WASD for direction changes
- **Movement**: Continuous snake movement at game speed intervals in strict 4-directional orthogonal paths
- **Timing**: Direction changes queued, applied on next movement tick
- **Edge Behavior**: By default edges are pass-through (wrap), configurable to walls
- **Collision Detection**: Real-time collision checking every movement update

### Movement Mechanics
- **Snake Growth**: Eating food adds segments based on growth mode
- **Direction Rules**: Cannot reverse directly (up→down, left→right)
- **Speed**: Base movement interval affected by global speed increases
- **Wrap-Around/Walls**: Behavior set by `edgeBehavior` option; default `wrap`
- **Growth Calculation**: 
  - `logarithmic` (default): `growth = max(1, floor(log(length) / ln(2)))` – growth slows over time
  - `arithmetic`: always +1 segment per food
- **Speed Progression**: Every `speedIncreaseInterval` seconds, global snake velocity increases by 5%

### Food System
- **Spawning**: Random food placement every `foodSpawnRate` seconds
- **Consumption**: Snake head touching food cell consumes it
- **Growth**: Each food consumed adds segments based on growth mode
- **Limits**: Maximum concurrent food items to prevent overcrowding
- **Death Drops**: Half of dead snake's body segments become food, spawned in-place

### Collision System
- **Self-Collision**: Configurable self-collision death
- **Snake-to-Snake**: Collision between different snakes causes death
- **Wall/Edge**: Behavior depends on `edgeBehavior` setting
- **Obstacles**: Static obstacles cause death on contact

## Events

### Core Events
- **User Input Events**: Direction change commands from players
- **Collision Events**: Snake-to-snake, snake-to-wall, snake-to-self, snake-to-obstacle
- **Grid Change Events**: Food spawning/consumption, obstacle generation
- **Environmental Events**: Speed increases, power-up effects, death cleanup

### Event Flow
```typescript
class SnakeGameEngine {
  private gameLoop(): void {
    // 1. Process input queue
    this.processDirectionChanges();
    
    // 2. Update snake positions
    this.moveAllSnakes();
    
    // 3. Check collisions & handle deaths
    const deaths = this.checkCollisions();
    if (deaths.length) {
      this.spawnFoodFromDeaths(deaths); // Convert half-body to food
    }
    
    // 4. Handle food consumption
    this.processFoodConsumption();
    
    // 5. Spawn new food
    this.spawnFood();
    
    // 6. Apply speed increases
    this.applySpeedIncrease();
    
    // 7. Update game state
    this.updateGameState();
    
    // 8. Check victory conditions
    this.checkVictoryConditions();
    
    // 9. Broadcast updates
    this.broadcastStateUpdate();
  }
}
```

## Victory Conditions

### Primary Win Condition
- **Objective**: Last snake standing (deathmatch with single life)
- **Measurement**: Only one snake remains active
- **Timing**: Checked after each collision/death event

### Alternative Win Conditions
- **Time Limit**: Highest score when time expires
- **Score Target**: First to reach target score (configurable)
- **Elimination**: All other snakes eliminated by collisions

### Tie-Breaking
- **Scoring System**: Points = food eaten + (kills × 5) + (survival time × 0.1)
- **Ranking**: 1st by survival time, 2nd by score, 3rd by snake length

## AI Implementation

### AI Strategy
```typescript
class SnakeAI extends AIPlayer {
  private pathfinder = new AStarPathfinder();
  private dangerAnalyzer = new DangerZoneAnalyzer();
  
  async makeMove(gameState: SnakeGameState): Promise<Direction> {
    const mySnake = gameState.snakes.get(this.playerId);
    const threats = this.analyzeThreats(gameState, mySnake);
    const opportunities = this.findFoodOpportunities(gameState, mySnake);
    
    // Priority: Survival > Food > Aggressive positioning
    if (threats.immediate.length > 0) {
      return this.evadeImmediate(threats.immediate);
    }
    
    if (opportunities.safe.length > 0) {
      return this.pathToFood(opportunities.safe[0]);
    }
    
    return this.maintainSafePosition(gameState);
  }
}
```

### Difficulty Scaling
- **Easy**: Basic pathfinding, frequent mistakes, slow reactions
- **Medium**: Improved collision avoidance, moderate food seeking
- **Hard**: Strategic food blocking, aggressive positioning
- **Expert**: Predictive collision avoidance, trap setting, optimal pathing

## Visual Design

### Rendering
```typescript
class SnakeRenderer {
  renderSnake(snake: SnakePlayer, ctx: CanvasRenderingContext2D): void {
    const cellSize = this.getCellSize();
    
    // Snake head - distinct from body
    const head = snake.snake[0];
    ctx.fillStyle = snake.color.hex;
    ctx.fillRect(head.x * cellSize, head.y * cellSize, cellSize, cellSize);
    
    // Add head direction indicator
    ctx.strokeStyle = this.getContrastColor(snake.color);
    ctx.lineWidth = 2;
    ctx.strokeRect(head.x * cellSize, head.y * cellSize, cellSize, cellSize);
    
    // Snake body - slightly transparent
    ctx.fillStyle = snake.color.hex + 'CC';
    for (let i = 1; i < snake.snake.length; i++) {
      const segment = snake.snake[i];
      ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
    }
    
    // Speed boost visual effect
    if (snake.speedBoostActive) {
      this.renderSpeedBoostTrail(snake, ctx);
    }
  }
  
  renderFood(food: FoodItem[], ctx: CanvasRenderingContext2D): void {
    const cellSize = this.getCellSize();
    
    food.forEach(f => {
      const pulseIntensity = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
      ctx.fillStyle = f.type === 'bonus' ? 
        `rgba(255, 215, 0, ${pulseIntensity})` : // Gold for bonus food
        `rgba(255, 107, 107, ${pulseIntensity})`; // Red for normal food
      
      ctx.beginPath();
      ctx.arc(
        f.position.x * cellSize + cellSize/2,
        f.position.y * cellSize + cellSize/2,
        cellSize/3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  }
  
  renderObstacles(obstacles: Position[], ctx: CanvasRenderingContext2D): void {
    const cellSize = this.getCellSize();
    
    ctx.fillStyle = '#666666';
    obstacles.forEach(obstacle => {
      ctx.fillRect(obstacle.x * cellSize, obstacle.y * cellSize, cellSize, cellSize);
    });
  }
  
  private getContrastColor(color: PlayerColor): string {
    return color.lightness > 60 ? '#000000' : '#FFFFFF';
  }
}
```

### Animations
- **Movement**: Smooth snake segment transitions
- **Death**: Snake body fade-out with explosion effect in player's color
- **Food Consumption**: Pulsing food items, consumption particle effects
- **Growth**: Tail segment addition animation
- **Speed Boost**: Glowing trail effect during speed boost

## Performance Optimization

### Core Optimizations
- **Update Frequency**: 60 FPS rendering, 10-20 FPS game logic
- **Memory Management**: Efficient snake segment arrays, food position pooling
- **Network Efficiency**: Delta compression for state updates, input prediction

### Scalability
- **Large Grids**: Spatial partitioning for collision detection
- **Many Players**: Octree collision optimization, selective update broadcasting
- **Collision Detection**: Broad-phase/narrow-phase collision pipeline

### Network Synchronization
```typescript
class SnakeNetworkSync {
  // Client-side prediction for smooth movement
  predictMovement(snake: SnakePlayer, deltaTime: number): Position {
    const predictedHead = this.calculateNextPosition(snake.snake[0], snake.direction);
    return this.validatePosition(predictedHead, snake);
  }
  
  // Server reconciliation for authoritative game state
  reconcileState(clientState: SnakeGameState, serverState: SnakeGameState): void {
    // Correct any drift between client prediction and server authority
    this.correctPositions(clientState, serverState);
    this.smoothInterpolation(clientState, serverState);
  }
}
```

This specification provides a comprehensive foundation for implementing multiplayer real-time Snake as a fast-paced, competitive game within the P1x3lz platform.