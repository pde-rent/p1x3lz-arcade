import { useState, useCallback, useEffect, useRef } from 'react';
import type { Game, Position, Player, Move, ValidationResult, ConquerGame, Region } from '../types/core-types';
import { CellType, GameStatus, GameType, generateId, VictoryType } from '../types/core-types';


export interface GameLogicState {
  game: Game;
  validMoves: Position[];
  currentPlayer: Player | null;
  isMyTurn: boolean;
  canMove: boolean;
  regions?: Region[]; // For Conquer games
}

export interface GameLogicActions {
  makeMove: (position: Position) => ValidationResult;
  getValidMoves: () => Position[];
  validateMove: (position: Position) => ValidationResult;
  updateGame: (gameData: Partial<Game>) => void;
  processTurn: (moves: Position[]) => boolean;
  passTurn: () => void;
}

/**
 * Enhanced game logic hook with Conquer-specific functionality
 * Handles turn-based mechanics, region detection, and victory conditions
 */
export const useGameLogic = (
  initialGame: Game,
  localPlayerId: string
): [GameLogicState, GameLogicActions] => {
  const [game, setGame] = useState<Game>(initialGame);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);

  // Audio objects for victory/defeat sounds
  const victoryAudio = useRef<HTMLAudioElement>(new Audio('/sounds/victory.mp3'));
  const defeatAudio = useRef<HTMLAudioElement>(new Audio('/sounds/game-over-voice.mp3'));

  // Update internal game state when initialGame changes (by ID or restart)
  useEffect(() => {
    if (initialGame.id !== game.id || initialGame.startedAt !== game.startedAt) {
      setGame(initialGame);
    }
  }, [initialGame.id, game.id, initialGame.startedAt, game.startedAt, initialGame]);

  // Derived state
  const localPlayers = game.players.filter(p => p.isLocal);
  const currentPlayer = game.currentTurn ? 
    game.players.find(p => p.id === game.currentTurn!.playerId) || null : null;
  const isMyTurn = !!currentPlayer && localPlayers.some(p => p.id === currentPlayer.id);
  const canMove = isMyTurn && validMoves.length > 0 && game.status === GameStatus.RUNNING;

  /**
   * Calculate valid moves for a player (game-specific logic)
   */
  const calculateValidMoves = useCallback((gameData: Game, _player: Player): Position[] => {
    const moves: Position[] = [];
    
    // Basic implementation - empty cells are valid
    for (let y = 0; y < gameData.grid.height; y++) {
      for (let x = 0; x < gameData.grid.width; x++) {
        const cell = gameData.grid.cells[y]?.[x];
        if (cell && cell.type === CellType.EMPTY) {
          moves.push({ x, y });
        }
      }
    }
    
    return moves;
  }, []);

  // Update valid moves when game state changes
  useEffect(() => {
    if (currentPlayer && game.status === GameStatus.RUNNING) {
      const moves = calculateValidMoves(game, currentPlayer);
      setValidMoves(moves);
    } else {
      setValidMoves([]);
    }
  }, [game, currentPlayer, calculateValidMoves]);

  // Update regions for Conquer games
  useEffect(() => {
    if (game.type === GameType.CONQUER) {
      const conquerGame = game as ConquerGame;
      if (conquerGame.regions) {
        setRegions(conquerGame.regions);
      }
    }
  }, [game]);

  /**
   * Validate if a move is legal
   */
  const validateMove = useCallback((position: Position): ValidationResult => {
    // Check if position is valid
    if (position.x < 0 || position.x >= game.grid.width || 
        position.y < 0 || position.y >= game.grid.height) {
      return { valid: false, error: 'Position out of bounds' };
    }

    // Check if it's the player's turn
    if (!isMyTurn) {
      return { valid: false, error: 'Not your turn' };
    }

    // Check if cell is empty
    const cell = game.grid.cells[position.y]?.[position.x];
    if (!cell || cell.type !== CellType.EMPTY) {
      return { valid: false, error: 'Cell is not empty' };
    }

    // Check if it's in valid moves
    const isValidMove = validMoves.some(pos => pos.x === position.x && pos.y === position.y);
    if (!isValidMove) {
      return { valid: false, error: 'Invalid move' };
    }

    return { valid: true };
  }, [game, isMyTurn, validMoves]);

  /**
   * Make a move for the current player
   */
  const makeMove = useCallback((position: Position): ValidationResult => {
    const validation = validateMove(position);
    if (!validation.valid) {
      console.warn('Invalid move:', validation.error);
      return validation;
    }

    if (!currentPlayer) {
      return { valid: false, error: 'No current player' };
    }

    // Create the move
    const move: Move = {
      id: generateId(),
      playerId: currentPlayer.id,
      position,
      timestamp: new Date(),
      type: 'cell_claim'
    };

    // Apply the move to game state
    const newGame = { ...game };
    const cell = newGame.grid.cells[position.y]?.[position.x];
    if (cell) {
      cell.type = CellType.OCCUPIED;
      cell.owner = currentPlayer;
      cell.lastModified = new Date();
    }

    // Add to move history
    if (newGame.currentTurn) {
      newGame.currentTurn.moves.push(move);
    }

    // For Conquer games, handle region capture
    if (game.type === GameType.CONQUER) {
      // Region capture is handled by the ConquerScene
      // The scene will detect and capture regions, then emit events
      // This integration happens through the game event system
    }

    // Check for victory conditions
    const victoryResult = checkVictoryConditions(newGame);
    if (victoryResult.hasWinner) {
      newGame.winCondition = victoryResult;
      newGame.status = GameStatus.ENDED;
      newGame.endedAt = new Date();
      
      // Play victory or defeat sound
      const isLocalPlayerWinner = victoryResult.winners.some(winner => 
        localPlayers.some(local => local.id === winner.id)
      );
      if (isLocalPlayerWinner) {
        victoryAudio.current.currentTime = 0;
        victoryAudio.current.play().catch(console.error);
      } else {
        defeatAudio.current.currentTime = 0;
        defeatAudio.current.play().catch(console.error);
      }
    } else {
      // Advance to next turn
      advanceToNextTurn(newGame);
    }

    // Update game state
    setGame(newGame);

    return { valid: true };
  }, [game, currentPlayer, validateMove]);

  /**
   * Process a complete turn with multiple moves (for games that allow it)
   */
  const processTurn = useCallback((moves: Position[]): boolean => {
    if (!currentPlayer) return false;

    let success = true;
    moves.forEach(position => {
      if (!makeMove(position).valid) {
        success = false;
      }
    });

    return success;
  }, [makeMove, currentPlayer]);

  /**
   * Pass the current turn
   */
  const passTurn = useCallback(() => {
    if (!isMyTurn) return;

    const newGame = { ...game };
    advanceToNextTurn(newGame);
    setGame(newGame);
  }, [game, isMyTurn]);

  /**
   * Conquer-specific move processing with region detection
   */
  const processConquerMove = (conquerGame: ConquerGame, position: Position, player: Player): { capturedRegions: Region[], capturedCells: Position[] } => {
    // This is a simplified version - in a real implementation, 
    // this would integrate with the ConquerScene
    
    const capturedCells: Position[] = [];
    const capturedRegions: Region[] = [];
    
    // Basic flood fill for surrounded areas
    const adjacentPositions = [
      { x: position.x - 1, y: position.y },
      { x: position.x + 1, y: position.y },
      { x: position.x, y: position.y - 1 },
      { x: position.x, y: position.y + 1 }
    ];
    
    adjacentPositions.forEach(adj => {
      const surroundedCells = floodFillSurrounded(conquerGame, adj, player);
      capturedCells.push(...surroundedCells);
    });
    
    return { capturedRegions, capturedCells };
  };

  /**
   * Simple flood fill to detect surrounded areas
   */
  const floodFillSurrounded = (conquerGame: ConquerGame, start: Position, player: Player): Position[] => {
    const visited = new Set<string>();
    const cells: Position[] = [];
    const stack = [start];
    let isSurrounded = true;
    
    while (stack.length > 0 && isSurrounded) {
      const current = stack.pop()!;
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Check bounds
      if (current.x < 0 || current.x >= conquerGame.grid.width ||
          current.y < 0 || current.y >= conquerGame.grid.height) {
        isSurrounded = false;
        break;
      }
      
      const cell = conquerGame.grid.cells[current.y]?.[current.x];
      if (!cell) continue;
      
      if (cell.type === CellType.EMPTY) {
        cells.push(current);
        // Add adjacent cells to check
        [
          { x: current.x - 1, y: current.y },
          { x: current.x + 1, y: current.y },
          { x: current.x, y: current.y - 1 },
          { x: current.x, y: current.y + 1 }
        ].forEach(adj => {
          const adjKey = `${adj.x},${adj.y}`;
          if (!visited.has(adjKey)) {
            stack.push(adj);
          }
        });
      } else if (cell.owner?.id !== player.id) {
        isSurrounded = false;
        break;
      }
    }
    
    return isSurrounded ? cells : [];
  };

  /**
   * Check victory conditions based on game type
   */
  const checkVictoryConditions = (gameData: Game) => {
    if (gameData.type === GameType.CONQUER) {
      return checkConquerVictory(gameData);
    }
    
    // Default: no winner
    return {
      hasWinner: false,
      winners: [],
      type: VictoryType.MAJORITY,
      reason: 'Game in progress'
    };
  };

  /**
   * Check Conquer victory conditions with smart mathematical impossibility detection
   */
  const checkConquerVictory = (gameData: Game) => {
    const totalCells = gameData.grid.width * gameData.grid.height;
    const playerCounts = new Map<string, number>();
    let occupiedCells = 0;
    let rockCells = 0;
    let emptyCells = 0;

    // Count cells for each player, rocks, and empty cells
    for (let y = 0; y < gameData.grid.height; y++) {
      for (let x = 0; x < gameData.grid.width; x++) {
        const cell = gameData.grid.cells[y]?.[x];
        if (cell?.owner) {
          const count = playerCounts.get(cell.owner.id) || 0;
          playerCounts.set(cell.owner.id, count + 1);
          occupiedCells++;
        } else if (cell?.type === CellType.ROCK) {
          rockCells++;
        } else if (cell?.type === CellType.EMPTY) {
          emptyCells++;
        }
      }
    }
    
    const playableCells = totalCells - rockCells;
    const majorityThreshold = Math.floor(playableCells / 2) + 1;
    
    // 1. Check for strict majority control (>50% of playable cells)
    for (const [playerId, count] of playerCounts.entries()) {
      if (count >= majorityThreshold) {
        const winner = gameData.players.find(p => p.id === playerId);
        if (winner) {
          return {
            hasWinner: true,
            winners: [winner],
            type: VictoryType.MAJORITY,
            reason: `${winner.name} controls over 50% of the territory.`
          };
        }
      }
    }

    // 2. Check for mathematical impossibility - smart early victory detection
    if (emptyCells > 0) {
      // Get player scores sorted descending
      const playerScores = gameData.players.map(player => ({
        player,
        count: playerCounts.get(player.id) || 0
      })).sort((a, b) => b.count - a.count);

             if (playerScores.length > 0 && playerScores[0]) {
         const leader = playerScores[0];
         const trailingPlayers = playerScores.slice(1);

         // Check if it's mathematically impossible for any trailing player to catch up
         // even if they got ALL remaining empty cells
         let anyCanCatchUp = false;
         for (const trailing of trailingPlayers) {
           const maxPossibleScore = trailing.count + emptyCells;
           if (maxPossibleScore > leader.count) {
             anyCanCatchUp = true;
             break;
           }
         }

         // If no trailing player can catch up even with all remaining tiles, leader wins
         if (!anyCanCatchUp && leader.count > 0) {
           return {
             hasWinner: true,
             winners: [leader.player],
             type: VictoryType.MAJORITY,
             reason: `No opponent can catch up, ${leader.player.name} has an clear lead.`
           };
         }
       }
    }
    
    // 3. Check if grid is full (stalemate or highest score wins)
    if (occupiedCells + rockCells >= totalCells) {
      const maxCount = Math.max(0, ...playerCounts.values());
      
      // Handle case where there are no players with tiles
      if (maxCount === 0) {
        return { hasWinner: true, winners: [], type: VictoryType.STALEMATE, reason: 'Grid is full, but no players own territory.' };
      }

      const winners = gameData.players.filter(p => 
        playerCounts.get(p.id) === maxCount
      );
      
      return {
        hasWinner: true,
        winners,
        type: VictoryType.MAJORITY, // Or could be a new 'STALEMATE_VICTORY' type
        reason: winners.length > 1 ? 
          `Grid is full. Tie between ${winners.map(w => w.name).join(', ')}.` :
          `Grid is full. ${winners[0]?.name} has the most territory.`
      };
    }
    
    return {
      hasWinner: false,
      winners: [],
      type: VictoryType.MAJORITY,
      reason: 'Game in progress'
    };
  };

  /**
   * Advance to the next player's turn
   * Turn number increments only when we complete a full round (all players played once)
   */
  const advanceToNextTurn = (gameData: Game) => {
    if (!gameData.currentTurn) return;
    
    const currentPlayerIndex = gameData.players.findIndex(
      p => p.id === gameData.currentTurn!.playerId
    );
    
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameData.players.length;
    const nextPlayer = gameData.players[nextPlayerIndex];
    
    if (nextPlayer) {
      // Increment turn number only when starting a new round (back to first player)
      const newTurnNumber = nextPlayerIndex === 0 ? 
        gameData.currentTurn.turnNumber + 1 : 
        gameData.currentTurn.turnNumber;
      
      gameData.currentTurn = {
        turnNumber: newTurnNumber,
        playerId: nextPlayer.id,
        moves: [],
        timeLimit: gameData.options.turnTimeLimit,
        timeRemaining: gameData.options.turnTimeLimit,
        startTime: new Date()
      };
    }
  };

  /**
   * Get current valid moves
   */
  const getValidMoves = useCallback((): Position[] => {
    return validMoves;
  }, [validMoves]);

  /**
   * Update game data
   */
  const updateGame = useCallback((gameData: Partial<Game>) => {
    setGame(prevGame => {
      // Create a shallow copy so React detects a new reference while keeping
      // nested structures (grid, players …) intact.
      const mergedGame: Game = { ...prevGame, ...gameData } as Game;

      // Re-evaluate victory only if the game is still running.
      if (mergedGame.status === GameStatus.RUNNING) {
        const victoryResult = checkVictoryConditions(mergedGame);

        if (victoryResult.hasWinner) {
          mergedGame.winCondition = victoryResult;
          mergedGame.status = GameStatus.ENDED;
          mergedGame.endedAt = new Date();

          // Play SFX for local player (or defeat SFX otherwise).
          const isLocalPlayerWinner = victoryResult.winners.some(winner =>
            localPlayers.some(local => local.id === winner.id)
          );

          if (isLocalPlayerWinner) {
            victoryAudio.current.currentTime = 0;
            victoryAudio.current.play().catch(console.error);
          } else {
            defeatAudio.current.currentTime = 0;
            defeatAudio.current.play().catch(console.error);
          }
        }
      }

      return mergedGame;
    });
  }, [checkVictoryConditions, localPlayers]);

  const state: GameLogicState = {
    game,
    validMoves,
    currentPlayer,
    isMyTurn,
    canMove,
    regions: game.type === GameType.CONQUER ? regions : undefined
  };

  const actions: GameLogicActions = {
    makeMove,
    getValidMoves,
    validateMove,
    updateGame,
    processTurn,
    passTurn
  };

  return [state, actions];
}; 