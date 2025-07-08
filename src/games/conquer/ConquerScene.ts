import { GridScene } from '../common/GridScene';
import type { GridSceneConfig } from '../common/GridScene';
import type { ConquerGame, ConquerOptions, Position, Region, Player } from '../../types/core-types';
import { CellType, generateId } from '../../types/core-types';
import { createScoreCalculator } from '../../utils/ScoreCalculators';

export interface ConquerSceneConfig extends GridSceneConfig {
  gameData: ConquerGame;
}

/**
 * ConquerScene extends GridScene with Conquer-specific functionality
 * Handles rock generation, region detection, and territory capture
 */
export class ConquerScene extends GridScene {
  private conquerGame: ConquerGame;
  private regions: Region[] = [];
  private animationQueue: { positions: Position[]; playerColor: string }[] = [];
  
  // Audio object for region capture sounds
  private regionCaptureAudio: HTMLAudioElement;

  constructor(key: string, config: ConquerSceneConfig) {
    super(key, config);
    this.conquerGame = config.gameData;
    
    // Initialize region capture audio
    this.regionCaptureAudio = new Audio('/sounds/bubble-pop-region.mp3');
    
    // Set up score calculator for Conquer game
    this.setScoreCalculator(createScoreCalculator(this.conquerGame.type));
  }

  override create() {
    super.create();
    this.generateRocks();
    this.updateRegions();
  }

  /**
   * Generates rocks on the grid based on the game options.
   * This ensures a random, non-symmetrical layout.
   */
  private generateRocks() {
    const options = this.conquerGame.options as ConquerOptions;
    const { width, height } = this.conquerGame.grid;
    const totalCells = width * height;
    const rockCount = Math.floor(totalCells * (options.rocksPercentage / 100));

    // Create a list of all possible cell positions
    const allPositions: Position[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        allPositions.push({ x, y });
      }
    }

    // Shuffle the positions array to randomize rock placement
    for (let i = allPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = allPositions[i];
      if(temp) {
        allPositions[i] = allPositions[j]!;
        allPositions[j] = temp;
      }
    }

    // Take the first 'rockCount' positions for our rocks
    const rockPositions = allPositions.slice(0, rockCount);

    // Update the grid cells to be rocks
    rockPositions.forEach(pos => {
      const cell = this.conquerGame.grid.cells[pos.y]?.[pos.x];
      if (cell) {
        cell.type = CellType.ROCK;
      }
    });

    // Update the visual representation
    this.updateGrid();
  }

  /**
   * Detects and captures regions after a player move
   * This is the main region detection logic for Conquer
   */
  detectAndCaptureRegions(lastMove: Position, player: Player): { capturedRegions: Region[], capturedCells: Position[] } {
    const capturedRegions: Region[] = [];
    const finalCapturedCells: Position[] = [];
    const alreadyCaptured = new Set<string>(); // Keep track of cells already captured in this turn
    const opponentTilesLost = new Map<string, number>(); // Track tiles lost per opponent

    const adjacentPositions = this.getAdjacentPositions(lastMove);

    adjacentPositions.forEach(startPos => {
      const startKey = `${startPos.x},${startPos.y}`;
      // If this starting position was already part of a captured region, skip it.
      if (alreadyCaptured.has(startKey)) {
        return;
      }

      const region = this.detectEnclosedRegion(startPos, player);
      if (region && region.cells.length > 0) {
        capturedRegions.push(region);

        // Add all cells from the newly found region to the final list and the tracking set
        region.cells.forEach(pos => {
          finalCapturedCells.push(pos);
          alreadyCaptured.add(`${pos.x},${pos.y}`);
        });

        // Add to animation queue
        this.animationQueue.push({
          positions: region.cells,
          playerColor: player.color.hex
        });
      }
    });

    // Now, apply the changes to the grid for all captured cells at once
    // and track opponent tiles being captured
    finalCapturedCells.forEach(pos => {
      const cell = this.conquerGame.grid.cells[pos.y]?.[pos.x];
      if (cell) {
        // If this cell was owned by an opponent, track it for score updates
        if (cell.owner && cell.owner.id !== player.id) {
          const currentCount = opponentTilesLost.get(cell.owner.id) || 0;
          opponentTilesLost.set(cell.owner.id, currentCount + 1);
        }
        
        cell.type = CellType.OCCUPIED;
        cell.owner = player;
        cell.lastModified = new Date();
      }
    });

    // Update opponent scores for lost tiles
    opponentTilesLost.forEach((tilesLost, opponentId) => {
      const opponent = this.conquerGame.players.find(p => p.id === opponentId);
      if (opponent) {
        // Emit an event to notify the game logic about the score change
        this.emitGameEvent('opponent_tiles_captured', {
          capturingPlayer: player,
          losingPlayer: opponent,
          tilesLost: tilesLost,
          totalCaptured: finalCapturedCells.length
        });
      }
    });

    if (this.animationQueue.length > 0) {
      this.processAnimationQueue();
    }

    this.updateGrid(); // Visually update the grid once after all captures

    return { capturedRegions, capturedCells: finalCapturedCells };
  }

  /**
   * Detects if there's an enclosed region starting from a position.
   * A region is enclosed if it's surrounded by the player's own tiles or rocks.
   * The region itself can contain empty cells and opponent's cells, which will be captured.
   * Grid edges count as neutral boundaries up to the maxNeutralEdges limit.
   * However, if any opponent tiles are on the edge within the region, those edges are not neutral and prevent conquest.
   */
  private detectEnclosedRegion(startPos: Position, player: Player): Region | null {
    const startCell = this.conquerGame.grid.cells[startPos.y]?.[startPos.x];

    // Only start from empty cells or opponent-owned cells
    if (!startCell || startCell.owner?.id === player.id || startCell.type === CellType.ROCK) {
      return null;
    }

    const regionCells: Position[] = [];
    const queue: Position[] = [startPos];
    const visited = new Set<string>([`${startPos.x},${startPos.y}`]);

    // Flood-fill contiguous empty/opponent cells
    while (queue.length) {
      const current = queue.pop() as Position;
      regionCells.push(current);

      this.getAdjacentPositions(current).forEach(neigh => {
        const key = `${neigh.x},${neigh.y}`;
        if (visited.has(key)) return;
        if (neigh.x < 0 || neigh.x >= this.conquerGame.grid.width || neigh.y < 0 || neigh.y >= this.conquerGame.grid.height) {
          // Neighbor is out of bounds – do not enqueue (but edges can still be valid boundaries)
          return;
        }
        const neighCell = this.conquerGame.grid.cells[neigh.y]?.[neigh.x];
        if (!neighCell) return;
        if (neighCell.type === CellType.EMPTY || (neighCell.owner && neighCell.owner.id !== player.id)) {
          // Empty or opponent cell – part of the region
          visited.add(key);
          queue.push(neigh);
        }
        // Player's own cell or rock act as boundary – do not enqueue
      });
    }

    // After flood fill, verify all boundary neighbours are player-owned, rocks, or neutral edges
    // Count the number of neutral edge boundaries and enforce the maxNeutralEdges limit
    // If any opponent tiles are on the edge within the region, those edges are not neutral
    let edgeCount = 0;
    const maxEdges = (this.conquerGame.options as ConquerOptions).maxNeutralEdges;
    
    // First, check if any opponent tiles are on the edge within the region
    for (const cellPos of regionCells) {
      const cell = this.conquerGame.grid.cells[cellPos.y]?.[cellPos.x];
      if (cell?.owner && cell.owner.id !== player.id) {
        // This is an opponent tile within the region
        // Check if this opponent tile is on the edge
        if (cellPos.x === 0 || cellPos.x === this.conquerGame.grid.width - 1 || 
            cellPos.y === 0 || cellPos.y === this.conquerGame.grid.height - 1) {
          // Opponent tile is on the edge - this region cannot be captured
          return null;
        }
      }
    }
    
    // Now check boundaries and count neutral edges
    for (const cellPos of regionCells) {
      for (const neigh of this.getAdjacentPositions(cellPos)) {
        if (neigh.x < 0 || neigh.x >= this.conquerGame.grid.width || neigh.y < 0 || neigh.y >= this.conquerGame.grid.height) {
          // Edge detected – count it as neutral
          edgeCount++;
          continue;
        }
        const neighCell = this.conquerGame.grid.cells[neigh.y]?.[neigh.x];
        if (!neighCell) continue;
        if (
          neighCell.type === CellType.ROCK ||
          (neighCell.owner && neighCell.owner.id === player.id)
        ) {
          // Friendly boundary – ok
          continue;
        }
        // If neighbour is not part of region and not friendly boundary, region is open
        if (!regionCells.some(p => p.x === neigh.x && p.y === neigh.y)) {
          return null;
        }
      }
    }

    // Check if the region exceeds the maximum allowed neutral edge boundaries
    if (edgeCount > maxEdges) {
      return null;
    }

    return {
      id: generateId(),
      cells: regionCells,
      owner: player,
      conqueredAt: new Date(),
    };
  }

  /**
   * Updates regions after game state changes
   */
  private updateRegions() {
    const newRegions: Region[] = [];
    
    // For each player, find their enclosed regions
    this.conquerGame.players.forEach(player => {
      const playerRegions = this.detectPlayerRegions(player);
      newRegions.push(...playerRegions);
    });
    
    this.regions = newRegions;
    this.conquerGame.regions = newRegions;
  }

  /**
   * Detects all regions currently owned by a specific player
   * This is used for updating the game state, not for capturing new regions
   */
  private detectPlayerRegions(player: Player): Region[] {
    const regions: Region[] = [];
    const visited = new Set<string>();
    
    // Check all empty cells to see if they form enclosed regions
    for (let y = 0; y < this.conquerGame.grid.height; y++) {
      for (let x = 0; x < this.conquerGame.grid.width; x++) {
        const pos = { x, y };
        const key = `${x},${y}`;
        
        if (!visited.has(key)) {
          const region = this.detectEnclosedRegion(pos, player);
          if (region) {
            regions.push(region);
            // Mark all cells in this region as visited
            region.cells.forEach(cell => {
              visited.add(`${cell.x},${cell.y}`);
            });
          }
        }
      }
    }
    
    return regions;
  }

  /**
   * Gets adjacent positions (4-directional)
   */
  private getAdjacentPositions(position: Position): Position[] {
    return [
      { x: position.x - 1, y: position.y },
      { x: position.x + 1, y: position.y },
      { x: position.x, y: position.y - 1 },
      { x: position.x, y: position.y + 1 }
    ];
  }

  /**
   * Calculates the boundary length of a region
   */
  private calculateBoundaryLength(cells: Position[]): number {
    let boundary = 0;
    
    cells.forEach(cell => {
      const adjacent = this.getAdjacentPositions(cell);
      adjacent.forEach(adj => {
        const isInRegion = cells.some(c => c.x === adj.x && c.y === adj.y);
        if (!isInRegion) {
          boundary++;
        }
      });
    });
    
    return boundary;
  }

  /**
   * Processes queued animations
   */
  private processAnimationQueue() {
    if (this.animationQueue.length === 0) return;
    
    const animation = this.animationQueue.shift()!;
    this.animateRegionCaptureWithSound(animation.positions, animation.playerColor);
    
    // Process next animation after delay
    if (this.animationQueue.length > 0) {
      this.time.delayedCall(500, () => this.processAnimationQueue());
    }
  }

  /**
   * Animates region capture with sound effects
   */
  private animateRegionCaptureWithSound(positions: Position[], playerColor: string) {
    // Play region capture sound
    this.regionCaptureAudio.currentTime = 0;
    this.regionCaptureAudio.play().catch(console.error);
    
    // Animate each cell with staggered timing
    positions.forEach((position, index) => {
      this.time.delayedCall(index * 50, () => {
        const sprite = this.cellSprites[position.y]?.[position.x];
        if (sprite) {
          // Create a color animation effect
          const targetColor = parseInt(playerColor.replace('#', ''), 16);
          
          // Flash effect
          sprite.setFillStyle(0xffffff);
          this.tweens.add({
            targets: sprite,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
              sprite.setFillStyle(targetColor);
            }
          });
        }
      });
    });
    
    // Emit game event for region capture
    this.emitGameEvent('region_captured', {
      positions,
      playerColor,
      cellCount: positions.length
    });
  }

  /**
   * Updates the grid visual representation
   */
  override updateGrid() {
    super.updateGrid();
    
    // Add special rendering for rocks
    this.renderRocks();
  }

  /**
   * Renders rocks with a distinct visual style
   */
  private renderRocks() {
    for (let y = 0; y < this.conquerGame.grid.height; y++) {
      for (let x = 0; x < this.conquerGame.grid.width; x++) {
        const cell = this.conquerGame.grid.cells[y]?.[x];
        if (cell?.type === CellType.ROCK) {
          // Rocks are already handled in the base GridScene updateCellVisual method
          // This is here for any additional rock-specific rendering if needed
        }
      }
    }
  }

  /**
   * Override to handle Conquer-specific game data updates
   */
  override updateGameData(gameData: ConquerGame) {
    super.updateGameData(gameData);
    this.conquerGame = gameData;
    this.updateRegions();
  }

  /**
   * Get current regions for external access
   */
  getRegions(): Region[] {
    return [...this.regions];
  }
} 