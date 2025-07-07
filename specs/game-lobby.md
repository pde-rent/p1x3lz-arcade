# Game Lobby

## Overview

The game lobby is where players gather before starting a game, similar to Warcraft 3 game lobbies. It provides player management, game configuration, and social interaction through an integrated chat system.

## Layout Structure

### Header
- **Game Title**: Editable by game master
- **Game Type & Status**: Visual indicators
- **Leave Game**: Return to main lobby

### Main Layout (3-Panel Design)
- **Left Panel (4/5 width)**: Player list + Chat
- **Right Panel (1/5 width, min 50px)**: Game controls

### Left Panel - Player List + Chat
- **Player List**: Visual representation of all player positions (top half)
- **Chat**: IRC-style chat system (bottom half)
- **Option Editing**: When editing options, this entire panel is replaced by the option editor

### Right Panel - Game Controls (1/5 screen width, min 50px)
- **Game Type Selector**: Switch between available game types
- **Game Options Button**: Opens option editor in left panel
- **Game State Controls**: Start!/Cancel!/Again! buttons

## Player Management

### Player List Interface
```jsx
<VStack gap={2} w="full" p={4}>
  <HStack justify="space-between" w="full">
    <Heading size="md" color="white">
      Players ({players.length}/{maxPlayers})
    </Heading>
    {isGameMaster && (
      <Button size="sm" onClick={handleAddAI}>
        Add AI
      </Button>
    )}
  </HStack>
  
  {playerSlots.map((slot, index) => (
    <HStack
      key={index}
      p={3}
      bg={slot.player ? slot.player.color + '20' : 'gray.800'}
      borderRadius="md"
      justify="space-between"
      w="full"
    >
      <HStack gap={3}>
        <Box
          w={4}
          h={4}
          bg={slot.player?.color || 'gray.500'}
          borderRadius="full"
          cursor={isGameMaster ? 'pointer' : 'default'}
          onClick={isGameMaster ? () => handleColorChange(slot) : undefined}
        />
        <VStack alignItems="start" gap={0}>
          <Text fontWeight="bold">
            {slot.player?.name || 'Empty'}
          </Text>
          <HStack gap={2}>
            {slot.player?.isGameMaster && (
              <Badge colorScheme="yellow" size="sm">HOST</Badge>
            )}
            {slot.player?.type === 'ai' && (
              <Badge colorScheme="purple" size="sm">AI</Badge>
            )}
            {slot.player?.isReady && (
              <Badge colorScheme="green" size="sm">READY</Badge>
            )}
          </HStack>
        </VStack>
      </HStack>
      
      {isGameMaster && slot.player && (
        <Menu>
          <MenuButton as={IconButton} size="sm" variant="ghost">
            <MoreIcon />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleTransferHost(slot.player)}>
              Transfer Host
            </MenuItem>
            <MenuItem onClick={() => handleMutePlayer(slot.player)}>
              {slot.player.isMuted ? 'Unmute' : 'Mute'}
            </MenuItem>
            <MenuItem onClick={() => handleKickPlayer(slot.player)}>
              Kick Player
            </MenuItem>
          </MenuList>
        </Menu>
      )}
    </HStack>
  ))}
</VStack>
```

### Chat System
```jsx
<VStack gap={0} h="300px" w="full" p={4}>
  <Box
    flex={1}
    w="full"
    overflowY="auto"
    bg="gray.900"
    p={3}
    borderRadius="md"
    border="1px solid"
    borderColor="gray.700"
  >
    {chatMessages.map(message => (
      <HStack key={message.id} gap={2} mb={1}>
        <Text fontSize="xs" color="gray.500" minW="12">
          {formatTime(message.timestamp)}
        </Text>
        <Text fontSize="sm" color={message.author.color} fontWeight="bold">
          {message.author.name}:
        </Text>
        <Text fontSize="sm">{message.content}</Text>
      </HStack>
    ))}
  </Box>
  
  <HStack w="full" mt={2}>
    <Input
      placeholder="Type a message..."
      value={chatInput}
      onChange={handleChatInput}
      onKeyPress={handleChatSubmit}
      isDisabled={currentPlayer.isMuted}
    />
    <Button
      onClick={handleSendMessage}
      isDisabled={currentPlayer.isMuted}
    >
      Send
    </Button>
  </HStack>
</VStack>
```

## Game Controls (Right Panel)

### Game Type Selection
```jsx
<VStack gap={4} w="full" p={4}>
  <FormControl>
    <FormLabel>Game Type</FormLabel>
    <Select
      value={gameType}
      onChange={handleGameTypeChange}
      isDisabled={!isGameMaster}
    >
      <option value="conquer">Conquer</option>
      {/* Future game types */}
    </Select>
  </FormControl>
  
  <Button
    onClick={handleEditOptions}
    isDisabled={!isGameMaster}
    w="full"
  >
    Game Options
  </Button>
  
  <Divider />
  
  <Button
    onClick={handleToggleReady}
    colorScheme={currentPlayer.isReady ? "red" : "green"}
    w="full"
  >
    {currentPlayer.isReady ? "Not Ready" : "Ready"}
  </Button>
  
  {isGameMaster && allPlayersReady && (
    <Button
      colorScheme="blue"
      w="full"
      onClick={handleStartGame}
      fontFamily="Tiny5"
      fontSize="lg"
    >
      Start!
    </Button>
  )}
  
  {isGameMaster && (
    <Button
      colorScheme="red"
      variant="outline"
      w="full"
      onClick={handleCancelGame}
    >
      Cancel
    </Button>
  )}
</VStack>
```

## Option Editing System

### Option Editor Layout
When "Game Options" is clicked, the left panel (player list + chat) is replaced with the option editor:

```jsx
{editingOptions ? (
  <OptionEditor
    gameType={gameType}
    options={gameOptions}
    onSave={handleSaveOptions}
    onCancel={handleCancelEdit}
  />
) : (
  <VStack gap={0} h="full">
    <PlayerList />
    <Chat />
  </VStack>
)}
```

### Universal Game Options
```jsx
<VStack gap={4} p={4}>
  <Heading size="md" color="white">Game Options</Heading>
  
  <FormControl>
    <FormLabel>Game Speed</FormLabel>
    <Slider
      min={0.5}
      max={2.0}
      step={0.1}
      value={gameSpeed}
      onChange={handleSpeedChange}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
    <Text fontSize="sm" color="gray.400">
      {gameSpeed}x speed
    </Text>
  </FormControl>
  
  <FormControl>
    <FormLabel>Grid Size</FormLabel>
    <HStack>
      <NumberInput
        min={4}
        max={64}
        value={gridWidth}
        onChange={handleWidthChange}
      >
        <NumberInputField />
      </NumberInput>
      <Text>×</Text>
      <NumberInput
        min={4}
        max={64}
        value={gridHeight}
        onChange={handleHeightChange}
      >
        <NumberInputField />
      </NumberInput>
    </HStack>
  </FormControl>
  
  <FormControl>
    <Checkbox
      isChecked={chatEnabled}
      onChange={handleChatToggle}
    >
      Enable In-Game Chat
    </Checkbox>
  </FormControl>
  
  <FormControl>
    <Checkbox
      isChecked={observersAllowed}
      onChange={handleObserversToggle}
    >
      Allow Observers
    </Checkbox>
  </FormControl>
</VStack>
```

### Conquer-Specific Options
```jsx
<VStack gap={4} p={4}>
  <Heading size="md" color="white">Conquer Options</Heading>
  
  <FormControl>
    <FormLabel>Rock Density</FormLabel>
    <Slider
      min={0}
      max={90}
      step={5}
      value={rocksPercentage}
      onChange={handleRocksChange}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
    <Text fontSize="sm" color="gray.400">
      {rocksPercentage}% of grid
    </Text>
  </FormControl>
  
  <FormControl>
    <FormLabel>Turn Blocks</FormLabel>
    <NumberInput
      min={1}
      max={4}
      value={turnBlocks}
      onChange={handleTurnBlocksChange}
    >
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
    <FormHelperText>
      Cells per turn
    </FormHelperText>
  </FormControl>
  
  <FormControl>
    <Checkbox
      isChecked={teamMode}
      onChange={handleTeamModeToggle}
    >
      Team Mode
    </Checkbox>
  </FormControl>
  
  <HStack gap={2} w="full" mt={6}>
    <Button
      colorScheme="green"
      onClick={handleSaveOptions}
      flex={1}
    >
      Save
    </Button>
    <Button
      variant="outline"
      onClick={handleCancelEdit}
      flex={1}
    >
      Cancel
    </Button>
  </HStack>
</VStack>
```

## Game State Management

### Ready System
- **Individual Ready**: Each player toggles their ready state
- **Host Control**: Game master sees "Start!" when all players ready
- **Auto-kick**: Players not ready after 10 seconds get kicked (except host)

### Game State Controls
- **Start!**: Begin the game (host only, all players ready)
- **Cancel**: Cancel the game and return to main lobby (host only)
- **Again!**: Restart the game with same players (post-game, host only)

This layout provides a clean, efficient interface that maximizes space usage while maintaining clear separation of concerns between player management, communication, and game configuration.
