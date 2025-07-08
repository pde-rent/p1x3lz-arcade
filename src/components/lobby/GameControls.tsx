import React from 'react';
import {
  VStack,
  Box,
  Text,
  Button
} from '@chakra-ui/react';
import type { Game, GameStatus } from '../../types/core-types';
import { GameStatus as GameStatusEnum, GameType } from '../../types/core-types';

interface GameControlsProps {
  game: Game;
  isHost: boolean;
  countdown: number | null;
  onGameTypeClick: () => void;
  onOptionsClick: () => void;
  onStartClick: () => void;
  onLeaveClick: () => void;
}

// Game icons mapping
const GAME_ICONS: Record<GameType, string> = {
  [GameType.CONQUER]: '⚔️',
  [GameType.CHESS]: '♟️',
  [GameType.SNAKE]: '🐍'
} as const;

export const GameControls: React.FC<GameControlsProps> = ({
  game,
  isHost,
  countdown,
  onGameTypeClick,
  onOptionsClick,
  onStartClick,
  onLeaveClick
}) => {
  const canStartGame = () => {
    if (!isHost) return false;
    // If game has ended, allow restarting with current players
    if (game.status === GameStatusEnum.ENDED) {
      return game.players.length >= 2;
    }
    // For new games, count total players (local players are automatically ready)
    return game.players.length >= 2;
  };

  const getStartButtonText = () => {
    if (countdown !== null) {
      return `Cancel! (${countdown})`;
    }
    
    if (game.status === GameStatusEnum.RUNNING) {
      return 'Again!';
    }
    
    if (!isHost) {
      const currentPlayerInGame = game.players.find(p => p.id === game.createdBy);
      return currentPlayerInGame?.isReady ? 'Ready!' : 'Ready!';
    }
    
    return canStartGame() ? 'Start!' : 'Start!';
  };

  const getStartButtonColor = () => {
    if (countdown !== null) return 'blue';
    if (!isHost) {
      return 'blue';
    }
    if (game.status === GameStatusEnum.ENDED) return 'blue';
    return canStartGame() ? 'green' : 'gray';
  };

  return (
    <Box w="200px" display="flex" flexDirection="column" h="full" minH={0}>
      {/* Top Controls - align with first player row */}
      <Box h="28px" /> {/* Spacer to align with Players title */}
      <Button
        onClick={onGameTypeClick}
        variant="outline"
        colorScheme="blue"
        w="full"
        h="80px"
        fontSize="2xl"
        fontFamily="Tiny5"
        leftIcon={<Text fontSize="2xl">{GAME_ICONS[game.type]}</Text>}
        isDisabled={!isHost}
        mb={3}
        sx={{
          _hover: isHost ? {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'blue.300',
            color: 'blue.300'
          } : {}
        }}
      >
        {game.type.charAt(0).toUpperCase() + game.type.slice(1).toLowerCase()}
      </Button>

      <Button
        onClick={onOptionsClick}
        variant="outline"
        colorScheme="blue"
        w="full"
        isDisabled={!isHost}
        mb={3}
        sx={{
          _hover: isHost ? {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'blue.300',
            color: 'blue.300'
          } : {}
        }}
      >
        Options
      </Button>

      {/* Spacer */}
      <Box flex="1" />

      {/* Bottom Controls - align with chat input */}
      <Button
        onClick={onLeaveClick}
        variant="outline"
        colorScheme="red"
        w="full"
        mb={3}
        sx={{
          _hover: {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'red.300',
            color: 'red.300'
          }
        }}
      >
        Leave
      </Button>

      <Button
        variant="outline"
        colorScheme={getStartButtonColor()}
        w="full"
        h="80px"
        fontSize="2xl"
        fontFamily="Tiny5"
        onClick={onStartClick}
        isDisabled={getStartButtonColor() === 'gray'}
        mb={3}
        sx={{
          _hover: getStartButtonColor() !== 'gray' ? {
            bg: 'rgba(255, 255, 255, 0.05)',
            borderColor: getStartButtonColor() === 'green' ? 'green.300' : 
                        getStartButtonColor() === 'blue' ? 'blue.300' : 'gray.300',
            color: getStartButtonColor() === 'green' ? 'green.300' : 
                   getStartButtonColor() === 'blue' ? 'blue.300' : 'gray.300'
          } : {}
        }}
      >
        {getStartButtonText()}
      </Button>
    </Box>
  );
};

export default GameControls; 