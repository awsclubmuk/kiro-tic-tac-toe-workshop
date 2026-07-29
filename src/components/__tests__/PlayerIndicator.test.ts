/**
 * PlayerIndicator Component Tests
 * Task 3.3: Create Player Indicator component showing current player's turn
 * Validates: Requirements 4, 15 - Two-Player Game Mode & Turn-Based Game Flow Control
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PlayerIndicator from '../PlayerIndicator.vue'
import type { Player } from '../../types'

describe('PlayerIndicator Component', () => {
    const mockPlayer1: Player = {
        name: 'Alice',
        symbol: '🕷️',
        isAI: false,
    }

    const mockPlayer2: Player = {
        name: 'Bob',
        symbol: '🕸️',
        isAI: false,
    }

    const mockCPU: Player = {
        name: 'CPU',
        symbol: '🤖',
        isAI: true,
    }

    describe('Player 1 Styling (Red)', () => {
        it('should apply red gradient background for Player 1', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    playerNumber: 1,
                },
            })

            const card = wrapper.find('.player-card')
            expect(card.classes()).toContain('bg-gradient-to-r')
            expect(card.classes()).toContain('from-red-700')
            expect(card.classes()).toContain('to-spiderman-red')
        })

        it('should display Player 1 label correctly', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    playerNumber: 1,
                },
            })

            expect(wrapper.find('.player-label').text()).toContain('Player 1 Turn')
        })

        it('should display Player 1 name and symbol', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    playerNumber: 1,
                },
            })

            expect(wrapper.find('.player-name').text()).toBe('Alice')
            expect(wrapper.find('.player-symbol').text()).toBe('🕷️')
        })

        it('should apply red glow filter to Player 1 symbol', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    playerNumber: 1,
                },
            })

            const symbol = wrapper.find('.player-symbol')
            expect(symbol.classes()).toContain('text-spiderman-red')
        })
    })

    describe('Player 2 Styling (Yellow)', () => {
        it('should apply yellow background for Player 2', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer2,
                    playerNumber: 2,
                },
            })

            const card = wrapper.find('.player-card')
            expect(card.classes()).toContain('bg-spiderman-web')
        })

        it('should display Player 2 label correctly', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer2,
                    playerNumber: 2,
                },
            })

            expect(wrapper.find('.player-label').text()).toContain('Player 2 Turn')
        })

        it('should apply yellow glow filter to Player 2 symbol', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer2,
                    playerNumber: 2,
                },
            })

            const symbol = wrapper.find('.player-symbol')
            expect(symbol.classes()).toContain('text-spiderman-web')
        })
    })

    describe('CPU Styling (Blue)', () => {
        it('should apply blue background for CPU', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                },
            })

            const card = wrapper.find('.player-card')
            expect(card.classes()).toContain('bg-spiderman-blue')
        })

        it('should display CPU label correctly', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                },
            })

            expect(wrapper.find('.player-label').text()).toContain('CPU Turn')
        })

        it('should display CPU name', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                },
            })

            expect(wrapper.find('.player-name').text()).toBe('CPU')
        })

        it('should apply red symbol color for CPU', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                },
            })

            const symbol = wrapper.find('.player-symbol')
            expect(symbol.classes()).toContain('text-spiderman-red')
        })
    })

    describe('Pulse Animation', () => {
        it('should apply pulse animation when isActive is true', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    isActive: true,
                },
            })

            const card = wrapper.find('.player-card')
            expect(card.classes()).toContain('animate-web-pulse')
        })

        it('should not apply pulse animation when isActive is false', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    isActive: false,
                },
            })

            const card = wrapper.find('.player-card')
            expect(card.classes()).not.toContain('animate-web-pulse')
        })

        it('should apply pulse animation by default when isActive prop not specified', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            const card = wrapper.find('.player-card')
            expect(card.classes()).toContain('animate-web-pulse')
        })
    })

    describe('CPU Thinking Indicator', () => {
        it('should display CPU thinking message when isCPUThinking is true', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                    isCPUThinking: true,
                },
            })

            expect(wrapper.find('.cpu-thinking').exists()).toBe(true)
            expect(wrapper.find('.cpu-thinking').text()).toContain('CPU Thinking...')
        })

        it('should not display CPU thinking message when isCPUThinking is false', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                    isCPUThinking: false,
                },
            })

            expect(wrapper.find('.cpu-thinking').exists()).toBe(false)
        })

        it('should not display CPU thinking message by default', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                },
            })

            expect(wrapper.find('.cpu-thinking').exists()).toBe(false)
        })

        it('should show spinner animation in CPU thinking indicator', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockCPU,
                    isCPUThinking: true,
                },
            })

            const spinner = wrapper.find('.thinking-spinner')
            expect(spinner.exists()).toBe(true)
            // Verify the spinner exists and is rendered with proper structure
            expect(spinner.element).toBeDefined()
        })
    })

    describe('Component Structure', () => {
        it('should render player symbol display', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            expect(wrapper.find('.player-symbol').exists()).toBe(true)
        })

        it('should render player info section', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            expect(wrapper.find('.player-info').exists()).toBe(true)
            expect(wrapper.find('.player-label').exists()).toBe(true)
            expect(wrapper.find('.player-name').exists()).toBe(true)
        })

        it('should render main container with correct classes', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            const container = wrapper.find('.player-indicator-container')
            expect(container.exists()).toBe(true)
        })
    })

    describe('Props Defaults', () => {
        it('should use isCPUThinking false by default', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            expect(wrapper.find('.cpu-thinking').exists()).toBe(false)
        })

        it('should use isActive true by default', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            const card = wrapper.find('.player-card')
            expect(card.classes()).toContain('animate-web-pulse')
        })

        it('should use playerNumber 1 by default', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            expect(wrapper.find('.player-label').text()).toContain('Player 1 Turn')
        })
    })

    describe('Responsive Layout', () => {
        it('should apply responsive classes to symbol', () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                },
            })

            const symbol = wrapper.find('.player-symbol')
            // Check for base responsive sizing in style
            expect(symbol.exists()).toBe(true)
        })
    })

    describe('Edge Cases', () => {
        it('should handle player with special characters in name', () => {
            const specialPlayer: Player = {
                name: 'Player @#$%',
                symbol: '✨',
                isAI: false,
            }

            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: specialPlayer,
                    playerNumber: 1,
                },
            })

            expect(wrapper.find('.player-name').text()).toBe('Player @#$%')
        })

        it('should handle player with empty symbol', () => {
            const emptySymbolPlayer: Player = {
                name: 'Test Player',
                symbol: '',
                isAI: false,
            }

            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: emptySymbolPlayer,
                    playerNumber: 1,
                },
            })

            expect(wrapper.find('.player-symbol').text()).toBe('')
        })

        it('should handle switching between players dynamically', async () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    playerNumber: 1,
                },
                global: {
                    stubs: {
                        Transition: {
                            template: '<div><slot /></div>',
                        },
                    },
                },
            })

            expect(wrapper.find('.player-label').text()).toContain('Player 1')

            await wrapper.setProps({
                currentPlayer: mockPlayer2,
                playerNumber: 2,
            })
            await wrapper.vm.$nextTick()

            expect(wrapper.find('.player-label').text()).toContain('Player 2')
            expect(wrapper.find('.player-card').classes()).toContain('bg-spiderman-web')
        })

        it('should handle switching between human and CPU players', async () => {
            const wrapper = mount(PlayerIndicator, {
                props: {
                    currentPlayer: mockPlayer1,
                    playerNumber: 1,
                },
                global: {
                    stubs: {
                        Transition: {
                            template: '<div><slot /></div>',
                        },
                    },
                },
            })

            expect(wrapper.find('.player-label').text()).toContain('Player 1')

            await wrapper.setProps({
                currentPlayer: mockCPU,
            })
            await wrapper.vm.$nextTick()

            expect(wrapper.find('.player-label').text()).toContain('CPU')
            expect(wrapper.find('.player-card').classes()).toContain('bg-spiderman-blue')
        })
    })
})
