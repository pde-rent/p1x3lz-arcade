import { useState, useCallback, useEffect } from 'react';
import type { AppState, LobbyState, Player, Game } from '../types/core-types';
import { ScreenType, SortOrder } from '../types/core-types';

// Initial state for the MVP - all local, no server/WebRTC/blockchain
const createInitialLobbyState = (): LobbyState => ({
  games: new Map(),
  activeGameCount: 0,
  maxGames: 10,
  onlinePlayers: new Map(),
  totalPlayerCount: 0,
  playersInGames: new Map(),
  globalChat: {
    messages: [],
    maxMessages: 100,
    participants: new Set(),
    createdAt: new Date(),
    lastActivity: new Date()
  },
  gameFilters: {
    hasPassword: false,
    hasSpace: true,
    hideRunning: false,
    hideEnded: true
  },
  searchQuery: '',
  sortOrder: SortOrder.NEWEST,
  stats: {
    totalGamesCreated: 0,
    totalGamesCompleted: 0,
    averageGameDuration: 0,
    peakPlayerCount: 0,
    activeGamesByType: new Map()
  }
});

const createInitialAppState = (): AppState => ({
  currentScreen: ScreenType.LOGIN,
  currentPlayer: null,
  currentGame: null,
  lobbyState: createInitialLobbyState(),
  gameState: null,
  isLoading: false,
  error: null
});

// Local storage key for MVP persistence
const STORAGE_KEY = 'p1x3lz_app_state';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    // Load from localStorage on initialization
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reconstruct Maps from stored data
        const lobbyState = parsed.lobbyState;
        if (lobbyState) {
          lobbyState.games = new Map(lobbyState.games);
          lobbyState.onlinePlayers = new Map(lobbyState.onlinePlayers);
          lobbyState.playersInGames = new Map(lobbyState.playersInGames);
          lobbyState.stats.activeGamesByType = new Map(lobbyState.stats.activeGamesByType);
          lobbyState.globalChat.participants = new Set(lobbyState.globalChat.participants);
        }
        return { ...createInitialAppState(), ...parsed, lobbyState };
      }
    } catch (error) {
      console.warn('Failed to load app state from localStorage:', error);
    }
    return createInitialAppState();
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      // Convert Maps and Sets to arrays for JSON serialization
      const stateToSave = {
        ...appState,
        lobbyState: {
          ...appState.lobbyState,
          games: Array.from(appState.lobbyState.games.entries()),
          onlinePlayers: Array.from(appState.lobbyState.onlinePlayers.entries()),
          playersInGames: Array.from(appState.lobbyState.playersInGames.entries()),
          stats: {
            ...appState.lobbyState.stats,
            activeGamesByType: Array.from(appState.lobbyState.stats.activeGamesByType.entries())
          },
          globalChat: {
            ...appState.lobbyState.globalChat,
            participants: Array.from(appState.lobbyState.globalChat.participants)
          }
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save app state to localStorage:', error);
    }
  }, [appState]);

  const updateAppState = useCallback((updates: Partial<AppState>) => {
    setAppState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const updateLobbyState = useCallback((updates: Partial<LobbyState>) => {
    setAppState(prevState => ({
      ...prevState,
      lobbyState: { ...prevState.lobbyState, ...updates }
    }));
  }, []);

  const setCurrentPlayer = useCallback((player: Player | null) => {
    setAppState(prevState => ({ ...prevState, currentPlayer: player }));
  }, []);

  const setCurrentGame = useCallback((game: Game | null) => {
    setAppState(prevState => ({ ...prevState, currentGame: game }));
  }, []);

  const navigateToScreen = useCallback((screen: ScreenType) => {
    setAppState(prevState => ({ ...prevState, currentScreen: screen }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setAppState(prevState => ({ ...prevState, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setAppState(prevState => ({ ...prevState, error }));
  }, []);

  const clearError = useCallback(() => {
    setAppState(prevState => ({ ...prevState, error: null }));
  }, []);

  // Helper function to add a game to the lobby
  const addGame = useCallback((game: Game) => {
    setAppState(prevState => {
      const newGames = new Map(prevState.lobbyState.games);
      newGames.set(game.id, game);
      
      return {
        ...prevState,
        lobbyState: {
          ...prevState.lobbyState,
          games: newGames,
          activeGameCount: newGames.size,
          stats: {
            ...prevState.lobbyState.stats,
            totalGamesCreated: prevState.lobbyState.stats.totalGamesCreated + 1
          }
        }
      };
    });
  }, []);

  // Helper function to remove a game from the lobby
  const removeGame = useCallback((gameId: string) => {
    setAppState(prevState => {
      const newGames = new Map(prevState.lobbyState.games);
      newGames.delete(gameId);
      
      return {
        ...prevState,
        lobbyState: {
          ...prevState.lobbyState,
          games: newGames,
          activeGameCount: newGames.size
        }
      };
    });
  }, []);

  // Helper function to update a game in the lobby
  const updateGame = useCallback((updatedGame: Game) => {
    setAppState(prevState => {
      const newGames = new Map(prevState.lobbyState.games);
      newGames.set(updatedGame.id, updatedGame);
      
      return {
        ...prevState,
        lobbyState: {
          ...prevState.lobbyState,
          games: newGames
        }
      };
    });
  }, []);

  return {
    appState,
    updateAppState,
    updateLobbyState,
    setCurrentPlayer,
    setCurrentGame,
    navigateToScreen,
    setLoading,
    setError,
    clearError,
    addGame,
    removeGame,
    updateGame
  };
}; 