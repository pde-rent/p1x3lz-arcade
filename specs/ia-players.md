# AI Players

## Overview

P1x3lz features intelligent computer opponents that provide challenging gameplay when human players are unavailable. The AI system is designed to be modular, allowing different difficulty levels and strategic approaches for each game type.

## AI Architecture

### Base AI Framework
```typescript
// AIPlayer, AIDifficulty, AIStrategy, AIPersonality are defined in core-types.md
```

### AI Strategy Pattern
Each game type implements specific AI strategies:

```typescript
interface AIStrategy {
  name: string;
  description: string;
  difficulty: AIDifficulty;
  
  // Core decision making
  makeMove(game: Game, player: AIPlayer): Promise<Move>;
  evaluatePosition(game: Game, player: AIPlayer): number;
  
  // Strategic planning
  getPriorityTargets(game: Game, player: AIPlayer): Position[];
  assessThreat(game: Game, opponent: Player): number;
  planAhead(game: Game, player: AIPlayer, depth: number): Move[];
}
```

## Difficulty Implementation

### Easy AI
**Goal**: Provide a beatable opponent for new players
- **Decision Speed**: 500ms thinking time
- **Strategy Depth**: 1-2 moves ahead
- **Mistakes**: 20-30% suboptimal moves
- **Focus**: Basic pattern recognition

```typescript
class EasyAI extends AIPlayer {
  async makeMove(game: Game): Promise<Move> {
    await this.simulateThinking(500);
    
    const validMoves = this.getValidMoves(game);
    const randomFactor = Math.random();
    
    // 70% optimal move, 30% random
    if (randomFactor < 0.7) {
      return this.getBestMove(game, validMoves, 1);
    } else {
      return this.getRandomMove(validMoves);
    }
  }
}
```

### Medium AI
**Goal**: Balanced challenge for intermediate players
- **Decision Speed**: 1000ms thinking time
- **Strategy Depth**: 2-3 moves ahead
- **Mistakes**: 10-15% suboptimal moves
- **Focus**: Tactical awareness

```typescript
class MediumAI extends AIPlayer {
  async makeMove(game: Game): Promise<Move> {
    await this.simulateThinking(1000);
    
    const validMoves = this.getValidMoves(game);
    const threats = this.assessThreats(game);
    
    // Prioritize defensive moves if under threat
    if (threats.length > 0) {
      return this.getDefensiveMove(game, threats);
    }
    
    return this.getBestMove(game, validMoves, 2);
  }
}
```

### Hard AI
**Goal**: Strong challenge requiring strategic thinking
- **Decision Speed**: 1500ms thinking time
- **Strategy Depth**: 3-4 moves ahead
- **Mistakes**: 5-8% suboptimal moves
- **Focus**: Strategic planning and opponent prediction

### Expert AI
**Goal**: Near-perfect play for advanced players
- **Decision Speed**: 2000ms thinking time
- **Strategy Depth**: 4-6 moves ahead
- **Mistakes**: 1-3% suboptimal moves
- **Focus**: Optimal play with deep calculation

## Game-Specific AI Implementation

### AI Availability Check
Before allowing AI players in a lobby, the system checks if AI is implemented for the current game type:

```typescript
class AIAvailability {
  static isAvailable(gameType: GameType): boolean {
    switch (gameType) {
      case GameType.CONQUER:
        return true;  // AI implemented
      default:
        return false; // No AI available
    }
  }
  
  static getAvailableDifficulties(gameType: GameType): AIDifficulty[] {
    if (!this.isAvailable(gameType)) return [];
    
    // Return implemented difficulties for this game type
    return [
      AIDifficulty.EASY,
      AIDifficulty.MEDIUM,
      AIDifficulty.HARD,
      AIDifficulty.EXPERT
    ];
  }
}
```

### Error Handling
When AI is not available for a game type:

```typescript
// In game lobby when trying to add AI
if (!AIAvailability.isAvailable(gameType)) {
  showError({
    title: "AI Not Available",
    message: `Computer players are not yet implemented for ${gameType} games. Only human players can join this game.`,
    type: "warning"
  });
  return;
}
```

## AI Behavior Patterns

### Human-Like Timing
AI players simulate human thinking patterns:

```typescript
class AIBehavior {
  async simulateThinking(baseTime: number): Promise<void> {
    // Add randomness to make AI feel more human
    const variance = 0.3; // ±30% timing variation
    const actualTime = baseTime * (1 + (Math.random() - 0.5) * variance);
    
    await this.delay(actualTime);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Personality Traits
Different AI instances can have distinct personalities:

```typescript
interface AIPersonality {
  aggression: number;      // 0-1, tendency to attack
  patience: number;        // 0-1, willingness to wait for better moves
  riskTaking: number;      // 0-1, preference for risky vs safe moves
  adaptability: number;    // 0-1, ability to change strategy
}

// Example personalities
const PERSONALITIES = {
  AGGRESSIVE: { aggression: 0.8, patience: 0.2, riskTaking: 0.7, adaptability: 0.6 },
  DEFENSIVE: { aggression: 0.2, patience: 0.8, riskTaking: 0.3, adaptability: 0.4 },
  BALANCED: { aggression: 0.5, patience: 0.5, riskTaking: 0.5, adaptability: 0.7 },
  UNPREDICTABLE: { aggression: 0.6, patience: 0.3, riskTaking: 0.9, adaptability: 0.9 }
};
```

### Learning and Adaptation
Advanced AI can adapt to player behavior:

```typescript
class AdaptiveAI extends AIPlayer {
  private opponentHistory: Map<string, PlayerPattern> = new Map();
  
  analyzeOpponent(opponent: Player, moves: Move[]): PlayerPattern {
    // Track opponent tendencies
    return {
      preferredAreas: this.findPreferredAreas(moves),
      aggressionLevel: this.calculateAggression(moves),
      defensivePatterns: this.identifyDefensivePatterns(moves),
      timingPatterns: this.analyzeTimingPatterns(moves)
    };
  }
  
  async makeMove(game: Game): Promise<Move> {
    // Factor in opponent analysis
    const opponents = game.players.filter(p => p.id !== this.id);
    const strategies = opponents.map(opp => this.opponentHistory.get(opp.id));
    
    return this.getCounterMove(game, strategies);
  }
}
```

## AI Integration in Lobbies

### Adding AI Players
Game masters can add AI players through the lobby interface:

```typescript
// In GameLobby component
const handleAddAI = (difficulty: AIDifficulty) => {
  if (!AIAvailability.isAvailable(game.type)) {
    showAIUnavailableError();
    return;
  }
  
  const aiPlayer = createAIPlayer({
    gameType: game.type,
    difficulty: difficulty,
    personality: selectRandomPersonality()
  });
  
  addPlayerToGame(game.id, aiPlayer);
};
```

### AI Player Display
AI players are clearly marked in the UI:

```tsx
{slot.player?.type === 'ai' && (
  <HStack spacing={1}>
    <Badge colorScheme="purple" size="sm">AI</Badge>
    <Badge colorScheme="gray" size="sm" variant="outline">
      {slot.player.difficulty.toUpperCase()}
    </Badge>
  </HStack>
)}
```

### AI Auto-Ready
AI players automatically mark themselves as ready:

```typescript
class AIPlayer {
  constructor(options: AIPlayerOptions) {
    super(options);
    this.isReady = true; // AI is always ready
  }
  
  // AI cannot be manually toggled ready/not ready
  toggleReady(): void {
    // No-op for AI players
  }
}
```

## Performance Considerations

### Computation Limits
AI thinking is bounded to prevent UI blocking:

```typescript
class AIThinking {
  private static readonly MAX_THINKING_TIME = 5000; // 5 seconds max
  private static readonly MIN_THINKING_TIME = 200;  // 0.2 seconds min
  
  static async computeMove(ai: AIPlayer, game: Game): Promise<Move> {
    const startTime = Date.now();
    const maxTime = Math.min(ai.thinkingTime, this.MAX_THINKING_TIME);
    
    // Run AI computation with timeout
    const computation = Promise.race([
      ai.computeBestMove(game),
      this.timeout(maxTime)
    ]);
    
    const result = await computation;
    
    // Ensure minimum thinking time for realism
    const elapsed = Date.now() - startTime;
    if (elapsed < this.MIN_THINKING_TIME) {
      await this.delay(this.MIN_THINKING_TIME - elapsed);
    }
    
    return result;
  }
}
```

### Memory Management
AI systems use efficient data structures:

```typescript
class AIMemory {
  // Limit game state history
  private static readonly MAX_HISTORY_SIZE = 20;
  
  // Use object pooling for move calculations
  private movePool: Move[] = [];
  private positionPool: Position[] = [];
  
  getMove(): Move {
    return this.movePool.pop() || new Move();
  }
  
  returnMove(move: Move): void {
    move.reset();
    this.movePool.push(move);
  }
}
```

## Development Guidelines

### Testing AI
Each AI implementation should include:

```typescript
describe('ConquerAI', () => {
  test('makes valid moves', () => {
    const ai = new ConquerAI(AIDifficulty.MEDIUM);
    const game = createTestGame();
    const move = ai.makeMove(game);
    expect(isValidMove(game, move)).toBe(true);
  });
  
  test('difficulty affects move quality', () => {
    const easyAI = new ConquerAI(AIDifficulty.EASY);
    const hardAI = new ConquerAI(AIDifficulty.HARD);
    
    // Hard AI should score better over multiple games
    const easyScore = simulateGames(easyAI, 100);
    const hardScore = simulateGames(hardAI, 100);
    expect(hardScore).toBeGreaterThan(easyScore);
  });
});
```

### AI Ethics
- **Fair Play**: AI should not cheat or access hidden information
- **Balanced Challenge**: AI should be challenging but not frustrating
- **Transparent Behavior**: Players should understand AI capabilities
- **Accessibility**: AI provides practice opportunities for all skill levels

This AI system ensures that P1x3lz games remain engaging even with fewer human players, while providing valuable practice opportunities and consistent challenge levels.
