import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Box,
  Text,
  SimpleGrid,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Select,
  Divider,
  HStack,
  Button,
} from '@chakra-ui/react';
import {
  GameType,
  DEFAULT_TURN_TIME_LIMITS,
  type GameOptions,
  type ConquerOptions,
} from '../../types/core-types';

interface GameOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
  initialOptions: GameOptions & Partial<ConquerOptions>;
  onSave: (options: GameOptions) => void;
}

const GameOptionsModal: React.FC<GameOptionsModalProps> = ({
  isOpen,
  onClose,
  gameType,
  initialOptions,
  onSave,
}) => {
  const [tempOptions, setTempOptions] = useState<GameOptions & Partial<ConquerOptions>>(initialOptions);

  // Reset temp options when modal opens
  useEffect(() => {
    if (isOpen) setTempOptions(initialOptions);
  }, [isOpen, initialOptions]);

  /* ----------------------------- Validation ---------------------------- */
  const validateOptions = (options: GameOptions): string[] => {
    const errors: string[] = [];
    if (options.gridSize.width < 4 || options.gridSize.width > 64) {
      errors.push('Grid width must be between 4 and 64');
    }
    if (options.gridSize.height < 4 || options.gridSize.height > 64) {
      errors.push('Grid height must be between 4 and 64');
    }
    if (options.minPlayers < 2 || options.minPlayers > options.maxPlayers) {
      errors.push('Min players must be at least 2 and not exceed max players');
    }
    if (options.maxPlayers < options.minPlayers || options.maxPlayers > 8) {
      errors.push('Max players must be between min players and 8');
    }
    if (options.gameSpeed < 0.5 || options.gameSpeed > 2.0) {
      errors.push('Game speed must be between 0.5x and 2.0x');
    }
    if (options.gameTimeLimit !== undefined && options.gameTimeLimit < 5) {
      errors.push('Game time limit must be at least 5 minutes');
    }
    return errors;
  };

  const errors = validateOptions(tempOptions);

  /* ------------------------------ Updates ------------------------------ */
  const updateTempOption = <K extends keyof GameOptions>(key: K, value: GameOptions[K]) => {
    setTempOptions({ ...tempOptions, [key]: value });
  };

  const updateTempConquerOption = <K extends keyof ConquerOptions>(
    key: K,
    value: ConquerOptions[K]
  ) => {
    setTempOptions({ ...tempOptions, [key]: value });
  };

  /* ------------------------------ Render ------------------------------ */
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" border="1px solid" borderColor="gray.600" maxH="90vh">
        <ModalHeader color="blue.300" fontFamily="Tiny5" fontSize="2xl">
          Game Options
        </ModalHeader>
        <ModalCloseButton color="gray.300" />
        <ModalBody pb={6} overflowY="auto">
          <VStack gap={6} align="stretch">
            {/* Grid Configuration */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color="blue.300">
                Grid Configuration
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Grid Width</FormLabel>
                  <NumberInput
                    value={tempOptions.gridSize.width}
                    min={4}
                    max={64}
                    onChange={(_, value) =>
                      updateTempOption('gridSize', { ...tempOptions.gridSize, width: value })
                    }
                  >
                    <NumberInputField bg="transparent" border="1px solid" borderColor="gray.600" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Grid Height</FormLabel>
                  <NumberInput
                    value={tempOptions.gridSize.height}
                    min={4}
                    max={64}
                    onChange={(_, value) =>
                      updateTempOption('gridSize', { ...tempOptions.gridSize, height: value })
                    }
                  >
                    <NumberInputField bg="transparent" border="1px solid" borderColor="gray.600" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              <Text fontSize="xs" color="gray.400" mt={2}>
                Current: {tempOptions.gridSize.width}×{tempOptions.gridSize.height} (
                {tempOptions.gridSize.width * tempOptions.gridSize.height} cells)
              </Text>
            </Box>

            <Divider />

            {/* Player Configuration */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color="blue.300">
                Player Configuration
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Min Players</FormLabel>
                  <NumberInput
                    value={tempOptions.minPlayers}
                    min={2}
                    max={tempOptions.maxPlayers}
                    onChange={(_, value) => updateTempOption('minPlayers', value)}
                  >
                    <NumberInputField bg="transparent" border="1px solid" borderColor="gray.600" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Max Players</FormLabel>
                  <NumberInput
                    value={tempOptions.maxPlayers}
                    min={tempOptions.minPlayers}
                    max={8}
                    onChange={(_, value) => updateTempOption('maxPlayers', value)}
                  >
                    <NumberInputField bg="transparent" border="1px solid" borderColor="gray.600" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* Timing Configuration */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color="blue.300">
                Timing Configuration
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm">Turn Time Limit (seconds)</FormLabel>
                  <Select
                    value={tempOptions.turnTimeLimit}
                    onChange={(e) => updateTempOption('turnTimeLimit', parseInt(e.target.value))}
                    bg="transparent"
                    border="1px solid"
                    borderColor="gray.600"
                  >
                    {DEFAULT_TURN_TIME_LIMITS.map((limit) => (
                      <option key={limit} value={limit}>
                        {limit}s {limit === 30 ? '(Default)' : ''}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Game Time Limit (minutes)</FormLabel>
                  <Select
                    value={tempOptions.gameTimeLimit ?? 'unlimited'}
                    onChange={(e) =>
                      updateTempOption(
                        'gameTimeLimit',
                        e.target.value === 'unlimited' ? undefined : parseInt(e.target.value)
                      )
                    }
                  >
                    <option value="unlimited">Unlimited</option>
                    <option value="10">10 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              <FormControl mt={4}>
                <FormLabel fontSize="sm">Game Speed: {tempOptions.gameSpeed}x</FormLabel>
                <Slider
                  value={tempOptions.gameSpeed}
                  onChange={(value) => updateTempOption('gameSpeed', value)}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>
            </Box>

            <Divider />

            {/* Game Features */}
            <Box>
              <Text fontSize="lg" fontWeight="bold" mb={3} color="blue.300">
                Game Features
              </Text>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0}>
                    Allow Spectators
                  </FormLabel>
                  <Switch
                    isChecked={tempOptions.allowSpectators}
                    onChange={(e) => updateTempOption('allowSpectators', e.target.checked)}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0}>
                    Allow AI Players
                  </FormLabel>
                  <Switch
                    isChecked={tempOptions.allowAI}
                    onChange={(e) => updateTempOption('allowAI', e.target.checked)}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0}>
                    Enable Chat
                  </FormLabel>
                  <Switch
                    isChecked={tempOptions.allowChat}
                    onChange={(e) => updateTempOption('allowChat', e.target.checked)}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0}>
                    Private Game
                  </FormLabel>
                  <Switch
                    isChecked={tempOptions.isPrivate}
                    onChange={(e) => updateTempOption('isPrivate', e.target.checked)}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0}>
                    Team Mode
                  </FormLabel>
                  <Switch
                    isChecked={tempOptions.teamMode}
                    onChange={(e) => updateTempOption('teamMode', e.target.checked)}
                  />
                </FormControl>
                <FormControl display="flex" alignItems="center">
                  <FormLabel fontSize="sm" mb={0}>
                    Ranked Game
                  </FormLabel>
                  <Switch
                    isChecked={tempOptions.isRanked}
                    onChange={(e) => updateTempOption('isRanked', e.target.checked)}
                  />
                </FormControl>
              </SimpleGrid>
            </Box>

            {/* Conquer Specific */}
            {gameType === GameType.CONQUER && (
              <>
                <Divider />
                <Box>
                  <Text fontSize="lg" fontWeight="bold" mb={3} color="orange.300">
                    Conquer Options
                  </Text>
                  <VStack gap={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">
                        Rocks Percentage: {(tempOptions as ConquerOptions).rocksPercentage}%
                      </FormLabel>
                      <Slider
                        value={(tempOptions as ConquerOptions).rocksPercentage}
                        onChange={(v) => updateTempConquerOption('rocksPercentage', v)}
                        min={0}
                        max={50}
                        step={5}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">Turn Blocks (cells per turn)</FormLabel>
                      <NumberInput
                        value={(tempOptions as ConquerOptions).turnBlocks}
                        min={1}
                        max={4}
                        onChange={(_, v) => updateTempConquerOption('turnBlocks', v)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm">
                        Max Neutral Edges: {(tempOptions as ConquerOptions).maxNeutralEdges}
                      </FormLabel>
                      <Text fontSize="xs" color="gray.400" mb={2}>
                        Maximum grid edges that can count as region boundaries (0 = no edges allowed, 20 = very permissive)
                      </Text>
                      <Slider
                        value={(tempOptions as ConquerOptions).maxNeutralEdges}
                        onChange={(v) => updateTempConquerOption('maxNeutralEdges', v)}
                        min={0}
                        max={20}
                        step={1}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                    </FormControl>
                  </VStack>
                </Box>
              </>
            )}

            {/* Validation */}
            {errors.length > 0 && (
              <Box p={3} bg="red.900" borderRadius="md" border="1px solid" borderColor="red.600">
                <Text fontSize="sm" fontWeight="bold" color="red.300" mb={2}>
                  Please fix the following issues:
                </Text>
                <VStack align="start" gap={1}>
                  {errors.map((err, idx) => (
                    <Text key={idx} fontSize="xs" color="red.200">
                      • {err}
                    </Text>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Actions */}
            <HStack gap={3} justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={() => onSave(tempOptions)} isDisabled={errors.length > 0}>
                Save Options
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GameOptionsModal; 