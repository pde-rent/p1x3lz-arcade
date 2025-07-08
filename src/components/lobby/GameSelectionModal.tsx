import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Button,
  SimpleGrid
} from '@chakra-ui/react';
import { GameType } from '../../types/core-types';
import TransparentBox from '../common/TransparentBox';

interface GameSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
  onSave: () => void;
  isHost: boolean;
}

// Game info for selection modal
const GAME_INFO = {
  [GameType.CONQUER]: {
    name: 'Conquer',
    icon: '⚔️',
    description: 'Conquer the map by capturing regions',
    implemented: true
  },
  [GameType.CHESS]: {
    name: 'Chess',
    icon: '♟️',
    description: 'OG turn-based strategy game',
    implemented: false
  },
  [GameType.SNAKE]: {
    name: 'Snake',
    icon: '🐍',
    description: 'Multiplayer snake battle royale',
    implemented: false
  },
  BOMBER: {
    name: 'Bomber',
    icon: '💣',
    description: 'Plant bombs and destroy opponents',
    implemented: false
  }
} as const;

export const GameSelectionModal: React.FC<GameSelectionModalProps> = ({
  isOpen,
  onClose,
  currentGameType,
  onGameTypeChange,
  onSave,
  isHost
}) => {
  const [tempGameType, setTempGameType] = React.useState<GameType>(currentGameType);

  React.useEffect(() => {
    if (isOpen) {
      setTempGameType(currentGameType);
    }
  }, [isOpen, currentGameType]);

  const handleGameTypeClick = (gameType: GameType) => {
    if (!isHost) return;
    // For now, only allow Conquer
    if (gameType !== GameType.CONQUER) return;
    
    setTempGameType(gameType);
    onGameTypeChange(gameType);
  };

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleClose = () => {
    setTempGameType(currentGameType);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" motionPreset="none">
      <ModalOverlay bg="transparent" backdropFilter="blur(4px)" />
      <ModalContent bg="transparent" boxShadow="none" p={0}>
        <TransparentBox p={3} w="full">
          <ModalHeader color="blue.300" fontFamily="Tiny5" fontSize="2xl">
            Select Game Type
          </ModalHeader>
          <ModalCloseButton color="gray.300" />
          <ModalBody pb={6}>
            <VStack gap={4} align="stretch">
              <Text fontSize="sm" color="gray.400" mb={2}>
                Choose a game type for your lobby. Only implemented games can be selected.
              </Text>
              
              <SimpleGrid columns={1} spacing={3}>
                {/* Conquer */}
                <Box
                  p={4}
                  border="2px solid"
                  borderColor={tempGameType === GameType.CONQUER ? 'blue.400' : 'gray.600'}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleGameTypeClick(GameType.CONQUER)}
                  bg={tempGameType === GameType.CONQUER ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
                  _hover={{
                    borderColor: 'blue.400',
                    bg: 'rgba(59, 130, 246, 0.05)'
                  }}
                >
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Text fontSize="2xl">{GAME_INFO[GameType.CONQUER].icon}</Text>
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold" color="white">
                          {GAME_INFO[GameType.CONQUER].name}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          {GAME_INFO[GameType.CONQUER].description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge variant="solid" colorScheme="green" fontSize="xs">
                      Available
                    </Badge>
                  </HStack>
                </Box>

                {/* Chess */}
                <Box
                  p={4}
                  border="2px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  cursor="not-allowed"
                  bg="gray.700"
                  opacity={0.6}
                >
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Text fontSize="2xl">{GAME_INFO[GameType.CHESS].icon}</Text>
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold" color="gray.300">
                          {GAME_INFO[GameType.CHESS].name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {GAME_INFO[GameType.CHESS].description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge variant="solid" colorScheme="orange" fontSize="xs">
                      Soon
                    </Badge>
                  </HStack>
                </Box>

                {/* Snake */}
                <Box
                  p={4}
                  border="2px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  cursor="not-allowed"
                  bg="gray.700"
                  opacity={0.6}
                >
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Text fontSize="2xl">{GAME_INFO[GameType.SNAKE].icon}</Text>
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold" color="gray.300">
                          {GAME_INFO[GameType.SNAKE].name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {GAME_INFO[GameType.SNAKE].description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge variant="solid" colorScheme="orange" fontSize="xs">
                      Soon
                    </Badge>
                  </HStack>
                </Box>

                {/* Bomber */}
                <Box
                  p={4}
                  border="2px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  cursor="not-allowed"
                  bg="gray.700"
                  opacity={0.6}
                >
                  <HStack justify="space-between">
                    <HStack gap={3}>
                      <Text fontSize="2xl">{GAME_INFO.BOMBER.icon}</Text>
                      <VStack align="start" gap={1}>
                        <Text fontWeight="bold" color="gray.300">
                          {GAME_INFO.BOMBER.name}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {GAME_INFO.BOMBER.description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge variant="solid" colorScheme="orange" fontSize="xs">
                      Soon
                    </Badge>
                  </HStack>
                </Box>
              </SimpleGrid>

              {/* Action Buttons */}
              <HStack gap={3} justify="flex-end" mt={4}>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleSave}
                  isDisabled={!tempGameType || tempGameType === currentGameType}
                >
                  Change Game Type
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </TransparentBox>
      </ModalContent>
    </Modal>
  );
};

export default GameSelectionModal; 