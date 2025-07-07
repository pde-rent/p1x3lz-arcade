# Unified Lobby System

## Overview

The P1x3lz lobby system uses a unified design pattern that serves both **Main Lobby** (platform-wide) and **Game Lobby** (game-specific) functions. This approach maximizes component reuse while providing context-specific functionality through configuration.

## Core Concept: Unified Lobby Pattern

Both lobby types share the same fundamental structure:

| Component | Main Lobby | Game Lobby |
|-----------|------------|------------|
| **Search List** | Searchable game list | Searchable player list |
| **Type Filter** | Filter by game type | Game type selector (host) / display (player) |
| **Options Panel** | Player preferences | Game options (host) / read-only (player) |
| **Chat System** | Global platform chat | Game-specific chat |
| **Action Button** | "Play!" (join/create) | "Ready!" / "Start!" / "Cancel!" |

## Layout Structure

### 3-Panel Unified Design
- **Top Left Panel (4/5 width)**: Primary list (games or players)
- **Bottom Left Panel (4/5 width)**: Chat system
- **Right Panel (1/5 width)**: Controls and options

### Header
- **Title**: "Lobby" or "{GameName}"
- **Navigation**: Back button for game lobby
- **Status**: Connection status, player count

## State Management

### Unified Lobby State
```typescript
interface LobbyState {
  // Context
  lobbyType: 'main' | 'game';
  gameId?: string; // Only for game lobby
  
  // Lists
  items: Map<string, LobbyItem>; // Games or Players
  filteredItems: LobbyItem[];
  searchQuery: string;
  
  // Filters
  typeFilter: GameType | 'all';
  statusFilter: ItemStatus | 'all';
  sortOrder: SortOrder;
  
  // Chat
  chat: ChatHistory;
  chatInput: string;
  
  // User State
  currentUser: Player;
  userRole: 'host' | 'player' | 'observer';
  
  // Options
  editingOptions: boolean;
  options: LobbyOptions;
  
  // Actions
  primaryAction: ActionState;
  secondaryActions: ActionState[];
}

interface LobbyItem {
  id: string;
  name: string;
  type: GameType | 'player';
  status: ItemStatus;
  metadata: Record<string, any>;
  color?: string;
  isReady?: boolean;
  isHost?: boolean;
  isAI?: boolean;
}

enum ItemStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  READY = 'ready',
  NOT_READY = 'not_ready',
  OFFLINE = 'offline'
}

interface ActionState {
  label: string;
  action: () => void;
  enabled: boolean;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: string;
}
```

### Context-Specific Configurations

#### Main Lobby Configuration
```typescript
const mainLobbyConfig: LobbyConfig = {
  lobbyType: 'main',
  leftPanel: {
    title: 'Active Games',
    itemType: 'game',
    searchPlaceholder: 'Search games...',
    emptyMessage: 'No games available',
    showCreateButton: true,
    createButtonLabel: '+ Create'
  },
  rightPanel: {
    title: 'Player Options',
    showTypeFilter: true,
    showOptions: true,
    optionsReadOnly: false
  },
  chat: {
    title: 'Global Chat',
    chatId: 'global'
  },
  primaryAction: {
    label: 'Play!',
    action: 'joinRandomGame'
  }
};
```

#### Game Lobby Configuration
```typescript
const gameLobbyConfig: LobbyConfig = {
  lobbyType: 'game',
  leftPanel: {
    title: 'Players',
    itemType: 'player',
    searchPlaceholder: 'Search players...',
    emptyMessage: 'Waiting for players...',
    showCreateButton: true,
    createButtonLabel: '+ Add AI'
  },
  rightPanel: {
    title: 'Game Options',
    showTypeFilter: true,
    showOptions: true,
    optionsReadOnly: !isHost
  },
  chat: {
    title: 'Game Chat',
    chatId: gameId
  },
  primaryAction: {
    label: isHost ? 'Start!' : 'Ready!',
    action: isHost ? 'startGame' : 'toggleReady'
  }
};
```

## Component Architecture

### Lobby Component
```typescript
interface LobbyProps {
  config: LobbyConfig;
  state: LobbyState;
  onStateChange: (state: LobbyState) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  config,
  state,
  onStateChange
}) => {
  return (
    <VStack h="100vh" gap={0}>
      <LobbyHeader config={config} state={state} />
      
      <HStack flex={1} gap={0}>
        <LeftPanel config={config.leftPanel} state={state} />
        <CenterPanel config={config.chat} state={state} />
        <RightPanel config={config.rightPanel} state={state} />
      </HStack>
    </VStack>
  );
};
```

### Left Panel - Item List
```typescript
const LeftPanel: React.FC<LeftPanelProps> = ({ config, state }) => {
  const filteredItems = useMemo(() => {
    return state.items.values()
      .filter(item => matchesSearch(item, state.searchQuery))
      .filter(item => matchesTypeFilter(item, state.typeFilter))
      .sort((a, b) => sortItems(a, b, state.sortOrder));
  }, [state.items, state.searchQuery, state.typeFilter, state.sortOrder]);

  return (
    <VStack w="60%" h="full" p={4} bg="gray.900">
      <HStack w="full" justify="space-between">
        <Heading size="md" fontFamily="Tiny5" color="white">
          {config.title} ({filteredItems.length})
        </Heading>
        
        {config.showCreateButton && (
          <Button
            size="sm"
            onClick={handleCreate}
            leftIcon={<AddIcon />}
          >
            {config.createButtonLabel}
          </Button>
        )}
      </HStack>
      
      <Input
        placeholder={config.searchPlaceholder}
        value={state.searchQuery}
        onChange={handleSearchChange}
        bg="gray.800"
      />
      
      <ScrollArea flex={1} w="full">
        {filteredItems.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={8}>
            {config.emptyMessage}
          </Text>
        ) : (
          filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              config={config}
              onClick={() => handleItemClick(item)}
            />
          ))
        )}
      </ScrollArea>
    </VStack>
  );
};
```

### Center Panel - Chat System
```typescript
const CenterPanel: React.FC<CenterPanelProps> = ({ config, state }) => {
  return (
    <VStack w="20%" h="full" p={4} bg="gray.800">
      <Heading size="sm" fontFamily="Tiny5" color="white">
        {config.title}
      </Heading>
      
      <ScrollArea flex={1} w="full">
        {state.chat.messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </ScrollArea>
      
      <HStack w="full">
        <Input
          placeholder="Type a message..."
          value={state.chatInput}
          onChange={handleChatInput}
          onKeyPress={handleChatSubmit}
          size="sm"
          bg="gray.700"
        />
        <IconButton
          icon={<SendIcon />}
          onClick={handleSendMessage}
          size="sm"
          aria-label="Send message"
        />
      </HStack>
    </VStack>
  );
};
```

### Right Panel - Controls & Options
```typescript
const RightPanel: React.FC<RightPanelProps> = ({ config, state }) => {
  return (
    <VStack w="20%" h="full" p={4} bg="gray.700">
      <Heading size="sm" fontFamily="Tiny5" color="white">
        {config.title}
      </Heading>
      
      {config.showTypeFilter && (
        <FormControl>
          <FormLabel fontSize="sm">Game Type</FormLabel>
          <Select
            value={state.typeFilter}
            onChange={handleTypeFilterChange}
            size="sm"
            bg="gray.600"
          >
            <option value="all">All Types</option>
            <option value="conquer">Conquer</option>
          </Select>
        </FormControl>
      )}
      
      {config.showOptions && (
        <VStack gap={2} w="full">
          <Button
            onClick={handleEditOptions}
            isDisabled={config.optionsReadOnly}
            size="sm"
            w="full"
          >
            {config.optionsReadOnly ? 'View Options' : 'Edit Options'}
          </Button>
          
          {state.editingOptions && (
            <OptionsEditor
              options={state.options}
              readOnly={config.optionsReadOnly}
              onSave={handleSaveOptions}
              onCancel={handleCancelOptions}
            />
          )}
        </VStack>
      )}
      
      <Spacer />
      
      <VStack gap={2} w="full">
        <Button
          onClick={state.primaryAction.action}
          isDisabled={!state.primaryAction.enabled}
          colorScheme={state.primaryAction.variant === 'primary' ? 'blue' : 'red'}
          fontFamily="Tiny5"
          fontSize="lg"
          w="full"
        >
          {state.primaryAction.label}
        </Button>
        
        {state.secondaryActions.map(action => (
          <Button
            key={action.label}
            onClick={action.action}
            isDisabled={!action.enabled}
            variant="outline"
            size="sm"
            w="full"
          >
            {action.label}
          </Button>
        ))}
      </VStack>
    </VStack>
  );
};
```

## Item Card Components

### Game Card (Main Lobby)
```typescript
const GameCard: React.FC<GameCardProps> = ({ item, onClick }) => {
  const game = item.metadata as Game;
  
  return (
    <HStack
      p={3}
      bg="gray.800"
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      _hover={{ bg: "gray.700" }}
      w="full"
    >
      <VStack alignItems="start" flex={1} gap={1}>
        <HStack>
          <Text fontWeight="bold" color="white">
            {game.name}
          </Text>
          <Badge colorScheme="blue" size="sm">
            {game.type}
          </Badge>
        </HStack>
        
        <HStack gap={4} fontSize="sm" color="gray.400">
          <Text>Players: {game.players.length}/{game.maxPlayers}</Text>
          <Text>Status: {game.status}</Text>
          <Text>Grid: {game.options.gridWidth}×{game.options.gridHeight}</Text>
        </HStack>
      </VStack>
      
      <VStack alignItems="end" gap={1}>
        <Text fontSize="xs" color="gray.500">
          {formatTimeAgo(game.createdAt)}
        </Text>
        <Button size="xs" colorScheme="green">
          Join
        </Button>
      </VStack>
    </HStack>
  );
};
```

### Player Card (Game Lobby)
```typescript
const PlayerCard: React.FC<PlayerCardProps> = ({ item, onClick }) => {
  const player = item.metadata as Player;
  
  return (
    <HStack
      p={3}
      bg={player.color + '20'}
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      w="full"
    >
      <Box
        w={4}
        h={4}
        bg={player.color}
        borderRadius="full"
      />
      
      <VStack alignItems="start" flex={1} gap={0}>
        <Text fontWeight="bold" color="white">
          {player.name}
        </Text>
        <HStack gap={2}>
          {player.isHost && (
            <Badge colorScheme="yellow" size="sm">HOST</Badge>
          )}
          {player.type === 'ai' && (
            <Badge colorScheme="purple" size="sm">AI</Badge>
          )}
          {player.isReady && (
            <Badge colorScheme="green" size="sm">READY</Badge>
          )}
        </HStack>
      </VStack>
      
      {player.isHost && (
        <Menu>
          <MenuButton as={IconButton} size="sm" variant="ghost">
            <MoreIcon />
          </MenuButton>
          <MenuList>
            <MenuItem>Transfer Host</MenuItem>
            <MenuItem>Mute Player</MenuItem>
            <MenuItem>Kick Player</MenuItem>
          </MenuList>
        </Menu>
      )}
    </HStack>
  );
};
```

## Options System

### Universal Options Editor
```typescript
const OptionsEditor: React.FC<OptionsEditorProps> = ({
  options,
  readOnly,
  onSave,
  onCancel
}) => {
  return (
    <VStack gap={4} w="full" p={4} bg="gray.600" borderRadius="md">
      <Heading size="sm" color="white">
        {readOnly ? 'Game Options' : 'Edit Options'}
      </Heading>
      
      {/* Universal Options */}
      <FormControl>
        <FormLabel fontSize="sm">Game Speed</FormLabel>
        <Slider
          value={options.gameSpeed}
          onChange={handleSpeedChange}
          min={0.5}
          max={2.0}
          step={0.1}
          isDisabled={readOnly}
        >
          <SliderTrack><SliderFilledTrack /></SliderTrack>
          <SliderThumb />
        </Slider>
        <Text fontSize="xs" color="gray.400">
          {options.gameSpeed}x speed
        </Text>
      </FormControl>
      
      <FormControl>
        <FormLabel fontSize="sm">Grid Size</FormLabel>
        <HStack>
          <NumberInput
            value={options.gridWidth}
            onChange={handleWidthChange}
            min={4}
            max={64}
            isDisabled={readOnly}
            size="sm"
          >
            <NumberInputField />
          </NumberInput>
          <Text>×</Text>
          <NumberInput
            value={options.gridHeight}
            onChange={handleHeightChange}
            min={4}
            max={64}
            isDisabled={readOnly}
            size="sm"
          >
            <NumberInputField />
          </NumberInput>
        </HStack>
      </FormControl>
      
      {/* Game-Specific Options */}
      {options.gameType === 'conquer' && (
        <ConquerOptions
          options={options}
          readOnly={readOnly}
          onChange={handleOptionsChange}
        />
      )}
      
      {!readOnly && (
        <HStack gap={2} w="full">
          <Button
            colorScheme="green"
            onClick={onSave}
            size="sm"
            flex={1}
          >
            Save
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            size="sm"
            flex={1}
          >
            Cancel
          </Button>
        </HStack>
      )}
    </VStack>
  );
};
```

## State Transitions

### Main Lobby → Game Lobby
```typescript
const transitionToGameLobby = (gameId: string) => {
  const gameConfig = createGameLobbyConfig(gameId);
  const gameState = createGameLobbyState(gameId);
  
  // Navigate to game lobby
  navigate(`/lobby/${gameId}`);
  
  // Update lobby configuration
  setLobbyConfig(gameConfig);
  setLobbyState(gameState);
};
```

### Game Lobby → In-Game
```typescript
const transitionToGame = (gameId: string) => {
  // Save lobby state
  saveLobbyState();
  
  // Navigate to game
  navigate(`/game/${gameId}`);
};
```

## Implementation Benefits

1. **Maximum Reusability**: Single component serves both lobby types
2. **Consistent UX**: Same interaction patterns across contexts
3. **Maintainability**: Single source of truth for lobby logic
4. **Scalability**: Easy to add new lobby types or game modes
5. **Performance**: Shared components reduce bundle size

This unified approach eliminates code duplication while providing the flexibility needed for different lobby contexts through configuration-driven design. 