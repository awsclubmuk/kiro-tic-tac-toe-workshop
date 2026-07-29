/**
 * Tests for useGameConfig composable
 * Task 9.2: Create Game Configuration Manager
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useGameConfig } from '../useGameConfig'
import type { Difficulty } from '../../types'

describe('useGameConfig', () => {
    let gameConfig: ReturnType<typeof useGameConfig>

    beforeEach(() => {
        gameConfig = useGameConfig()
    })

    describe('Board Size Configuration', () => {
        it('should initialize with default board size of 3', () => {
            expect(gameConfig.config.boardSize).toBe(3)
        })

        it('should accept valid board sizes (3-10)', () => {
            for (let size = 3; size <= 10; size++) {
                const result = gameConfig.setBoardSize(size)
                expect(result).toBe(true)
                expect(gameConfig.config.boardSize).toBe(size)
            }
        })

        it('should reject board size less than 3', () => {
            const result = gameConfig.setBoardSize(2)
            expect(result).toBe(false)
            expect(gameConfig.isConfigValid.value).toBe(false)
            expect(gameConfig.validationErrors.value).toContain(
                'Board size must be between 3 and 10'
            )
        })

        it('should reject board size greater than 10', () => {
            const result = gameConfig.setBoardSize(11)
            expect(result).toBe(false)
            expect(gameConfig.isConfigValid.value).toBe(false)
            expect(gameConfig.validationErrors.value).toContain(
                'Board size must be between 3 and 10'
            )
        })
    })

    describe('Game Mode Configuration', () => {
        it('should initialize with two-player mode', () => {
            expect(gameConfig.config.gameMode).toBe('two-player')
        })

        it('should allow switching to single-player mode', () => {
            gameConfig.setGameMode('single-player')
            expect(gameConfig.config.gameMode).toBe('single-player')
        })

        it('should allow switching back to two-player mode', () => {
            gameConfig.setGameMode('single-player')
            gameConfig.setGameMode('two-player')
            expect(gameConfig.config.gameMode).toBe('two-player')
        })

        it('should clear difficulty when switching to two-player', () => {
            gameConfig.setDifficulty('hard')
            gameConfig.setGameMode('two-player')
            expect(gameConfig.config.difficulty).toBeNull()
        })
    })

    describe('Difficulty Configuration', () => {
        it('should allow setting difficulty levels', () => {
            const difficulties: Difficulty[] = ['easy', 'medium', 'hard']
            difficulties.forEach((difficulty) => {
                gameConfig.setDifficulty(difficulty)
                expect(gameConfig.config.difficulty).toBe(difficulty)
            })
        })

        it('should allow clearing difficulty', () => {
            gameConfig.setDifficulty('hard')
            gameConfig.setDifficulty(null)
            expect(gameConfig.config.difficulty).toBeNull()
        })
    })

    describe('Symbol Configuration', () => {
        it('should initialize with default symbols', () => {
            expect(gameConfig.config.symbols.playerOne.value).toBe('🕷️')
            expect(gameConfig.config.symbols.playerTwo.value).toBe('🕸️')
        })

        it('should allow setting different symbols for each player', () => {
            const symbol1 = gameConfig.getAvailableSymbols()[2] // Red circle
            const symbol2 = gameConfig.getAvailableSymbols()[3] // Yellow circle

            const result1 = gameConfig.setPlayerSymbol(1, symbol1)
            expect(result1).toBe(true)
            expect(gameConfig.config.symbols.playerOne.value).toBe(symbol1.value)

            const result2 = gameConfig.setPlayerSymbol(2, symbol2)
            expect(result2).toBe(true)
            expect(gameConfig.config.symbols.playerTwo.value).toBe(symbol2.value)
        })

        it('should reject duplicate symbols for both players', () => {
            const symbol = gameConfig.getAvailableSymbols()[2] // Red circle

            gameConfig.setPlayerSymbol(1, symbol)
            const result = gameConfig.setPlayerSymbol(2, symbol)

            expect(result).toBe(false)
            expect(gameConfig.isConfigValid.value).toBe(false)
            expect(gameConfig.validationErrors.value).toContain(
                'Players must have different symbols'
            )
        })

        it('should provide list of available symbols', () => {
            const symbols = gameConfig.getAvailableSymbols()
            expect(symbols.length).toBeGreaterThan(0)
            expect(symbols.every((s) => s.value && s.displayName)).toBe(true)
        })
    })

    describe('Player Configuration', () => {
        it('should initialize with default player names', () => {
            expect(gameConfig.config.playerOne.name).toBe('Player 1')
            expect(gameConfig.config.playerTwo.name).toBe('Player 2')
        })

        it('should allow setting player names', () => {
            gameConfig.setPlayerName(1, 'Alice')
            gameConfig.setPlayerName(2, 'Bob')

            expect(gameConfig.config.playerOne.name).toBe('Alice')
            expect(gameConfig.config.playerTwo.name).toBe('Bob')
        })
    })

    describe('First Player Configuration', () => {
        it('should default to player one going first', () => {
            expect(gameConfig.config.playerOneGoesFirst).toBe(true)
        })

        it('should allow setting player two to go first', () => {
            gameConfig.setFirstPlayer(2)
            expect(gameConfig.config.playerOneGoesFirst).toBe(false)
        })

        it('should allow setting player one to go first', () => {
            gameConfig.setFirstPlayer(2)
            gameConfig.setFirstPlayer(1)
            expect(gameConfig.config.playerOneGoesFirst).toBe(true)
        })
    })

    describe('Configuration Validation', () => {
        it('should validate complete configuration', () => {
            gameConfig.setBoardSize(5)
            gameConfig.setGameMode('two-player')
            expect(gameConfig.validateConfig()).toBe(true)
        })

        it('should require different symbols when both set', () => {
            const symbol = gameConfig.getAvailableSymbols()[0]
            gameConfig.setPlayerSymbol(1, symbol)
            // Try to set player 2 to same symbol - this should fail and return false
            const result = gameConfig.setPlayerSymbol(2, symbol)
            expect(result).toBe(false)
            expect(gameConfig.isConfigValid.value).toBe(false)
        })

        it('should require difficulty for single-player mode', () => {
            gameConfig.setGameMode('single-player')
            gameConfig.setDifficulty(null)
            expect(gameConfig.validateConfig()).toBe(false)
        })

        it('should validate single-player mode with difficulty set', () => {
            gameConfig.setGameMode('single-player')
            gameConfig.setDifficulty('medium')
            expect(gameConfig.validateConfig()).toBe(true)
        })
    })

    describe('Configuration Loading and Resetting', () => {
        it('should reset to defaults', () => {
            gameConfig.setBoardSize(7)
            gameConfig.setGameMode('single-player')
            gameConfig.setDifficulty('hard')

            gameConfig.resetConfig()

            expect(gameConfig.config.boardSize).toBe(3)
            expect(gameConfig.config.gameMode).toBe('two-player')
            expect(gameConfig.config.difficulty).toBeNull()
        })

        it('should load partial configuration', () => {
            gameConfig.loadConfig({
                boardSize: 6,
                gameMode: 'single-player',
                difficulty: 'hard',
            })

            expect(gameConfig.config.boardSize).toBe(6)
            expect(gameConfig.config.gameMode).toBe('single-player')
            expect(gameConfig.config.difficulty).toBe('hard')
        })

        it('should get current configuration', () => {
            gameConfig.setBoardSize(4)
            const config = gameConfig.getConfig()

            expect(config.boardSize).toBe(4)
            expect(config.gameMode).toBe('two-player')
        })
    })

    describe('Player Swap (for Replay)', () => {
        it('should swap player positions', () => {
            const originalP1 = gameConfig.config.playerOne.name
            const originalP2 = gameConfig.config.playerTwo.name

            gameConfig.swapPlayers()

            expect(gameConfig.config.playerOne.name).toBe(originalP2)
            expect(gameConfig.config.playerTwo.name).toBe(originalP1)
        })

        it('should swap player symbols', () => {
            const symbol1 = gameConfig.getAvailableSymbols()[2]
            const symbol2 = gameConfig.getAvailableSymbols()[3]

            gameConfig.setPlayerSymbol(1, symbol1)
            gameConfig.setPlayerSymbol(2, symbol2)

            gameConfig.swapPlayers()

            expect(gameConfig.config.symbols.playerOne.value).toBe(symbol2.value)
            expect(gameConfig.config.symbols.playerTwo.value).toBe(symbol1.value)
        })

        it('should flip who goes first on player swap', () => {
            gameConfig.setFirstPlayer(1)
            expect(gameConfig.config.playerOneGoesFirst).toBe(true)

            gameConfig.swapPlayers()

            expect(gameConfig.config.playerOneGoesFirst).toBe(false)
        })
    })
})
