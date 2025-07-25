import { Scene } from 'phaser';
import type { Game, Grid, Position, Cell, PlayerScore, ScoreCalculator } from '../../types/core-types';
import { CellType } from '../../types/core-types';

export interface GridSceneConfig {
  gameData: Game;
  cellSize: number;
  padding: number;
}

/**
 * Lean Phaser Scene for grid-based games
 * Handles rendering and input, delegates game logic to React layer
 */
export class GridScene extends Scene {
  private grid!: Grid;
  private cellSize: number;
  private padding: number;
  private gameData: Game;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  protected cellSprites: Phaser.GameObjects.Rectangle[][] = [];
  private onCellClick?: (position: Position) => void;
  private onGameEvent?: (event: string, data: unknown) => void;
  
  // Zoom functionality
  private minZoom = 0.5;
  private maxZoom = 3.0;
  private zoomFactor = 0.1;
  private isDragging = false;
  private dragStartPos = { x: 0, y: 0 };
  private cameraStartPos = { x: 0, y: 0 };
  
  // Enhanced camera controls
  private isSpacePressed = false;
  private activeTouches: Phaser.Input.Pointer[] = [];
  private lastPinchDistance = 0;

  // Audio objects for click sounds
  private bubblePopSounds: HTMLAudioElement[] = [];
  
  constructor(key: string, config: GridSceneConfig) {
    super({ key });
    this.gameData = config.gameData;
    this.cellSize = config.cellSize;
    this.padding = config.padding;
    
    // Initialize bubble pop sounds
    this.bubblePopSounds = [
      new Audio('/sounds/bubble-pop-1.mp3'),
      new Audio('/sounds/bubble-pop-2.mp3'),
      new Audio('/sounds/bubble-pop-3.mp3')
    ];
  }

  preload() {
    // No assets needed for minimal grid rendering
  }

  create() {
    this.grid = this.gameData.grid;
    this.setupGrid();
    this.setupInput();
    this.setupCameraControls();
    
    // Store references in scene data for React bridge
    this.data.set('scene', this);
    this.data.set('game', this.gameData);
  }

  /**
   * Sets up the grid visualization
   */
  private setupGrid() {
    this.gridGraphics = this.add.graphics();
    this.cellSprites = [];

    // Create cell sprites
    for (let y = 0; y < this.grid.height; y++) {
      this.cellSprites[y] = [];
      for (let x = 0; x < this.grid.width; x++) {
        const cellX = this.padding + x * this.cellSize;
        const cellY = this.padding + y * this.cellSize;
        
        const cell = this.add.rectangle(
          cellX + this.cellSize / 2,
          cellY + this.cellSize / 2,
          this.cellSize - 2,
          this.cellSize - 2,
          0x2a2a2a
        );
        
        cell.setStrokeStyle(1, 0x4a4a4a);
        cell.setInteractive();
        cell.setData('position', { x, y });
        
        this.cellSprites[y]![x] = cell;
      }
    }

    this.updateGrid();
    this.centerCamera();
  }

  /**
   * Sets up input handling
   */
  private setupInput() {
    this.input.on('gameobjectdown', (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Rectangle) => {
      // Prevent cell clicks when panning
      if (this.isDragging || this.isSpacePressed) return;

      if (this.onCellClick && gameObject) {
        const position = gameObject.getData('position') as Position;
        
        // Play random bubble pop sound
        const randomSound = this.bubblePopSounds[Math.floor(Math.random() * this.bubblePopSounds.length)];
        if (randomSound) {
          randomSound.currentTime = 0;
          randomSound.play().catch(console.error);
        }
        
        this.onCellClick(position);
      }
    });
  }

  /**
   * Sets up camera controls
   */
  private setupCameraControls() {
    const camera = this.cameras.main;

    // Wheel / track-pad zoom
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      this.handleZoom(pointer, deltaY);
    });

    // Pointer drag panning (right or middle mouse button)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown() || pointer.middleButtonDown()) {
        this.isDragging = true;
        this.dragStartPos = { x: pointer.x, y: pointer.y };
        this.cameraStartPos = { x: camera.scrollX, y: camera.scrollY };
        this.input.setDefaultCursor('grabbing');
      } else if ((pointer as any).pointerType === 'touch') {
        // Track active touches for pinch-to-zoom
        if (!this.activeTouches.find(t => t.id === pointer.id)) {
          this.activeTouches.push(pointer);
        }
        if (this.activeTouches.length === 2) {
          this.lastPinchDistance = Phaser.Math.Distance.Between(
            this.activeTouches[0]!.x,
            this.activeTouches[0]!.y,
            this.activeTouches[1]!.x,
            this.activeTouches[1]!.y
          );
        }
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // ----- Pinch-to-zoom -----
      if (
        (pointer as any).pointerType === 'touch' &&
        this.activeTouches.length === 2 &&
        this.activeTouches.some(t => t.id === pointer.id)
      ) {
        const camera = this.cameras.main;
        const touchA = this.activeTouches[0]! as Phaser.Input.Pointer;
        const touchB = this.activeTouches[1]! as Phaser.Input.Pointer;
        const distance = Phaser.Math.Distance.Between(touchA.x, touchA.y, touchB.x, touchB.y);

        if (this.lastPinchDistance > 0) {
          const scaleFactor = distance / this.lastPinchDistance;
          const newZoom = Phaser.Math.Clamp(
            camera.zoom * scaleFactor,
            this.minZoom,
            this.maxZoom
          );
          if (Math.abs(newZoom - camera.zoom) > 0.001) {
            camera.setZoom(newZoom);
            this.centerCamera();
          }
        }
        this.lastPinchDistance = distance;
        return; // skip panning logic while pinching
      }

      // ----- Mouse drag panning -----
      if (!this.isDragging) return;
      const deltaX = (pointer.x - this.dragStartPos.x) / camera.zoom;
      const deltaY = (pointer.y - this.dragStartPos.y) / camera.zoom;
      camera.scrollX = this.cameraStartPos.x - deltaX;
      camera.scrollY = this.cameraStartPos.y - deltaY;
      this.constrainCamera();
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.input.setDefaultCursor('default');
      }

      if ((pointer as any).pointerType === 'touch') {
        // Remove touch from active list
        this.activeTouches = this.activeTouches.filter(t => t.id !== pointer.id);
        if (this.activeTouches.length < 2) {
          this.lastPinchDistance = 0;
        }
      }
    });

    // Some devices emit pointerwheel instead of wheel
    this.input.on('pointerwheel', (pointer: Phaser.Input.Pointer, _deltaX: number, deltaY: number) => {
      this.handleZoom(pointer, deltaY);
    });
  }

  /**
   * Handles zoom functionality with smooth pointer-centered zooming
   */
  private handleZoom(pointer: Phaser.Input.Pointer | { x: number; y: number }, deltaY: number) {
    const camera = this.cameras.main;
    const oldZoom = camera.zoom;
    
    // Prevent zoom while actively panning
    if (this.isDragging) return;
    
    // Calculate new zoom level with smooth scaling
    const zoomDirection = deltaY > 0 ? -1 : 1;
    const newZoom = Phaser.Math.Clamp(
      oldZoom + zoomDirection * this.zoomFactor * oldZoom,
      this.minZoom,
      this.maxZoom
    );

    if (Math.abs(newZoom - oldZoom) > 0.001) {
      camera.setZoom(newZoom);
      // Always keep camera centered on the grid after zooming
      this.centerCamera();
    }
  }

  /**
   * Centers the camera on the grid
   */
  private centerCamera() {
    const gridWidth = this.grid.width * this.cellSize;
    const gridHeight = this.grid.height * this.cellSize;
    
    const centerX = (gridWidth / 2) + this.padding;
    const centerY = (gridHeight / 2) + this.padding;
    
    this.cameras.main.centerOn(centerX, centerY);
  }

  /**
   * Constrains camera to stay within reasonable bounds
   */
  private constrainCamera() {
    const camera = this.cameras.main;
    const zoom = camera.zoom;
    
    // Calculate grid bounds
    const gridWidth = this.grid.width * this.cellSize + this.padding * 2;
    const gridHeight = this.grid.height * this.cellSize + this.padding * 2;
    
    // Calculate camera bounds based on zoom
    const cameraWidth = camera.width / zoom;
    const cameraHeight = camera.height / zoom;
    
    // Allow some padding outside the grid
    const extraPadding = Math.max(this.cellSize * 2, 100);
    
    const minX = -extraPadding;
    const maxX = gridWidth + extraPadding - cameraWidth;
    const minY = -extraPadding;
    const maxY = gridHeight + extraPadding - cameraHeight;
    
    // Constrain camera position
    const constrainedX = Phaser.Math.Clamp(camera.scrollX, minX, maxX);
    const constrainedY = Phaser.Math.Clamp(camera.scrollY, minY, maxY);
    
    camera.setScroll(constrainedX, constrainedY);
  }

  /**
   * Updates the grid visualization
   */
  updateGrid() {
    if (!this.cellSprites.length) return;

    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const cell = this.grid.cells[y]?.[x];
        const sprite = this.cellSprites[y]?.[x];
        
        if (cell && sprite) {
          this.updateCellVisual(sprite, cell);
        }
      }
    }
  }

  /**
   * Updates a single cell's visual representation
   */
  private updateCellVisual(sprite: Phaser.GameObjects.Rectangle, cell: Cell) {
    let color = 0x1c273a; // Default empty (dark blue)
    let strokeColor = 0x2a4365; // Default stroke (lighter blue)

    switch (cell.type) {
      case CellType.ROCK:
        color = 0x4a5568; // Rock (grayish blue)
        strokeColor = 0x718096;
        break;
      case CellType.BLOCKED:
        color = 0x2d3748; // Blocked (darker grayish blue)
        strokeColor = 0x4a5568;
        break;
      case CellType.OCCUPIED:
        if (cell.owner) {
          color = parseInt(cell.owner.color.hex.substring(1), 16);
          strokeColor = this.lightenColor(color, 0.3);
        }
        break;
    }

    sprite.setFillStyle(color);
    sprite.setStrokeStyle(1, strokeColor);
  }

  /**
   * Highlights valid moves
   */
  highlightValidMoves(positions: Position[]) {
    // Reset all highlights
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const sprite = this.cellSprites[y]?.[x];
        if (sprite) {
          sprite.setAlpha(1);
        }
      }
    }

    // Highlight valid positions
    positions.forEach(pos => {
      if (this.isValidPosition(pos)) {
        const sprite = this.cellSprites[pos.y]?.[pos.x];
        if (sprite) {
          sprite.setAlpha(0.7);
          sprite.setStrokeStyle(2, 0x00ff00);
        }
      }
    });
  }

  /**
   * Plays a simple animation when a cell is placed
   */
  animateCellPlacement(position: Position) {
    if (!this.isValidPosition(position)) return;
    
    const sprite = this.cellSprites[position.y]?.[position.x];
    if (!sprite) return;
    
    // Start from 25% scale (small tile) for smoother pop-in and to avoid z-overlap
    sprite.setScale(0.50);

    // Zoom to slightly larger than final size, then settle at 1
    this.tweens.add({
      targets: sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: sprite,
          scaleX: 1,
          scaleY: 1,
          duration: 90,
          ease: 'Back.easeIn'
        });
      }
    });
    
    // Notify of game action that affects scores
    this.onGameAction('cell_placed', { position });
  }

  /**
   * Animates region capture
   */
  animateRegionCapture(positions: Position[], playerColor: string) {
    positions.forEach((pos, index) => {
      if (!this.isValidPosition(pos)) return;
      
      const sprite = this.cellSprites[pos.y]?.[pos.x];
      if (!sprite) return;
      
      // Staggered wave animation
      this.tweens.add({
        targets: sprite,
        alpha: 0.3,
        duration: 100,
        delay: index * 50,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          const color = parseInt(playerColor.substring(1), 16);
          sprite.setFillStyle(color);
        }
      });
    });
    
    // Notify of game action that affects scores
    this.onGameAction('region_captured', { positions, playerColor });
  }

  /**
   * Updates the game data and refreshes the grid
   */
  updateGameData(gameData: Game) {
    this.gameData = gameData;
    this.grid = gameData.grid;

    // The Scene's Data Manager is only available after the Scene systems are
    // fully initialised (i.e. after `create`). When React mounts quickly we
    // may call this method earlier, so we need a defensive check to avoid
    // accessing `this.data` before it exists.
    if ((this as unknown as { data?: Phaser.Data.DataManager }).data) {
      (this as unknown as { data: Phaser.Data.DataManager }).data.set('game', gameData);
    }

    this.updateGrid();
    // Scoreboard updates are now handled in React.
  }

  /**
   * Sets the score calculator for this game type
   */
  setScoreCalculator(calculator: ScoreCalculator) {
    // This is now handled in the React layer (useGameLogic hook)
    // The calculator is passed via props instead.
  }

  /**
   * Manually refreshes the scoreboard - call this when game actions change scores
   */
  refreshScoreboard() {
    // Scoreboard is now a React component, this method is obsolete.
  }

  /**
   * Called when a game action occurs that might affect scores
   * Override in game-specific scenes to add additional logic
   */
  protected onGameAction(actionType: string, data?: unknown) {
    // The new UI panel gets data from the hook, so we just need to emit the event.
    this.emitGameEvent(actionType, data);
  }

  /**
   * Sets the cell click callback
   */
  setCellClickHandler(callback: (position: Position) => void) {
    this.onCellClick = callback;
  }

  /**
   * Sets the game event callback
   */
  setGameEventHandler(callback: (event: string, data: unknown) => void) {
    this.onGameEvent = callback;
  }

  /**
   * Emits a game event to React layer
   */
  emitGameEvent(event: string, data: unknown) {
    if (this.onGameEvent) {
      this.onGameEvent(event, data);
    }
  }

  /**
   * Utility methods
   */
  private isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.grid.width && pos.y >= 0 && pos.y < this.grid.height;
  }

  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xFF) * (1 + factor)));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xFF) * (1 + factor)));
    const b = Math.min(255, Math.floor((color & 0xFF) * (1 + factor)));
    return (r << 16) | (g << 8) | b;
  }

} 