# Chess Game Specification

## Concept Overview
- **Brief Description**: Classic chess game with standard rules where two players compete to checkmate the opponent's king
- **Game Type**: Turn-Based
- **Players**: 2 players (1v1 only)
- **Duration**: 10-60 minutes (variable)
- **Complexity**: Complex
- **AI Support**: Yes (Easy, Medium, Hard, Expert)

## Game Mode
- **Play Style**: One Man Army (1v1 only)
- **Team Configuration**: N/A (strictly two-player)
- **Shared Resources**: N/A (individual piece control)

## Level Design
- **Grid Configuration**: Fixed 8x8 board (64 squares)
- **Environmental Elements**: Standard chess pieces in starting positions
- **Procedural Generation**: N/A (standard chess setup)
- **Balanced Layout**: Traditional chess starting position ensures perfect symmetry
- **Edge Behavior**: N/A (chess board has fixed boundaries)

## Game-Specific Models

### Player Extension
```typescript
interface ChessPlayer extends Player {
  pieceColor: PlayerColor;          // Chess piece color (from platform colors)
  isFirstPlayer: boolean;           // Whether this player moves first
  isInCheck: boolean;               // Currently in check
  canCastleKingside: boolean;       // Kingside castling rights
  canCastleQueenside: boolean;      // Queenside castling rights
  capturedPieces: ChessPiece[];     // Pieces captured from opponent
  moveHistory: ChessMove[];         // All moves made by this player
  timeRemaining?: number;           // Time remaining (if time control enabled)
  lastMoveTime: number;             // Timestamp of last move
}
```

### Grid Extension
```typescript
interface ChessGrid extends Grid {
  pieces: Map<string, ChessPiece>;  // All pieces on board (position -> piece)
  enPassantTarget?: Position;       // Current en passant target square
  fiftyMoveCounter: number;         // Counter for 50-move rule
  fullMoveNumber: number;           // Full move counter
  boardOrientation: 'vertical' | 'horizontal'; // Board display orientation
}
```

### Options Extension
```typescript
interface ChessOptions extends GameOptions {
  /**
   * Board orientation - how the board is displayed to players
   * 'vertical' = First player at bottom, second player at top (default)
   * 'horizontal' = First player at left, second player at right
   */
  boardOrientation: 'vertical' | 'horizontal';
  
  // Chess-specific timing options
  timeControl?: {
    initialTime: number;            // Initial time per player (seconds)
    increment: number;              // Time increment per move (seconds)
  };
  
  // Inherited base options
  ...DEFAULT_GAME_OPTIONS
}
```

### Additional Type Definitions
```typescript
// Chess piece types
enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king'
}

// Chess piece representation
interface ChessPiece {
  type: PieceType;
  color: PlayerColor;             // Uses platform player colors
  position: Position;
  hasMoved: boolean;              // For castling and pawn double-move tracking
  value: number;                  // Piece value for evaluation
  belongsToFirstPlayer: boolean; // Whether piece belongs to first player
}

// Chess move representation
interface ChessMove {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  promotion?: PieceType;          // For pawn promotion
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isCastle: boolean;
  isEnPassant: boolean;
  notation: string;               // Algebraic notation
  timestamp: number;
}

// Game result types
enum GameResult {
  FIRST_PLAYER_WINS = 'first_player_wins',
  SECOND_PLAYER_WINS = 'second_player_wins',
  DRAW = 'draw',
  ONGOING = 'ongoing'
}
```

### Game-Specific Events
```typescript
enum ChessEventType {
  MOVE_MADE = 'move_made',
  PIECE_CAPTURED = 'piece_captured',
  CHECK_GIVEN = 'check_given',
  CHECKMATE = 'checkmate',
  STALEMATE = 'stalemate',
  CASTLE_PERFORMED = 'castle_performed',
  PAWN_PROMOTED = 'pawn_promoted',
  EN_PASSANT = 'en_passant',
  DRAW_OFFERED = 'draw_offered',
  DRAW_ACCEPTED = 'draw_accepted',
  RESIGNATION = 'resignation'
}

interface ChessEvent extends GameEvent {
  type: ChessEventType;
  playerId: string;
  move?: ChessMove;
  piece?: ChessPiece;
  result?: GameResult;
}
```

### Game-Specific State
```typescript
interface ChessGameState extends GameState {
  board: ChessGrid;
  firstPlayer: ChessPlayer;
  secondPlayer: ChessPlayer;
  currentTurn: PlayerColor;
  gameResult: GameResult;
  moveHistory: ChessMove[];
  positionHistory: string[];      // FEN strings for repetition detection
  lastMove?: ChessMove;
  availableMoves: Map<string, ChessMove[]>; // Legal moves for current player
}
```

## Rules

### Turn Actions
- **Turn Structure**: Players alternate turns, starting player chosen randomly at game start
- **Valid Actions**: Move one piece per turn according to chess rules
- **Action Limits**: Only legal moves allowed, must resolve check immediately
- **Special Moves**: Castling, en passant, and pawn promotion handled automatically

### Movement Rules
- **Piece Movement**: Each piece type has specific movement patterns
- **Capture Rules**: Pieces capture by moving to opponent's square
- **Check/Checkmate**: King cannot be left in check, checkmate ends game
- **Stalemate**: Player with no legal moves (but not in check) results in draw

### Special Rules
- **Castling**: King and rook move simultaneously under specific conditions
- **En Passant**: Pawn captures diagonally past opponent's pawn
- **Pawn Promotion**: Pawn reaching opposite end promotes to chosen piece
- **Fifty-Move Rule**: Draw claimed after 50 moves without capture or pawn move
- **Threefold Repetition**: Draw claimed when same position occurs three times

## Events

### Core Events
- **User Input Events**: Piece selection, move confirmation, draw offers
- **Game State Events**: Move execution, check detection, game end conditions
- **Validation Events**: Move legality checking, rule enforcement

### Event Flow
```typescript
class ChessGameEngine {
  private processTurn(player: ChessPlayer, move: ChessMove): TurnResult {
    // 1. Validate move legality
    const validation = this.validateMove(move, player);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // 2. Execute move
    const result = this.executeMove(move);
    
    // 3. Update game state
    this.updateGameState(result);
    
    // 4. Check for special conditions
    this.checkForCheck();
    this.checkForCheckmate();
    this.checkForStalemate();
    this.checkForDraw();
    
    // 5. Switch turns
    this.switchTurn();
    
    return { success: true, move: result };
  }
}
```

## Victory Conditions

### Primary Win Condition
- **Objective**: Checkmate opponent's king
- **Measurement**: King is in check with no legal moves to escape
- **Timing**: Checked after each move

### Alternative Win Conditions
- **Resignation**: Player voluntarily concedes the game
- **Time Forfeit**: Player runs out of time (if time control enabled)
- **Draw by Agreement**: Both players agree to draw

### Draw Conditions
- **Stalemate**: Player has no legal moves but is not in check
- **Insufficient Material**: Neither side has enough pieces to checkmate
- **Fifty-Move Rule**: 50 moves without capture or pawn move
- **Threefold Repetition**: Same position occurs three times
- **Perpetual Check**: Endless checking sequence

## AI Implementation

### AI Strategy
```typescript
class ChessAI extends AIPlayer {
  private evaluator = new PositionEvaluator();
  private searcher = new MinimaxSearcher();
  
  async makeMove(gameState: ChessGameState): Promise<ChessMove> {
    const depth = this.getSearchDepth();
    const legalMoves = this.generateLegalMoves(gameState);
    
    // Use minimax with alpha-beta pruning
    const bestMove = await this.searcher.search(
      gameState,
      depth,
      -Infinity,
      Infinity,
      true
    );
    
    return bestMove;
  }
  
  private getSearchDepth(): number {
    switch (this.difficulty) {
      case AIDifficulty.EASY: return 2;
      case AIDifficulty.MEDIUM: return 4;
      case AIDifficulty.HARD: return 6;
      case AIDifficulty.EXPERT: return 8;
      default: return 4;
    }
  }
}
```

### Difficulty Scaling
- **Easy**: Depth 2 search, basic evaluation, occasional blunders
- **Medium**: Depth 4 search, improved evaluation, tactical awareness
- **Hard**: Depth 6 search, positional understanding, opening book
- **Expert**: Depth 8+ search, advanced evaluation, endgame tablebase

## Visual Design

### Rendering
```typescript
class ChessRenderer {
  renderBoard(board: ChessGrid, ctx: CanvasRenderingContext2D): void {
    const cellSize = this.getCellSize();
    
    // Render board squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? '#F0D9B5' : '#B58863';
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
    
    // Render pieces
    board.pieces.forEach(piece => {
      this.renderPiece(piece, ctx);
    });
    
    // Render move highlights
    this.renderMoveHighlights(ctx);
  }
  
  renderPiece(piece: ChessPiece, ctx: CanvasRenderingContext2D): void {
    const { x, y } = piece.position;
    const cellSize = this.getCellSize();
    
    // Use Unicode chess symbols or piece images
    const symbol = this.getPieceSymbol(piece);
    ctx.font = `${cellSize * 0.8}px Arial`;
    ctx.fillStyle = piece.color.hex; // Use actual player color hex
    ctx.strokeStyle = this.getContrastColor(piece.color);
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    ctx.fillText(
      symbol,
      x * cellSize + cellSize / 2,
      y * cellSize + cellSize * 0.75
    );
    ctx.strokeText(
      symbol,
      x * cellSize + cellSize / 2,
      y * cellSize + cellSize * 0.75
    );
  }
  
  private getContrastColor(color: PlayerColor): string {
    // Return black or white based on color lightness for optimal contrast
    return color.lightness > 60 ? '#000000' : '#FFFFFF';
  }
}
```

### Animations
- **Piece Movement**: Smooth sliding animation between squares
- **Capture Animation**: Captured piece fades out
- **Check Indicator**: King square highlights when in check
- **Legal Move Hints**: Possible destination squares highlighted on piece selection

## Performance Optimization

### Core Optimizations
- **Move Generation**: Efficient legal move calculation
- **Position Evaluation**: Cached evaluation scores
- **Search Pruning**: Alpha-beta pruning for AI search

### Scalability
- **Move History**: Compressed move notation storage
- **Position Caching**: Transposition table for repeated positions
- **AI Thinking**: Iterative deepening with time management

### Network Synchronization
```typescript
class ChessNetworkSync {
  // Moves are deterministic, only need to sync move commands
  syncMove(move: ChessMove): void {
    // Validate move independently on both clients
    const validation = this.validateMove(move);
    if (validation.valid) {
      this.executeMove(move);
      this.broadcastGameState();
    }
  }
  
  // Handle disconnection gracefully
  handleDisconnection(playerId: string): void {
    // Pause game clock, offer draw or declare forfeit
    this.pauseGame();
    this.offerReconnection(playerId);
  }
}
```

This specification provides a comprehensive foundation for implementing classic chess as a strategic, turn-based game within the P1x3lz platform, with the flexibility to display the board in either vertical or horizontal orientation as requested.
