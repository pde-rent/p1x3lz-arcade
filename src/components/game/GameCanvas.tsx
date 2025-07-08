import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme } from '@chakra-ui/react';
import Phaser from 'phaser';
import { GridScene } from '../../games/common/GridScene';
import { ConquerScene } from '../../games/conquer/ConquerScene';
import type { Game, ConquerGame, Position } from '../../types/core-types';
import { GameType } from '../../types/core-types';

export interface GameCanvasProps {
  game: Game;
  onCellClick?: (position: Position) => void;
  onGameEvent?: (event: string, data: unknown) => void;
  onRegionCapture?: (capturedCells: Position[], capturedRegions: unknown[]) => void;
}

// Add a method to trigger region detection after a move
export interface GameCanvasRef {
  detectAndCaptureRegions?: (lastMove: Position, player: any) => { capturedRegions: unknown[], capturedCells: Position[] };
  animateCellPlacement?: (position: Position) => void;
}

/**
 * Enhanced React-Phaser bridge component
 * Handles game-specific scene selection and integration
 */
export const GameCanvas = React.forwardRef<GameCanvasRef, GameCanvasProps>(({
  game,
  onCellClick,
  onGameEvent,
  onRegionCapture: _onRegionCapture,
}, ref) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GridScene | ConquerScene | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const chakraTheme = useTheme() as any;

  // Early return if game is not provided
  if (!game) {
    return (
      <Box
        width="100%"
        height="100%"
        overflow="hidden"
        bg="gray.900"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        Loading game...
      </Box>
    );
  }

  // Calculate full-screen dimensions
  useEffect(() => {
    // Early return if game is not defined
    if (!game || !game.grid) {
      setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
      return;
    }

    const updateSize = () => {
      const { innerWidth: viewportWidth, innerHeight: viewportHeight } = window;
      const maxResolution = 1920;

      // Determine the constraint (width or height)
      let scale: number;
      if (viewportWidth > viewportHeight) {
        // Landscape or square
        scale = Math.min(1, maxResolution / viewportWidth);
      } else {
        // Portrait
        scale = Math.min(1, maxResolution / viewportHeight);
      }
      
      const newWidth = Math.floor(viewportWidth * scale);
      const newHeight = Math.floor(viewportHeight * scale);
      
      setCanvasSize({ width: newWidth, height: newHeight });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [game]);

  useEffect(() => {
    if (!gameRef.current || isInitialized || !game || !game.grid) return;

    // Calculate optimal cell size
    const cellSize = Math.min(
      Math.floor(canvasSize.width / game.grid.width),
      Math.floor(canvasSize.height / game.grid.height)
    );

    // Phaser configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: canvasSize.width,
      height: canvasSize.height,
      parent: gameRef.current,
      backgroundColor: '#171923',
      physics: {
        default: 'arcade' // Minimal physics for potential future use
      },
      scene: []
    };

    // Create Phaser game
    const phaserGame = new Phaser.Game(config);
    
    // Create and add the appropriate scene based on game type
    let gameScene: GridScene | ConquerScene;
    
    if (game.type === GameType.CONQUER) {
      // Create ConquerGame format for scene creation
      gameScene = new ConquerScene('ConquerGame', {
        gameData: game as ConquerGame,
        cellSize,
        padding: 10
      });
    } else {
      gameScene = new GridScene('GridGame', {
        gameData: game,
        cellSize,
        padding: 10
      });
    }

    phaserGame.scene.add(game.type === GameType.CONQUER ? 'ConquerGame' : 'GridGame', gameScene, true);
    
    // Store references
    phaserGameRef.current = phaserGame;
    sceneRef.current = gameScene;
    
    // Set up event handlers
    if (onCellClick) {
      gameScene.setCellClickHandler(onCellClick);
    }
    
    if (onGameEvent) {
      gameScene.setGameEventHandler(onGameEvent);
    }

    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
        sceneRef.current = null;
        setIsInitialized(false);
      }
    };
  }, [game?.id, game?.startedAt, canvasSize.width, canvasSize.height]); // Re-initialize if game ID, start time, or size changes

  // Update game data when it changes
  useEffect(() => {
    if (sceneRef.current && isInitialized && game) {
      sceneRef.current.updateGameData(game as ConquerGame);
    }
  }, [game, isInitialized]);

  // Update event handlers when they change
  useEffect(() => {
    if (sceneRef.current && onCellClick) {
      sceneRef.current.setCellClickHandler(onCellClick);
    }
  }, [onCellClick]);

  useEffect(() => {
    if (sceneRef.current && onGameEvent) {
      sceneRef.current.setGameEventHandler(onGameEvent);
    }
  }, [onGameEvent]);

  // Resize Phaser game when canvas size changes
  useEffect(() => {
    if (phaserGameRef.current && isInitialized) {
      phaserGameRef.current.scale.resize(canvasSize.width, canvasSize.height);
    }
  }, [canvasSize.width, canvasSize.height, isInitialized]);

  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    detectAndCaptureRegions: (lastMove: Position, player: any) => {
      if (sceneRef.current && game.type === GameType.CONQUER) {
        const conquerScene = sceneRef.current as ConquerScene;
        return conquerScene.detectAndCaptureRegions(lastMove, player);
      }
      return { capturedRegions: [], capturedCells: [] };
    },
    animateCellPlacement: (position: Position) => {
      if (sceneRef.current) {
        sceneRef.current.animateCellPlacement(position);
      }
    }
  }));

  return (
    <Box
      ref={gameRef}
      width="100%"
      height="100%"
      overflow="hidden"
      bg="gray.900"
      display="flex"
      alignItems="center"
      justifyContent="center"
    />
  );
});

export default GameCanvas; 