import {
  GameType,
  GameStatus,
  GamePhase,
  generateId,
  createEmptyGrid,
  DEFAULT_CONQUER_OPTIONS
} from '../types/core-types';
import { colorManager } from './ColorManager';

import type {
  AppState,
  Game,
  Player,
  ChatMessage,
  LobbyState,
  GameOptions
} from '../types/core-types';

// Actions exposed by useAppState that mutate global state
export interface GameManagerActions {
  addGame: (game: Game) => void;
  setCurrentGame: (game: Game | null) => void;
  updateGame: (game: Game) => void;
  removeGame: (gameId: string) => void;
  updateLobbyState: (updates: Partial<LobbyState>) => void;
}

/**
 * GameManager centralises all lobby/game related state mutations so that React
 * UI components can stay focused on presentation. All operations are pure and
 * synchronous – network/server sync will be introduced later.
 */
export class GameManager {
  constructor(private readonly appState: AppState, private readonly actions: GameManagerActions) {}

  /* -------------------------------------------------------------------------- */
  /*                               Lobby Helpers                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Create a brand-new local Conquer game and set it as the current game. The
   * caller is responsible for navigating after creation.
   */
  createGame(): Game | null {
    const currentPlayer = this.appState.currentPlayer;
    if (!currentPlayer) {
      // In MVP we simply return null, a real implementation would throw.
      console.warn('GameManager.createGame – no current player');
      return null;
    }

    const gameId = generateId();

    // Assign a color to the player creating the game
    currentPlayer.color = colorManager.assignPlayerColor(currentPlayer.id, gameId);

    const newGame: Game = {
      id: gameId,
      name: `${currentPlayer.name}'s Game`,
      type: GameType.CONQUER,
      status: GameStatus.PENDING,
      players: [currentPlayer],
      spectators: [],
      options: DEFAULT_CONQUER_OPTIONS,
      grid: createEmptyGrid(
        DEFAULT_CONQUER_OPTIONS.gridSize.width,
        DEFAULT_CONQUER_OPTIONS.gridSize.height
      ),
      currentTurn: null,
      gamePhase: GamePhase.LOBBY,
      winCondition: null,
      createdAt: new Date(),
      createdBy: currentPlayer.id
    };

    this.actions.addGame(newGame);
    this.actions.setCurrentGame(newGame);
    return newGame;
  }

  /** Add the user to an existing game and make it current */
  joinGame(game: Game): void {
    this.actions.setCurrentGame(game);
  }

  /** Leave a game. Host migration & game deletion handled automatically. */
  leaveGame(game: Game): void {
    const { currentPlayer } = this.appState;
    if (!currentPlayer) return;

    const isHost = game.createdBy === currentPlayer.id;

    if (isHost) {
      const otherPlayers = game.players.filter(p => p.id !== currentPlayer.id);
      if (otherPlayers.length > 0) {
        // Transfer host role
        const updatedGame: Game = {
          ...game,
          players: otherPlayers,
          createdBy: otherPlayers[0]!.id
        };
        this.actions.updateGame(updatedGame);
        this.actions.setCurrentGame(updatedGame);
      } else {
        this.actions.removeGame(game.id);
        this.actions.setCurrentGame(null);
      }
    } else {
      const updatedGame: Game = {
        ...game,
        players: game.players.filter(p => p.id !== currentPlayer.id)
      };
      this.actions.updateGame(updatedGame);
      this.actions.setCurrentGame(updatedGame);
    }
  }

  /** Update a game name (host only) */
  updateGameName(game: Game, newName: string): void {
    if (!newName.trim()) return;
    const updatedGame: Game = { ...game, name: newName.trim() };
    this.actions.updateGame(updatedGame);
    this.actions.setCurrentGame(updatedGame);
  }

  /**
   * Add an additional **local** player slot to the current game. Players are
   * created in ready state for a smooth local-multiplayer flow.
   */
  async addLocalPlayer(game: Game): Promise<Game | null> {
    const { currentPlayer } = this.appState;
    if (!currentPlayer) return null;
    const isHost = game.createdBy === currentPlayer.id;
    if (!isHost) return null;

    if (game.players.length >= game.options.maxPlayers) return null;

    const nextNumber = game.players.length + 1;
    const newPlayerName = `Local Player ${nextNumber}`;

    // Re-using createPlayer helper keeps consistency (color, id, etc.)
    // We import lazily to avoid a circular dependency cost at module load.
    const { createPlayer } = await import('../types/core-types');

    const newPlayer = createPlayer(newPlayerName, true, false);
    newPlayer.isReady = true;

    // Assign a color to the new local player
    newPlayer.color = colorManager.assignPlayerColor(newPlayer.id, game.id);

    const updatedGame: Game = {
      ...game,
      players: [...game.players, newPlayer]
    };

    this.actions.updateGame(updatedGame);
    this.actions.setCurrentGame(updatedGame);
    return updatedGame;
  }

  /** Transition the lobby game to running state (host only, ≥2 players) */
  startGame(game: Game): Game | null {
    const { currentPlayer } = this.appState;
    if (!currentPlayer) return null;
    const isHost = game.createdBy === currentPlayer.id;
    if (!isHost || game.players.length < 2) return null;

    // Preserve the existing grid with its pre-generated rocks
    const newGrid = game.grid;

    const firstTurn = {
      turnNumber: 1,
      playerId: game.players[0]?.id || '',
      moves: [],
      timeLimit: game.options.turnTimeLimit,
      timeRemaining: game.options.turnTimeLimit,
      startTime: new Date()
    };

    const updatedGame: Game = {
      ...game,
      status: GameStatus.RUNNING,
      gamePhase: GamePhase.PLAYING,
      grid: newGrid,
      currentTurn: firstTurn,
      startedAt: new Date()
    };

    this.actions.updateGame(updatedGame);
    this.actions.setCurrentGame(updatedGame);
    return updatedGame;
  }

  /** Push a chat message to global lobby chat */
  sendChatMessage(content: string): void {
    const { currentPlayer, lobbyState } = this.appState;
    if (!currentPlayer || !content.trim()) return;

    const message: ChatMessage = {
      id: generateId(),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      content: content.trim(),
      timestamp: new Date(),
      isSystemMessage: false
    };

    const updatedChat = {
      ...lobbyState.globalChat,
      messages: [...lobbyState.globalChat.messages, message],
      lastActivity: new Date()
    };

    this.actions.updateLobbyState({ globalChat: updatedChat });
  }

  /** Push a system message to global lobby chat */
  sendSystemMessage(content: string): void {
    const { lobbyState } = this.appState;
    if (!content.trim()) return;

    const message: ChatMessage = {
      id: generateId(),
      playerId: 'system',
      playerName: 'System',
      content: content.trim(),
      timestamp: new Date(),
      isSystemMessage: true
    };

    const updatedChat = {
      ...lobbyState.globalChat,
      messages: [...lobbyState.globalChat.messages, message],
      lastActivity: new Date()
    };

    this.actions.updateLobbyState({ globalChat: updatedChat });
  }

  /** Update game options (host only) */
  updateGameOptions(game: Game, newOptions: Partial<GameOptions>): Game | null {
    const { currentPlayer } = this.appState;
    if (!currentPlayer) return null;
    const isHost = game.createdBy === currentPlayer.id;
    if (!isHost) return null;

    // Merge new options with existing ones
    const updatedOptions = { ...game.options, ...newOptions };
    
    // Validate options
    if (updatedOptions.gridSize.width < 4 || updatedOptions.gridSize.width > 64) return null;
    if (updatedOptions.gridSize.height < 4 || updatedOptions.gridSize.height > 64) return null;
    if (updatedOptions.minPlayers < 2 || updatedOptions.minPlayers > updatedOptions.maxPlayers) return null;
    if (updatedOptions.maxPlayers < updatedOptions.minPlayers || updatedOptions.maxPlayers > 8) return null;
    if (updatedOptions.turnTimeLimit < 10 || updatedOptions.turnTimeLimit > 300) return null;
    if (updatedOptions.gameSpeed < 0.5 || updatedOptions.gameSpeed > 2.0) return null;
    if (updatedOptions.gameTimeLimit !== undefined && updatedOptions.gameTimeLimit < 5) return null;

    // Create new grid if size changed
    const needsNewGrid = 
      updatedOptions.gridSize.width !== game.options.gridSize.width ||
      updatedOptions.gridSize.height !== game.options.gridSize.height;

    const updatedGame: Game = {
      ...game,
      options: updatedOptions,
      grid: needsNewGrid ? createEmptyGrid(updatedOptions.gridSize.width, updatedOptions.gridSize.height) : game.grid
    };

    this.actions.updateGame(updatedGame);
    this.actions.setCurrentGame(updatedGame);
    return updatedGame;
  }
} 