import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameHeader from '../GameHeader.vue'
import { GameMode, Difficulty } from '@/types'

/**
 * GameHeader Component Tests
 * Task 3.2: Create Game Header component with title and navigation
 * Validates: Requirements 1, 6, 7
 */

describe('GameHeader.vue', () => {
    describe('Title and Display', () => {
        it('should render the Spider-Man Tic-Tac-Toe title', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                },
            })
            expect(wrapper.text()).toContain('Spider-Man Tic-Tac-Toe')
        })

        it('should display the board size configuration', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 5,
                },
            })
            expect(wrapper.text()).toContain('Board Size:')
            expect(wrapper.text()).toContain('5×5')
        })

        it('should update board size display when prop changes', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                },
            })
            expect(wrapper.text()).toContain('3×3')

            await wrapper.setProps({ boardSize: 10 })
            expect(wrapper.text()).toContain('10×10')
        })

        it('should render title element', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                },
            })
            const title = wrapper.find('.game-title')
            expect(title.exists()).toBe(true)
            expect(title.text()).toContain('Spider-Man Tic-Tac-Toe')
        })

        it('should support various board sizes', () => {
            for (let size = 3; size <= 10; size++) {
                const wrapper = mount(GameHeader, {
                    props: {
                        boardSize: size,
                    },
                })
                expect(wrapper.text()).toContain(`${size}×${size}`)
            }
        })
    })

    describe('Game Mode Toggle', () => {
        it('should render both game mode options', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.TwoPlayer,
                },
            })
            expect(wrapper.text()).toContain('2-Player')
            expect(wrapper.text()).toContain('vs CPU')
        })

        it('should show 2-Player as active by default', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.TwoPlayer,
                },
            })
            const buttons = wrapper.findAll('.mode-button')
            expect(buttons[0].classes()).toContain('active')
            expect(buttons[1].classes()).not.toContain('active')
        })

        it('should show vs CPU as active when SinglePlayer mode is selected', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            const buttons = wrapper.findAll('.mode-button')
            expect(buttons[0].classes()).not.toContain('active')
            expect(buttons[1].classes()).toContain('active')
        })

        it('should emit update:gameMode when 2-Player button is clicked', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            const buttons = wrapper.findAll('.mode-button')
            await buttons[0].trigger('click')

            expect(wrapper.emitted('update:gameMode')).toBeTruthy()
            expect(wrapper.emitted('update:gameMode')[0]).toEqual([GameMode.TwoPlayer])
        })

        it('should emit update:gameMode when vs CPU button is clicked', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.TwoPlayer,
                },
            })
            const buttons = wrapper.findAll('.mode-button')
            await buttons[1].trigger('click')

            expect(wrapper.emitted('update:gameMode')).toBeTruthy()
            expect(wrapper.emitted('update:gameMode')[0]).toEqual([GameMode.SinglePlayer])
        })

        it('should switch between modes when buttons are clicked multiple times', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.TwoPlayer,
                },
            })
            const buttons = wrapper.findAll('.mode-button')

            // Click to SinglePlayer
            await buttons[1].trigger('click')
            expect(wrapper.emitted('update:gameMode')[0]).toEqual([GameMode.SinglePlayer])

            // Click back to TwoPlayer
            await buttons[0].trigger('click')
            expect(wrapper.emitted('update:gameMode')[1]).toEqual([GameMode.TwoPlayer])
        })
    })

    describe('Difficulty Selector', () => {
        it('should not show difficulty selector in TwoPlayer mode', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.TwoPlayer,
                },
            })
            expect(wrapper.find('.difficulty-group').exists()).toBe(false)
        })

        it('should show difficulty selector in SinglePlayer mode', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            expect(wrapper.find('.difficulty-group').exists()).toBe(true)
        })

        it('should hide difficulty selector when switching from SinglePlayer to TwoPlayer', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            expect(wrapper.find('.difficulty-group').exists()).toBe(true)

            await wrapper.setProps({ modelGameMode: GameMode.TwoPlayer })
            expect(wrapper.find('.difficulty-group').exists()).toBe(false)
        })

        it('should show difficulty selector when switching from TwoPlayer to SinglePlayer', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.TwoPlayer,
                },
            })
            expect(wrapper.find('.difficulty-group').exists()).toBe(false)

            await wrapper.setProps({ modelGameMode: GameMode.SinglePlayer })
            expect(wrapper.find('.difficulty-group').exists()).toBe(true)
        })

        it('should render all three difficulty options when in CPU mode', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            const select = wrapper.find('.difficulty-select')
            const options = select.findAll('option')

            expect(options.length).toBe(3)
            expect(options[0].element.value).toBe(Difficulty.Easy)
            expect(options[1].element.value).toBe(Difficulty.Medium)
            expect(options[2].element.value).toBe(Difficulty.Hard)
        })

        it('should have Medium difficulty selected by default', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                    modelDifficulty: Difficulty.Medium,
                },
            })
            const select = wrapper.find('.difficulty-select')
            expect(select.element.value).toBe(Difficulty.Medium)
        })

        it('should emit update:difficulty when difficulty changes to Easy', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                    modelDifficulty: Difficulty.Medium,
                },
            })
            const select = wrapper.find('.difficulty-select')

            await select.setValue(Difficulty.Easy)

            expect(wrapper.emitted('update:difficulty')).toBeTruthy()
            expect(wrapper.emitted('update:difficulty')[0]).toEqual([Difficulty.Easy])
        })

        it('should emit update:difficulty when difficulty changes to Hard', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                    modelDifficulty: Difficulty.Medium,
                },
            })
            const select = wrapper.find('.difficulty-select')

            await select.setValue(Difficulty.Hard)

            expect(wrapper.emitted('update:difficulty')).toBeTruthy()
            expect(wrapper.emitted('update:difficulty')[0]).toEqual([Difficulty.Hard])
        })

        it('should support changing difficulty multiple times', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                    modelDifficulty: Difficulty.Easy,
                },
            })

            const select = wrapper.find('.difficulty-select')

            // Easy to Medium
            await select.setValue(Difficulty.Medium)
            expect(wrapper.emitted('update:difficulty')[0]).toEqual([Difficulty.Medium])

            // Medium to Hard
            await select.setValue(Difficulty.Hard)
            expect(wrapper.emitted('update:difficulty')[1]).toEqual([Difficulty.Hard])

            // Hard back to Easy
            await select.setValue(Difficulty.Easy)
            expect(wrapper.emitted('update:difficulty')[2]).toEqual([Difficulty.Easy])
        })

        it('should display correct difficulty option values', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            const select = wrapper.find('.difficulty-select')
            const options = select.findAll('option')

            expect(options[0].text()).toContain('Easy')
            expect(options[1].text()).toContain('Medium')
            expect(options[2].text()).toContain('Hard')
        })
    })

    describe('Props and Defaults', () => {
        it('should accept boardSize prop', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 7,
                },
            })
            expect(wrapper.text()).toContain('7×7')
        })

        it('should accept all valid board sizes (3-10)', () => {
            for (let size = 3; size <= 10; size++) {
                const wrapper = mount(GameHeader, {
                    props: {
                        boardSize: size,
                    },
                })
                expect(wrapper.text()).toContain(`${size}×${size}`)
            }
        })

        it('should default to TwoPlayer game mode', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                },
            })
            const buttons = wrapper.findAll('.mode-button')
            expect(buttons[0].classes()).toContain('active')
        })

        it('should default to Medium difficulty', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            const select = wrapper.find('.difficulty-select')
            expect(select.element.value).toBe(Difficulty.Medium)
        })

        it('should allow explicit model values to override defaults', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                    modelDifficulty: Difficulty.Hard,
                },
            })
            const select = wrapper.find('.difficulty-select')
            expect(select.element.value).toBe(Difficulty.Hard)
        })
    })

    describe('Responsive Layout', () => {
        it('should render header element', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                },
            })
            expect(wrapper.find('.game-header').exists()).toBe(true)
        })

        it('should render all sections', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })

            expect(wrapper.find('.title-section').exists()).toBe(true)
            expect(wrapper.find('.header-content').exists()).toBe(true)
            expect(wrapper.find('.board-config').exists()).toBe(true)
            expect(wrapper.find('.controls-section').exists()).toBe(true)
            expect(wrapper.find('.mode-toggle-group').exists()).toBe(true)
            expect(wrapper.find('.difficulty-group').exists()).toBe(true)
        })
    })

    describe('Accessibility', () => {
        it('should have proper labels for difficulty selector', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            const label = wrapper.find('.difficulty-label')
            const select = wrapper.find('.difficulty-select')

            expect(label.text()).toBe('Difficulty:')
            expect(label.attributes('for')).toBe('difficulty-select')
            expect(select.attributes('id')).toBe('difficulty-select')
        })

        it('should have proper labels for game mode toggle', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                },
            })
            const label = wrapper.find('.mode-label')
            expect(label.text()).toContain('Game Mode:')
        })

        it('should have proper labels for board config', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                },
            })
            const label = wrapper.find('.config-label')
            expect(label.text()).toContain('Board Size:')
        })

        it('should have accessible select element structure', () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })
            const select = wrapper.find('.difficulty-select')

            expect(select.exists()).toBe(true)
            expect(select.element.tagName).toBe('SELECT')
            expect(select.attributes('id')).toBe('difficulty-select')
        })
    })

    describe('Component Integration', () => {
        it('should handle game mode and difficulty changes independently', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                    modelDifficulty: Difficulty.Medium,
                },
            })

            // Change difficulty
            const select = wrapper.find('.difficulty-select')
            await select.setValue(Difficulty.Hard)

            expect(wrapper.emitted('update:difficulty')).toBeTruthy()
            expect(wrapper.emitted('update:gameMode')).toBeFalsy()

            // Change mode
            const buttons = wrapper.findAll('.mode-button')
            await buttons[0].trigger('click')

            expect(wrapper.emitted('update:gameMode')).toBeTruthy()
            expect(wrapper.emitted('update:gameMode')[0]).toEqual([GameMode.TwoPlayer])
        })

        it('should display all controls when in SinglePlayer mode', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.TwoPlayer,
                },
            })

            // Initially no difficulty selector
            expect(wrapper.find('.difficulty-group').exists()).toBe(false)

            // Switch to SinglePlayer
            const buttons = wrapper.findAll('.mode-button')
            await buttons[1].trigger('click')

            // Now difficulty selector should appear
            expect(wrapper.find('.difficulty-group').exists()).toBe(true)

            // Both mode buttons and difficulty selector should be present
            expect(wrapper.findAll('.mode-button').length).toBe(2)
            expect(wrapper.find('.difficulty-select').exists()).toBe(true)
        })
    })

    describe('Requirements Validation', () => {
        it('should validate Requirement 1: Customizable Board display (board size shown)', () => {
            // Requirement 1: THE Game_System SHALL support board sizes ranging from 3x3 to 10x10
            // Requirement 1.2: THE Game_System SHALL allow configuration of board dimensions
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 5,
                },
            })

            expect(wrapper.text()).toContain('Board Size:')
            expect(wrapper.text()).toContain('5×5')
        })

        it('should validate Requirement 6: Single-Player Mode support (mode toggle includes CPU option)', () => {
            // Requirement 6.1: THE Game_System SHALL support single-player mode with a CPU opponent
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })

            expect(wrapper.text()).toContain('vs CPU')
            expect(wrapper.find('.difficulty-group').exists()).toBe(true)
        })

        it('should validate Requirement 7: CPU Difficulty Levels (all three levels available)', () => {
            // Requirement 7.1: THE Game_System SHALL provide three difficulty levels: Easy, Medium, and Hard
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 3,
                    modelGameMode: GameMode.SinglePlayer,
                },
            })

            const select = wrapper.find('.difficulty-select')
            const options = select.findAll('option')

            const difficulties = options.map(o => o.element.value)
            expect(difficulties).toContain(Difficulty.Easy)
            expect(difficulties).toContain(Difficulty.Medium)
            expect(difficulties).toContain(Difficulty.Hard)
        })

        it('should validate all three requirements are met together', async () => {
            const wrapper = mount(GameHeader, {
                props: {
                    boardSize: 5,
                    modelGameMode: GameMode.SinglePlayer,
                    modelDifficulty: Difficulty.Hard,
                },
            })

            // Req 1: Board size display
            expect(wrapper.text()).toContain('5×5')

            // Req 6: CPU mode is available and selected
            expect(wrapper.text()).toContain('vs CPU')
            const buttons = wrapper.findAll('.mode-button')
            expect(buttons[1].classes()).toContain('active')

            // Req 7: Difficulty selector with all levels
            const select = wrapper.find('.difficulty-select')
            expect(select.element.value).toBe(Difficulty.Hard)
            expect(select.findAll('option').length).toBe(3)
        })
    })
})
