import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  UnorderedList,
  ListItem,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { GameType } from '../../types/core-types';
import TransparentBox from '../common/TransparentBox';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
}

const GameRulesModal: React.FC<GameRulesModalProps> = ({ isOpen, onClose, gameType }) => {
  const renderConquerRules = () => (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          🎯 Objective
        </Text>
        <Text color="gray.300">
          Control the majority of the grid (&gt;50% of total cells) by claiming territory and capturing regions.
        </Text>
      </Box>

      <Divider />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          🎮 Basic Gameplay
        </Text>
        <UnorderedList spacing={1} color="gray.300">
          <ListItem>Take turns placing tiles on empty cells</ListItem>
          <ListItem>Click on any empty cell to claim it in your color</ListItem>
          <ListItem>Build strategic patterns to create enclosed regions</ListItem>
          <ListItem>Capture opponent territories through smart positioning</ListItem>
        </UnorderedList>
      </Box>

      <Divider />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          🏰 Region Capture Rules
        </Text>
        <VStack align="stretch" spacing={2}>
          <Box>
            <Badge colorScheme="blue" mb={1}>Key Rule</Badge>
            <Text color="gray.300" fontSize="sm">
              Regions are only captured when completely surrounded by your own tiles or rocks.
            </Text>
          </Box>
          <Box>
            <Badge colorScheme="yellow" mb={1}>Edge Rule</Badge>
            <Text color="gray.300" fontSize="sm">
              Grid edges count as boundaries up to the "Max Neutral Edges" limit (configurable in game options).
            </Text>
          </Box>
          <Box>
            <Badge colorScheme="green" mb={1}>Bonus</Badge>
            <Text color="gray.300" fontSize="sm">
              Any opponent tiles (orphans) within a captured region are converted to you.
            </Text>
          </Box>
        </VStack>
      </Box>

      <Divider />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          ⚡ Detailed Mechanics
        </Text>
        <UnorderedList spacing={1} color="gray.300" fontSize="sm">
          <ListItem><strong>Complete Enclosure Required:</strong> A region must be completely surrounded by your tiles or rocks</ListItem>
          <ListItem><strong>Flexible Edge Boundaries:</strong> Grid edges count as boundaries up to the "Max Neutral Edges" limit (default: 6)</ListItem>
          <ListItem><strong>Opponent Tile Capture:</strong> Enemy tiles trapped within your enclosed region are converted to you</ListItem>
          <ListItem><strong>Immediate Score Impact:</strong> Scores update instantly when regions are captured</ListItem>
          <ListItem><strong>Multi-Cell Regions:</strong> Large enclosed areas are captured as a single region</ListItem>
          <ListItem><strong>Nested Regions:</strong> Smaller regions within larger territories can be captured independently</ListItem>
        </UnorderedList>
      </Box>

      <Divider />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          🏆 Victory Conditions
        </Text>
        <UnorderedList spacing={1} color="gray.300">
          <ListItem><strong>Majority Control:</strong> Control &gt;50% of the grid</ListItem>
          <ListItem><strong>Elimination:</strong> All other players surrender</ListItem>
          <ListItem><strong>Time Limit:</strong> Highest score when time expires</ListItem>
          <ListItem><strong>Grid Full:</strong> Most territory when no moves remain</ListItem>
        </UnorderedList>
      </Box>

      <Divider />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          💡 Strategy Tips
        </Text>
        <UnorderedList spacing={1} color="gray.300" fontSize="sm">
          <ListItem>Consider the "Max Neutral Edges" limit when planning near grid edges</ListItem>
          <ListItem>Use rocks as natural boundaries for easier enclosure</ListItem>
          <ListItem>Block opponent expansion routes when possible</ListItem>
          <ListItem>Look for opportunities to capture multiple opponent tiles</ListItem>
          <ListItem>Create multiple smaller regions rather than one large one</ListItem>
        </UnorderedList>
      </Box>
    </VStack>
  );

  const renderRulesContent = () => {
    switch (gameType) {
      case GameType.CONQUER:
        return renderConquerRules();
      default:
        return (
          <Text color="gray.300">
            Rules for {gameType} are not yet available.
          </Text>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" motionPreset="none">
      <ModalOverlay bg="transparent" backdropFilter="blur(4px)" />
      <ModalContent bg="transparent" boxShadow="none" p={0}>
        <TransparentBox p={3} w="full">
          <ModalHeader>
            <HStack>
              <Text>📖 Game Rules</Text>
              <Badge colorScheme="blue" variant="subtle">
                {gameType.toUpperCase()}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {renderRulesContent()}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Got it!
            </Button>
          </ModalFooter>
        </TransparentBox>
      </ModalContent>
    </Modal>
  );
};

export default GameRulesModal; 