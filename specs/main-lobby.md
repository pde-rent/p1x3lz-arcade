# Main Lobby

## Overview

The main lobby is the central hub where players browse and join existing games or create new ones. Inspired by the classic Battle.net interface, it provides a clean list of available games with essential information at a glance.

## Layout Structure

### Header
- **Platform Logo**: P1x3lz branding (left)
- **Player Info**: Current player name and avatar (right)
- **Logout Button**: Return to home page

### Sidebar (Left Panel)
- **Create Game**: Primary action button
- **Game Filters**: Filter by game type, status, player count
- **Player Count**: Total players online
- **Game Count**: Total active games

### Main Area (Game List)
- **Game Entries**: Scrollable list of available games
- **Pagination**: Handle large number of games
- **Empty State**: When no games are available

### Chat Panel (Right Panel)
- **Global Chat**: Platform-wide chat system
- **Player List**: Online players not in games
- **System Messages**: Server announcements

## Game List Components

### Game Entry Card
Each game displays essential information in a compact format:

```jsx
<Box
  borderWidth="1px"
  borderRadius="md"
  p={4}
  bg="gray.800"
  _hover={{ bg: "gray.700" }}
  cursor="pointer"
  onClick={handleJoinGame}
>
  <HStack justify="space-between">
    <VStack align="start" spacing={1}>
      <HStack>
        <Text fontWeight="bold">{game.name}</Text>
        <Badge colorScheme={getStatusColor(game.state)}>
          {game.state.toUpperCase()}
        </Badge>
      </HStack>
      <Text fontSize="sm" color="gray.400">
        {game.type} • {game.grid.width}x{game.grid.height}
      </Text>
    </VStack>
    
    <VStack align="end" spacing={1}>
      <Text fontSize="sm">
        {game.players.length}/{game.options.maxPlayers}
      </Text>
      <HStack spacing={1}>
        {game.players.map(player => (
          <Box
            key={player.id}
            w={3}
            h={3}
            bg={player.color}
            rounded="full"
          />
        ))}
      </HStack>
    </VStack>
  </HStack>
</Box>
```

### Game Status Indicators
- **Pending**: Green badge, accepting players
- **Starting**: Yellow badge, countdown in progress
- **Running**: Red badge, game in progress (spectators only if enabled)
- **Ended**: Gray badge, game completed (not shown unless filter enabled)

### Game Information Display
- **Game Name**: Custom name set by game master
- **Game Type**: Conquer, etc.
- **Grid Size**: Dimensions (e.g., "16x16")
- **Player Count**: Current/Max players
- **Player Colors**: Visual dots showing occupied colors
- **Options**: Speed, rocks percentage (Conquer-specific)

## Create Game Interface

### Create Game Modal
```jsx
<Modal isOpen={isOpen} onClose={onClose} size="lg">
  <ModalOverlay />
  <ModalContent bg="gray.800">
    <ModalHeader>Create New Game</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Game Name</FormLabel>
          <Input
            placeholder="Enter game name"
            value={gameName}
            onChange={handleNameChange}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Game Type</FormLabel>
          <Select value={gameType} onChange={handleTypeChange}>
            <option value="conquer">Conquer</option>
            {/* Future game types */}
          </Select>
        </FormControl>
        
        <FormControl>
          <FormLabel>Max Players</FormLabel>
          <NumberInput
            min={2}
            max={12}
            value={maxPlayers}
            onChange={handlePlayersChange}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        
        <FormControl>
          <FormLabel>Grid Size</FormLabel>
          <HStack>
            <NumberInput
              min={8}
              max={64}
              value={gridWidth}
              onChange={handleWidthChange}
            >
              <NumberInputField />
            </NumberInput>
            <Text>×</Text>
            <NumberInput
              min={8}
              max={64}
              value={gridHeight}
              onChange={handleHeightChange}
            >
              <NumberInputField />
            </NumberInput>
          </HStack>
        </FormControl>
      </VStack>
    </ModalBody>
    
    <ModalFooter>
      <Button variant="ghost" mr={3} onClick={onClose}>
        Cancel
      </Button>
      <Button colorScheme="blue" onClick={handleCreateGame}>
        Create Game
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

## Filtering and Search

### Filter Options
- **Game Type**: All, Conquer, (future types)
- **Status**: All, Pending, Starting, Running
- **Player Count**: All, Has Space, Nearly Full
- **Grid Size**: All, Small (≤16x16), Medium (17-32x32), Large (≥33x33)

### Search Functionality
- **Game Name**: Text search through game names
- **Player Name**: Find games with specific players
- **Real-time Updates**: Live filtering as user types

## Global Chat System

### Chat Interface
```jsx
<VStack h="400px" spacing={0}>
  <Box
    flex={1}
    w="full"
    overflowY="auto"
    bg="gray.900"
    p={3}
    borderRadius="md"
  >
    {messages.map(message => (
      <ChatMessage key={message.id} message={message} />
    ))}
  </Box>
  
  <HStack w="full" mt={2}>
    <Input
      placeholder="Type a message..."
      value={chatInput}
      onChange={handleChatInput}
      onKeyPress={handleChatSubmit}
    />
    <Button onClick={handleSendMessage}>Send</Button>
  </HStack>
</VStack>
```

### Chat Features
- **Player Names**: Colored based on player color
- **System Messages**: Game creation/join announcements
- **Timestamps**: Show when messages were sent
- **Scroll to Bottom**: Auto-scroll for new messages
- **Message History**: Persistent chat across sessions

### Chat Commands
- `/help` - Show available commands
- `/players` - List online players
- `/games` - Show active games count
- `/clear` - Clear chat history (local only)

## Real-time Updates

### Live Game List
- **WebSocket Connection**: Real-time game state updates
- **Automatic Refresh**: Update list every 30 seconds as fallback
- **Player Join/Leave**: Immediate visual updates
- **New Games**: Appear instantly in list

### Status Indicators
- **Online Players**: Live count of connected users
- **Active Games**: Current number of games by status
- **Connection Status**: Visual indicator for connectivity

## Responsive Design

### Mobile Layout (320px - 768px)
- **Single Panel**: Full-width game list
- **Collapsible Chat**: Toggle-able chat overlay
- **Touch-Optimized**: Larger tap targets for game entries
- **Swipe Navigation**: Swipe between list and filters

### Tablet Layout (768px - 1024px)
- **Two Panel**: Game list + sidebar or chat
- **Tab Navigation**: Switch between filters and chat
- **Medium Density**: More games visible per screen

### Desktop Layout (1024px+)
- **Three Panel**: Sidebar + game list + chat
- **Full Feature Set**: All features visible simultaneously
- **Keyboard Shortcuts**: Quick navigation and actions

## Performance Optimizations

### Virtual Scrolling
- **Large Game Lists**: Render only visible game entries
- **Smooth Scrolling**: Maintain 60fps during scroll
- **Memory Management**: Cleanup unused components

### Caching Strategy
- **Game List Cache**: Store recent game states
- **Player Data Cache**: Cache player information
- **Chat History**: Limit to last 100 messages

### Network Optimization
- **Differential Updates**: Only send changed game data
- **Compression**: Gzip chat messages and game lists
- **Connection Pooling**: Efficient WebSocket management

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical navigation through interface
- **Arrow Keys**: Navigate game list
- **Enter/Space**: Join selected game
- **Escape**: Close modals and overlays

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Announce chat messages and game updates
- **Role Attributes**: Proper semantic markup

### Visual Accessibility
- **High Contrast**: Clear distinction between elements
- **Focus Indicators**: Visible focus rings
- **Text Scaling**: Support for zoom up to 200%
- **Color Independence**: No color-only information

This main lobby design balances nostalgia for classic gaming interfaces with modern usability standards, ensuring efficient game discovery and social interaction.
