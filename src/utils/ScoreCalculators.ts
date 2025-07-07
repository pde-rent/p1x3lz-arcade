import type { Game, Player, PlayerScore, ScoreCalculator, ConquerGame } from '../types/core-types';
import { GameType, CellType } from '../types/core-types';

/**
 * Score calculator for Conquer game
 * Format: "PlayerName: XT Y%" (tiles owned and percentage)
 */
export class ConquerScoreCalculator implements ScoreCalculator {
  calculateScore(game: Game, player: Player): PlayerScore {
    const conquerGame = game as ConquerGame;
    const grid = conquerGame.grid;
    
    // Count tiles owned by this player and total playable tiles
    let tilesOwned = 0;
    let totalPlayableCells = 0;
    
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y]?.[x];
        if (cell) {
          // Only count non-rock tiles as playable
          if (cell.type !== CellType.ROCK) {
            totalPlayableCells++;
            
            // Count tiles owned by this player
            if (cell.owner?.id === player.id) {
              tilesOwned++;
            }
          }
        }
      }
    }
    
    // Calculate percentage based on playable tiles only
    const percentage = totalPlayableCells > 0 ? Math.round((tilesOwned / totalPlayableCells) * 100) : 0;
    const displayText = `${player.name}: ${tilesOwned}T ${percentage}%`;
    
    return {
      playerId: player.id,
      displayText,
      rawScore: [tilesOwned, percentage],
      color: player.color.hex
    };
  }
  
  getScoreFormat(): string {
    return 'PlayerName: XT Y%';
  }
}

/**
 * Score calculator for Chess game
 * Format: "PlayerName: XP" (pieces remaining)
 */
export class ChessScoreCalculator implements ScoreCalculator {
  calculateScore(game: Game, player: Player): PlayerScore {
    const grid = game.grid;
    
    // Count pieces owned by this player
    let piecesRemaining = 0;
    
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const cell = grid.cells[y]?.[x];
        if (cell?.owner?.id === player.id && cell.type === CellType.OCCUPIED) {
          piecesRemaining++;
        }
      }
    }
    
    const displayText = `${player.name}: ${piecesRemaining}P`;
    
    return {
      playerId: player.id,
      displayText,
      rawScore: [piecesRemaining],
      color: player.color.hex
    };
  }
  
  getScoreFormat(): string {
    return 'PlayerName: XP';
  }
}

/**
 * Score calculator for Bomber game
 * Format: "PlayerName: XK YL" (kills and lives remaining)
 */
export class BomberScoreCalculator implements ScoreCalculator {
  calculateScore(game: Game, player: Player): PlayerScore {
    // TODO: When BomberGame and BomberPlayer interfaces are implemented, 
    // cast to BomberGame and access player-specific data properly
    // const bomberGame = game as BomberGame;
    // const bomberPlayer = bomberGame.players.find(p => p.id === player.id) as BomberPlayer;
    // const kills = bomberPlayer.kills || 0;
    // const lives = bomberPlayer.livesRemaining || 0;
    
    // For now, use player's score as kills and assume 3 lives
    const kills = player.score || 0;
    const lives = 3; // This should come from BomberPlayer.livesRemaining
    
    const displayText = `${player.name}: ${kills}K ${lives}L`;
    
    return {
      playerId: player.id,
      displayText,
      rawScore: [kills, lives],
      color: player.color.hex
    };
  }
  
  getScoreFormat(): string {
    return 'PlayerName: XK YL';
  }
}

/**
 * Score calculator for Snake game
 * Format: "PlayerName: XK YL" (kills and length)
 */
export class SnakeScoreCalculator implements ScoreCalculator {
  calculateScore(game: Game, player: Player): PlayerScore {
    // TODO: When SnakeGame and SnakePlayer interfaces are implemented,
    // cast to SnakeGame and access player-specific data properly
    // const snakeGame = game as SnakeGame;
    // const snakePlayer = snakeGame.players.find(p => p.id === player.id) as SnakePlayer;
    // const kills = snakePlayer.kills || 0;
    // const length = snakePlayer.length || 0;
    
    // For now, use player's score as kills and assume length 5
    const kills = player.score || 0;
    const length = 5; // This should come from SnakePlayer.length
    
    const displayText = `${player.name}: ${kills}K ${length}L`;
    
    return {
      playerId: player.id,
      displayText,
      rawScore: [kills, length],
      color: player.color.hex
    };
  }
  
  getScoreFormat(): string {
    return 'PlayerName: XK YL';
  }
}

/**
 * Factory function to create appropriate score calculator based on game type
 */
export function createScoreCalculator(gameType: GameType): ScoreCalculator {
  switch (gameType) {
    case GameType.CONQUER:
      return new ConquerScoreCalculator();
    case GameType.CHESS:
      return new ChessScoreCalculator();
    case GameType.SNAKE:
      return new SnakeScoreCalculator();
    // TODO: Add BOMBER when GameType.BOMBER is added to the enum
    // case GameType.BOMBER:
    //   return new BomberScoreCalculator();
    default:
      // Default to conquer for now
      return new ConquerScoreCalculator();
  }
} 