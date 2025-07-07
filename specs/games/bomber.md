# Bomber Game Specification

## Concept Overview
- **Brief Description**: Multiplayer real-time Bomberman where players place bombs to destroy blocks and eliminate opponents in a confined grid arena
- **Game Type**: Real-Time
- **Players**: 2-8 players
- **Duration**: 2-8 minutes
- **Complexity**: Medium
- **AI Support**: Yes (Easy, Medium, Hard, Expert)

## Game Mode
- **Play Style**: One Man Army (Free-for-All)
- **Team Configuration**: Optional team mode (2v2, 3v3, 4v4)
- **Shared Resources**: Power-ups scattered in destructible blocks

## Level Design
- **Grid Configuration**: 13x13 to 21x21 grid (odd dimensions for classic feel)
- **Environmental Elements**: Indestructible walls, destructible blocks, power-ups
- **Procedural Generation**: Random destructible block placement with guaranteed safe spawn areas
- **Balanced Layout**: Symmetric arena design with equal opportunities for all players
- **Edge Behavior**: Grid edges act as solid walls (collision stops movement)

## Game-Specific Models

### Player Extension
```typescript
interface BomberPlayer extends Player {
  bombCount: number;              // Current bombs player can place simultaneously
  maxBombs: number;               // Maximum bombs limit
  explosionRadius: number;        // Current explosion radius
  speed: number;                  // Movement speed multiplier
  alive: boolean;                 // Alive/dead state
  invulnerable: boolean;          // Temporary invulnerability after spawn
  kills: number;                  // Number of players eliminated
  blocksDestroyed: number;        // Destructible blocks destroyed
  powerUpsCollected: number;      // Power-ups collected
  lastBombPlaced: number;         // Timestamp of last bomb placement
  speedBoostActive: boolean;      // Whether speed boost is active
  speedBoostExpires: number;      // When speed boost expires
  megaBombsRemaining: number;     // Number of mega-bombs remaining
  megaBombLevel: number;          // Current mega-bomb level (1-3)
}
```

### Grid Extension
```typescript
interface BomberGrid extends Grid {
  blocks: Block[];                // All block entities (destructible/indestructible)
  bombs: Bomb[];                  // Active bombs on grid
  explosions: Explosion[];        // Active explosion effects
  powerUps: PowerUp[];            // Available power-ups
  spawnPoints: Position[];        // Player spawn positions
  safeZones: Position[];          // Safe areas around spawn points
}
```

### Options Extension
```typescript
interface BomberOptions extends GameOptions {
  explosionBaseRadius: number;    // Base explosion radius in blocks (default: 1)
  explosionMaxRadius: number;     // Maximum explosion radius (default: 8)
  bombTimer: number;              // Base bomb delay in seconds (default: 3.0)
  bombCooldown: number;           // Minimum time between bomb placements per player (default: 2)
  defaultMaxBombs: number;        // Starting bomb capacity per player (default: 3)
  bombCapacityInterval: number;   // Every X seconds, players gain +1 max bomb (default: 60)
  explosionDecay: number;         // Bomb timer reduction % per minute (default: 100)
  /**
   * Initial grid composition
   */
  steelPercentage: number;        // % of indestructible steel blocks (default: 15)
  brickPercentage: number;        // % of destructible brick blocks (default: 55)
  /**
   * Loot distribution configuration
   */
  lootRateBricks: number;         // % chance a destroyed brick drops loot (default: 20)
  lootRateKills: number;          // % chance a killed player drops loot (default: 50)
  randomLootInterval: number;     // Interval in seconds for random loot spawn after bricks are gone (default: 30)
  lootSpeedBoots: boolean;        // Toggle speed boots drops (default: true)
  lootMegaBombs: boolean;         // Toggle mega-bombs drops (default: true)
  chainReaction: boolean;         // Bombs trigger other bombs (default: true)
  friendlyFire: boolean;          // Players can kill teammates (default: false)
  /**
   * How grid edges behave. Bomber uses 'wall' (collision stops movement).
   * 'wall' = collision with edges blocks movement
   * 'wrap' = pass-through (not typical for Bomberman)
   */
  edgeBehavior: 'wall' | 'wrap';
  
  // Inherited base options
  ...DEFAULT_GAME_OPTIONS
}
```

### Additional Type Definitions
```typescript
// Block types in the arena
enum BlockType {
  DESTRUCTIBLE = 'destructible',
  INDESTRUCTIBLE = 'indestructible'
}

// Power-up types (extended)
enum PowerUpType {
  BOMB_UP = 'bomb_up',              // Increase max bombs
  FIRE_UP = 'fire_up',              // Increase explosion radius
  SPEED_UP = 'speed_up',            // Increase movement speed (legacy)
  KICK = 'kick',                    // Kick bombs
  PUNCH = 'punch',                  // Punch bombs
  REMOTE = 'remote',                // Remote detonation
  SPEED_BOOTS_L1 = 'speed_boots_l1', // +15% speed for 3s
  SPEED_BOOTS_L2 = 'speed_boots_l2', // +25% speed for 6s
  SPEED_BOOTS_L3 = 'speed_boots_l3', // +35% speed for 9s
  MEGA_BOMB_L1 = 'mega_bomb_l1',    // Next 4 bombs radius +1
  MEGA_BOMB_L2 = 'mega_bomb_l2',    // Next 4 bombs radius +2
  MEGA_BOMB_L3 = 'mega_bomb_l3'     // Next 4 bombs radius +3
}

// Bomb state
interface Bomb {
  id: string;
  position: Position;
  owner: Player;
  timer: number;                    // Seconds remaining
  explosionRadius: number;          // Radius for this bomb
  isChained: boolean;               // Triggered by another explosion
  placedAt: number;                 // Timestamp
  isMegaBomb: boolean;              // Whether this is a mega-bomb
  megaBombLevel: number;            // Mega-bomb level (0 = normal)
}

// Block entity
interface Block {
  position: Position;
  type: BlockType;
  destructible: boolean;
  containsPowerUp?: PowerUpType;
  health: number;                   // Hit points for multi-hit blocks
}

// Explosion effect
interface Explosion {
  id: string;
  center: Position;
  radius: number;
  directions: Position[];           // All affected positions
  startTime: number;
  duration: number;                 // How long explosion lasts
  owner: Player;
  damage: number;                   // Explosion damage value
}

// Power-up item
interface PowerUp {
  id: string;
  position: Position;
  type: PowerUpType;
  spawnedAt: number;
  level: number;                    // Power-up level (1-3)
  duration?: number;                // Duration for temporary power-ups
}
```

### Game-Specific Events
```typescript
enum BomberEventType {
  BOMB_PLACED = 'bomb_placed',
  BOMB_EXPLODED = 'bomb_exploded',
  BLOCK_DESTROYED = 'block_destroyed',
  POWER_UP_SPAWNED = 'power_up_spawned',
  POWER_UP_COLLECTED = 'power_up_collected',
  PLAYER_ELIMINATED = 'player_eliminated',
  CHAIN_REACTION = 'chain_reaction',
  LOOT_DROPPED = 'loot_dropped',
  SPEED_BOOST_ACTIVATED = 'speed_boost_activated',
  SPEED_BOOST_EXPIRED = 'speed_boost_expired',
  MEGA_BOMB_ACTIVATED = 'mega_bomb_activated'
}

interface BomberEvent extends GameEvent {
  type: BomberEventType;
  playerId: string;
  position?: Position;
  bombId?: string;
  powerUpType?: PowerUpType;
  chainedBombs?: string[];          // For chain reactions
  lootType?: PowerUpType;
  level?: number;                   // Power-up level
  duration?: number;                // Effect duration
}
```

### Game-Specific State
```typescript
interface BomberGameState extends GameState {
  grid: BomberGrid;
  players: Map<string, BomberPlayer>;
  bombs: Map<string, Bomb>;
  explosions: Map<string, Explosion>;
  blocks: Map<string, Block>;
  powerUps: Map<string, PowerUp>;
  gameTimer: number;                // Current game time
  eliminationOrder: string[];       // Player elimination sequence
  lastExplosionDecay: number;       // Time of last decay application
  lastBombCapacityIncrease: number; // Time of last capacity increase
  nextRandomLootSpawn: number;      // Time for next random loot
}
```

## Rules

### Real-Time Controls
- **Input Handling**: Arrow keys (↑↓←→) or WASD for movement, Spacebar for bomb placement
- **Movement**: Grid-based movement with smooth interpolation between cells
- **Timing**: Continuous movement with collision detection, bomb placement cooldown
- **Edge Behavior**: By default edges are walls (collision stops movement)
- **Collision Detection**: Real-time collision with blocks, bombs, and other players

### Movement Mechanics
- **Grid Movement**: Players move one cell at a time in 4 directions
- **Speed**: Base movement speed affected by speed power-ups
- **Collision**: Cannot move through blocks, bombs, or other players
- **Bomb Interaction**: Can push bombs if kick power-up is active
- **Speed Boosts**: Temporary speed increases from Speed Boots power-ups

### Bomb Mechanics
- **Placement**: Players can place bombs up to their `maxBombs` limit, respecting `bombCooldown`
- **Capacity Progression**: Every `bombCapacityInterval` seconds, each alive player's `maxBombs` increases by 1
- **Timer**: Bombs explode after `bombTimer` seconds (affected by decay)
- **Explosion Pattern**: Cross-shaped explosion in 4 directions
- **Chain Reaction**: Explosions can trigger other bombs if `chainReaction` is enabled
- **Radius**: Explosion travels `explosionRadius` blocks in each direction until hitting indestructible block
- **Mega-Bombs**: Enhanced bombs with increased radius from power-ups

### Power-Up System
- **Spawning**: 
  - Destroyed bricks drop loot with probability `lootRateBricks%` (default 20%)
  - Player eliminations drop loot at death position with probability `lootRateKills%` (default 50%)
  - Random loot spawns every `randomLootInterval` seconds when no bricks remain
- **Types & Distribution**: 
  - **Speed Boots** (Levels 1-3): 60%/30%/10% probability, duration 3/6/9 seconds
  - **Mega-Bombs** (Levels 1-3): 60%/30%/10% probability, affects next 4 bombs
- **Collection**: Walking over power-ups grants effects immediately
- **Stacking**: Same-type effects replace (not stack), keeping higher level/duration

## Events

### Core Events
- **User Input Events**: Movement commands, bomb placement requests
- **Collision Events**: Player-block, player-bomb, player-explosion interactions
- **Grid Change Events**: Block destruction, power-up spawning/collection
- **Environmental Events**: Bomb explosions, chain reactions, timer decay

### Event Flow
```typescript
class BomberGameEngine {
  private gameLoop(): void {
    // 1. Process input queue
    this.processMovementInput();
    this.processBombPlacement();
    
    // 2. Update player positions
    this.updatePlayerPositions();
    
    // 3. Update bomb timers
    this.updateBombTimers();
    
    // 4. Process explosions
    this.processExplosions();
    
    // 5. Handle chain reactions
    this.handleChainReactions();
    
    // 6. Update power-ups and effects
    this.updatePowerUps();
    this.updatePlayerEffects();
    
    // 7. Apply progression mechanics
    this.applyBombCapacityIncrease();
    this.applyExplosionDecay();
    this.spawnRandomLoot();
    
    // 8. Check victory conditions
    this.checkVictoryConditions();
    
    // 9. Broadcast updates
    this.broadcastStateUpdate();
  }
}
```

## Victory Conditions

### Primary Win Condition
- **Objective**: Last player standing (elimination-based)
- **Measurement**: Only one player remains alive
- **Timing**: Checked after each player elimination

### Alternative Win Conditions
- **Time Limit**: Player with most kills when time expires
- **Sudden Death**: Indestructible blocks start disappearing to force encounters
- **Team Victory**: Last team with surviving members (in team mode)

### Tie-Breaking
- **Scoring System**: Points = kills × 10 + blocks destroyed + power-ups collected
- **Ranking**: 1st by survival time, 2nd by score, 3rd by kills

## AI Implementation

### AI Strategy
```typescript
class BomberAI extends AIPlayer {
  private pathfinder = new SafePathfinder();
  private explosionPredictor = new ExplosionPredictor();
  
  async makeMove(gameState: BomberGameState): Promise<BomberMove> {
    const myPlayer = gameState.players.get(this.playerId);
    const threats = this.analyzeDangerZones(gameState);
    const opportunities = this.findTargets(gameState);
    
    // Priority: Survival > Offensive > Collect Power-ups
    if (threats.immediate.length > 0) {
      return this.findSafePosition(gameState, threats);
    }
    
    if (opportunities.bombing.length > 0) {
      return this.executeBombStrategy(gameState, opportunities);
    }
    
    return this.collectPowerUps(gameState);
  }
}
```

### Difficulty Scaling
- **Easy**: Basic movement, poor bomb timing, minimal prediction
- **Medium**: Improved safety awareness, better power-up collection
- **Hard**: Strategic bomb placement, chain reaction setup, player hunting
- **Expert**: Advanced prediction, trap setting, optimal positioning

## Visual Design

### Rendering
```typescript
class BomberRenderer {
  renderPlayer(player: BomberPlayer, ctx: CanvasRenderingContext2D): void {
    const { x, y } = player.position;
    const cellSize = this.getCellSize();
    
    // Use dynamic player color
    ctx.fillStyle = player.color.hex;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    
    // Add contrast border
    ctx.strokeStyle = this.getContrastColor(player.color);
    ctx.lineWidth = 2;
    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    
    // Speed boost visual effect
    if (player.speedBoostActive) {
      this.renderSpeedBoostEffect(player, ctx);
    }
  }
  
  renderBomb(bomb: Bomb, ctx: CanvasRenderingContext2D): void {
    const { x, y } = bomb.position;
    const cellSize = this.getCellSize();
    const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
    
    // Different colors for mega-bombs
    const bombColor = bomb.isMegaBomb ? 
      `rgba(255, 215, 0, ${pulseIntensity})` : // Gold for mega-bombs
      `rgba(255, 100, 100, ${pulseIntensity})`; // Red for normal bombs
    
    ctx.fillStyle = bombColor;
    ctx.beginPath();
    ctx.arc(
      x * cellSize + cellSize/2,
      y * cellSize + cellSize/2,
      cellSize/3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  renderExplosion(explosion: Explosion, ctx: CanvasRenderingContext2D): void {
    const cellSize = this.getCellSize();
    
    // Use explosion owner's color with high brightness
    const explosionColor = this.adjustColorLightness(explosion.owner.color, 40);
    ctx.fillStyle = explosionColor;
    
    explosion.directions.forEach(pos => {
      ctx.fillRect(pos.x * cellSize, pos.y * cellSize, cellSize, cellSize);
    });
  }
  
  private getContrastColor(color: PlayerColor): string {
    return color.lightness > 60 ? '#000000' : '#FFFFFF';
  }
  
  private adjustColorLightness(color: PlayerColor, adjustment: number): string {
    const newLightness = Math.max(0, Math.min(100, color.lightness + adjustment));
    return this.hslToHex(color.hue, color.saturation, newLightness);
  }
}
```

### Animations
- **Movement**: Smooth interpolation between grid cells
- **Bomb Pulse**: Pulsing animation with increasing frequency as timer decreases
- **Explosion**: Bright flash with particle effects in player's color
- **Block Destruction**: Crumbling animation with debris
- **Power-up Collection**: Sparkle effect and UI notification
- **Speed Boost**: Glowing trail effect during speed boost

## Performance Optimization

### Core Optimizations
- **Update Frequency**: 60 FPS rendering, 30 FPS game logic
- **Memory Management**: Object pooling for bombs, explosions, particles
- **Network Efficiency**: Delta compression, input prediction, lag compensation

### Scalability
- **Large Grids**: Spatial partitioning for collision detection
- **Many Players**: Efficient explosion calculation algorithms
- **Chain Reactions**: Optimized explosion propagation with cycle detection

### Network Synchronization
```typescript
class BomberNetworkSync {
  // Client-side prediction for movement
  predictMovement(player: BomberPlayer, input: MovementInput): Position {
    const predictedPos = this.calculateMovement(player.position, input);
    return this.validatePosition(predictedPos);
  }
  
  // Server reconciliation for bomb timing
  reconcileBombState(clientBombs: Map<string, Bomb>, serverBombs: Map<string, Bomb>): void {
    // Synchronize bomb timers and handle discrepancies
    this.syncBombTimers(clientBombs, serverBombs);
    this.handleExplosionDiscrepancies(clientBombs, serverBombs);
  }
}
```

This specification provides a comprehensive foundation for implementing classic Bomberman gameplay as a fast-paced, strategic multiplayer experience within the P1x3lz platform.
