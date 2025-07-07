import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Heading,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { useGameLogic } from '../../hooks/useGameLogic';
import { GameCanvas } from './GameCanvas';
import type { GameCanvasRef } from './GameCanvas';
import { GameInfoPanel } from './GameInfoPanel';
import { GameOverModal } from './GameOverModal';
import { ScreenType, GameType, GameStatus, GamePhase, createEmptyGrid, createPlayer, DEFAULT_CONQUER_OPTIONS } from '../../types/core-types';
import type { Game, Position, Turn, PlayerScore } from '../../types/core-types';
import { createScoreCalculator } from '../../utils/ScoreCalculators';

const InGameScreen: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { appState, navigateToScreen, updateGame } = useAppState();
  const toast = useToast();
  
  // Compute the current game from global state (re-evaluates every render)
  const currentGame = useMemo(() => {
    return appState.currentGame || appState.lobbyState.games.get(gameId || '') || null;
  }, [appState.currentGame, appState.lobbyState.games, gameId]);

  // If no game is found in state, fall back to a demo instance so the screen still works
  const fallbackDemoGame = useMemo(() => {
    const grid = createEmptyGrid(12, 8);
    const player1 = createPlayer('Player 1', true, false);
    const player2 = createPlayer('Player 2', false, false);

    const currentTurn: Turn = {
      turnNumber: 1,
      playerId: player1.id,
      moves: [],
      timeLimit: 30,
      timeRemaining: 30,
      startTime: new Date()
    };

    return {
      id: gameId || 'demo-game',
      name: 'Demo Conquer Game',
      type: GameType.CONQUER,
      status: GameStatus.RUNNING,
      players: [player1, player2],
      spectators: [],
      options: {
        ...DEFAULT_CONQUER_OPTIONS,
        gridSize: { width: 12, height: 8 },
        maxPlayers: 2,
        allowSpectators: false,
        allowAI: false
      },
      grid,
      currentTurn,
      gamePhase: GamePhase.PLAYING,
      winCondition: null,
      createdAt: new Date(),
      startedAt: new Date(),
      createdBy: player1.id
    } as Game;
  }, [gameId]);

  // Decide which game object to use for logic – real if available, else demo
  const activeGame = currentGame ?? fallbackDemoGame;

  // Local player ID (defaults to first player if unknown)
  const localPlayerId = appState.currentPlayer?.id || activeGame.players[0]?.id || '';

  const [gameLogicState, gameLogicActions] = useGameLogic(activeGame, localPlayerId);
  const gameCanvasRef = useRef<GameCanvasRef>(null);

  const scoreCalculator = useMemo(() => createScoreCalculator(activeGame.type), [activeGame.type]);
  const [scores, setScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    const newScores = gameLogicState.game.players.map(p =>
      scoreCalculator.calculateScore(gameLogicState.game, p)
    );
    setScores(newScores);
  }, [gameLogicState.game, scoreCalculator]);

  const handleCellClick = (position: Position) => {
    // Prevent moves if game is over
    if (gameLogicState.game.status === GameStatus.ENDED) {
      toast({
        title: 'Game Over',
        description: 'No more moves can be made.',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const result = gameLogicActions.makeMove(position);
    if (result.valid) {
      // For Conquer games, trigger region detection in the scene
      if (activeGame.type === GameType.CONQUER && gameLogicState.currentPlayer && gameCanvasRef.current) {
        const regionResult = gameCanvasRef.current.detectAndCaptureRegions?.(position, gameLogicState.currentPlayer);
        // Region capture is handled silently - visual and audio feedback is sufficient
      }
      
      updateGame(gameLogicState.game);

      // Animate tile placement zoom effect
      if (gameCanvasRef.current?.animateCellPlacement) {
        // Delay slightly to ensure grid visuals updated
        setTimeout(() => {
          gameCanvasRef.current?.animateCellPlacement?.(position);
        }, 50);
      }
    } else {
      toast({
        title: result.error || 'Invalid move',
        description: 'Your move could not be completed.',
        status: 'warning',
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const handleGameEvent = (event: string, data: unknown) => {
    console.warn('Game event:', event, data);
  };

  const handleEndGameContinue = () => {
    // Navigate back to the game lobby for this game
    if (gameId) {
      navigate(`/lobby/${gameId}`);
    } else {
      // Or fall back to main lobby if there's no gameId (e.g. local demo game)
      navigateToScreen(ScreenType.MAIN_LOBBY);
    }
  };

  const handleBackToLobby = () => {
    if (gameId) {
      navigate(`/lobby/${gameId}`);
    } else {
      navigateToScreen(ScreenType.MAIN_LOBBY);
    }
  };

  const handleQuitGame = () => {
    navigateToScreen(ScreenType.MAIN_LOBBY);
  };

  const handlePassTurn = () => {
    gameLogicActions.passTurn();
    toast({
      title: 'Turn passed',
      description: 'Next player\'s turn',
      status: 'info',
      duration: 1000,
      isClosable: true,
    });
  };

  // Memoize win condition to prevent re-renders
  const winCondition = useMemo(
    () => gameLogicState.game.winCondition,
    [gameLogicState.game.winCondition]
  );

  return (
    <Box position="relative" w="full" h="100vh" overflow="hidden">
      {/* Game Canvas */}
      <GameCanvas
        ref={gameCanvasRef}
        game={gameLogicState.game}
        onCellClick={handleCellClick}
        onGameEvent={handleGameEvent}
      />

      {/* Logo Overlay */}
      <Box position="fixed" top={1} left={6} zIndex={1200} pointerEvents="none">
        <Heading
          fontFamily="Tiny5"
          fontSize={['5xl']}
          color="accent.primary"
          letterSpacing="2px"
        >
          P1x3lz
        </Heading>
      </Box>

      {/* Game Over Modal */}
      {winCondition?.hasWinner && (
        <GameOverModal
          isOpen={true}
          onClose={handleEndGameContinue}
          isWinner={winCondition.winners.some(w => w.id === localPlayerId)}
          winCondition={{
            winners: winCondition.winners,
            reason: winCondition.reason,
          }}
        />
      )}

      {/* New Unified Game Info Panel */}
      <GameInfoPanel
        game={gameLogicState.game}
        scores={scores}
        isMyTurn={gameLogicState.isMyTurn}
        currentPlayer={gameLogicState.currentPlayer}
        onPassTurn={handlePassTurn}
        onBackToLobby={handleBackToLobby}
        onQuitGame={handleQuitGame}
      />
    </Box>
  );
};

export default InGameScreen; 