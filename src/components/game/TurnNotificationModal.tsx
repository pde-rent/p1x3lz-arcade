import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Fade,
} from '@chakra-ui/react';
import type { Player, Game } from '../../types/core-types';
import TransparentBox from '../common/TransparentBox';

interface TurnNotificationModalProps {
  currentPlayer: Player | null;
  game: Game;
  isVisible: boolean;
  onComplete: () => void;
}

export const TurnNotificationModal: React.FC<TurnNotificationModalProps> = ({
  currentPlayer,
  game,
  isVisible,
  onComplete,
}) => {
  useEffect(() => {
    if (isVisible) {
      // Auto-hide after 1.5 seconds (faster)
      const timer = setTimeout(() => {
        onComplete();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!currentPlayer || !isVisible) return null;

  // Use the actual turn number (now properly tracked per round)
  const turnNumber = game.currentTurn?.turnNumber || 1;

  return (
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      zIndex={1500}
      pointerEvents="none"
    >
      <TransparentBox
        p={8}
        minW="380px"
        textAlign="center"
      >
        <VStack spacing={4}>
          <Text fontSize="md" color="gray.300" textTransform="uppercase" letterSpacing="wider" fontWeight="semibold">
            Turn {turnNumber} Starts for
          </Text>
          <HStack spacing={3} justify="center" align="center">
            <Box
              w="20px"
              h="20px"
              bg={currentPlayer.color.hex}
              borderRadius="4px"
              border="1px solid rgba(255, 255, 255, 0.2)"
              flexShrink={0}
            />
            <Text fontSize="2xl" color="white" fontWeight="bold">
              {currentPlayer.name}
            </Text>
          </HStack>
        </VStack>
      </TransparentBox>
    </Box>
  );
}; 