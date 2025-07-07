# Home Page

## Overview

The home page serves as the entry point to P1x3lz, providing a clean login interface and platform introduction. For the MVP, it uses a simple name-based authentication similar to slither.io, while the production version will support Web3 wallet authentication.

## Layout Structure

### Header
- **P1x3lz Logo**: Minimal pixel art logo (top-left)
- **Version Indicator**: Small version text (bottom-right of header)

### Main Content Area
- **Welcome Section**: Platform introduction and game preview
- **Login Form**: Simple authentication interface
- **Game Preview**: Animated grid showcasing gameplay

### Footer
- **About**: Link to platform information
- **GitHub**: Link to source code repository

## Login System

### MVP Authentication
```typescript
interface LoginForm {
  playerName: string; // 3-20 characters, alphanumeric + spaces
  acceptTerms: boolean;
}
```

**Validation Rules:**
- Player name must be 3-20 characters
- Only alphanumeric characters and spaces allowed
- No profanity filtering (basic word list check)
- Duplicate names allowed (append number automatically)

### Production Authentication (Future)
```typescript
interface Web3LoginForm {
  walletAddress: string;
  signature: string;
  playerName?: string; // Optional display name override
}
```

**Supported Wallets:**
- MetaMask
- WalletConnect
- Coinbase Wallet
- Trust Wallet

## UI Components

### Welcome Section
```jsx
<VStack spacing={8} align="center">
  <Heading size="2xl" color="blue.400">
    Welcome to P1x3lz
  </Heading>
  <Text fontSize="lg" textAlign="center" maxW="600px">
    Fast-paced PvP arcade games on customizable grids.
    Play classic-inspired games against friends or AI opponents.
  </Text>
  <HStack spacing={4}>
    <Badge colorScheme="blue">Turn-Based</Badge>
    <Badge colorScheme="purple">Real-Time</Badge>
    <Badge colorScheme="green">Cross-Platform</Badge>
  </HStack>
</VStack>
```

### Login Form
```jsx
<Box maxW="400px" w="full">
  <VStack spacing={4}>
    <FormControl isRequired>
      <FormLabel>Player Name</FormLabel>
      <Input
        placeholder="Enter your name"
        value={playerName}
        onChange={handleNameChange}
        maxLength={20}
      />
      <FormHelperText>
        3-20 characters, letters and numbers only
      </FormHelperText>
    </FormControl>
    
    <Checkbox isChecked={acceptTerms} onChange={handleTermsChange}>
      I accept the terms of service
    </Checkbox>
    
    <Button
      colorScheme="blue"
      size="lg"
      w="full"
      isDisabled={!isFormValid}
      isLoading={isLogging}
      onClick={handleLogin}
    >
      Enter Game Lobby
    </Button>
  </VStack>
</Box>
```

### Game Preview
An animated grid showing sample gameplay to entice users:

```jsx
<Box position="relative" w="300px" h="300px">
  <Grid templateColumns="repeat(8, 1fr)" gap={1}>
    {cells.map((cell, index) => (
      <GridItem
        key={index}
        bg={cell.color}
        h="35px"
        border="1px solid"
        borderColor="gray.600"
        transition="background-color 0.3s"
      />
    ))}
  </Grid>
  <Text
    position="absolute"
    bottom="-30px"
    left="50%"
    transform="translateX(-50%)"
    fontSize="sm"
    color="gray.400"
  >
    Live Game Preview
  </Text>
</Box>
```

## Animations

### Page Load
- Fade-in animation for main content (0.5s)
- Staggered animation for UI elements (0.1s delays)
- Logo scaling animation (bounce effect)

### Game Preview
- Continuous cell color changes every 2 seconds
- Simulated territory conquest animations
- Particle effects for completed regions

### Login Flow
- Form field focus animations
- Button hover and click feedback
- Loading spinner during authentication
- Success animation before redirect

## Responsive Design

### Mobile (320px - 768px)
- Single column layout
- Larger touch targets (minimum 44px)
- Simplified game preview (4x4 grid)
- Collapsible sections for smaller screens

### Tablet (768px - 1024px)
- Two-column layout (content + preview)
- Medium-sized interactive elements
- 6x6 game preview grid
- Side-by-side form and preview

### Desktop (1024px+)
- Three-column layout with side padding
- Full-featured game preview (8x8 grid)
- Keyboard shortcuts for form navigation
- Hover states for all interactive elements

## Error Handling

### Validation Errors
- Real-time field validation with visual feedback
- Clear error messages below form fields
- Form submission prevention until valid
- Accessible error announcements

### Connection Errors
- Offline detection with retry mechanism
- Network error toast notifications
- Graceful degradation for slow connections
- Local storage for form data persistence

### Name Conflicts
- Automatic name disambiguation (Player, Player2, etc.)
- Suggestion of alternative names
- Visual feedback for name availability
- Option to proceed with suggested name

## Performance Considerations

### Optimization Strategies
- Lazy loading for non-critical assets
- Preloading of essential game assets
- Image compression for grid preview
- Minimal JavaScript bundle for initial load

### Loading States
- Skeleton screens for form rendering
- Progressive enhancement for animations
- Graceful fallbacks for older browsers
- Performance monitoring for login flow

## Accessibility

### WCAG Compliance
- High contrast color scheme (4.5:1 minimum)
- Keyboard navigation support
- Screen reader friendly labels
- Focus management during navigation

### Enhanced Features
- Reduced motion preferences
- Font size scaling support
- Voice-over compatibility
- Touch-friendly interface elements

This home page design prioritizes simplicity and immediate engagement while providing a solid foundation for both MVP and production authentication systems.
