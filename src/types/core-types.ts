// Core Types for P1x3lz Platform
// Based on specs/core-types.md

// ====================
// CORE ENUMS
// ====================

export enum GameType {
  CONQUER = 'conquer',
  CHESS = 'chess',
  SNAKE = 'snake'
}

export enum GameStatus {
  PENDING = 'pending',
  STARTING = 'starting',
  RUNNING = 'running',
  PAUSED = 'paused',
  ENDING = 'ending',
  ENDED = 'ended'
}

export enum PlayerStatus {
  ONLINE = 'online',
  IN_LOBBY = 'in_lobby',
  IN_GAME = 'in_game',
  IDLE = 'idle',
  DISCONNECTED = 'disconnected'
}

export enum CellType {
  EMPTY = 'empty',
  OCCUPIED = 'occupied',
  ROCK = 'rock',
  BLOCKED = 'blocked',
  SPECIAL = 'special'
}

export enum GamePhase {
  LOBBY = 'lobby',
  STARTING = 'starting',
  PLAYING = 'playing',
  ENDED = 'ended'
}

export enum VictoryType {
  MAJORITY = 'majority',
  ELIMINATION = 'elimination',
  OBJECTIVE = 'objective',
  TIME_LIMIT = 'time_limit',
  CONSENSUS = 'consensus',
  STALEMATE = 'stalemate'
}

export enum ScreenType {
  LOGIN = 'login',
  MAIN_LOBBY = 'main_lobby',
  GAME_LOBBY = 'game_lobby',
  IN_GAME = 'in_game'
}

export enum SortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PLAYERS_DESC = 'players_desc',
  PLAYERS_ASC = 'players_asc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc'
}

export enum ActionType {
  PLACE_PIECE = 'place_piece',
  MOVE_PIECE = 'move_piece',
  REMOVE_PIECE = 'remove_piece',
  PASS_TURN = 'pass_turn',
  SURRENDER = 'surrender',
  CHAT_MESSAGE = 'chat_message'
}

export enum MoveType {
  CELL_CLAIM = 'cell_claim',
  PIECE_MOVE = 'piece_move',
  SPECIAL_ACTION = 'special_action'
}

export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

// ====================
// DYNAMIC COLOR SYSTEM
// ====================

export interface PlayerColor {
  hex: string;
  hue: number;
  saturation: number;
  lightness: number;
  name: string;
}

export interface ColorConstraints {
  minLightness: number;
  maxLightness: number;
  minSaturation: number;
  maxSaturation: number;
  minHueDifference: number;
  forbiddenRanges: HueRange[];
}

export interface HueRange {
  start: number;
  end: number;
  reason: string;
}

export const DEFAULT_COLOR_CONSTRAINTS: ColorConstraints = {
  minLightness: 50,
  maxLightness: 85,
  minSaturation: 70,
  maxSaturation: 100,
  minHueDifference: 30,
  forbiddenRanges: [
    { start: 20, end: 40, reason: 'muddy browns' },
    { start: 200, end: 220, reason: 'dark blues too close to UI' }
  ]
};

// ====================
// CORE INTERFACES
// ====================

export interface Position {
  x: number;
  y: number;
}

export interface GridSize {
  width: number;
  height: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}

export interface Player {
  id: string;
  name: string;
  type: 'human' | 'ai';
  color: PlayerColor;
  status: PlayerStatus;
  score: number;
  rank?: number;
  isReady: boolean;
  isGameMaster: boolean;
  isMuted: boolean;
  joinedAt: Date;
  isLocal: boolean;
  isAI: boolean;
  difficulty?: AIDifficulty;
}

export interface Cell {
  position: Position;
  type: CellType;
  owner?: Player;
  lastModified: Date;
}

export interface Grid {
  width: number;
  height: number;
  cells: Cell[][];
}

export interface Move {
  id: string;
  playerId: string;
  position: Position;
  timestamp: Date;
  type: string;
}

export interface Turn {
  turnNumber: number;
  playerId: string;
  moves: Move[];
  timeLimit: number;
  timeRemaining: number;
  startTime: Date;
  endTime?: Date;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export interface WinCondition {
  hasWinner: boolean;
  winners: Player[];
  type: VictoryType;
  reason: string;
}

export interface GameOptions {
  // Grid Configuration
  gridSize: { width: number; height: number };
  
  // Player Configuration
  minPlayers: number;
  maxPlayers: number;
  
  // Timing Configuration
  turnTimeLimit: number;           // Seconds per turn
  gameTimeLimit?: number;          // Minutes for entire game, null = unlimited
  gameSpeed: number;               // 0.5x - 2.0x speed multiplier
  
  // Game Features
  allowSpectators: boolean;
  allowChat: boolean;
  allowAI: boolean;
  
  // Game Mode
  isRanked: boolean;
  isPrivate: boolean;
  teamMode: boolean;               // Default false, can be overridden by game-specific options
}

export interface ConquerOptions extends GameOptions {
  rocksPercentage: number;
  turnBlocks: number;
  teamMode: boolean;
  sharedRegions: boolean;
  teamChat: boolean;
  maxNeutralEdges: number;  // Maximum number of grid edges that can count as boundaries (0-20)
}

export interface Game {
  id: string;
  name: string;
  type: GameType;
  status: GameStatus;
  players: Player[];
  spectators: Player[];
  options: GameOptions;
  grid: Grid;
  currentTurn: Turn | null;
  gamePhase: GamePhase;
  winCondition: WinCondition | null;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  createdBy: string;
}

export interface ConquerGame extends Game {
  options: ConquerOptions;
  regions: Region[];
  captureHistory: CaptureEvent[];
}

export interface Region {
  id: string;
  cells: Position[];
  owner?: Player;
  conqueredAt?: Date;
}

export interface CaptureEvent {
  id: string;
  playerId: string;
  region: Region;
  timestamp: Date;
  cellsCaptured: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  content: string;
  timestamp: Date;
  isSystemMessage: boolean;
}

export interface ChatHistory {
  messages: ChatMessage[];
  maxMessages: number;
  participants: Set<string>;
  createdAt: Date;
  lastActivity: Date;
}

export interface GameFilters {
  gameType?: GameType;
  hasPassword: boolean;
  hasSpace: boolean;
  hideRunning: boolean;
  hideEnded: boolean;
  maxPlayers?: number;
  minPlayers?: number;
}

// ====================
// APPLICATION STATE
// ====================

export interface AppState {
  currentScreen: ScreenType;
  currentPlayer: Player | null;
  currentGame: Game | null;
  lobbyState: LobbyState;
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
}

export interface LobbyState {
  games: Map<string, Game>;
  activeGameCount: number;
  maxGames: number;
  onlinePlayers: Map<string, Player>;
  totalPlayerCount: number;
  playersInGames: Map<string, string>;
  globalChat: ChatHistory;
  gameFilters: GameFilters;
  searchQuery: string;
  sortOrder: SortOrder;
  stats: LobbyStats;
}

export interface LobbyStats {
  totalGamesCreated: number;
  totalGamesCompleted: number;
  averageGameDuration: number;
  peakPlayerCount: number;
  activeGamesByType: Map<GameType, number>;
}

export interface GameState {
  game: Game;
  localPlayerId: string;
  moveHistory: Move[];
  stateHistory: StateSnapshot[];
  pendingMoves: Move[];
  validMoves: Position[];
  lastUpdate: Date;
  isMyTurn: boolean;
  canMove: boolean;
}

// ====================
// SCOREBOARD SYSTEM
// ====================

export interface PlayerScore {
  playerId: string;
  displayText: string;
  rawScore: number[];
  color: string;
}

export interface ScoreCalculator {
  calculateScore(game: Game, player: Player): PlayerScore;
  getScoreFormat(): string;
}

// Game-specific score data interfaces
export interface ConquerScoreData {
  tilesOwned: number;
  percentageOwned: number;
}

export interface ChessScoreData {
  piecesRemaining: number;
}

export interface BomberScoreData {
  kills: number;
  livesRemaining: number;
}

export interface SnakeScoreData {
  kills: number;
  length: number;
}

export interface StateSnapshot {
  id: string;
  turnNumber: number;
  timestamp: Date;
  grid: Grid;
  players: Player[];
  gamePhase: GamePhase;
}

// ====================
// CONSTANTS
// ====================

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  // Grid Configuration
  gridSize: { width: 15, height: 15 },
  
  // Player Configuration
  minPlayers: 2,
  maxPlayers: 4,
  
  // Timing Configuration
  turnTimeLimit: 30,
  gameTimeLimit: undefined,
  gameSpeed: 1.0,
  
  // Game Features
  allowSpectators: true,
  allowChat: true,
  allowAI: true,
  
  // Game Mode
  isRanked: false,
  isPrivate: false,
  teamMode: false
} as const;

export const DEFAULT_CONQUER_OPTIONS: ConquerOptions = {
  ...DEFAULT_GAME_OPTIONS,
  rocksPercentage: 10,
  turnBlocks: 1,
  teamMode: false,
  sharedRegions: true,
  teamChat: true,
  maxNeutralEdges: 6  // Default: allow up to 6 grid edges as boundaries
} as const;

// Player colors are now dynamically generated by ColorManager

export const GRID_SIZES: readonly { width: number; height: number; label: string }[] = [
  { width: 10, height: 10, label: 'Small (10x10)' },
  { width: 15, height: 15, label: 'Medium (15x15)' },
  { width: 20, height: 20, label: 'Large (20x20)' },
  { width: 25, height: 25, label: 'Extra Large (25x25)' }
] as const;

export const MAX_PLAYERS_BY_GAME_TYPE: Readonly<Record<GameType, number>> = {
  [GameType.CONQUER]: 8,
  [GameType.CHESS]: 2,
  [GameType.SNAKE]: 8
} as const;

export const DEFAULT_TURN_TIME_LIMITS: readonly number[] = [15, 30, 60, 120, 300] as const;

// ====================
// UTILITY TYPES
// ====================

export type GameCreationOptions = Omit<Game, 'id' | 'players' | 'spectators' | 'grid' | 'currentTurn' | 'gamePhase' | 'winCondition' | 'createdAt' | 'startedAt' | 'endedAt'>;

export type PlayerUpdate = Partial<Pick<Player, 'name' | 'color' | 'status' | 'score' | 'isReady'>>;

export type GameUpdate = Partial<Pick<Game, 'name' | 'status' | 'gamePhase' | 'winCondition'>>;

export type StateUpdate = {
  type: 'GAME_UPDATE' | 'PLAYER_UPDATE' | 'MOVE_APPLIED' | 'TURN_ENDED' | 'GAME_ENDED';
  timestamp: Date;
  data: unknown;
};

export type EventHandler<T = unknown> = (data: T) => void;

export type GameEventType = 'move' | 'turn_end' | 'game_end' | 'player_join' | 'player_leave' | 'chat_message';

export type LobbyEventType = 'game_created' | 'game_updated' | 'game_removed' | 'player_joined' | 'player_left' | 'chat_message';

// ====================
// HELPER FUNCTIONS
// ====================

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function createEmptyGrid(width: number, height: number): Grid {
  const cells: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row[x] = {
        position: { x, y },
        type: CellType.EMPTY,
        lastModified: new Date()
      };
    }
    cells[y] = row;
  }
  return { width, height, cells };
}

export function createPlayer(name: string, isLocal: boolean = true, isAI: boolean = false): Player {
  return {
    id: generateId(),
    name,
    type: isAI ? 'ai' : 'human',
    color: {} as PlayerColor,
    status: PlayerStatus.ONLINE,
    score: 0,
    isReady: false,
    isGameMaster: false,
    isMuted: false,
    joinedAt: new Date(),
    isLocal,
    isAI
  };
}

export function isValidPosition(pos: Position, grid: Grid): boolean {
  return pos.x >= 0 && pos.x < grid.width && pos.y >= 0 && pos.y < grid.height;
}

export function positionToString(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function stringToPosition(str: string): Position {
  const parts = str.split(',');
  const x = parseInt(parts[0] || '0', 10);
  const y = parseInt(parts[1] || '0', 10);
  return { x, y };
}