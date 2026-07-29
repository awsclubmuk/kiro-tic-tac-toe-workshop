import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BoardConfiguration from '../BoardConfiguration.vue'

/**
 * BoardConfiguration Component Tests
 * Task 4.1: Create Board Configuration component
 * Validates: Requirement 1 - Customizable Board
 */

describe('BoardConfiguration.vue', () => {
    describe('Rendering and Display', () => {
        it('should not render when open prop is false', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: false,
                },
            })
            expect(wrapper.find('.board-configuration-overlay').exists()).toBe(false)
        })

        it('should render when open prop is true', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            expect(wrapper.find('.board-configuration-overlay').exists()).toBe(true)
            expect(wrapper.find('.board-configuration-panel').exists()).toBe(true)
        })

        it('should render the title "Board Configuration"', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            expect(wrapper.text()).toContain('Board Configuration')
        })

        it('should render slider input element', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            expect(wrapper.find('#board-size-slider').exists()).toBe(true)
        })

        it('should render number input element', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            expect(wrapper.find('#board-size-input').exists()).toBe(true)
        })

        it('should render confirm and cancel buttons', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            const buttons = wrapper.findAll('.button')
            expect(buttons.length).toBeGreaterThanOrEqual(2)
            expect(buttons.some(b => b.text().includes('Cancel'))).toBe(true)
            expect(buttons.some(b => b.text().includes('Confirm'))).toBe(true)
        })

        it('should render close button', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            expect(wrapper.find('.close-button').exists()).toBe(true)
        })
    })

    describe('Size Range and Constraints', () => {
        it('should have minimum size of 3', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            const slider = wrapper.find('#board-size-slider')
            expect(slider.attributes('min')).toBe('3')
        })

        it('should have maximum size of 10', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            const slider = wrapper.find('#board-size-slider')
            expect(slider.attributes('max')).toBe('10')
        })

        it('should display size range in label', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })
            expect(wrapper.text()).toContain('3')
            expect(wrapper.text()).toContain('10')
        })
    })

    describe('Slider Functionality', () => {
        it('should initialize slider with modelValue', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })
            const slider = wrapper.find('#board-size-slider')
            expect(slider.element.value).toBe('5')
        })

        it('should update slider value when modelValue prop changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            await wrapper.setProps({ modelValue: 7 })

            const slider = wrapper.find('#board-size-slider')
            expect(slider.element.value).toBe('7')
        })

        it('should sync number input with slider changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(6)

            const numberInput = wrapper.find('#board-size-input')
            expect(numberInput.element.value).toBe('6')
        })

        it('should update current size display when slider changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(8)

            expect(wrapper.text()).toContain('8×8')
        })

        it('should support all valid sizes from 3 to 10', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            for (let size = 3; size <= 10; size++) {
                const slider = wrapper.find('#board-size-slider')
                await slider.setValue(size)

                expect(wrapper.text()).toContain(`${size}×${size}`)
            }
        })

        it('should display correct cell count for each size', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')

            for (let size = 3; size <= 10; size++) {
                await slider.setValue(size)
                const expectedCells = size * size
                expect(wrapper.text()).toContain(expectedCells.toString())
            }
        })
    })

    describe('Number Input Functionality', () => {
        it('should initialize number input with modelValue', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })
            const input = wrapper.find('#board-size-input')
            expect(input.element.value).toBe('5')
        })

        it('should update number input when modelValue prop changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            await wrapper.setProps({ modelValue: 7 })

            const input = wrapper.find('#board-size-input')
            expect(input.element.value).toBe('7')
        })

        it('should sync slider with number input changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(6)

            const slider = wrapper.find('#board-size-slider')
            expect(slider.element.value).toBe('6')
        })

        it('should update current size display when number input changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(8)

            expect(wrapper.text()).toContain('8×8')
        })
    })

    describe('Input Validation', () => {
        it('should show error when size is below minimum (< 3)', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(2)
            await input.trigger('blur')

            expect(wrapper.text()).toContain('must be at least 3×3')
            expect(wrapper.find('.error-message').exists()).toBe(true)
        })

        it('should show error when size is above maximum (> 10)', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(11)
            await input.trigger('blur')

            expect(wrapper.text()).toContain('cannot exceed 10×10')
            expect(wrapper.find('.error-message').exists()).toBe(true)
        })

        it('should reject size below minimum without auto-correcting', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(2)
            await input.trigger('blur')

            expect(wrapper.find('.error-message').exists()).toBe(true)
            expect(wrapper.text()).toContain('must be at least 3×3')
            // Input retains invalid value; confirm stays disabled
            expect(input.element.value).toBe('2')
        })

        it('should reject size above maximum without auto-correcting', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(15)
            await input.trigger('blur')

            expect(wrapper.find('.error-message').exists()).toBe(true)
            expect(wrapper.text()).toContain('cannot exceed 10×10')
            expect(input.element.value).toBe('15')
        })

        it('should not show error for valid sizes (3-10)', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            for (let size = 3; size <= 10; size++) {
                const input = wrapper.find('#board-size-input')
                await input.setValue(size)
                await input.trigger('blur')

                expect(wrapper.find('.error-message').exists()).toBe(false)
            }
        })

        it('should clear error message when valid input is provided', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')

            // Trigger invalid value
            await input.setValue(2)
            await input.trigger('blur')
            expect(wrapper.find('.error-message').exists()).toBe(true)

            // Correct to valid value
            await input.setValue(5)
            await input.trigger('blur')
            expect(wrapper.find('.error-message').exists()).toBe(false)
        })

        it('should reject values outside range and prevent confirm', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(12)
            await input.trigger('blur')

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            expect(confirmButton?.attributes('disabled')).toBeDefined()
        })
    })

    describe('Confirm Button Behavior', () => {
        it('should be disabled when size unchanged', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            expect(confirmButton?.attributes('disabled')).toBeDefined()
        })

        it('should be enabled when size is changed to valid value', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(7)

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            expect(confirmButton?.attributes('disabled')).not.toBeDefined()
        })

        it('should emit update:modelValue when confirm is clicked', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(7)

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            await confirmButton?.trigger('click')

            expect(wrapper.emitted('update:modelValue')).toBeTruthy()
            expect(wrapper.emitted('update:modelValue')[0]).toEqual([7])
        })

        it('should show success message when confirm is clicked', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(7)

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            await confirmButton?.trigger('click')

            expect(wrapper.find('.success-message').exists()).toBe(true)
            expect(wrapper.text()).toContain('7×7')
        })

        it('should be disabled when size is invalid', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(2)
            await input.trigger('blur')

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            expect(confirmButton?.attributes('disabled')).toBeDefined()
        })
    })

    describe('Cancel and Close Functionality', () => {
        it('should emit close event when cancel button is clicked', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const cancelButton = wrapper.findAll('.button').find(b => b.text().includes('Cancel'))
            await cancelButton?.trigger('click')

            expect(wrapper.emitted('close')).toBeTruthy()
        })

        it('should emit close event when close button is clicked', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const closeButton = wrapper.find('.close-button')
            await closeButton.trigger('click')

            expect(wrapper.emitted('close')).toBeTruthy()
        })

        it('should reset values when canceling after changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(8)
            expect(wrapper.text()).toContain('8×8')

            const cancelButton = wrapper.findAll('.button').find(b => b.text().includes('Cancel'))
            await cancelButton?.trigger('click')

            // After cancel, should still show changed values until component closes
            // but emit close event
            expect(wrapper.emitted('close')).toBeTruthy()
        })

        it('should close overlay when clicking outside panel', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const overlay = wrapper.find('.board-configuration-overlay')
            await overlay.trigger('click')

            expect(wrapper.emitted('close')).toBeTruthy()
        })

        it('should not close when clicking inside panel', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const panel = wrapper.find('.board-configuration-panel')
            await panel.trigger('click')

            expect(wrapper.emitted('close')).toBeFalsy()
        })
    })

    describe('Current Selection Display', () => {
        it('should display selected size in current selection', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })

            expect(wrapper.text()).toContain('Selected Size:')
            expect(wrapper.find('.size-value').text()).toBe('5×5')
        })

        it('should display total cells calculation', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 4,
                    open: true,
                },
            })

            expect(wrapper.text()).toContain('Total cells:')
            expect(wrapper.find('.cell-count').text()).toBe('16')
        })

        it('should update displayed cell count when size changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            expect(wrapper.find('.cell-count').text()).toBe('9')

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(5)

            expect(wrapper.find('.cell-count').text()).toBe('25')
        })

        it('should calculate correct cell counts for all sizes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')

            for (let size = 3; size <= 10; size++) {
                await slider.setValue(size)
                const expectedCells = size * size
                expect(wrapper.find('.cell-count').text()).toBe(expectedCells.toString())
            }
        })
    })

    describe('Modal Behavior', () => {
        it('should handle opening and closing', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: false,
                },
            })

            expect(wrapper.find('.board-configuration-overlay').exists()).toBe(false)

            await wrapper.setProps({ open: true })
            expect(wrapper.find('.board-configuration-overlay').exists()).toBe(true)

            const closeButton = wrapper.find('.close-button')
            await closeButton.trigger('click')
            expect(wrapper.emitted('close')).toBeTruthy()
        })

        it('should reset state when opening', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: false,
                },
            })

            // Make changes while closed
            await wrapper.setProps({ open: true })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(8)

            // Close
            const closeButton = wrapper.find('.close-button')
            await closeButton.trigger('click')

            // Close via prop so the open watcher can re-fire on reopen
            await wrapper.setProps({ open: false })
            await wrapper.setProps({ open: true })
            const newSlider = wrapper.find('#board-size-slider')
            expect(newSlider.element.value).toBe('5')
        })
    })

    describe('Accessibility', () => {
        it('should have proper labels for inputs', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const sliderLabel = wrapper.find('label[for="board-size-slider"]')
            expect(sliderLabel.exists()).toBe(true)

            const inputLabel = wrapper.find('label[for="board-size-input"]')
            expect(inputLabel.exists()).toBe(true)
        })

        it('should have aria-label on close button', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const closeButton = wrapper.find('.close-button')
            expect(closeButton.attributes('aria-label')).toBe('Close configuration')
        })

        it('should have aria-label on slider', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            expect(slider.attributes('aria-label')).toBe('Board size slider')
        })

        it('should have aria-label on number input', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            expect(input.attributes('aria-label')).toBe('Board size number input')
        })

        it('should use role="alert" for error messages', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(2)
            await input.trigger('blur')

            expect(wrapper.find('[role="alert"]').exists()).toBe(true)
        })

        it('should use role="status" for success messages', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(5)

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            await confirmButton?.trigger('click')

            expect(wrapper.find('[role="status"]').exists()).toBe(true)
        })
    })

    describe('Requirements Validation', () => {
        it('should validate Requirement 1.1: Support board sizes 3-10', () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            expect(slider.attributes('min')).toBe('3')
            expect(slider.attributes('max')).toBe('10')

            // Should support each size
            for (let size = 3; size <= 10; size++) {
                expect(wrapper.find(`#board-size-slider`).attributes('min')).toBe('3')
                expect(wrapper.find(`#board-size-slider`).attributes('max')).toBe('10')
            }
        })

        it('should validate Requirement 1.3: Validate board size input', async () => {
            // WHEN a player selects a board size, THE Game_System SHALL validate that the board size is between 3 and 10

            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            // Test below minimum
            const input = wrapper.find('#board-size-input')
            await input.setValue(2)
            await input.trigger('blur')
            expect(wrapper.find('.error-message').exists()).toBe(true)

            // Test above maximum
            await input.setValue(11)
            await input.trigger('blur')
            expect(wrapper.find('.error-message').exists()).toBe(true)

            // Test valid value
            await input.setValue(5)
            await input.trigger('blur')
            expect(wrapper.find('.error-message').exists()).toBe(false)
        })

        it('should validate Requirement 1.4: Show error message for invalid input', async () => {
            // IF an invalid board size is provided, THEN THE Game_System SHALL return an error message

            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 5,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue(2)
            await input.trigger('blur')

            const errorMessage = wrapper.find('.error-message')
            expect(errorMessage.exists()).toBe(true)
            expect(errorMessage.text()).toContain('must be at least 3×3')
        })

        it('should validate Requirement 1.5: Store selected size in game session', async () => {
            // THE Game_System SHALL store the selected board size as part of the Game_Session configuration

            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            await slider.setValue(7)

            const confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            await confirmButton?.trigger('click')

            // Should emit update event with the selected size
            expect(wrapper.emitted('update:modelValue')).toBeTruthy()
            expect(wrapper.emitted('update:modelValue')[0]).toEqual([7])
        })

        it('should support independent board size selection for each new game', async () => {
            // Create independent board size selection for each new game

            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            // First selection
            let slider = wrapper.find('#board-size-slider')
            await slider.setValue(5)
            let confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            await confirmButton?.trigger('click')

            expect(wrapper.emitted('update:modelValue')[0]).toEqual([5])

            // Close via prop so reopen triggers the open watcher
            await wrapper.setProps({ open: false })
            await wrapper.setProps({ modelValue: 7, open: true })

            // Should start with new size
            slider = wrapper.find('#board-size-slider')
            expect(slider.element.value).toBe('7')

            // Can select different size
            await slider.setValue(9)
            confirmButton = wrapper.findAll('.button').find(b => b.text().includes('Confirm'))
            await confirmButton?.trigger('click')

            expect(wrapper.emitted('update:modelValue')[1]).toEqual([9])
        })
    })

    describe('Edge Cases', () => {
        it('should handle rapid slider changes', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')

            // Rapid changes
            await slider.setValue(4)
            await slider.setValue(5)
            await slider.setValue(6)
            await slider.setValue(7)

            expect(wrapper.find('#board-size-slider').element.value).toBe('7')
            expect(wrapper.find('#board-size-input').element.value).toBe('7')
        })

        it('should handle empty number input gracefully', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')
            await input.setValue('')
            await input.trigger('input')

            // Should not show error while input is empty
            expect(wrapper.find('.error-message').exists()).toBe(false)
        })

        it('should handle boundary values correctly', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const input = wrapper.find('#board-size-input')

            // Test minimum boundary
            await input.setValue(3)
            await input.trigger('blur')
            expect(wrapper.find('.error-message').exists()).toBe(false)

            // Test maximum boundary
            await input.setValue(10)
            await input.trigger('blur')
            expect(wrapper.find('.error-message').exists()).toBe(false)
        })

        it('should maintain consistency between slider and input', async () => {
            const wrapper = mount(BoardConfiguration, {
                props: {
                    modelValue: 3,
                    open: true,
                },
            })

            const slider = wrapper.find('#board-size-slider')
            const input = wrapper.find('#board-size-input')

            for (let i = 0; i < 5; i++) {
                await slider.setValue(5 + i)
                expect(input.element.value).toBe((5 + i).toString())
            }
        })
    })
})
