import React from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Badge
} from '@chakra-ui/react';
import type { Game, GameStatus } from '../../types/core-types';
import { GameType } from '../../types/core-types';

interface GameListProps {
  games: Game[];
  onJoinGame: (game: Game) => void;
}

// Game icons mapping
const GAME_ICONS: Record<GameType, string> = {
  [GameType.CONQUER]: '⚔️',
  [GameType.CHESS]: '♟️',
  [GameType.SNAKE]: '🐍'
} as const;

export const GameList: React.FC<GameListProps> = ({
  games,
  onJoinGame
}) => {
  const getStatusColor = (status: GameStatus) => {
    switch (status) {
      case 'pending': return 'green.400';
      case 'starting': 
      case 'ended': return 'orange.400';
      case 'running': return 'gray.400';
      default: return 'gray.400';
    }
  };

  if (games.length === 0) {
    return (
      <VStack align="stretch" gap={2}>
        <Text color="gray.500" textAlign="center" py={8}>
          No games found. Create one to get started!
        </Text>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={2}>
      {games.map((game) => (
        <HStack
          key={game.id}
          p={3}
          border="1px solid"
          borderColor="gray.600"
          borderRadius="md"
          justify="space-between"
          cursor="pointer"
          onClick={() => onJoinGame(game)}
          sx={{
            _hover: {
              bg: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'gray.500'
            }
          }}
        >
          <HStack gap={3}>
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg={getStatusColor(game.status)}
            />
            <Text fontWeight="medium">{game.name}</Text>
            <Text color="gray.400" fontSize="sm">
              {game.players.length}/{4} players
            </Text>
            <Badge variant="outline" colorScheme="blue" fontSize="xs">
              {GAME_ICONS[game.type]} {game.type}
            </Badge>
          </HStack>
        </HStack>
      ))}
    </VStack>
  );
};

export default GameList; 