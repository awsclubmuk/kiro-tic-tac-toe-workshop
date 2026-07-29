/**
 * Game Configuration Manager Composable
 * Task 9.2 — Requirements: 1, 3, 6, 7
 */

import { reactive, computed, ref } from 'vue';
import type { GameMode, Difficulty, Player } from '../types';

const STORAGE_KEY = 'ttt-config';

export interface SymbolOption {
    value: string;
    displayName: string;
    isCustom: boolean;
}

export interface GameConfigState {
    boardSize: number;
    gameMode: GameMode;
    difficulty: Difficulty | null;
    symbols: {
        playerOne: SymbolOption;
        playerTwo: SymbolOption;
    };
    playerOne: { name: string };
    playerTwo: { name: string };
    playerOneGoesFirst: boolean;
}

const AVAILABLE_SYMBOLS: SymbolOption[] = [
    { value: '🕷️', displayName: 'Spider', isCustom: false },
    { value: '🕸️', displayName: 'Web', isCustom: false },
    { value: '🔴', displayName: 'Red Circle', isCustom: false },
    { value: '🟡', displayName: 'Yellow Circle', isCustom: false },
    { value: '⭕', displayName: 'Circle', isCustom: false },
    { value: '❌', displayName: 'Cross', isCustom: false },
    { value: 'S', displayName: 'S', isCustom: false },
    { value: 'W', displayName: 'W', isCustom: false },
    { value: 'P1', displayName: 'P1', isCustom: false },
    { value: 'P2', displayName: 'P2', isCustom: false },
];

function makeDefaults(): GameConfigState {
    return {
        boardSize: 3,
        gameMode: 'two-player',
        difficulty: null,
        symbols: {
            playerOne: { value: '🕷️', displayName: 'Spider', isCustom: false },
            playerTwo: { value: '🕸️', displayName: 'Web', isCustom: false },
        },
        playerOne: { name: 'Player 1' },
        playerTwo: { name: 'Player 2' },
        playerOneGoesFirst: true,
    };
}

export function useGameConfig() {
    // Use reactive so properties are directly mutable (config.boardSize = 5 works)
    const config = reactive<GameConfigState>(makeDefaults());
    const validationErrors = ref<string[]>([]);

    function _validate(): void {
        const errors: string[] = [];
        if (config.boardSize < 3 || config.boardSize > 10) {
            errors.push('Board size must be between 3 and 10');
        }
        if (config.symbols.playerOne.value === config.symbols.playerTwo.value) {
            errors.push('Players must have different symbols');
        }
        if (!config.symbols.playerOne.value || !config.symbols.playerTwo.value) {
            errors.push('Both players must select symbols');
        }
        if (config.gameMode === 'single-player' && !config.difficulty) {
            errors.push('Difficulty must be selected for single-player mode');
        }
        validationErrors.value = errors;
    }

    _validate();

    const isConfigValid = computed(() => validationErrors.value.length === 0);

    function validateConfig(): boolean {
        _validate();
        return validationErrors.value.length === 0;
    }

    function setBoardSize(size: number): boolean {
        config.boardSize = size;
        _validate();
        return size >= 3 && size <= 10;
    }

    function setGameMode(mode: GameMode): void {
        config.gameMode = mode;
        if (mode === 'two-player') config.difficulty = null;
        else if (!config.difficulty) config.difficulty = 'medium';
        _validate();
    }

    function setDifficulty(difficulty: Difficulty | null): void {
        config.difficulty = difficulty;
        _validate();
    }

    function setPlayerSymbol(player: 1 | 2, symbol: SymbolOption): boolean {
        const other = player === 1 ? config.symbols.playerTwo : config.symbols.playerOne;
        if (player === 1) config.symbols.playerOne = { ...symbol };
        else config.symbols.playerTwo = { ...symbol };
        _validate();
        return symbol.value !== other.value;
    }

    function setPlayerName(player: 1 | 2, name: string): void {
        if (player === 1) config.playerOne.name = name;
        else config.playerTwo.name = name;
    }

    function setFirstPlayer(player: 1 | 2): void {
        config.playerOneGoesFirst = player === 1;
    }

    function swapPlayers(): void {
        const tmpName = config.playerOne.name;
        config.playerOne.name = config.playerTwo.name;
        config.playerTwo.name = tmpName;

        const tmpSym = { ...config.symbols.playerOne };
        config.symbols.playerOne = { ...config.symbols.playerTwo };
        config.symbols.playerTwo = tmpSym;

        config.playerOneGoesFirst = !config.playerOneGoesFirst;
        _validate();
    }

    function getAvailableSymbols(): SymbolOption[] {
        return [...AVAILABLE_SYMBOLS];
    }

    function getPlayerObjects(): { playerOne: Player; playerTwo: Player } {
        const p1: Player = {
            name: config.playerOne.name,
            symbol: config.symbols.playerOne.value,
            isAI: false,
        };
        const p2: Player = {
            name: config.gameMode === 'single-player' ? 'CPU' : config.playerTwo.name,
            symbol: config.symbols.playerTwo.value,
            isAI: config.gameMode === 'single-player',
        };
        return config.playerOneGoesFirst
            ? { playerOne: p1, playerTwo: p2 }
            : { playerOne: p2, playerTwo: p1 };
    }

    function getConfig(): GameConfigState {
        return JSON.parse(JSON.stringify(config));
    }

    function loadConfig(partial: Partial<GameConfigState>): void {
        Object.assign(config, partial);
        _validate();
    }

    function resetConfig(): void {
        Object.assign(config, makeDefaults());
        validationErrors.value = [];
    }

    function persistConfig(): void {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* ignore */ }
    }

    function restoreConfig(): boolean {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return false;
            Object.assign(config, JSON.parse(raw));
            _validate();
            return true;
        } catch { return false; }
    }

    return {
        config,          // reactive object — access as config.boardSize etc.
        validationErrors,
        isConfigValid,
        validateConfig,
        setBoardSize,
        setGameMode,
        setDifficulty,
        setPlayerSymbol,
        setPlayerName,
        setFirstPlayer,
        swapPlayers,
        getAvailableSymbols,
        getPlayerObjects,
        getConfig,
        loadConfig,
        resetConfig,
        persistConfig,
        restoreConfig,
    };
}
