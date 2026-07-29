/**
 * CPU Opponent Composable
 * Task 5.1: Create CPU AI engine with difficulty-based strategy
 * Requirements: 6, 7
 *
 * Delegates to concrete strategies in utils/cpuStrategies.ts
 */

import type { Board, Difficulty, CPUMoveResult } from '../types/index';
import {
    easyStrategy as easyStrategyImpl,
    mediumStrategy as mediumStrategyImpl,
    hardStrategy as hardStrategyImpl,
} from '../utils/cpuStrategies';

/**
 * Strategy function type that returns a move and confidence
 */
type StrategyFunction = (
    board: Board,
    cpuSymbol: string,
    playerSymbol: string,
    boardSize: number
) => CPUMoveResult | null;

function withConfidence(
    move: { row: number; col: number } | null,
    confidence: number
): CPUMoveResult | null {
    if (!move) return null;
    return { row: move.row, col: move.col, confidence };
}

/**
 * CPU Opponent composable for managing AI difficulty levels and strategies
 */
export function useCPUOpponent() {
    function easyStrategy(
        board: Board,
        cpuSymbol: string,
        _playerSymbol: string = '',
        _boardSize: number = board.length
    ): CPUMoveResult | null {
        return withConfidence(easyStrategyImpl(board, cpuSymbol), 0.3);
    }

    function mediumStrategy(
        board: Board,
        cpuSymbol: string,
        playerSymbol: string,
        boardSize: number
    ): CPUMoveResult | null {
        return withConfidence(
            mediumStrategyImpl(board, cpuSymbol, playerSymbol, boardSize),
            0.65
        );
    }

    function hardStrategy(
        board: Board,
        cpuSymbol: string,
        playerSymbol: string,
        boardSize: number
    ): CPUMoveResult | null {
        return withConfidence(
            hardStrategyImpl(board, cpuSymbol, playerSymbol, boardSize),
            0.95
        );
    }

    function selectStrategy(difficulty: Difficulty): StrategyFunction {
        switch (difficulty) {
            case 'easy':
                return easyStrategy;
            case 'medium':
                return mediumStrategy;
            case 'hard':
                return hardStrategy;
            default:
                return easyStrategy;
        }
    }

    function getCPUMove(
        board: Board,
        difficulty: Difficulty,
        cpuSymbol: string,
        playerSymbol: string,
        boardSize: number
    ): CPUMoveResult | null {
        const strategy = selectStrategy(difficulty);
        return strategy(board, cpuSymbol, playerSymbol, boardSize);
    }

    return {
        selectStrategy,
        easyStrategy,
        mediumStrategy,
        hardStrategy,
        getCPUMove,
    };
}
