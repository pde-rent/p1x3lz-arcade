# In-Game State Management

## Overview

The in-game state management system handles all aspects of active gameplay, including turn management, game state synchronization, move validation, and conflict resolution. For the MVP, all state is managed locally in the browser. The production version will use WebRTC for P2P state synchronization with periodic on-chain settlement for integrity verification.

## Core Game State Architecture

### Game State Structure
```typescript
// See GameState, GameStatus, and related types in core-types.md
```

### Turn Management System
```typescript
// Turn interface is defined in core-types.md
// Example implementation skeleton
class TurnManager {
  private gameState: GameState;
  private turnTimer?: NodeJS.Timeout;
  // startTurn, endTurn, timeout logic here ...
}
```

## Move Validation and Processing

### Move Validation Engine
```typescript
interface MoveValidator {
  validateMove(gameState: GameState, move: Move): ValidationResult;
  validateTurn(gameState: GameState, moves: Move[]): ValidationResult;
  getValidMoves(gameState: GameState, player: Player): Position[];
}

class ConquerMoveValidator implements MoveValidator {
  validateMove(gameState: GameState, move: Move): ValidationResult {
    const { position, player } = move;
    const cell = gameState.grid.cells[position.y][position.x];
    
    // Basic validation
    if (!this.isInBounds(position, gameState.grid)) {
      return { valid: false, error: 'Position out of bounds' };
    }
    
    if (cell.type !== CellType.EMPTY) {
      return { valid: false, error: 'Cell already occupied or blocked' };
    }
    
    if (gameState.currentPlayer.id !== player.id) {
      return { valid: false, error: 'Not your turn' };
    }
    
    // Game-specific validation
    return this.validateConquerSpecificRules(gameState, move);
  }
  
  validateTurn(gameState: GameState, moves: Move[]): ValidationResult {
    const options = gameState.options as ConquerOptions;
    
    // Check turn block limit
    if (moves.length > options.turnBlocks) {
      return { 
        valid: false, 
        error: `Too many moves. Maximum ${options.turnBlocks} per turn` 
      };
    }
    
    // Validate each move
    for (const move of moves) {
      const result = this.validateMove(gameState, move);
      if (!result.valid) {
        return result;
      }
    }
    
    return { valid: true };
  }
}
```

### Move Processing Pipeline
```typescript
class MoveProcessor {
  async processMove(gameState: GameState, move: Move): Promise<MoveResult> {
    try {
      // 1. Pre-validation
      const validation = this.validator.validateMove(gameState, move);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // 2. Apply move to game state
      const stateUpdate = this.applyMoveToState(gameState, move);
      
      // 3. Check for side effects (region capture, etc.)
      const sideEffects = await this.processSideEffects(gameState, move);
      
      // 4. Update derived state (scores, etc.)
      this.updateDerivedState(gameState, move, sideEffects);
      
      // 5. Create state snapshot
      const snapshot = this.createStateSnapshot(gameState);
      
      // 6. Emit events
      this.emitMoveEvents(move, sideEffects);
      
      return {
        success: true,
        stateUpdate,
        sideEffects,
        snapshot
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: `Move processing failed: ${error.message}` 
      };
    }
  }
  
  private async processSideEffects(gameState: GameState, move: Move): Promise<SideEffect[]> {
    const effects: SideEffect[] = [];
    
    // Check for region capture (Conquer specific)
    if (gameState.gameType === GameType.CONQUER) {
      const capturedRegions = this.checkRegionCapture(gameState, move);
      if (capturedRegions.length > 0) {
        effects.push({
          type: 'REGION_CAPTURE',
          data: { regions: capturedRegions, player: move.player }
        });
      }
    }
    
    return effects;
  }
}
```

## State Synchronization (MVP Local Implementation)

### Local State Management
```typescript
class LocalGameStateManager {
  private gameState: GameState;
  private stateHistory: StateSnapshot[] = [];
  private maxHistorySize = 50;
  
  updateState(update: StateUpdate): void {
    // Create snapshot before update
    const snapshot = this.createSnapshot();
    this.stateHistory.push(snapshot);
    
    // Trim history if too large
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
    
    // Apply update
    this.applyStateUpdate(update);
    
    // Validate state integrity
    this.validateStateIntegrity();
    
    // Save to local storage
    this.persistState();
    
    // Emit state change event
    this.emitStateChange(update);
  }
  
  rollbackToSnapshot(snapshotIndex: number): void {
    if (snapshotIndex >= 0 && snapshotIndex < this.stateHistory.length) {
      const snapshot = this.stateHistory[snapshotIndex];
      this.gameState = this.restoreFromSnapshot(snapshot);
      
      // Trim history after rollback point
      this.stateHistory = this.stateHistory.slice(0, snapshotIndex + 1);
      
      this.emitStateChange({ type: 'ROLLBACK', snapshotIndex });
    }
  }
  
  private persistState(): void {
    try {
      const serializedState = JSON.stringify(this.gameState);
      localStorage.setItem(`game_state_${this.gameState.gameId}`, serializedState);
    } catch (error) {
      console.error('Failed to persist game state:', error);
    }
  }
  
  loadPersistedState(gameId: string): GameState | null {
    try {
      const serialized = localStorage.getItem(`game_state_${gameId}`);
      if (!serialized) return null;
      
      const state = JSON.parse(serialized);
      return this.hydrateState(state);
    } catch (error) {
      console.error('Failed to load persisted state:', error);
      return null;
    }
  }
}
```

### State Checkpointing
```typescript
interface StateCheckpoint {
  id: string;
  turn: number;
  timestamp: Date;
  stateHash: string;
  criticalEvent?: string; // 'GAME_START', 'REGION_CAPTURE', etc.
  playerSignatures?: Map<string, string>; // Future: cryptographic signatures
}

class StateCheckpointing {
  private checkpoints: StateCheckpoint[] = [];
  private checkpointInterval = 10; // Every 10 turns
  
  shouldCreateCheckpoint(gameState: GameState): boolean {
    return (
      gameState.currentTurn % this.checkpointInterval === 0 ||
      this.hasCriticalEvent(gameState) ||
      this.isGameEnd(gameState)
    );
  }
  
  createCheckpoint(gameState: GameState, event?: string): StateCheckpoint {
    const checkpoint: StateCheckpoint = {
      id: generateId(),
      turn: gameState.currentTurn,
      timestamp: new Date(),
      stateHash: this.calculateStateHash(gameState),
      criticalEvent: event
    };
    
    this.checkpoints.push(checkpoint);
    
    // Cleanup old checkpoints
    if (this.checkpoints.length > 20) {
      this.checkpoints.shift();
    }
    
    return checkpoint;
  }
  
  private calculateStateHash(gameState: GameState): string {
    // Create deterministic hash of critical state
    const criticalState = {
      grid: gameState.grid.cells.map(row => 
        row.map(cell => ({ type: cell.type, owner: cell.owner?.id }))
      ),
      players: gameState.players.map(p => ({ id: p.id, score: p.score })),
      currentTurn: gameState.currentTurn,
      gamePhase: gameState.gamePhase
    };
    
    return this.hash(JSON.stringify(criticalState));
  }
}
```

## Future WebRTC P2P State Synchronization

### P2P Game State Protocol
```typescript
interface P2PGameState {
  // Core state
  gameState: GameState;
  
  // P2P specific
  peerId: string;
  peerRole: PeerRole; // HOST, PEER, OBSERVER
  conflictResolution: ConflictResolutionStrategy;
  
  // Synchronization
  lastSyncTimestamp: number;
  pendingSyncOperations: SyncOperation[];
  syncAcknowledgments: Map<string, number>;
}

enum PeerRole {
  HOST = 'host',       // Game state authority
  PEER = 'peer',       // Active player
  OBSERVER = 'observer' // Spectator only
}

class P2PGameStateSynchronizer {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private gameChannels = new Map<string, RTCDataChannel>();
  private role: PeerRole;
  
  async synchronizeMove(move: Move): Promise<SyncResult> {
    // 1. Broadcast move to all peers
    const moveMessage: P2PMessage = {
      type: 'MOVE',
      timestamp: Date.now(),
      data: move,
      senderId: this.peerId,
      sequenceNumber: this.getNextSequence()
    };
    
    await this.broadcastMessage(moveMessage);
    
    // 2. Wait for acknowledgments (if required)
    if (this.requiresConsensus(move)) {
      const ackResult = await this.waitForAcknowledgments(moveMessage);
      if (!ackResult.success) {
        return { success: false, error: 'Consensus not reached' };
      }
    }
    
    // 3. Apply move locally
    const result = this.localProcessor.processMove(this.gameState, move);
    
    return { success: true, result };
  }
  
  private async handlePeerMessage(peerId: string, message: P2PMessage): Promise<void> {
    switch (message.type) {
      case 'MOVE':
        await this.handlePeerMove(peerId, message.data);
        break;
      case 'STATE_SYNC':
        await this.handleStateSync(peerId, message.data);
        break;
      case 'CONFLICT_RESOLUTION':
        await this.handleConflictResolution(peerId, message.data);
        break;
    }
  }
}
```

### Conflict Resolution System
```typescript
enum ConflictType {
  SIMULTANEOUS_MOVES = 'simultaneous_moves',
  STATE_DIVERGENCE = 'state_divergence',
  TURN_ORDER_DISPUTE = 'turn_order_dispute',
  RULE_INTERPRETATION = 'rule_interpretation'
}

class ConflictResolver {
  resolveConflict(conflict: GameConflict): ConflictResolution {
    switch (conflict.type) {
      case ConflictType.SIMULTANEOUS_MOVES:
        return this.resolveSimultaneousMoves(conflict);
      
      case ConflictType.STATE_DIVERGENCE:
        return this.resolveStateDivergence(conflict);
      
      case ConflictType.TURN_ORDER_DISPUTE:
        return this.resolveTurnOrderDispute(conflict);
      
      default:
        return this.rollbackToLastCheckpoint(conflict);
    }
  }
  
  private resolveSimultaneousMoves(conflict: GameConflict): ConflictResolution {
    const moves = conflict.data.moves as Move[];
    
    // Sort by timestamp, then by player order
    moves.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return this.getPlayerPriority(a.player) - this.getPlayerPriority(b.player);
    });
    
    // Apply first valid move, reject others
    return {
      resolution: 'TIMESTAMP_PRIORITY',
      acceptedMove: moves[0],
      rejectedMoves: moves.slice(1),
      explanation: 'Earliest timestamp wins'
    };
  }
}
```

## Cheat Detection and Prevention

### Anti-Cheat System
```typescript
class AntiCheatSystem {
  private suspiciousActions: Map<string, SuspiciousAction[]> = new Map();
  private cheatDetectors: CheatDetector[] = [];
  
  validateAction(action: PlayerAction): CheatCheckResult {
    const results: CheatCheckResult[] = [];
    
    // Run all cheat detectors
    for (const detector of this.cheatDetectors) {
      const result = detector.check(action, this.gameState);
      if (result.suspicious) {
        results.push(result);
        this.recordSuspiciousAction(action.playerId, result);
      }
    }
    
    // Evaluate overall suspicion level
    const suspicionLevel = this.calculateSuspicionLevel(action.playerId);
    
    if (suspicionLevel > this.cheatThreshold) {
      return {
        action: 'KICK_PLAYER',
        reason: 'Multiple cheat detection triggers',
        evidence: results
      };
    }
    
    return { action: 'ALLOW', suspicionLevel };
  }
  
  // Example cheat detectors
  private initializeDetectors(): void {
    this.cheatDetectors = [
      new SpeedCheatDetector(),      // Actions too fast
      new ImpossibleMoveDetector(),  // Invalid game moves
      new PatternCheatDetector(),    // Unrealistic play patterns
      new TimingCheatDetector()      // Suspicious timing patterns
    ];
  }
}

class SpeedCheatDetector implements CheatDetector {
  private readonly MIN_ACTION_INTERVAL = 100; // 100ms minimum between actions
  
  check(action: PlayerAction, gameState: GameState): CheatCheckResult {
    const lastAction = this.getLastAction(action.playerId);
    
    if (lastAction) {
      const timeDiff = action.timestamp.getTime() - lastAction.timestamp.getTime();
      if (timeDiff < this.MIN_ACTION_INTERVAL) {
        return {
          suspicious: true,
          severity: 'HIGH',
          reason: `Actions too fast: ${timeDiff}ms interval`,
          evidence: { lastAction, currentAction: action }
        };
      }
    }
    
    return { suspicious: false };
  }
}
```

## On-Chain Settlement (Production)

### Blockchain Integration Architecture
```typescript
interface OnChainGameState {
  gameId: string;
  finalState: GameStateSnapshot;
  playerSignatures: Map<string, string>;
  settlementTimestamp: number;
  winnerVerification: WinnerProof;
}

class BlockchainSettlement {
  async settleGame(gameState: GameState): Promise<SettlementResult> {
    try {
      // 1. Create final state snapshot
      const finalSnapshot = this.createFinalSnapshot(gameState);
      
      // 2. Collect player signatures
      const signatures = await this.collectPlayerSignatures(finalSnapshot);
      
      // 3. Generate winner proof
      const winnerProof = this.generateWinnerProof(gameState);
      
      // 4. Submit to blockchain
      const settlement: OnChainGameState = {
        gameId: gameState.gameId,
        finalState: finalSnapshot,
        playerSignatures: signatures,
        settlementTimestamp: Date.now(),
        winnerVerification: winnerProof
      };
      
      const txHash = await this.submitToBlockchain(settlement);
      
      return {
        success: true,
        transactionHash: txHash,
        settlement
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Settlement failed: ${error.message}`
      };
    }
  }
  
  private generateWinnerProof(gameState: GameState): WinnerProof {
    // Create cryptographic proof of winner based on game rules
    return {
      winner: gameState.winCondition?.winners[0]?.id,
      finalScore: this.calculateFinalScores(gameState),
      ruleProof: this.generateRuleProof(gameState),
      stateHash: this.calculateFinalStateHash(gameState)
    };
  }
}
```

This comprehensive in-game state management system provides robust local state handling for the MVP while being architected for seamless integration with WebRTC P2P synchronization and blockchain settlement in the production version.
