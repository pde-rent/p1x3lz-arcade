import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  Divider,
} from '@chakra-ui/react';
import type { Player, PlayerScore } from '../../types/core-types';
import TransparentBox from '../common/TransparentBox';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  winCondition: {
    winners: Player[];
    reason: string;
  };
  players: Player[];
  scores: PlayerScore[];
}

// Position ranking colors
const POSITION_COLORS = {
  1: '#FFD700', // Gold
  2: '#C0C0C0', // Silver  
  3: '#CD7F32', // Bronze
  default: '#6B7280' // Grey for 4th+
} as const;

const POSITION_SUFFIXES = {
  1: 'st',
  2: 'nd', 
  3: 'rd',
  default: 'th'
} as const;

const getPositionText = (position: number): string => {
  const suffix = position <= 3 ? POSITION_SUFFIXES[position as 1|2|3] : POSITION_SUFFIXES.default;
  return `${position}${suffix}`;
};

const getPositionColor = (position: number): string => {
  return position <= 3 ? POSITION_COLORS[position as 1|2|3] : POSITION_COLORS.default;
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  winCondition,
  players,
  scores,
}) => {
  // Check if any local player won (since players share screen)
  const hasLocalWinner = winCondition.winners.some(winner => 
    players.find(p => p.id === winner.id)?.isLocal
  );

  // Always show Victory if any local player wins
  const title = hasLocalWinner ? 'Victory' : 'Defeat';
  const titleColor = hasLocalWinner ? 'blue.400' : 'red.500';
  
  const winnerText = winCondition.winners.length > 1
    ? `Tie: ${winCondition.winners.map(w => w.name).join(', ')}`
    : `Winner: ${winCondition.winners[0]?.name || 'N/A'}`;

  // Sort players by score for ranking (higher score = better position)
  // For Conquer game, sort by tiles owned (first element of rawScore)
  const sortedScores = [...scores].sort((a, b) => {
    const scoreA = a.rawScore[0] || 0;
    const scoreB = b.rawScore[0] || 0;
    return scoreB - scoreA; // Descending order
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl" motionPreset="none">
      <ModalOverlay bg="transparent" backdropFilter="blur(4px)" />
      <ModalContent bg="transparent" boxShadow="none" p={0}>
        <TransparentBox p={3} w="full">
          <ModalHeader textAlign="center">
            <Text
              fontFamily="'Tiny5', monospace"
              fontSize="8xl"
              fontWeight="bold"
              color={titleColor}
              textShadow="0 0 10px"
            >
              {title}
            </Text>
          </ModalHeader>
          <ModalBody textAlign="center" px={8}>
            <VStack spacing={6}>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="bold">
                  {winnerText}
                </Text>
                <Text fontSize="md" color="gray.400">
                  {winCondition.reason}
                </Text>
              </VStack>

              <Divider borderColor="gray.600" />

              {/* Score Table */}
              <VStack spacing={3} w="full">
                <Text fontSize="lg" fontWeight="bold" color="gray.200">
                  Final Scores
                </Text>
                <VStack spacing={2} w="full">
                  {sortedScores.map((score, index) => {
                    const position = index + 1;
                    const player = players.find(p => p.id === score.playerId);
                    const positionColor = getPositionColor(position);
                    const positionText = getPositionText(position);
                    
                    return (
                      <HStack
                        key={score.playerId}
                        w="full"
                        justify="space-between"
                        px={4}
                        py={2}
                        bg="rgba(255, 255, 255, 0.05)"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.600"
                      >
                        {/* Position */}
                        <HStack spacing={3} flex={1}>
                          <Text
                            fontSize="md"
                            fontWeight="bold"
                            color={positionColor}
                            minW="36px"
                            textAlign="left"
                          >
                            {positionText}
                          </Text>
                          
                          {/* Player color and name */}
                          <HStack spacing={2}>
                            <Box
                              w="16px"
                              h="16px"
                              bg={score.color}
                              borderRadius="3px"
                              border="1px solid rgba(255, 255, 255, 0.2)"
                              flexShrink={0}
                            />
                            <Text 
                              fontSize="md" 
                              color="white" 
                              fontWeight="medium"
                              textAlign="left"
                            >
                              {player?.name || 'Unknown'}
                            </Text>
                          </HStack>
                        </HStack>
                        
                        {/* Score */}
                        <Text 
                          fontSize="md" 
                          color="gray.300" 
                          fontWeight="bold"
                          textAlign="right"
                          minW="60px"
                        >
                          {score.displayText.split(': ')[1]}
                        </Text>
                      </HStack>
                    );
                  })}
                </VStack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center" p={8}>
            <Button colorScheme="blue" onClick={onClose} size="lg" px={10}>
              Continue
            </Button>
          </ModalFooter>
        </TransparentBox>
      </ModalContent>
    </Modal>
  );
}; 