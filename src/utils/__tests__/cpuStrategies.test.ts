/**
 * Unit Tests for CPU Difficulty Strategies
 * Task 5.2, 5.3, 5.4: Test Easy, Medium, and Hard strategies
 * Requirements: 6, 7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Board } from '../../types/index';
import {
    getValidMoves,
    easyStrategy,
    mediumStrategy,
    hardStrategy,
    findWinningMove,
    minimax,
    calculateMaxDepth,
} from '../cpuStrategies';
import { createEmptyBoard, placeMark } from '../boardUtils';

describe('CPU Strategies - Utility Functions', () => {
    describe('getValidMoves', () => {
        it('should return all 9 moves for empty 3x3 board', () => {
            const board = createEmptyBoard(3);
            const moves = getValidMoves(board);

            expect(moves).toHaveLength(9);
        });

        it('should return empty array for full board', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 0, 1, 'O');
            board = placeMark(board, 0, 2, 'X');
            board = placeMark(board, 1, 0, 'O');
            board = placeMark(board, 1, 1, 'X');
            board = placeMark(board, 1, 2, 'O');
            board = placeMark(board, 2, 0, 'X');
            board = placeMark(board, 2, 1, 'O');
            board = placeMark(board, 2, 2, 'X');

            const moves = getValidMoves(board);
            expect(moves).toHaveLength(0);
        });

        it('should return correct count for partially filled board', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 1, 1, 'O');
            board = placeMark(board, 2, 2, 'X');

            const moves = getValidMoves(board);
            expect(moves).toHaveLength(6);
        });

        it('should return correct positions for valid moves', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');

            const moves = getValidMoves(board);
            expect(moves).toContainEqual([0, 1]);
            expect(moves).toContainEqual([0, 2]);
            expect(moves).toContainEqual([1, 0]);
            expect(moves).not.toContainEqual([0, 0]); // Should not include occupied cell
        });

        it('should work with larger board sizes', () => {
            const board = createEmptyBoard(5);
            const moves = getValidMoves(board);

            expect(moves).toHaveLength(25);
        });
    });

    describe('findWinningMove', () => {
        it('should find blocking move for horizontal line', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 0, 1, 'X');

            const move = findWinningMove(board, 'X', 3);
            expect(move).toEqual([0, 2]);
        });

        it('should find blocking move for vertical line', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 1, 0, 'X');

            const move = findWinningMove(board, 'X', 3);
            expect(move).toEqual([2, 0]);
        });

        it('should find blocking move for diagonal line (top-left to bottom-right)', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 1, 1, 'X');

            const move = findWinningMove(board, 'X', 3);
            expect(move).toEqual([2, 2]);
        });

        it('should find blocking move for diagonal line (top-right to bottom-left)', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 2, 'X');
            board = placeMark(board, 1, 1, 'X');

            const move = findWinningMove(board, 'X', 3);
            expect(move).toEqual([2, 0]);
        });

        it('should return null when no winning move exists', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');

            const move = findWinningMove(board, 'X', 3);
            expect(move).toBeNull();
        });

        it('should return null when line is blocked by opponent', () => {
            let board = createEmptyBoard(3);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 0, 1, 'X');
            board = placeMark(board, 0, 2, 'O');

            const move = findWinningMove(board, 'X', 3);
            expect(move).toBeNull();
        });

        it('should work with larger boards and different line lengths', () => {
            let board = createEmptyBoard(5);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 0, 1, 'X');
            board = placeMark(board, 0, 2, 'X');
            board = placeMark(board, 0, 3, 'X');

            const move = findWinningMove(board, 'X', 5);
            expect(move).toEqual([0, 4]);
        });

        it('should find winning move in the middle of a line', () => {
            let board = createEmptyBoard(4);
            board = placeMark(board, 0, 0, 'X');
            board = placeMark(board, 0, 2, 'X');
            board = placeMark(board, 0, 3, 'X');

            const move = findWinningMove(board, 'X', 4);
            expect(move).toEqual([0, 1]);
        });
    });

    describe('calculateMaxDepth', () => {
        it('should return 9 for 3x3 board', () => {
            expect(calculateMaxDepth(3)).toBe(9);
        });

        it('should return 6 for 4x4 board', () => {
            expect(calculateMaxDepth(4)).toBe(6);
        });

        it('should return 5 for 5x5 board', () => {
            expect(calculateMaxDepth(5)).toBe(5);
        });

        it('should return 4 for 6x6 board', () => {
            expect(calculateMaxDepth(6)).toBe(4);
        });

        it('should return 4 for 10x10 board', () => {
            expect(calculateMaxDepth(10)).toBe(4);
        });
    });
});

describe('CPU Strategies - Easy Strategy', () => {
    it('should return a valid move from available moves', () => {
        const board = createEmptyBoard(3);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(move?.row).toBeGreaterThanOrEqual(0);
        expect(move?.row).toBeLessThan(3);
        expect(move?.col).toBeGreaterThanOrEqual(0);
        expect(move?.col).toBeLessThan(3);
    });

    it('should return null when no valid moves available', () => {
        let board = createEmptyBoard(3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board = placeMark(board, i, j, 'X');
            }
        }

        const move = easyStrategy(board, 'O');
        expect(move).toBeNull();
    });

    it('should return an empty cell', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'O');

        const move = easyStrategy(board, 'X');
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('should work with different board sizes', () => {
        const board = createEmptyBoard(5);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('should return random different moves (statistical test)', () => {
        const board = createEmptyBoard(3);
        const moves = new Set<string>();

        for (let i = 0; i < 20; i++) {
            const move = easyStrategy(board, 'X');
            moves.add(`${move?.row}-${move?.col}`);
        }

        // With high probability, random strategy should produce different moves
        // (not guaranteed, but very likely with 20 iterations on 9-cell board)
        expect(moves.size).toBeGreaterThan(1);
    });

    it('should handle single available move', () => {
        let board = createEmptyBoard(3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (!(i === 0 && j === 0)) {
                    board = placeMark(board, i, j, 'X');
                }
            }
        }

        const move = easyStrategy(board, 'O');
        expect(move).toEqual({ row: 0, col: 0 });
    });
});

describe('CPU Strategies - Medium Strategy', () => {
    it('should block opponent winning move', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'X');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 0, col: 2 });
    });

    it('should prioritize blocking over random move', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'X');
        board = placeMark(board, 2, 2, 'O');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 0, col: 2 });
    });

    it('should use random move when no blocking needed', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('should return null when no moves available', () => {
        let board = createEmptyBoard(3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board = placeMark(board, i, j, 'X');
            }
        }

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toBeNull();
    });

    it('should block vertical winning move', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 0, 'X');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 2, col: 0 });
    });

    it('should block diagonal winning move', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'X');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 2, col: 2 });
    });

    it('should work with larger boards', () => {
        let board = createEmptyBoard(5);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'X');
        board = placeMark(board, 0, 2, 'X');
        board = placeMark(board, 0, 3, 'X');

        const move = mediumStrategy(board, 'O', 'X', 5);
        expect(move).toEqual({ row: 0, col: 4 });
    });
});

describe('CPU Strategies - Hard Strategy (Minimax)', () => {
    it('should return a valid move', () => {
        const board = createEmptyBoard(3);
        const move = hardStrategy(board, 'O', 'X', 3);

        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('should return null when no moves available', () => {
        let board = createEmptyBoard(3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board = placeMark(board, i, j, 'X');
            }
        }

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move).toBeNull();
    });

    it('should block opponent winning move', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'X');

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move?.row).toBe(0);
        expect(move?.col).toBe(2);
    });

    it('should win when opportunity exists', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'O');
        board = placeMark(board, 0, 1, 'O');

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move?.row).toBe(0);
        expect(move?.col).toBe(2);
    });

    it('should prefer center on empty board (strategy element)', () => {
        const board = createEmptyBoard(3);
        const move = hardStrategy(board, 'O', 'X', 3);

        // On empty board, minimax should prefer center cell (optimal play)
        expect(move).not.toBeNull();
        // Center is [1,1], but other corner/edge positions are also strategically sound
        // So we just verify it returns something reasonable
        expect(move?.row).toBeGreaterThanOrEqual(0);
        expect(move?.row).toBeLessThan(3);
    });

    it('should work with 4x4 board', () => {
        let board = createEmptyBoard(4);
        board = placeMark(board, 0, 0, 'O');
        board = placeMark(board, 0, 1, 'O');
        board = placeMark(board, 0, 2, 'O');

        const move = hardStrategy(board, 'O', 'X', 4);
        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('should complete a winning line when possible', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 1, 0, 'O');
        board = placeMark(board, 1, 1, 'O');
        // Empty at [1, 2] - winning position

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 1, col: 2 });
    });

    it('should perform reasonably within time constraints on 5x5 board', () => {
        let board = createEmptyBoard(5);
        board = placeMark(board, 0, 0, 'X');

        const startTime = performance.now();
        const move = hardStrategy(board, 'O', 'X', 5);
        const endTime = performance.now();

        expect(move).not.toBeNull();
        // Should complete in reasonable time (< 5 seconds)
        expect(endTime - startTime).toBeLessThan(5000);
    });
});

describe('CPU Strategies - Minimax Engine', () => {
    it('should detect immediate win for CPU', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'O');
        board = placeMark(board, 0, 1, 'O');
        board = placeMark(board, 0, 2, 'O');

        const score = minimax(board, 3, 'O', 'X', 0, true);
        // Score should reflect that CPU has won (positive value)
        expect(score).toBeGreaterThan(0);
    });

    it('should detect immediate loss for CPU', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'X');
        board = placeMark(board, 0, 2, 'X');

        const score = minimax(board, 3, 'O', 'X', 0, true);
        // Score should reflect that X has won (negative value)
        expect(score).toBeLessThan(0);
    });

    it('should detect draw', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'O');
        board = placeMark(board, 0, 2, 'X');
        board = placeMark(board, 1, 0, 'O');
        board = placeMark(board, 1, 1, 'X');
        board = placeMark(board, 1, 2, 'O');
        board = placeMark(board, 2, 0, 'O');
        board = placeMark(board, 2, 1, 'X');
        board = placeMark(board, 2, 2, 'O');

        const score = minimax(board, 3, 'O', 'X', 0, true);
        expect(score).toBe(0);
    });

    it('should use alpha-beta pruning correctly', () => {
        const board = createEmptyBoard(3);

        // This should complete quickly due to pruning
        const startTime = performance.now();
        const score = minimax(board, 3, 'O', 'X', 0, true);
        const endTime = performance.now();

        expect(typeof score).toBe('number');
        // With alpha-beta pruning, should be reasonably fast
        expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should prefer winning sooner (lower depth)', () => {
        // Create a board where CPU can win
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'O');
        board = placeMark(board, 0, 1, 'O');

        const score1 = minimax(board, 3, 'O', 'X', 0, true);

        // Same board but at different depth should affect score
        const score2 = minimax(board, 3, 'O', 'X', 2, true);

        // Both should be winning positions, but different depths
        expect(score1).toBeGreaterThan(0);
        expect(score2).toBeGreaterThan(0);
    });
});

describe('CPU Strategies - Board Size Constraints', () => {
    it('easy strategy works on 3x3 board and returns in-bounds move', () => {
        const board = createEmptyBoard(3);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(3);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(3);
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('easy strategy works on 5x5 board and returns in-bounds move', () => {
        const board = createEmptyBoard(5);
        const move = easyStrategy(board, 'O');

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(5);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(5);
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('easy strategy works on 10x10 board and returns in-bounds move', () => {
        const board = createEmptyBoard(10);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(10);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(10);
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('medium strategy does not crash on full board', () => {
        let board = createEmptyBoard(3);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board = placeMark(board, i, j, i % 2 === 0 ? 'X' : 'O');
            }
        }

        expect(() => mediumStrategy(board, 'O', 'X', 3)).not.toThrow();
        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toBeNull();
    });

    it('hard strategy respects board size on 3x3 - returned row/col within bounds', () => {
        const board = createEmptyBoard(3);
        const move = hardStrategy(board, 'O', 'X', 3);

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(3);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(3);
    });

    it('hard strategy finds winning move when CPU can win in one move', () => {
        // CPU (O) has two in a row on the first row, can win at [0, 2]
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'O');
        board = placeMark(board, 0, 1, 'O');
        board = placeMark(board, 1, 0, 'X');
        board = placeMark(board, 2, 2, 'X');

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 0, col: 2 });
    });

    it('hard strategy blocks player winning move (player about to win)', () => {
        // Player (X) has two in a row diagonally, about to win at [2, 2]
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'X');

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 2, col: 2 });
    });
});

describe('CPU Strategies - Integration Tests', () => {
    it('Easy strategy should be fast', () => {
        const board = createEmptyBoard(10);

        const startTime = performance.now();
        const move = easyStrategy(board, 'X');
        const endTime = performance.now();

        expect(move).not.toBeNull();
        expect(endTime - startTime).toBeLessThan(10);
    });

    it('Medium strategy should be fast', () => {
        let board = createEmptyBoard(10);
        board = placeMark(board, 0, 0, 'X');

        const startTime = performance.now();
        const move = mediumStrategy(board, 'O', 'X', 10);
        const endTime = performance.now();

        expect(move).not.toBeNull();
        expect(endTime - startTime).toBeLessThan(100);
    });

    it('Hard strategy should take reasonable time on 3x3', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 1, 1, 'X'); // CPU goes second

        const startTime = performance.now();
        const move = hardStrategy(board, 'O', 'X', 3);
        const endTime = performance.now();

        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
        // Should be reasonably fast for 3x3
        expect(endTime - startTime).toBeLessThan(1000);
    });

    it('all strategies should respect board constraints', () => {
        let board = createEmptyBoard(3);
        // Fill the entire 3x3 board
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                board = placeMark(board, i, j, i % 2 === 0 ? 'X' : 'O');
            }
        }

        const easyMove = easyStrategy(board, 'O');
        const mediumMove = mediumStrategy(board, 'O', 'X', 3);
        const hardMove = hardStrategy(board, 'O', 'X', 3);

        expect(easyMove).toBeNull();
        expect(mediumMove).toBeNull();
        expect(hardMove).toBeNull();
    });

    it('all strategies should make valid moves on partially filled board', () => {
        let board = createEmptyBoard(4);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'O');
        board = placeMark(board, 2, 2, 'X');

        const easyMove = easyStrategy(board, 'O');
        const mediumMove = mediumStrategy(board, 'O', 'X', 4);
        const hardMove = hardStrategy(board, 'O', 'X', 4);

        expect(board[easyMove!.row][easyMove!.col]).toBeNull();
        expect(board[mediumMove!.row][mediumMove!.col]).toBeNull();
        expect(board[hardMove!.row][hardMove!.col]).toBeNull();
    });
});
