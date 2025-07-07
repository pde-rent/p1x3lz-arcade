# Tech Stack

## Core Technologies

### Frontend Framework
- **React** with TypeScript
- **Vite** for build tooling and development server
- **Bun** for package management (faster than npm/yarn)

### UI Framework
- **Chakra UI** - Component library for minimal CSS footprint
- **Emotion** - CSS-in-JS (Chakra UI dependency)
- **Framer Motion** - Animation library (Chakra UI integration)

### Game Engine
- **Phaser 3** - 2D game engine for canvas management
- **Matter.js** - Physics engine (Phaser integration)
- **Phaser Grid Physics** - Custom grid-based collision system

### Development Tools
- **TypeScript** - Type safety and better DX
- **ESLint** + **Prettier** - Code linting and formatting
- **Vite DevTools** - Development debugging

## Architecture

### Separation of Concerns
```
React Layer (UI)          Phaser Layer (Game)
├── Lobbies               ├── Game Scenes
├── Menus                 ├── Grid Management
├── HUD Components        ├── Collision Detection
├── Chat System           ├── Animation System
└── Game Settings         └── Input Handling
```

### State Management
- **Local State**: React useState/useReducer for MVP
- **Game State**: Phaser Scene Data Manager
- **Future**: WebRTC P2P state synchronization

### Communication Bridge
- Custom React-Phaser bridge for:
  - Game events → React UI updates
  - React interactions → Phaser game actions
  - Shared state synchronization

## Project Structure
```
src/
├── components/           # React UI components
│   ├── lobby/           # Lobby-related components
│   ├── game/            # In-game UI components
│   └── common/          # Shared components
├── games/               # Phaser game implementations
│   ├── common/          # Shared game logic
│   └── conquer/         # Conquer game specific
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
├── utils/               # Utility functions
└── assets/              # Images, fonts, sounds
```

## Dependencies

### Production
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@chakra-ui/react": "^2.8.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "framer-motion": "^10.16.0",
  "phaser": "^3.70.0"
}
```

### Development
```json
{
  "typescript": "^5.0.0",
  "vite": "^4.4.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.0.0",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0"
}
```

## Performance Optimizations

### React Layer
- Lazy loading for game components
- React.memo for expensive UI components
- useCallback/useMemo for render optimization
- Virtualized lists for large player lists

### Phaser Layer
- Object pooling for grid elements
- Sprite atlases for optimized rendering
- Minimal draw calls through batching
- Efficient collision detection algorithms

### Mobile Optimizations
- Touch gesture handling
- Responsive grid sizing
- Battery-friendly rendering
- Reduced particle effects on low-end devices

## Build Configuration

### Vite Configuration
- TypeScript support
- Hot module replacement
- Asset optimization
- Bundle splitting for better caching

### Deployment
- Static site generation
- CDN-friendly asset structure
- Progressive Web App capabilities
- Mobile app wrapper support (future)
