/**
 * GameResultOverlay Component Tests
 * Task 3.7: Create Game Result Overlay component for end-game display
 * Validates: Requirements 5, 9, 14
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GameResultOverlay from '../GameResultOverlay.vue'
import { GameResult } from '@/types'

describe('GameResultOverlay', () => {
    const mockPlayerOne = {
        name: 'Alice',
        symbol: '🕷️',
    }

    const mockPlayerTwo = {
        name: 'Bob',
        symbol: '🕸️',
    }

    const mockBoard = [
        ['🕷️', '🕷️', '🕷️'],
        ['🕸️', '🕸️', null],
        ['🕷️', null, '🕸️'],
    ]

    const mockWinningLines = [
        [
            [0, 0],
            [0, 1],
            [0, 2],
        ],
    ]

    describe('Player One Wins', () => {
        it('should display "PLAYER 1 WINS!" when gameResult is player-one-wins', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const message = wrapper.find('.result-message')
            expect(message.text()).toBe('PLAYER 1 WINS!')
        })

        it('should apply red styling for Player 1 win', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const card = wrapper.find('.result-card')
            expect(card.classes()).toContain('result-card-player-one')
        })

        it('should display Player 1 as winner', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('Alice')
        })
    })

    describe('Player Two Wins', () => {
        it('should display "PLAYER 2 WINS!" when gameResult is player-two-wins', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerTwoWins as any,
                    winner: mockPlayerTwo.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const message = wrapper.find('.result-message')
            expect(message.text()).toBe('PLAYER 2 WINS!')
        })

        it('should apply yellow styling for Player 2 win', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerTwoWins as any,
                    winner: mockPlayerTwo.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const card = wrapper.find('.result-card')
            expect(card.classes()).toContain('result-card-player-two')
        })

        it('should display Player 2 as winner', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerTwoWins as any,
                    winner: mockPlayerTwo.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('Bob')
        })
    })

    describe('Draw', () => {
        it('should display "IT\'S A DRAW!" when gameResult is draw', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.Draw as any,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const message = wrapper.find('.result-message')
            expect(message.text()).toBe("IT'S A DRAW!")
        })

        it('should apply draw styling for draw result', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.Draw as any,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const card = wrapper.find('.result-card')
            expect(card.classes()).toContain('result-card-draw')
        })

        it('should display "Draw" as result', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.Draw as any,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('Draw')
        })

        it('should not show winning cells for draw', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.Draw as any,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    winningLines: mockWinningLines,
                    isVisible: true,
                },
            })

            const winningCells = wrapper.find('.winning-cells-display')
            expect(winningCells.exists()).toBe(false)
        })
    })

    describe('Winning Cells Display', () => {
        it('should display winning lines for Player 1 win', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    board: mockBoard,
                    winningLines: mockWinningLines,
                    isVisible: true,
                },
            })

            const winningCells = wrapper.find('.winning-cells-display')
            expect(winningCells.exists()).toBe(true)
        })

        it('should show correct number of winning lines', () => {
            const multipleWinningLines = [
                [
                    [0, 0],
                    [0, 1],
                    [0, 2],
                ],
                [
                    [1, 0],
                    [1, 1],
                    [1, 2],
                ],
            ]

            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    board: mockBoard,
                    winningLines: multipleWinningLines,
                    isVisible: true,
                },
            })

            const winningLines = wrapper.findAll('.winning-line')
            expect(winningLines).toHaveLength(2)
        })

        it('should display symbols in winning cells', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    board: mockBoard,
                    winningLines: mockWinningLines,
                    isVisible: true,
                },
            })

            const winningCellSpans = wrapper.findAll('.winning-cell')
            expect(winningCellSpans.length).toBeGreaterThan(0)
            // Should display spider emoji from board
            expect(winningCellSpans[0].text()).toBe('🕷️')
        })
    })

    describe('Game Statistics', () => {
        it('should display board size', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    boardSize: 5,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('5×5')
        })

        it('should display total moves count', () => {
            const mockMoves = [
                { row: 0, col: 0, symbol: '🕷️', playerName: 'Alice', timestamp: 1000 },
                { row: 1, col: 1, symbol: '🕸️', playerName: 'Bob', timestamp: 2000 },
                { row: 0, col: 1, symbol: '🕷️', playerName: 'Alice', timestamp: 3000 },
            ]

            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    moves: mockMoves,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('3')
        })

        it('should display game duration', () => {
            const startTime = 1000
            const endTime = 61000 // 60 seconds later

            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    startTime,
                    endTime,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('1m')
        })

        it('should display duration in seconds only for short games', () => {
            const startTime = 1000
            const endTime = 31000 // 30 seconds

            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    startTime,
                    endTime,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('30s')
        })

        it('should display N/A for duration when times not provided', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const stats = wrapper.text()
            expect(stats).toContain('N/A')
        })
    })

    describe('Action Buttons', () => {
        it('should render replay button', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const replayBtn = wrapper.find('.btn-replay')
            expect(replayBtn.exists()).toBe(true)
            expect(replayBtn.text()).toContain('Replay')
        })

        it('should render main menu button', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const menuBtn = wrapper.find('.btn-main-menu')
            expect(menuBtn.exists()).toBe(true)
            expect(menuBtn.text()).toContain('Main Menu')
        })

        it('should emit replay event when replay button clicked', async () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const replayBtn = wrapper.find('.btn-replay')
            await replayBtn.trigger('click')

            expect(wrapper.emitted('replay')).toBeTruthy()
            expect(wrapper.emitted('replay')).toHaveLength(1)
        })

        it('should emit main-menu event when menu button clicked', async () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const menuBtn = wrapper.find('.btn-main-menu')
            await menuBtn.trigger('click')

            expect(wrapper.emitted('main-menu')).toBeTruthy()
            expect(wrapper.emitted('main-menu')).toHaveLength(1)
        })
    })

    describe('Visibility', () => {
        it('should be hidden when isVisible is false', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: false,
                },
            })

            const overlay = wrapper.find('.overlay-container')
            expect(overlay.exists()).toBe(false)
        })

        it('should be visible when isVisible is true', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            const overlay = wrapper.find('.overlay-container')
            expect(overlay.exists()).toBe(true)
        })
    })

    describe('Edge Cases', () => {
        it('should handle missing player names gracefully', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    playerOne: { name: '', symbol: '🕷️' },
                    playerTwo: { name: '', symbol: '🕸️' },
                    isVisible: true,
                },
            })

            const message = wrapper.find('.result-message')
            expect(message.text()).toBe('PLAYER 1 WINS!')
        })

        it('should handle empty winning lines array', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    winningLines: [],
                    isVisible: true,
                },
            })

            const winningCells = wrapper.find('.winning-cells-display')
            expect(winningCells.exists()).toBe(false)
        })

        it('should handle missing board data', () => {
            const wrapper = mount(GameResultOverlay, {
                props: {
                    gameResult: GameResult.PlayerOneWins as any,
                    winner: mockPlayerOne.name,
                    playerOne: mockPlayerOne,
                    playerTwo: mockPlayerTwo,
                    isVisible: true,
                },
            })

            expect(wrapper.exists()).toBe(true)
            const message = wrapper.find('.result-message')
            expect(message.text()).toBe('PLAYER 1 WINS!')
        })
    })
})
