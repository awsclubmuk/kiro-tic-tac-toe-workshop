/**
 * Core Type Definitions for Tic-Tac-Toe Game
 * Task 1.2: Define core TypeScript type definitions and interfaces
 */

/**
 * Board type: 2D array supporting 3x3 to 10x10 grids
 * Each cell contains a symbol string or null for empty cells
 */
export type Board = (string | null)[][];

/**
 * Difficulty levels for CPU opponent
 */
export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

/**
 * Game modes: Two-player local or single-player vs CPU
 */
export enum GameMode {
  TwoPlayer = 'two-player',
  SinglePlayer = 'single-player',
}

/**
 * Game status: represents the current state of the game
 */
export enum GameStatus {
  Setup = 'setup',
  Playing = 'playing',
  GameOver = 'game-over',
}

/**
 * Game result outcomes
 */
export enum GameResult {
  PlayerOneWins = 'player-one-wins',
  PlayerTwoWins = 'player-two-wins',
  Draw = 'draw',
}

/**
 * Player information
 */
export interface Player {
  name: string;
  symbol: string;
  isAI: boolean;
}

/**
 * Symbol configuration
 */
export interface Symbol {
  value: string;
  displayName: string;
  isCustom: boolean;
}

/**
 * Board configuration with size and win condition
 */
export interface BoardConfig {
  size: number; // 3-10
  winLineLength: number; // typically equals size (but can be different)
}

/**
 * Move record for tracking game progression
 */
export interface Move {
  row: number;
  col: number;
  symbol: string;
  playerName: string;
  timestamp: number;
}

/**
 * Player metrics and statistics
 */
export interface PlayerMetrics {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  winPercentage: number;
  averageGameDuration: number; // in milliseconds
  difficultyStats: {
    [key in Difficulty]: {
      games: number;
      wins: number;
      losses: number;
      draws: number;
    };
  };
}

/**
 * Complete game session record
 */
export interface GameSession {
  id: string;
  playerOne: Player;
  playerTwo: Player;
  result: GameResult | null;
  boardConfig: BoardConfig;
  gameMode: GameMode;
  difficulty: Difficulty | null; // only for single-player mode
  moves: Move[];
  startTime: number;
  endTime: number | null;
  winner: string | null;
  winningLines: Array<Array<[number, number]>>; // coordinates of winning lines
}

/**
 * Current game state during active gameplay
 */
export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameStatus: GameStatus;
  boardConfig: BoardConfig;
  players: {
    playerOne: Player;
    playerTwo: Player;
  };
  moveHistory: Move[];
  gameMode: GameMode;
  difficulty: Difficulty | null;
  startTime: number;
}

/**
 * Validation result for move validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Win detection result
 */
export interface WinDetectionResult {
  winner: string | null;
  winningLines: Array<Array<[number, number]>>;
}

/**
 * CPU strategy move result
 */
export interface CPUMoveResult {
  row: number;
  col: number;
  confidence: number;
}
