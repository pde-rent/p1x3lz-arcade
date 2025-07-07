# Lobby State Management

## Overview

The lobby state management system handles all platform-wide state tracking, including games, players, chats, and navigation flow. For the MVP, all state is stored locally in the browser. The production version will use WebRTC for real-time synchronization and server-side persistence.

## State Architecture

### Global Application State
```typescript
// See AppState, LobbyState, ScreenType, and related types in core-types.md
```

### Lobby State Structure
```typescript
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
  
  // Filters and Search
  gameFilters: GameFilters;
  searchQuery: string;
  sortOrder: SortOrder;
  
  // Statistics
  stats: LobbyStats;
}

interface LobbyStats {
  totalGamesCreated: number;
  totalGamesCompleted: number;
  averageGameDuration: number;
  peakPlayerCount: number;
  activeGamesByType: Map<GameType, number>;
}
```

## Game State Tracking

### Game Lifecycle Management
```typescript
class GameStateManager {
  private games = new Map<string, Game>();
  private gameEvents = new EventEmitter();
  
  createGame(options: GameCreationOptions): Game {
    const game: Game = {
      id: generateId(),
      name: options.name,
      type: options.type,
      state: GameState.PENDING,
      players: [options.creator],
      options: options.gameOptions,
      grid: this.initializeGrid(options),
      currentTurn: 0,
      createdAt: new Date(),
      chat: new ChatHistory()
    };
    
    this.games.set(game.id, game);
    this.emitGameEvent('GAME_CREATED', game);
    
    return game;
  }
  
  updateGameState(gameId: string, newState: GameState): void {
    const game = this.games.get(gameId);
    if (!game) return;
    
    const oldState = game.state;
    game.state = newState;
    
    this.emitGameEvent('GAME_STATE_CHANGED', game, { oldState, newState });
    
    // Handle state-specific logic
    switch (newState) {
      case GameState.STARTING:
        this.handleGameStarting(game);
        break;
      case GameState.RUNNING:
        this.handleGameRunning(game);
        break;
      case GameState.ENDED:
        this.handleGameEnded(game);
        break;
    }
  }
  
  removeGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;
    
    // Only remove if no players remain
    if (game.players.length === 0) {
      this.games.delete(gameId);
      this.emitGameEvent('GAME_REMOVED', game);
    }
  }
}
```

### Game State Transitions
```typescript
enum GameStateTransition {
  CREATE = 'pending',           // New game created
  JOIN = 'pending',             // Player joins
  START = 'starting',           // All players ready
  LAUNCH = 'running',           // Game begins
  END = 'ended',                // Game completes
  RESTART = 'pending',          // Play again
  ABANDON = 'removed'           // All players leave
}

class GameTransitionValidator {
  static isValidTransition(from: GameState, to: GameState): boolean {
    const validTransitions = {
      [GameState.PENDING]: [GameState.STARTING, GameState.ENDED],
      [GameState.STARTING]: [GameState.RUNNING, GameState.PENDING],
      [GameState.RUNNING]: [GameState.ENDED],
      [GameState.ENDED]: [GameState.PENDING] // Restart
    };
    
    return validTransitions[from]?.includes(to) || false;
  }
}
```

## Player State Management

### Player Tracking System
```typescript
interface PlayerState {
  player: Player;
  status: PlayerStatus;
  currentGameId?: string;
  lastActivity: Date;
  sessionStarted: Date;
}

enum PlayerStatus {
  ONLINE = 'online',
  IN_LOBBY = 'in_lobby',
  IN_GAME = 'in_game',
  IDLE = 'idle',
  DISCONNECTED = 'disconnected'
}

class PlayerStateManager {
  private players = new Map<string, PlayerState>();
  private activityTimeout = 5 * 60 * 1000; // 5 minutes
  
  addPlayer(player: Player): void {
    const playerState: PlayerState = {
      player,
      status: PlayerStatus.IN_LOBBY,
      lastActivity: new Date(),
      sessionStarted: new Date()
    };
    
    this.players.set(player.id, playerState);
    this.emitPlayerEvent('PLAYER_JOINED', player);
  }
  
  updatePlayerActivity(playerId: string): void {
    const playerState = this.players.get(playerId);
    if (playerState) {
      playerState.lastActivity = new Date();
      
      // Update status from idle if applicable
      if (playerState.status === PlayerStatus.IDLE) {
        playerState.status = PlayerStatus.IN_LOBBY;
        this.emitPlayerEvent('PLAYER_ACTIVE', playerState.player);
      }
    }
  }
  
  movePlayerToGame(playerId: string, gameId: string): void {
    const playerState = this.players.get(playerId);
    if (playerState) {
      playerState.currentGameId = gameId;
      playerState.status = PlayerStatus.IN_GAME;
      this.emitPlayerEvent('PLAYER_JOINED_GAME', playerState.player);
    }
  }
  
  // Periodic cleanup of idle players
  checkIdlePlayers(): void {
    const now = new Date();
    
    for (const [playerId, playerState] of this.players) {
      const timeSinceActivity = now.getTime() - playerState.lastActivity.getTime();
      
      if (timeSinceActivity > this.activityTimeout) {
        if (playerState.status !== PlayerStatus.IDLE) {
          playerState.status = PlayerStatus.IDLE;
          this.emitPlayerEvent('PLAYER_IDLE', playerState.player);
        }
      }
    }
  }
}
```

## Chat State Management

### Platform-Wide Chat System
```typescript
interface ChatState {
  globalChat: ChatHistory;
  gameChats: Map<string, ChatHistory>; // gameId -> chat
  privateChats: Map<string, ChatHistory>; // conversation -> chat
  settings: ChatSettings;
  unreadCounts: Map<string, number>;
}

interface ChatHistory {
  messages: ChatMessage[];
  maxMessages: number;
  participants: Set<string>;
  createdAt: Date;
  lastActivity: Date;
}

interface ChatSettings {
  globalChatEnabled: boolean;
  profanityFilter: boolean;
  maxMessageLength: number;
  rateLimitMessages: number;
  rateLimitWindow: number; // milliseconds
}

class ChatStateManager {
  private chatState: ChatState;
  private messageQueue: ChatMessage[] = [];
  
  constructor() {
    this.chatState = {
      globalChat: this.createChatHistory(),
      gameChats: new Map(),
      privateChats: new Map(),
      settings: this.getDefaultChatSettings(),
      unreadCounts: new Map()
    };
  }
  
  addMessage(message: ChatMessage, chatId: string = 'global'): void {
    let chatHistory: ChatHistory;
    
    if (chatId === 'global') {
      chatHistory = this.chatState.globalChat;
    } else {
      chatHistory = this.chatState.gameChats.get(chatId) || this.createGameChat(chatId);
    }
    
    // Add message
    chatHistory.messages.push(message);
    chatHistory.lastActivity = new Date();
    
    // Trim if over limit
    if (chatHistory.messages.length > chatHistory.maxMessages) {
      chatHistory.messages.shift();
    }
    
    // Update unread counts
    this.updateUnreadCounts(chatId, message);
    
    // Emit event
    this.emitChatEvent('MESSAGE_ADDED', { chatId, message });
  }
  
  createGameChat(gameId: string): ChatHistory {
    const chatHistory = this.createChatHistory();
    this.chatState.gameChats.set(gameId, chatHistory);
    return chatHistory;
  }
  
  markChatAsRead(chatId: string, playerId: string): void {
    this.chatState.unreadCounts.delete(`${chatId}:${playerId}`);
    this.emitChatEvent('CHAT_READ', { chatId, playerId });
  }
}
```

## Local Storage Implementation (MVP)

### Browser Storage Strategy
```typescript
class LocalStorageManager {
  private readonly STORAGE_KEYS = {
    APP_STATE: 'p1x3lz_app_state',
    PLAYER_PROFILE: 'p1x3lz_player',
    GAME_HISTORY: 'p1x3lz_game_history',
    CHAT_HISTORY: 'p1x3lz_chat_history',
    SETTINGS: 'p1x3lz_settings'
  };
  
  saveAppState(state: AppState): void {
    try {
      // Clean state for storage (remove functions, etc.)
      const cleanState = this.sanitizeForStorage(state);
      localStorage.setItem(
        this.STORAGE_KEYS.APP_STATE,
        JSON.stringify(cleanState)
      );
    } catch (error) {
      console.warn('Failed to save app state:', error);
      this.clearOldData();
    }
  }
  
  loadAppState(): Partial<AppState> | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.APP_STATE);
      if (!stored) return null;
      
      const state = JSON.parse(stored);
      return this.hydrateDates(state);
    } catch (error) {
      console.warn('Failed to load app state:', error);
      return null;
    }
  }
  
  // Automatic save on state changes
  setupAutoSave(stateManager: StateManager): void {
    stateManager.onStateChange((state) => {
      this.debounce(() => this.saveAppState(state), 1000);
    });
  }
  
  // Clean up old data when storage is full
  private clearOldData(): void {
    const keys = Object.values(this.STORAGE_KEYS);
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // Storage might be full, try to clear
      }
    });
  }
}
```

### State Persistence Strategy
```typescript
interface StorageConfig {
  maxChatMessages: number;
  maxGameHistory: number;
  autoSaveInterval: number;
  compressionEnabled: boolean;
}

class StatePersistence {
  private config: StorageConfig = {
    maxChatMessages: 100,
    maxGameHistory: 50,
    autoSaveInterval: 5000, // 5 seconds
    compressionEnabled: true
  };
  
  persistLobbyState(lobbyState: LobbyState): void {
    const persistentData = {
      // Only persist essential data
      gameFilters: lobbyState.gameFilters,
      chatSettings: lobbyState.chatSettings.globalChatEnabled,
      stats: {
        totalGamesCreated: lobbyState.stats.totalGamesCreated,
        totalGamesCompleted: lobbyState.stats.totalGamesCompleted
      }
    };
    
    this.storage.save('lobby_state', persistentData);
  }
  
  restoreLobbyState(): Partial<LobbyState> {
    const data = this.storage.load('lobby_state');
    if (!data) return {};
    
    // Reconstruct state with defaults
    return {
      games: new Map(),
      onlinePlayers: new Map(),
      gameFilters: data.gameFilters || this.getDefaultFilters(),
      // ... restore other properties
    };
  }
}
```

## Future WebRTC Integration

### WebRTC State Synchronization (Production)
```typescript
interface WebRTCConfig {
  stunServers: string[];
  turnServers: TurnServer[];
  maxPeers: number;
  heartbeatInterval: number;
}

class WebRTCLobbySync {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private dataChannels = new Map<string, RTCDataChannel>();
  private isHost: boolean = false;
  
  async initializePeerConnection(peerId: string): Promise<void> {
    const pc = new RTCPeerConnection(this.rtcConfig);
    
    // Setup data channel for state sync
    const channel = pc.createDataChannel('lobbyState', {
      ordered: true,
      protocol: 'p1x3lz-lobby-v1'
    });
    
    channel.onopen = () => this.handleChannelOpen(peerId);
    channel.onmessage = (event) => this.handleStateMessage(peerId, event);
    
    this.peerConnections.set(peerId, pc);
    this.dataChannels.set(peerId, channel);
  }
  
  broadcastStateUpdate(update: StateUpdate): void {
    const message = {
      type: 'STATE_UPDATE',
      timestamp: Date.now(),
      data: update
    };
    
    for (const [peerId, channel] of this.dataChannels) {
      if (channel.readyState === 'open') {
        channel.send(JSON.stringify(message));
      }
    }
  }
  
  private handleStateMessage(peerId: string, event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'STATE_UPDATE':
          this.applyStateUpdate(message.data);
          break;
        case 'GAME_EVENT':
          this.handleGameEvent(message.data);
          break;
        case 'CHAT_MESSAGE':
          this.handleChatMessage(message.data);
          break;
      }
    } catch (error) {
      console.error('Failed to handle state message:', error);
    }
  }
}
```

### Conflict Resolution
```typescript
class StateConflictResolver {
  resolveGameStateConflict(localState: Game, remoteState: Game): Game {
    // Use timestamp-based resolution with specific rules
    
    // Player changes: use most recent
    if (remoteState.players.length !== localState.players.length) {
      return this.mergePlayerChanges(localState, remoteState);
    }
    
    // Game state: use most advanced state
    if (this.isMoreAdvanced(remoteState.state, localState.state)) {
      return remoteState;
    }
    
    return localState;
  }
  
  private isMoreAdvanced(state1: GameState, state2: GameState): boolean {
    const stateOrder = [
      GameState.PENDING,
      GameState.STARTING,
      GameState.RUNNING,
      GameState.ENDED
    ];
    
    return stateOrder.indexOf(state1) > stateOrder.indexOf(state2);
  }
}
```

## Event System

### Lobby Event Management
```typescript
enum LobbyEventType {
  // Game Events
  GAME_CREATED = 'game_created',
  GAME_UPDATED = 'game_updated',
  GAME_REMOVED = 'game_removed',
  
  // Player Events
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  PLAYER_STATUS_CHANGED = 'player_status_changed',
  
  // Chat Events
  CHAT_MESSAGE = 'chat_message',
  CHAT_HISTORY_UPDATED = 'chat_history_updated',
  
  // System Events
  CONNECTION_STATUS_CHANGED = 'connection_status_changed',
  ERROR_OCCURRED = 'error_occurred'
}

class LobbyEventManager extends EventEmitter {
  emit(event: LobbyEventType, data: any): void {
    super.emit(event, data);
    
    // Log important events
    if (this.isImportantEvent(event)) {
      console.log(`[Lobby Event] ${event}:`, data);
    }
    
    // Handle side effects
    this.handleEventSideEffects(event, data);
  }
  
  private handleEventSideEffects(event: LobbyEventType, data: any): void {
    switch (event) {
      case LobbyEventType.GAME_CREATED:
        this.updateLobbyStats();
        this.notifyPlayers('New game created: ' + data.name);
        break;
      
      case LobbyEventType.PLAYER_JOINED:
        this.updatePlayerCount();
        this.broadcastPlayerList();
        break;
    }
  }
}
```

This lobby state management system provides a solid foundation for the MVP's local storage approach while being architected for easy migration to WebRTC-based real-time synchronization in the production version.
