# Core Types

## Overview

This document defines all core interfaces, enums, and types used throughout the P1x3lz platform. These types serve as the single source of truth and should be imported by all other modules to ensure consistency.

## Base Types

### Position and Geometry
```typescript
interface Position {
  x: number;
  y: number;
}

interface GridSize {
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

interface Region {
  id: string;
  cells: Position[];
  owner?: Player;
  conqueredAt?: Date;
}
```

## Core Enums

### Game Types
```typescript
enum GameType {
  CONQUER = 'conquer'
  // Future game types:
  // PIXEL_SNAKE = 'pixel_snake',
  // BLOCK_BLAST = 'block_blast',
  // GRID_WARS = 'grid_wars',
  // PIXEL_PONG = 'pixel_pong',
  // MINE_SWEEPER_ROYALE = 'mine_sweeper_royale'
}
```

### Game Status
```typescript
enum GameStatus {
  PENDING = 'pending',     // Waiting for players
  STARTING = 'starting',   // Countdown/initialization
  RUNNING = 'running',     // Active gameplay
  PAUSED = 'paused',       // Temporarily stopped
  ENDING = 'ending',       // Victory condition met
  ENDED = 'ended'          // Game completed
}
```

### Player States
```typescript
enum PlayerStatus {
  ONLINE = 'online',
  IN_LOBBY = 'in_lobby',
  IN_GAME = 'in_game',
  IDLE = 'idle',
  DISCONNECTED = 'disconnected'
}

// Dynamic color system for players
interface PlayerColor {
  hex: string;                    // Color in hex format (e.g., '#FF5733')
  hue: number;                    // HSL hue value (0-360)
  saturation: number;             // HSL saturation (0-100)
  lightness: number;              // HSL lightness (0-100)
  name: string;                   // Human-readable color name
}

// Color generation constraints
interface ColorConstraints {
  minLightness: number;           // Minimum lightness (default: 35)
  maxLightness: number;           // Maximum lightness (default: 85)
  minSaturation: number;          // Minimum saturation (default: 60)
  maxSaturation: number;          // Maximum saturation (default: 100)
  minHueDifference: number;       // Minimum hue difference between players (default: 30)
  forbiddenRanges: HueRange[];    // Hue ranges to avoid (e.g., muddy browns)
}

interface HueRange {
  start: number;                  // Starting hue
  end: number;                    // Ending hue
  reason: string;                 // Why this range is forbidden
}

// Default color constraints for good contrast on dark grids
const DEFAULT_COLOR_CONSTRAINTS: ColorConstraints = {
  minLightness: 35,               // Avoid too dark colors
  maxLightness: 85,               // Avoid too light colors
  minSaturation: 60,              // Ensure vivid colors
  maxSaturation: 100,             // Allow full saturation
  minHueDifference: 30,           // Ensure colors are distinguishable
  forbiddenRanges: [
    { start: 20, end: 40, reason: 'muddy browns' },
    { start: 200, end: 220, reason: 'dark blues too close to UI' }
  ]
};
```

### Grid and Cell Types
```typescript
enum CellType {
  EMPTY = 'empty',
  OCCUPIED = 'occupied',
  ROCK = 'rock',
  BLOCKED = 'blocked',
  SPECIAL = 'special'
}
```

### Game Actions and Moves
```typescript
enum ActionType {
  PLACE_PIECE = 'place_piece',
  MOVE_PIECE = 'move_piece', 
  REMOVE_PIECE = 'remove_piece',
  PASS_TURN = 'pass_turn',
  SURRENDER = 'surrender',
  CHAT_MESSAGE = 'chat_message'
}

enum MoveType {
  CELL_CLAIM = 'cell_claim',
  PIECE_MOVE = 'piece_move',
  SPECIAL_ACTION = 'special_action'
}
```

### Victory Conditions
```typescript
enum VictoryType {
  MAJORITY = 'majority',         // Control >50% of grid
  ELIMINATION = 'elimination',   // Last player standing
  OBJECTIVE = 'objective',       // Game-specific goal
  TIME_LIMIT = 'time_limit',     // Highest score when time expires
  CONSENSUS = 'consensus'        // All remaining players agree
}
```

### UI and Chat
```typescript
enum ScreenType {
  HOME = 'home',
  MAIN_LOBBY = 'main_lobby',
  GAME_LOBBY = 'game_lobby',
  IN_GAME = 'in_game',
  GAME_OVER = 'game_over'
}

enum MessageType {
  PLAYER = 'player',
  SYSTEM = 'system',
  GAME_EVENT = 'game_event',
  TEAM = 'team'
}

enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}
```

## Player Interfaces

### Base Player
```typescript
interface Player {
  id: string;
  name: string;
  type: 'human' | 'ai';
  color: PlayerColor;             // Dynamic color assignment
  isReady: boolean;
  score: number;
  rank?: number;
  isGameMaster: boolean;
  isMuted: boolean;
  joinedAt: Date;
}

interface PlayerGameState {
  player: Player;
  isConnected: boolean;
  lastActivity: Date;
  pendingActions: PlayerAction[];
  score: number;
  statistics: PlayerStats;
}

interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  averageGameTime: number;
  favoriteGameType?: GameType;
}
```

## Game Core Interfaces

### Base Grid
```typescript
interface Grid {
  width: number;
  height: number;
  cells: Cell[][];
}

interface Cell {
  x: number;
  y: number;
  owner?: Player;
  type: CellType;
  occupiedAt?: Date;
}
```

### Game Options Base
```typescript
interface GameOptions {
  // Core Settings
  chatEnabled: boolean;           // Default: true
  observersAllowed: boolean;      // Default: false
  gameSpeed: number;              // 0.5 - 2.0, default: 1.0
  
  // Grid Configuration
  gridSize: GridSize;
  
  // Player Configuration
  minPlayers: number;             // 2 - 32, default: 2
  maxPlayers: number;             // 2 - 32, default: 8
  teamMode: boolean;              // Default: false
  
  // Timing
  turnTimeLimit?: number;         // Seconds, null = unlimited
  gameTimeLimit?: number;         // Minutes, null = unlimited
  
  // Spectator Settings
  spectatorChat: boolean;         // Default: false
  spectatorCount: number;         // Max spectators, default: 10
}
```

### Base Game Interface
```typescript
interface Game {
  id: string;
  name: string;
  type: GameType;
  status: GameStatus;
  players: Player[];
  options: GameOptions;
  grid: Grid;
  currentTurn: number;
  winners?: Player[];
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  gamemaster: Player;
}
```

## Action and Move Interfaces

### Player Actions
```typescript
interface PlayerAction {
  id: string;
  playerId: string;
  type: ActionType;
  position?: Position;
  data?: any;
  timestamp: Date;
  validated: boolean;
}

interface Move {
  id: string;
  playerId: string;
  position: Position;
  type: MoveType;
  timestamp: number;
  data?: any;
}
```

### Game State Management
```typescript
interface GameState {
  // Game Identity
  gameId: string;
  gameType: GameType;
  status: GameStatus;
  version: number; // Incremented on each state change
  
  // Game Configuration
  options: GameOptions;
  grid: Grid;
  
  // Player State
  players: Player[];
  currentPlayer: Player;
  playerStates: Map<string, PlayerGameState>;
  
  // Turn Management
  currentTurn: number;
  turnStartTime: Date;
  turnTimeLimit?: number;
  turnHistory: Turn[];
  
  // Game Progress
  startTime: Date;
  lastMoveTime: Date;
  winCondition?: WinCondition;
  
  // Real-time State
  pendingMoves: Move[];
  lastStateHash: string;
}

interface Turn {
  turnNumber: number;
  playerId: string;
  startTime: Date;
  endTime?: Date;
  moves: Move[];
  isComplete: boolean;
  timeUsed: number; // milliseconds
}
```

## Validation and Results

### Validation Types
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: any;
}

interface TurnResult {
  success: boolean;
  error?: string;
  placedCells?: Position[];
  capturedRegions?: Region[];
  capturedCells?: Position[];
  winCondition?: WinCondition;
}

interface MoveResult {
  success: boolean;
  error?: string;
  stateUpdate?: any;
  sideEffects?: SideEffect[];
  snapshot?: StateSnapshot;
}
```

### Win Conditions
```typescript
interface WinCondition {
  hasWinner: boolean;
  winners: Player[];
  type: VictoryType;
  reason: string;
  finalScore?: Map<string, number>;
}
```

## Chat and Communication

### Chat Interfaces
```typescript
interface ChatMessage {
  id: string;
  author: Player;
  content: string;
  timestamp: Date;
  type: MessageType;
  gameId?: string;
  teamId?: string;
}

interface ChatHistory {
  messages: ChatMessage[];
  maxMessages: number;
  participants: Player[];
}

interface ChatSettings {
  globalChatEnabled: boolean;
  gameChatEnabled: boolean;
  teamChatEnabled: boolean;
  profanityFilter: boolean;
  maxMessageLength: number;
}
```

## Team System

### Team Interfaces
```typescript
interface Team {
  id: string;
  players: Player[];
  color: PlayerColor;
  name: string;
  chatChannel?: string;
  score?: number;
}
```

## Game-Specific Models

### ConquerGame
Extends the base Game interface with Conquer-specific properties.

```typescript
interface ConquerGame extends Game {
  type: GameType.CONQUER;
  options: ConquerOptions;
  grid: ConquerGrid; // Specialized grid with rocks and regions
}

interface ConquerOptions extends GameOptions {
  rocksPercentage: number; // 0-90%, default 20%
  turnBlocks: number; // 1-4, default 1
  teamMode: boolean; // false for FFA, true for team play
  teams?: Team[];
  sharedRegions: boolean; // Teams share conquered regions
  teamChat: boolean; // Private team communication
}

interface ConquerGrid extends Grid {
  rocks: Position[];
  rocksPercentage: number;
  regions: Region[];
}
```

## AI Player System

### AIPlayer Extension
Extends the base Player interface for AI-specific functionality.

```typescript
interface AIPlayer extends Player {
  type: 'ai';
  difficulty: AIDifficulty;
  strategy: AIStrategy;
  thinkingTime: number; // milliseconds
  personality?: AIPersonality;
}

enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

interface AIStrategy {
  name: string;
  description: string;
  difficulty: AIDifficulty;
  makeMove(game: Game, player: AIPlayer): Promise<Move>;
  evaluatePosition(game: Game, player: AIPlayer): number;
  getPriorityTargets(game: Game, player: AIPlayer): Position[];
}

interface AIPersonality {
  aggression: number;      // 0-1, tendency to attack
  patience: number;        // 0-1, willingness to wait for better moves
  riskTaking: number;      // 0-1, preference for risky vs safe moves
  adaptability: number;    // 0-1, ability to change strategy
}
```

## Game Actions and Rules

### Game Actions
Actions that can be performed on games.

```typescript
enum GameAction {
  // Game Management
  CREATE_GAME = 'create_game',
  JOIN_GAME = 'join_game',
  LEAVE_GAME = 'leave_game',
  START_GAME = 'start_game',
  END_GAME = 'end_game',
  RESTART_GAME = 'restart_game',
  
  // Player Management
  TOGGLE_READY = 'toggle_ready',
  CHANGE_COLOR = 'change_color',
  TRANSFER_LEADERSHIP = 'transfer_leadership',
  MUTE_PLAYER = 'mute_player',
  KICK_PLAYER = 'kick_player',
  ADD_AI_PLAYER = 'add_ai_player',
  
  // Game Settings
  UPDATE_OPTIONS = 'update_options',
  CHANGE_GAME_TYPE = 'change_game_type',
  
  // Gameplay
  MAKE_MOVE = 'make_move',
  END_TURN = 'end_turn',
  SURRENDER = 'surrender',
  
  // Chat
  SEND_MESSAGE = 'send_message'
}
```

### Game Rules Engine
```typescript
interface GameRules {
  validateMove(game: Game, move: Move): ValidationResult;
  checkWinCondition(game: Game): WinCondition;
  calculateScore(game: Game, player: Player): number;
  getValidMoves(game: Game, player: Player): Position[];
}
```

## Event System

### Game Events
Events that can be emitted during gameplay.

```typescript
interface GameEvent {
  id: string;
  type: EventType;
  gameId: string;
  playerId?: string;
  data: any;
  timestamp: Date;
}

enum EventType {
  // Game Lifecycle
  GAME_CREATED = 'game_created',
  GAME_STARTED = 'game_started',
  GAME_ENDED = 'game_ended',
  
  // Player Events
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  PLAYER_READY = 'player_ready',
  
  // Gameplay Events
  MOVE_MADE = 'move_made',
  TURN_CHANGED = 'turn_changed',
  REGION_CONQUERED = 'region_conquered',
  
  // Communication
  CHAT_MESSAGE = 'chat_message',
  
  // System Events
  ERROR_OCCURRED = 'error_occurred',
  CONNECTION_LOST = 'connection_lost'
}
```

## State Management

### Application State
```typescript
interface AppState {
  // User Session
  currentUser: Player;
  sessionId: string;
  isAuthenticated: boolean;
  
  // Navigation
  currentScreen: ScreenType;
  navigationHistory: ScreenType[];
  
  // Platform State
  lobby: LobbyState;
  currentGame?: GameState;
  
  // UI State
  ui: UIState;
  
  // Chat State
  chat: ChatState;
}

interface LobbyState {
  // Game Management
  games: Map<string, Game>;
  activeGameCount: number;
  maxGames: number;
  
  // Player Management
  onlinePlayers: Map<string, Player>;
  totalPlayerCount: number;
  playersInGames: Map<string, string>; // playerId -> gameId
  
  // Chat State
  globalChat: ChatHistory;
  chatSettings: ChatSettings;
}

interface UIState {
  isLoading: boolean;
  error?: string;
  notifications: Notification[];
  selectedGame?: string;
}

interface ChatState {
  globalChat: ChatHistory;
  gameChats: Map<string, ChatHistory>; // gameId -> chat
  teamChats: Map<string, ChatHistory>; // teamId -> chat
  settings: ChatSettings;
}
```

## Animation System

### Animation Types
```typescript
interface Animation {
  type: AnimationType;
  duration: number;
  easing: string;
  delay?: number;
  repeat?: number;
}

enum AnimationType {
  FADE = 'fade',
  SCALE = 'scale',
  SLIDE = 'slide',
  BOUNCE = 'bounce',
  PULSE = 'pulse',
  PARTICLE = 'particle'
}
```

## Utility Types

### Generic Utility Types
```typescript
interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: Date;
  autoClose: boolean;
  duration?: number;
}

interface StateSnapshot {
  id: string;
  timestamp: Date;
  gameState: GameState;
  checksum: string;
}

interface SideEffect {
  type: string;
  data: any;
  timestamp: Date;
}

// Generic ID generator type
type GenerateId = () => string;

// Event system types
type EventHandler<T = any> = (data: T) => void;
type EventEmitter = {
  on<T>(event: string, handler: EventHandler<T>): void;
  off<T>(event: string, handler: EventHandler<T>): void;
  emit<T>(event: string, data?: T): void;
};
```

## Constants

### Default Values
```typescript
const DEFAULT_GRID_SIZE: GridSize = {
  width: 16,
  height: 16,
  minWidth: 4,
  maxWidth: 64,
  minHeight: 4,
  maxHeight: 64
};

const DEFAULT_GAME_OPTIONS: GameOptions = {
  chatEnabled: true,
  observersAllowed: false,
  gameSpeed: 1.0,
  gridSize: DEFAULT_GRID_SIZE,
  minPlayers: 2,
  maxPlayers: 8,
  teamMode: false,
  turnTimeLimit: 30,
  gameTimeLimit: undefined,
  spectatorChat: false,
  spectatorCount: 10
};

const DEFAULT_CONQUER_OPTIONS: ConquerOptions = {
  ...DEFAULT_GAME_OPTIONS,
  rocksPercentage: 10,
  turnBlocks: 1,
  teamMode: false,
  sharedRegions: true,
  teamChat: true
};

// Color management is now handled dynamically by ColorManager
const COLOR_MANAGER = new ColorManager();

const AI_DIFFICULTIES = Object.values(AIDifficulty) as const;

const GAME_TYPES = Object.values(GameType) as const;
```

## Platform Integration

This comprehensive type system provides:

- **Single Source of Truth**: All platform types consolidated in one location
- **Type Safety**: Consistent interfaces across all modules
- **Extensibility**: Game-specific models extend base interfaces
- **Performance**: Map-based state management for efficient lookups
- **Modularity**: Clear separation between core and game-specific types
- **AI Integration**: Complete AI player system with personality traits
- **Event System**: Unified event handling across all components
- **Validation**: Comprehensive validation and result types

The unified type system ensures seamless integration across all P1x3lz platform components while maintaining the flexibility needed for different game types and future expansion. 

### Color Management System
```typescript
class ColorManager {
  private usedColors: Map<string, PlayerColor> = new Map();
  private constraints: ColorConstraints;
  
  constructor(constraints: ColorConstraints = DEFAULT_COLOR_CONSTRAINTS) {
    this.constraints = constraints;
  }
  
  /**
   * Assigns a unique, contrasting color to a player
   */
  assignPlayerColor(playerId: string, gameId: string): PlayerColor {
    const gameColors = this.getGameColors(gameId);
    const newColor = this.generateUniqueColor(gameColors);
    
    this.usedColors.set(`${gameId}:${playerId}`, newColor);
    return newColor;
  }
  
  /**
   * Generates a color that contrasts well with existing colors
   */
  private generateUniqueColor(existingColors: PlayerColor[]): PlayerColor {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const candidate = this.generateRandomColor();
      
      if (this.isColorValid(candidate, existingColors)) {
        return candidate;
      }
      
      attempts++;
    }
    
    // Fallback: use systematic hue distribution
    return this.generateSystematicColor(existingColors);
  }
  
  /**
   * Generates a random color within constraints
   */
  private generateRandomColor(): PlayerColor {
    let hue: number;
    let validHue = false;
    
    // Find a valid hue not in forbidden ranges
    while (!validHue) {
      hue = Math.random() * 360;
      validHue = !this.constraints.forbiddenRanges.some(range => 
        hue >= range.start && hue <= range.end
      );
    }
    
    const saturation = this.constraints.minSaturation + 
      Math.random() * (this.constraints.maxSaturation - this.constraints.minSaturation);
    
    const lightness = this.constraints.minLightness + 
      Math.random() * (this.constraints.maxLightness - this.constraints.minLightness);
    
    return this.createColorFromHSL(hue!, saturation, lightness);
  }
  
  /**
   * Validates if a color is sufficiently different from existing colors
   */
  private isColorValid(candidate: PlayerColor, existingColors: PlayerColor[]): boolean {
    return existingColors.every(existing => {
      const hueDiff = Math.abs(candidate.hue - existing.hue);
      const minDiff = Math.min(hueDiff, 360 - hueDiff); // Account for hue wrap-around
      return minDiff >= this.constraints.minHueDifference;
    });
  }
  
  /**
   * Creates PlayerColor from HSL values
   */
  private createColorFromHSL(hue: number, saturation: number, lightness: number): PlayerColor {
    const hex = this.hslToHex(hue, saturation, lightness);
    const name = this.generateColorName(hue, saturation, lightness);
    
    return {
      hex,
      hue,
      saturation,
      lightness,
      name
    };
  }
  
  /**
   * Converts HSL to hex color
   */
  private hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }
  
  /**
   * Generates a human-readable color name
   */
  private generateColorName(hue: number, saturation: number, lightness: number): string {
    const hueNames = [
      'Red', 'Orange', 'Yellow', 'Lime', 'Green', 'Teal',
      'Cyan', 'Blue', 'Purple', 'Magenta', 'Pink', 'Rose'
    ];
    
    const hueIndex = Math.floor(hue / 30);
    const baseName = hueNames[hueIndex];
    
    let modifier = '';
    if (lightness > 70) modifier = 'Light ';
    else if (lightness < 50) modifier = 'Dark ';
    
    if (saturation > 80) modifier += 'Vivid ';
    else if (saturation < 40) modifier += 'Muted ';
    
    return `${modifier}${baseName}`.trim();
  }
  
  /**
   * Gets all colors currently used in a game
   */
  private getGameColors(gameId: string): PlayerColor[] {
    return Array.from(this.usedColors.entries())
      .filter(([key]) => key.startsWith(`${gameId}:`))
      .map(([, color]) => color);
  }
  
  /**
   * Releases a player's color when they leave
   */
  releasePlayerColor(playerId: string, gameId: string): void {
    this.usedColors.delete(`${gameId}:${playerId}`);
  }
}
```

### Color Picker Interface
```typescript
interface ColorPickerOptions {
  constraints: ColorConstraints;
  existingColors: PlayerColor[];   // Colors already taken by other players
  previewMode: boolean;           // Show real-time preview
  allowCustomInput: boolean;      // Allow manual hex input (with validation)
}

interface ColorPickerResult {
  color: PlayerColor;
  isValid: boolean;
  validationMessage?: string;
}

// UI Color Picker Component specification
interface ColorPickerComponent {
  // Visual elements
  hueSlider: HTMLElement;         // 0-360 hue selection
  saturationSlider: HTMLElement;  // Saturation control
  lightnessSlider: HTMLElement;   // Lightness control
  colorPreview: HTMLElement;      // Large preview of selected color
  hexInput: HTMLInputElement;     // Manual hex input
  
  // Validation
  validateColor(color: PlayerColor): ColorPickerResult;
  
  // Events
  onColorChange: (color: PlayerColor) => void;
  onColorSelect: (color: PlayerColor) => void;
}
```

## Constants

### Default Values
```typescript
const DEFAULT_GRID_SIZE: GridSize = {
  width: 16,
  height: 16,
  minWidth: 4,
  maxWidth: 64,
  minHeight: 4,
  maxHeight: 64
};

const DEFAULT_GAME_OPTIONS: GameOptions = {
  chatEnabled: true,
  observersAllowed: false,
  gameSpeed: 1.0,
  gridSize: DEFAULT_GRID_SIZE,
  minPlayers: 2,
  maxPlayers: 8,
  teamMode: false,
  turnTimeLimit: 30,
  gameTimeLimit: undefined,
  spectatorChat: false,
  spectatorCount: 10
};

const DEFAULT_CONQUER_OPTIONS: ConquerOptions = {
  ...DEFAULT_GAME_OPTIONS,
  rocksPercentage: 10,
  turnBlocks: 1,
  teamMode: false,
  sharedRegions: true,
  teamChat: true
};

// Color management is now handled dynamically by ColorManager
const COLOR_MANAGER = new ColorManager();

const AI_DIFFICULTIES = Object.values(AIDifficulty) as const;

const GAME_TYPES = Object.values(GameType) as const;
```

## Platform Integration

This comprehensive type system provides:

- **Single Source of Truth**: All platform types consolidated in one location
- **Type Safety**: Consistent interfaces across all modules
- **Extensibility**: Game-specific models extend base interfaces
- **Performance**: Map-based state management for efficient lookups
- **Modularity**: Clear separation between core and game-specific types
- **AI Integration**: Complete AI player system with personality traits
- **Event System**: Unified event handling across all components
- **Validation**: Comprehensive validation and result types

The unified type system ensures seamless integration across all P1x3lz platform components while maintaining the flexibility needed for different game types and future expansion. 