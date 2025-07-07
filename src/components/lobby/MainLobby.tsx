import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Container,
  VStack,
  HStack,
  Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../hooks/useAppState';
import { GameType, GameStatus, GamePhase, generateId, createEmptyGrid, DEFAULT_CONQUER_OPTIONS } from '../../types/core-types';

// Plus icon component
const PlusIcon = () => (
  <Icon viewBox="0 0 24 24" w={4} h={4}>
    <path
      fill="currentColor"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
    />
  </Icon>
);

const MainLobby: React.FC = () => {
  const { appState, addGame, setCurrentGame } = useAppState();
  const navigate = useNavigate();

  const handleCreateGame = () => {
    if (!appState.currentPlayer) {
      console.error('No current player found');
      return;
    }

    // Create a new game with default options
    const gameId = generateId();
    const newGame = {
      id: gameId,
      name: `${appState.currentPlayer.name}'s Game`,
      type: GameType.CONQUER,
      status: GameStatus.PENDING,
      players: [appState.currentPlayer],
      spectators: [],
      options: DEFAULT_CONQUER_OPTIONS,
      grid: createEmptyGrid(DEFAULT_CONQUER_OPTIONS.gridSize.width, DEFAULT_CONQUER_OPTIONS.gridSize.height),
      currentTurn: null,
      gamePhase: GamePhase.LOBBY,
      winCondition: null,
      createdAt: new Date(),
      createdBy: appState.currentPlayer.id
    };

    // Add the game to the lobby state
    addGame(newGame);
    
    // Set as current game
    setCurrentGame(newGame);
    
    // Navigate to the game lobby
    navigate(`/lobby/${gameId}`);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const gamesList = Array.from(appState.lobbyState.games.values());

  return (
    <Container maxW="6xl">
      <Box p={6}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Box>
            <Heading fontFamily="Tiny5" fontSize="4xl" color="blue.400" letterSpacing="1px">
              Lobby
            </Heading>
            <Text color="gray.400">
              Welcome, {appState.currentPlayer?.name || 'Player'}!
            </Text>
          </Box>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </Box>

        {gamesList.length === 0 ? (
          <Box textAlign="center" py={20}>
            <Heading size="md" color="gray.300" mb={4}>
              No games available
            </Heading>
            <Text color="gray.500" mb={6}>
              Create your first game to get started!
            </Text>
            <Button 
              onClick={handleCreateGame} 
              colorScheme="blue" 
              size="lg"
            >
              <PlusIcon />
              Create
            </Button>
          </Box>
        ) : (
          <VStack gap={4}>
            <HStack justify="space-between" w="full">
              <Heading size="md" color="gray.300">
                Available Games ({gamesList.length})
              </Heading>
              <Button 
                onClick={handleCreateGame} 
                colorScheme="blue" 
                size="md"
              >
                <PlusIcon />
                Create
              </Button>
            </HStack>
            
            <VStack gap={3} w="full">
              {gamesList.map((game) => (
                <Box
                  key={game.id}
                  p={4}
                  bg="gray.800"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.700"
                  w="full"
                  cursor="pointer"
                  _hover={{ bg: "gray.700" }}
                  onClick={() => {
                    setCurrentGame(game);
                    navigate(`/lobby/${game.id}`);
                  }}
                >
                  <HStack justify="space-between">
                    <VStack alignItems="start" gap={1}>
                      <HStack>
                        <Text fontWeight="bold" color="white">
                          {game.name}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {game.type.toUpperCase()}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {game.options.gridSize.width}×{game.options.gridSize.height} • Created {game.createdAt.toLocaleTimeString()}
                      </Text>
                    </VStack>
                    
                    <VStack alignItems="end" gap={1}>
                      <Text fontSize="sm" color="gray.400">
                        {game.players.length}/{game.options.maxPlayers} players
                      </Text>
                      <HStack gap={1}>
                        {game.players.map((player) => (
                          <Box
                            key={player.id}
                            w={3}
                            h={3}
                            bg={player.color.hex}
                            borderRadius="full"
                            title={player.name}
                          />
                        ))}
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        )}

        <Box mt={8} p={4} bg="gray.800" borderRadius="md">
          <Text fontSize="sm" color="gray.500" textAlign="center">
            MVP Version - Local games only • All players are local • No server required
          </Text>
        </Box>
      </Box>
    </Container>
  );
};

export default MainLobby; 