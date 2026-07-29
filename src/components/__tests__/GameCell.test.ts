import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import GameCell from '../GameCell.vue';

describe('GameCell Component', () => {
    it('renders the component with correct props', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: null,
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').exists()).toBe(true);
    });

    it('displays symbol when provided', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: 'X',
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').text()).toBe('X');
    });

    it('displays empty text when symbol is null', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: null,
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').text()).toBe('');
    });

    it('applies symbol-player1 class when symbol is from player 1', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: 'X',
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').classes()).toContain('symbol-player1');
    });

    it('applies symbol-player2 class when symbol is from player 2', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: 'O',
                disabled: false,
                isPlayer1: false,
            },
        });

        expect(wrapper.find('button').classes()).toContain('symbol-player2');
    });

    it('does not apply player class when symbol is null', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: null,
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').classes()).not.toContain('symbol-player1');
        expect(wrapper.find('button').classes()).not.toContain('symbol-player2');
    });

    it('disables button when disabled prop is true', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: 'X',
                disabled: true,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });

    it('applies opacity-75 class when disabled', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: 'X',
                disabled: true,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').classes()).toContain('opacity-75');
    });

    it('does not have disabled attribute when disabled prop is false', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: 'X',
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
    });

    it('emits click event with row and col when clicked', async () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 1,
                col: 2,
                symbol: null,
                disabled: false,
                isPlayer1: true,
            },
        });

        await wrapper.find('button').trigger('click');

        expect(wrapper.emitted('click')).toHaveLength(1);
        expect(wrapper.emitted('click')?.[0]).toEqual([1, 2]);
    });

    it('does not emit click event when disabled', async () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 1,
                col: 2,
                symbol: 'X',
                disabled: true,
                isPlayer1: true,
            },
        });

        await wrapper.find('button').trigger('click');

        expect(wrapper.emitted('click')).toBeUndefined();
    });

    it('applies game-cell class', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: null,
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').classes()).toContain('game-cell');
    });

    it('displays emoji symbols correctly', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: '🕷️',
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapper.find('button').text()).toBe('🕷️');
    });

    it('handles default props correctly', () => {
        const wrapper = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: null,
            },
        });

        expect(wrapper.find('button').attributes('disabled')).toBeUndefined();
    });

    it('maintains correct cursor styling based on disabled state', () => {
        const wrapperEnabled = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: null,
                disabled: false,
                isPlayer1: true,
            },
        });

        expect(wrapperEnabled.find('button').classes()).toContain('cursor-pointer');

        const wrapperDisabled = mount(GameCell, {
            props: {
                row: 0,
                col: 0,
                symbol: null,
                disabled: true,
                isPlayer1: true,
            },
        });

        expect(wrapperDisabled.find('button').classes()).toContain('cursor-not-allowed');
    });

    it('works with different row and col values', async () => {
        const testCases = [
            { row: 0, col: 0 },
            { row: 2, col: 4 },
            { row: 5, col: 9 },
            { row: 9, col: 9 },
        ];

        for (const testCase of testCases) {
            const wrapper = mount(GameCell, {
                props: {
                    row: testCase.row,
                    col: testCase.col,
                    symbol: null,
                    disabled: false,
                    isPlayer1: true,
                },
            });

            await wrapper.find('button').trigger('click');
            expect(wrapper.emitted('click')?.[0]).toEqual([testCase.row, testCase.col]);
        }
    });
});
