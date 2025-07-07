import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  IconButton,
  Collapse,
  Divider,
  Flex,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, InfoIcon, SettingsIcon, StarIcon, TimeIcon } from '@chakra-ui/icons';
import type { Game, Player, PlayerScore } from '../../types/core-types';
import StyledBox from '../common/StyledBox';
import StyledButton from '../common/StyledButton';
import GameRulesModal from './GameRulesModal';

interface GameInfoPanelProps {
  game: Game;
  scores: PlayerScore[];
  isMyTurn: boolean;
  currentPlayer: Player | null;
  onPassTurn: () => void;
  onBackToLobby: () => void;
  onQuitGame: () => void;
}

export const GameInfoPanel: React.FC<GameInfoPanelProps> = ({
  game,
  scores,
  isMyTurn,
  currentPlayer,
  onPassTurn,
  onBackToLobby,
  onQuitGame,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isOpen: isRulesOpen, onOpen: onRulesOpen, onClose: onRulesClose } = useDisclosure();
  const toggleOpen = () => setIsOpen(!isOpen);

  // Prevent click propagation to underlying grid
  const handleBoxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Box position="fixed" top={4} right={4} zIndex={1200}>
        <StyledBox
          bg="rgba(26, 32, 44, 0.4)"
          borderRadius="xl"
          p={4}
          minW="320px"
          maxW="360px"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.4)"
          border="1px solid"
          borderColor="gray.600"
          backdropFilter="blur(12px)"
          transition="all 0.3s ease-in-out"
          _hover={{ borderColor: 'gray.500' }}
          onClick={handleBoxClick}
        >
          <VStack align="stretch" spacing={3}>
            {/* Player Scores Section */}
            <VStack align="stretch" spacing={2}>
              {scores.map((score, index) => {
                const player = game.players.find(p => p.id === score.playerId);
                return (
                  <HStack key={score.playerId} justify="space-between">
                    <HStack>
                      <Box
                        w="12px"
                        h="12px"
                        bg={score.color}
                        borderRadius="2px"
                        border="1px solid"
                        borderColor="gray.500"
                      />
                      <Text 
                        fontSize="sm" 
                        color="white" 
                        fontWeight={score.playerId === currentPlayer?.id ? 'bold' : 'normal'}
                      >
                        {player?.name || 'Unknown'}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.300" fontWeight="bold">
                      {score.displayText.split(': ')[1]}
                    </Text>
                  </HStack>
                );
              })}
            </VStack>

            {/* Always Visible Rules Button and Info Toggle */}
            <HStack spacing={2}>
              <StyledButton size="sm" onClick={toggleOpen} flex="1" colorScheme="gray">
                Info
              </StyledButton>
              <StyledButton size="sm" onClick={onRulesOpen} flex="1" colorScheme="blue">
                Rules
              </StyledButton>
            </HStack>

            <Collapse in={isOpen} animateOpacity>
              <VStack align="stretch" spacing={3}>
                <Divider borderColor="gray.600" my={1} />
                
                {/* Current Player Section */}
                <HStack justify="space-between">
                  <Text color="gray.400" fontSize="sm">Current Player</Text>
                  <Text color="white" fontSize="sm" fontWeight="bold">
                    {currentPlayer?.name || 'N/A'}
                  </Text>
                </HStack>
                
                <Divider borderColor="gray.600" my={1} />
                
                {/* Game Settings Section */}
                <VStack align="stretch" spacing={1}>
                   <HStack justify="space-between">
                      <Text color="gray.400" fontSize="sm">Grid Size</Text>
                      <Text color="gray.300" fontSize="sm">{game.options.gridSize.width}x{game.options.gridSize.height}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.400" fontSize="sm">Turn Time</Text>
                      <Text color="gray.300" fontSize="sm">{game.options.turnTimeLimit}s</Text>
                    </HStack>
                    {'rocksPercentage' in game.options && (
                       <HStack justify="space-between">
                         <Text color="gray.400" fontSize="sm">Rocks</Text>
                         <Text color="gray.300" fontSize="sm">{(game.options as any).rocksPercentage}%</Text>
                       </HStack>
                    )}
                </VStack>

                <Divider borderColor="gray.600" my={1} />
                
                {/* Action Buttons */}
                <VStack spacing={2}>
                  {isMyTurn && (
                    <StyledButton size="sm" onClick={onPassTurn} w="full" colorScheme="orange">
                      Pass Turn
                    </StyledButton>
                  )}
                  <StyledButton size="sm" onClick={onBackToLobby} w="full" colorScheme="blue">
                    Back to Lobby
                  </StyledButton>
                  <StyledButton size="sm" colorScheme="red" onClick={onQuitGame} w="full">
                    Leave Game
                  </StyledButton>
                </VStack>
              </VStack>
            </Collapse>
          </VStack>
        </StyledBox>
      </Box>

      {/* Rules Modal */}
      <GameRulesModal
        isOpen={isRulesOpen}
        onClose={onRulesClose}
        gameType={game.type}
      />
    </>
  );
}; 