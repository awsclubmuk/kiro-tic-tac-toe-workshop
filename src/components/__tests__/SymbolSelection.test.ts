import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SymbolSelection from '../SymbolSelection.vue';

describe('SymbolSelection Component', () => {
    describe('Default Rendering', () => {
        it('should render with default symbols', () => {
            const wrapper = mount(SymbolSelection);

            expect(wrapper.text()).toContain('Choose Your Symbols');
            expect(wrapper.text()).toContain('Player 1');
            expect(wrapper.text()).toContain('Player 2');
            expect(wrapper.text()).toContain('🕷️');
            expect(wrapper.text()).toContain('🕸️');
        });

        it('should display all symbols in the library', () => {
            const wrapper = mount(SymbolSelection);
            const expectedSymbols = ['🕷️', '🕸️', '🔴', '🟡', '⭕', '❌', 'S', 'W', 'P1', 'P2'];

            expectedSymbols.forEach(symbol => {
                expect(wrapper.text()).toContain(symbol);
            });
        });

        it('should render symbol buttons for both players', () => {
            const wrapper = mount(SymbolSelection);
            const buttons = wrapper.findAll('.symbol-button');

            // Should have 10 symbols × 2 players = 20 buttons
            expect(buttons).toHaveLength(20);
        });
    });

    describe('Symbol Selection', () => {
        it('should update Player 1 symbol when clicked', async () => {
            const wrapper = mount(SymbolSelection);
            const symbolButtons = wrapper.findAll('.player-1 .symbol-button');

            // Click the red circle button (🔴)
            await symbolButtons[2].trigger('click');

            expect(wrapper.vm.player1Symbol).toBe('🔴');
        });

        it('should update Player 2 symbol when clicked', async () => {
            const wrapper = mount(SymbolSelection);
            const symbolButtons = wrapper.findAll('.player-2 .symbol-button');

            // Click the yellow circle button (🟡)
            await symbolButtons[3].trigger('click');

            expect(wrapper.vm.player2Symbol).toBe('🟡');
        });

        it('should show selected state on the symbol preview', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');

            await player1Buttons[2].trigger('click');

            const preview = wrapper.find('.player-1 .symbol-preview');
            expect(preview.text()).toBe('🔴');
        });
    });

    describe('Duplicate Symbol Validation', () => {
        it('should show error when Player 1 selects same symbol as Player 2', async () => {
            const wrapper = mount(SymbolSelection, {
                props: {
                    player1Symbol: '🕷️',
                    player2Symbol: '🔴',
                },
            });

            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');

            // Player 1 selects red circle (same as Player 2)
            await player1Buttons[2].trigger('click');

            expect(wrapper.vm.errorMessage).toContain('already selected by Player 2');
        });

        it('should show error when Player 2 selects same symbol as Player 1', async () => {
            const wrapper = mount(SymbolSelection, {
                props: {
                    player1Symbol: '🕷️',
                    player2Symbol: '🔴',
                },
            });

            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            // Player 2 selects spider (same as Player 1)
            await player2Buttons[0].trigger('click');

            expect(wrapper.vm.errorMessage).toContain('already selected by Player 1');
        });

        it('should display error banner when error occurs', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            // Set Player 2 to yellow circle first
            await player2Buttons[3].trigger('click');

            // Now try to set Player 1 to yellow circle
            await player1Buttons[3].trigger('click');

            expect(wrapper.find('.error-banner').exists()).toBe(true);
            expect(wrapper.text()).toContain('already selected');
        });

        it('should clear error message when symbols become different', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            // Set both to yellow circle
            await player1Buttons[3].trigger('click');
            await player2Buttons[3].trigger('click');

            expect(wrapper.vm.errorMessage).toBeTruthy();

            // Change Player 1 to red circle
            await player1Buttons[2].trigger('click');

            expect(wrapper.vm.errorMessage).toBe('');
        });
    });

    describe('Form Validation and Confirmation', () => {
        it('should disable confirm button when symbols are the same', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');

            // Set both players to same symbol
            await player1Buttons[2].trigger('click');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');
            await player2Buttons[2].trigger('click');

            const confirmButton = wrapper.find('.confirm-button');
            expect(confirmButton.attributes('disabled')).toBe('');
        });

        it('should enable confirm button when symbols are different', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            await player1Buttons[2].trigger('click');
            await player2Buttons[3].trigger('click');

            const confirmButton = wrapper.find('.confirm-button');
            expect(confirmButton.attributes('disabled')).toBeUndefined();
        });

        it('should emit events when confirm is clicked with valid symbols', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            await player1Buttons[2].trigger('click');
            await player2Buttons[3].trigger('click');

            const confirmButton = wrapper.find('.confirm-button');
            await confirmButton.trigger('click');

            expect(wrapper.emitted('update:player1-symbol')).toBeTruthy();
            expect(wrapper.emitted('update:player2-symbol')).toBeTruthy();
            expect(wrapper.emitted('confirmed')).toBeTruthy();

            expect(wrapper.emitted('update:player1-symbol')?.[0]).toEqual(['🔴']);
            expect(wrapper.emitted('update:player2-symbol')?.[0]).toEqual(['🟡']);
        });

        it('should prevent confirmation with duplicate symbols', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            await player1Buttons[2].trigger('click');
            await player2Buttons[2].trigger('click');

            const confirmButton = wrapper.find('.confirm-button');
            expect(confirmButton.attributes('disabled')).toBe('');
        });
    });

    describe('Reset Functionality', () => {
        it('should reset to default symbols when reset button is clicked', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            // Change symbols
            await player1Buttons[2].trigger('click');
            await player2Buttons[3].trigger('click');

            expect(wrapper.vm.player1Symbol).toBe('🔴');
            expect(wrapper.vm.player2Symbol).toBe('🟡');

            // Click reset button
            const resetButton = wrapper.find('.reset-button');
            await resetButton.trigger('click');

            expect(wrapper.vm.player1Symbol).toBe('🕷️');
            expect(wrapper.vm.player2Symbol).toBe('🕸️');
        });

        it('should clear error message when reset is clicked', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');
            const player2Buttons = wrapper.findAll('.player-2 .symbol-button');

            // Create error state
            await player1Buttons[2].trigger('click');
            await player2Buttons[2].trigger('click');

            expect(wrapper.vm.errorMessage).toBeTruthy();

            // Click reset button
            const resetButton = wrapper.find('.reset-button');
            await resetButton.trigger('click');

            expect(wrapper.vm.errorMessage).toBe('');
        });
    });

    describe('Symbol Display', () => {
        it('should apply correct styling to selected symbols', async () => {
            const wrapper = mount(SymbolSelection);
            const player1Buttons = wrapper.findAll('.player-1 .symbol-button');

            await player1Buttons[2].trigger('click');

            const selectedButton = wrapper.find('.player-1 .symbol-button.selected');
            expect(selectedButton.exists()).toBe(true);
            expect(selectedButton.text()).toBe('🔴');
        });

        it('should display prop values as initial selection', () => {
            const wrapper = mount(SymbolSelection, {
                props: {
                    player1Symbol: 'S',
                    player2Symbol: 'W',
                },
            });

            expect(wrapper.vm.player1Symbol).toBe('S');
            expect(wrapper.vm.player2Symbol).toBe('W');
        });
    });

    describe('Accessibility', () => {
        it('should have proper title attributes on symbol buttons', () => {
            const wrapper = mount(SymbolSelection);
            const buttons = wrapper.findAll('.symbol-button');

            buttons.forEach(button => {
                expect(button.attributes('title')).toBeTruthy();
            });
        });

        it('should have descriptive headings and labels', () => {
            const wrapper = mount(SymbolSelection);

            expect(wrapper.find('.selection-title').exists()).toBe(true);
            expect(wrapper.find('.player-title').exists()).toBe(true);
            expect(wrapper.text()).toContain('Choose Your Symbols');
        });
    });
});
