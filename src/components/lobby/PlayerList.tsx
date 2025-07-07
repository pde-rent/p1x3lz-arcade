import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Spacer,
  useToast,
} from '@chakra-ui/react';
import type { Player, Game } from '../../types/core-types';

const MoreIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

interface PlayerListProps {
  game: Game;
  currentPlayerId: string;
  isHost: boolean;
  onAddLocalPlayer: () => void;
  onAddAIPlayer: () => void;
  onPlayerColorChange: (playerId: string, newColorHex: string) => void;
  onPlayerNameChange: (playerId: string, newName: string) => void;
  onKickPlayer: (playerId: string) => void;
  onMutePlayer: (playerId: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  game,
  currentPlayerId,
  isHost,
  onAddLocalPlayer,
  onAddAIPlayer,
  onPlayerColorChange,
  onPlayerNameChange,
  onKickPlayer,
  onMutePlayer,
}) => {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const toast = useToast();

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, player: Player) => {
    onPlayerColorChange(player.id, e.target.value);
  };

  const handleEditNameStart = (player: Player) => {
    if (isHost && (player.isLocal || player.isAI)) {
      setEditingPlayerId(player.id);
      setEditingName(player.name);
    }
  };

  const handleEditNameConfirm = () => {
    if (!editingPlayerId) return;

    const trimmedName = editingName.trim();
    if (trimmedName.length > 0 && trimmedName.length <= 16) {
      onPlayerNameChange(editingPlayerId, trimmedName);
    } else {
      toast({
        title: 'Invalid Name',
        description: 'Name must be between 1 and 16 characters.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
    setEditingPlayerId(null);
  };

  const totalSlots = game.options.maxPlayers || 4;
  const canAddPlayer = game.players.length < totalSlots;

  return (
    <VStack align="stretch" gap={2}>
      <HStack>
        <Text fontSize="xl" fontWeight="medium">
          Players ({game.players.length}/{totalSlots})
        </Text>
      </HStack>
      
      {Array.from({ length: totalSlots }, (_, i) => {
        const player = game.players[i];
        const isEmpty = !player;
        
        // Determine if this player's color can be changed
        const canChangeColor = !isEmpty && player.color?.hex && (isHost || player.id === currentPlayerId);
        
        return (
          <HStack
            key={i}
            p={3}
            border="1px solid"
            borderColor="gray.600"
            borderRadius="md"
            justify="space-between"
            minH="56px"
            bg={isEmpty ? 'transparent' : 'gray.700'}
            opacity={isEmpty ? 0.6 : 1}
            sx={{
              _hover: !isEmpty ? {
                bg: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'gray.500'
              } : {}
            }}
          >
            {isEmpty && isHost ? (
              // Empty slot with Add Player/AI buttons
              <HStack gap={2} w="100%">
                <Text color="gray.500" fontWeight="bold" fontSize="md">
                  Empty Slot
                </Text>
                <Spacer />
                <HStack gap={2}>
                  <Button 
                    size="xs" 
                    variant="outline" 
                    onClick={onAddLocalPlayer} 
                    isDisabled={!canAddPlayer}
                    leftIcon={<span style={{ fontSize: '12px' }}>+</span>}
                  >
                    Local
                  </Button>
                  <Button 
                    size="xs" 
                    variant="outline" 
                    onClick={onAddAIPlayer} 
                    isDisabled={true}
                    leftIcon={<span style={{ fontSize: '12px' }}>+</span>}
                  >
                    IA
                  </Button>
                </HStack>
              </HStack>
            ) : isEmpty ? (
              // Empty slot for non-hosts
              <HStack gap={3}>
                <Text color="gray.500" fontWeight="bold" fontSize="md">
                  Empty Slot
                </Text>
              </HStack>
            ) : (
              // Player slot
              <>
                <HStack gap={3}>
                  {player.color?.hex && (
                    <Box
                      as="label"
                      cursor={canChangeColor ? 'pointer' : 'default'}
                      w="24px"
                      h="24px"
                      borderRadius="md"
                      bg={player.color.hex}
                      border="1px solid"
                      borderColor="gray.500"
                      position="relative"
                      _hover={{ borderColor: canChangeColor ? 'gray.400' : 'gray.500' }}
                      title={canChangeColor ? 'Click to change color' : ''}
                    >
                      {canChangeColor && (
                        <Input
                          type="color"
                          className="color-picker-input"
                          title="Change color"
                          value={player.color.hex}
                          onChange={(e) => handleColorChange(e, player)}
                          position="absolute"
                          w="100%"
                          h="100%"
                          opacity={0}
                          cursor="pointer"
                        />
                      )}
                    </Box>
                  )}

                  {editingPlayerId === player.id ? (
                    <Input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={handleEditNameConfirm}
                      onKeyDown={e => e.key === 'Enter' && handleEditNameConfirm()}
                      size="sm"
                      autoFocus
                      variant="flushed"
                    />
                  ) : (
                    <Text
                      color="white"
                      fontWeight="bold"
                      fontSize="md"
                      onClick={() => handleEditNameStart(player)}
                      cursor={isHost && (player.isLocal || player.isAI) ? 'pointer' : 'default'}
                      _hover={
                        isHost && (player.isLocal || player.isAI)
                          ? { color: 'blue.300' }
                          : {}
                      }
                    >
                      {player.name}
                    </Text>
                  )}

                  {player.isReady && (
                     <Badge variant="solid" colorScheme="green" fontSize="xs">
                      READY
                    </Badge>
                  )}
                </HStack>
                
                {isHost && player.id !== currentPlayerId && (
                  <Menu>
                    <MenuButton 
                      as={IconButton} 
                      icon={<MoreIcon />}
                      size="sm"
                      variant="ghost"
                    />
                    <MenuList>
                      <MenuItem onClick={() => onKickPlayer(player.id)}>Kick Player</MenuItem>
                      <MenuItem onClick={() => onMutePlayer(player.id)}>
                        {player.isMuted ? 'Unmute' : 'Mute'} Player
                      </MenuItem>
                    </MenuList>
                  </Menu>
                )}
                
                {player.id === game.createdBy && !isHost && (
                  <Badge variant="outline" colorScheme="yellow" fontSize="xs">
                    HOST
                  </Badge>
                )}
              </>
            )}
          </HStack>
        );
      })}
    </VStack>
  );
};

export default PlayerList; 