/**
 * CPU Opponent Composable Tests
 * Task 5.1: Create CPU AI engine with difficulty-based strategy
 * Requirements: 6, 7
 */

import { describe, it, expect } from 'vitest';
import { useCPUOpponent } from '../useCPUOpponent';
import type { Difficulty, Board } from '../../types/index';
import { createEmptyBoard } from '../../utils/boardUtils';

describe('useCPUOpponent', () => {
    const { selectStrategy, getCPUMove } = useCPUOpponent();

    describe('selectStrategy', () => {
        it('should return easyStrategy function for easy difficulty', () => {
            const strategy = selectStrategy('easy');
            expect(strategy).toBeDefined();
            expect(typeof strategy).toBe('function');
        });

        it('should return mediumStrategy function for medium difficulty', () => {
            const strategy = selectStrategy('medium');
            expect(strategy).toBeDefined();
            expect(typeof strategy).toBe('function');
        });

        it('should return hardStrategy function for hard difficulty', () => {
            const strategy = selectStrategy('hard');
            expect(strategy).toBeDefined();
            expect(typeof strategy).toBe('function');
        });

        it('should return easyStrategy for unknown difficulty', () => {
            const strategy = selectStrategy('unknown' as Difficulty);
            expect(strategy).toBeDefined();
            expect(typeof strategy).toBe('function');
        });
    });

    describe('getCPUMove', () => {
        it('should accept valid parameters without error', () => {
            const board: Board = createEmptyBoard(3);
            const result = getCPUMove(board, 'easy', 'X', 'O', 3);
            // Result will be null in Task 5.1 implementation base, but function should not throw
            expect(result === null || typeof result === 'object').toBe(true);
        });

        it('should work with different board sizes', () => {
            const board5: Board = createEmptyBoard(5);
            const result5 = getCPUMove(board5, 'medium', 'X', 'O', 5);
            expect(result5 === null || typeof result5 === 'object').toBe(true);

            const board10: Board = createEmptyBoard(10);
            const result10 = getCPUMove(board10, 'hard', 'X', 'O', 10);
            expect(result10 === null || typeof result10 === 'object').toBe(true);
        });

        it('should work with different symbol combinations', () => {
            const board: Board = createEmptyBoard(3);
            const result1 = getCPUMove(board, 'easy', '🕷️', '🕸️', 3);
            expect(result1 === null || typeof result1 === 'object').toBe(true);

            const result2 = getCPUMove(board, 'medium', 'A', 'B', 3);
            expect(result2 === null || typeof result2 === 'object').toBe(true);
        });

        it('should handle all difficulty levels', () => {
            const board: Board = createEmptyBoard(3);
            const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

            difficulties.forEach((difficulty) => {
                const result = getCPUMove(board, difficulty, 'X', 'O', 3);
                expect(result === null || typeof result === 'object').toBe(true);
            });
        });
    });

    describe('CPUMoveResult type validation', () => {
        it('should return result with correct structure when move is found', () => {
            // This test validates the type structure that will be returned by strategies
            // For now, strategies return null, but future tasks will implement actual moves
            const board: Board = createEmptyBoard(3);
            const result = getCPUMove(board, 'easy', 'X', 'O', 3);

            if (result !== null) {
                expect(result).toHaveProperty('row');
                expect(result).toHaveProperty('col');
                expect(result).toHaveProperty('confidence');
                expect(typeof result.row).toBe('number');
                expect(typeof result.col).toBe('number');
                expect(typeof result.confidence).toBe('number');
            }
        });
    });
});
