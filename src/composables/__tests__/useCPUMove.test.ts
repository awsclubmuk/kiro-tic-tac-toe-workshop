/**
 * Tests for CPU Move Execution Composable
 * Task 5.5: Create CPU Move execution composable
 * Requirements: 6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCPUMove } from '../useCPUMove';
import { useGameState } from '../useGameState';
import { useCPUOpponent } from '../useCPUOpponent';
import type { Player, CPUMoveResult } from '../../types/index';

describe('useCPUMove', () => {
    let cpuMoveComposable: ReturnType<typeof useCPUMove>;
    let gameStateComposable: ReturnType<typeof useGameState>;
    let cpuOpponentComposable: ReturnType<typeof useCPUOpponent>;

    beforeEach(() => {
        gameStateComposable = useGameState();
        cpuOpponentComposable = useCPUOpponent();
        cpuMoveComposable = useCPUMove(gameStateComposable, cpuOpponentComposable);
    });

    describe('executeMove', () => {
        it('should execute a CPU move when called with valid game state', async () => {
            // Setup: Initialize a game with CPU as player 2
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');

            // Setup: Make a human move first
            gameStateComposable.makeMove(0, 0); // Human moves at [0,0]
            gameStateComposable.switchTurn(); // Switch to CPU

            // Mock getCPUMove to return a valid move
            const mockMove: CPUMoveResult = { row: 1, col: 1, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            // Store initial move count
            const initialMoveCount = gameStateComposable.moveHistory.value.length;

            // Execute CPU move
            await cpuMoveComposable.executeMove();

            // Assert: Move was added to history
            expect(gameStateComposable.moveHistory.value.length).toBe(initialMoveCount + 1);
            expect(gameStateComposable.board.value[1][1]).toBe('O');

            // Assert: Move result is tracked
            expect(cpuMoveComposable.getLastMoveResult()).toEqual(mockMove);

            // Assert: Turn switched back to human
            expect(gameStateComposable.getCurrentPlayer().isAI).toBe(false);
        });

        it('should handle delay parameter correctly', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            const mockMove: CPUMoveResult = { row: 1, col: 1, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            // Measure execution time with delay
            const startTime = Date.now();
            const delayMs = 100;
            await cpuMoveComposable.executeMove(delayMs);
            const elapsedTime = Date.now() - startTime;

            // Assert: Delay was applied (with some tolerance)
            expect(elapsedTime).toBeGreaterThanOrEqual(delayMs - 10);
        });

        it('should handle edge case when CPU cannot generate a move', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            // Mock getCPUMove to return null (no valid move)
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(null);

            const initialMoveCount = gameStateComposable.moveHistory.value.length;

            // Execute CPU move
            await cpuMoveComposable.executeMove();

            // Assert: No move was added
            expect(gameStateComposable.moveHistory.value.length).toBe(initialMoveCount);

            // Assert: Turn was switched back to human
            expect(gameStateComposable.getCurrentPlayer().isAI).toBe(false);

            // Assert: Last move result is null
            expect(cpuMoveComposable.getLastMoveResult()).toBeNull();
        });

        it('should handle edge case when generated move is invalid', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            // Fill the board to make most moves invalid
            gameStateComposable.makeMove(1, 1); // Add move to occupied cell won't work, so we add to board manually
            gameStateComposable.board.value[0][1] = 'X';
            gameStateComposable.board.value[0][2] = 'O';
            gameStateComposable.board.value[1][0] = 'X';
            gameStateComposable.board.value[1][1] = 'O';
            gameStateComposable.board.value[1][2] = 'X';
            gameStateComposable.board.value[2][0] = 'O';
            gameStateComposable.board.value[2][1] = 'X';

            // Mock getCPUMove to return move at already occupied cell
            const invalidMove: CPUMoveResult = { row: 0, col: 0, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(invalidMove);

            const initialMoveCount = gameStateComposable.moveHistory.value.length;

            // Execute CPU move
            await cpuMoveComposable.executeMove();

            // Assert: No new move was added
            expect(gameStateComposable.moveHistory.value.length).toBe(initialMoveCount);

            // Assert: Turn switched back to human
            expect(gameStateComposable.getCurrentPlayer().isAI).toBe(false);
        });

        it('should prevent concurrent move execution', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            const mockMove: CPUMoveResult = { row: 1, col: 1, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            // Start first move execution
            const promise1 = cpuMoveComposable.executeMove(100);

            // Immediately try to start second move
            expect(cpuMoveComposable.isExecutingMove()).toBe(true);

            // Second execution should return immediately
            const promise2 = cpuMoveComposable.executeMove();

            // Both should complete
            await promise1;
            await promise2;

            // Only one move should be recorded
            expect(gameStateComposable.moveHistory.value.filter((m) => m.symbol === 'O')).toHaveLength(1);
        });

        it('should handle missing difficulty level gracefully', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo);
            gameStateComposable.difficulty.value = null; // No difficulty set
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            const mockMove: CPUMoveResult = { row: 1, col: 1, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            // Should default to easy difficulty and execute move
            await cpuMoveComposable.executeMove();

            // Assert: Difficulty was set to easy
            expect(gameStateComposable.difficulty.value).toBe('easy');

            // Assert: Move was executed
            expect(gameStateComposable.board.value[1][1]).toBe('O');
        });

        it('should not execute when CPU is not current player', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            // Don't switch turn, so human is still current player

            const initialMoveCount = gameStateComposable.moveHistory.value.length;

            // Try to execute CPU move when human is current player
            await cpuMoveComposable.executeMove();

            // Assert: No move was added
            expect(gameStateComposable.moveHistory.value.length).toBe(initialMoveCount);
        });
    });

    describe('getLastMoveResult', () => {
        it('should return null initially', () => {
            expect(cpuMoveComposable.getLastMoveResult()).toBeNull();
        });

        it('should return the last executed move result', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            const mockMove: CPUMoveResult = { row: 2, col: 2, confidence: 0.9 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            await cpuMoveComposable.executeMove();

            const result = cpuMoveComposable.getLastMoveResult();
            expect(result).toEqual(mockMove);
        });
    });

    describe('isExecutingMove', () => {
        it('should return false when not executing', () => {
            expect(cpuMoveComposable.isExecutingMove()).toBe(false);
        });

        it('should return true during execution', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            const mockMove: CPUMoveResult = { row: 1, col: 1, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            // Start execution with delay to check state during execution
            const movePromise = cpuMoveComposable.executeMove(50);
            expect(cpuMoveComposable.isExecutingMove()).toBe(true);

            await movePromise;
            expect(cpuMoveComposable.isExecutingMove()).toBe(false);
        });
    });

    describe('resetMoveTracking', () => {
        it('should clear the last move result', async () => {
            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            const mockMove: CPUMoveResult = { row: 1, col: 1, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            await cpuMoveComposable.executeMove();
            expect(cpuMoveComposable.getLastMoveResult()).not.toBeNull();

            cpuMoveComposable.resetMoveTracking();
            expect(cpuMoveComposable.getLastMoveResult()).toBeNull();
        });
    });

    describe('cpu-move-executed event', () => {
        it('should dispatch event after successful move', async () => {
            const eventListener = vi.fn();
            window.addEventListener('cpu-move-executed', eventListener);

            const playerOne: Player = {
                name: 'Human Player',
                symbol: 'X',
                isAI: false,
            };
            const playerTwo: Player = {
                name: 'CPU Player',
                symbol: 'O',
                isAI: true,
            };

            gameStateComposable.initializeGame(3, 'single-player', playerOne, playerTwo, 'easy');
            gameStateComposable.makeMove(0, 0);
            gameStateComposable.switchTurn();

            const mockMove: CPUMoveResult = { row: 1, col: 1, confidence: 0.8 };
            vi.spyOn(cpuOpponentComposable, 'getCPUMove').mockReturnValue(mockMove);

            await cpuMoveComposable.executeMove();

            expect(eventListener).toHaveBeenCalled();
            const event = eventListener.mock.calls[0][0] as CustomEvent;
            expect(event.detail.moveResult).toEqual(mockMove);

            window.removeEventListener('cpu-move-executed', eventListener);
        });
    });
});
