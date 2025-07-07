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
} from '@chakra-ui/react';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWinner: boolean;
  winCondition: {
    winners: { name: string }[];
    reason: string;
  };
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  isWinner,
  winCondition,
}) => {
  const title = isWinner ? 'Victory' : 'Defeat';
  const titleColor = isWinner ? 'blue.400' : 'red.500';
  const winnerText =
    winCondition.winners.length > 1
      ? `Tie: ${winCondition.winners.map(w => w.name).join(', ')}`
      : `Winner: ${winCondition.winners[0]?.name || 'N/A'}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="2xl">
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg="gray.800" border="1px solid" borderColor="gray.600">
        <ModalHeader textAlign="center" p={8}>
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
          <VStack spacing={2}>
            <Text fontSize="xl" fontWeight="bold">
              {winnerText}
            </Text>
            <Text fontSize="md" color="gray.400">
              {winCondition.reason}
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center" p={8}>
          <Button colorScheme="blue" onClick={onClose} size="lg" px={10}>
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 