/**
 * GameBoard Component Tests
 * Task 3.4: Create Game Board component with dynamic grid layout
 * Tests: Requirements 2, 3
 *
 * Unit tests for GameBoard component covering:
 * - Grid rendering for different board sizes (3x3 to 10x10)
 * - Cell display and updates
 * - Symbol rendering
 * - Click event emission
 * - Responsive styling
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GameBoard from '../GameBoard.vue'
import type { Board } from '@/types'

/**
 * Helper function to create an empty board of given size
 */
const createEmptyBoard = (size: number): Board => {
    return Array.from({ length: size }, () => Array(size).fill(null))
}

/**
 * Helper function to create a board with some symbols
 */
const createBoardWithMoves = (
    size: number,
    moves: Array<{ row: number; col: number; symbol: string }>
): Board => {
    const board = createEmptyBoard(size)
    moves.forEach(({ row, col, symbol }) => {
        board[row][col] = symbol
    })
    return board
}

describe('GameBoard Component', () => {
    /**
     * Test: Component renders with default props
     */
    it('should render the game board with default props', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        expect(wrapper.exists()).toBe(true)
        expect(wrapper.find('.game-board').exists()).toBe(true)
    })

    /**
     * Test: Board renders correct number of cells for 3x3
     */
    it('should render correct number of cells for 3x3 board', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        expect(cells).toHaveLength(9) // 3x3 = 9 cells
    })

    /**
     * Test: Board renders correct number of cells for 5x5
     */
    it('should render correct number of cells for 5x5 board', () => {
        const boardData = createEmptyBoard(5)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 5,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        expect(cells).toHaveLength(25) // 5x5 = 25 cells
    })

    /**
     * Test: Board renders correct number of cells for 10x10
     */
    it('should render correct number of cells for 10x10 board', () => {
        const boardData = createEmptyBoard(10)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 10,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        expect(cells).toHaveLength(100) // 10x10 = 100 cells
    })

    /**
     * Test: CSS Grid is correctly configured with board size
     */
    it('should set CSS Grid to correct dimensions', () => {
        const boardData = createEmptyBoard(4)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 4,
            },
        })

        const boardElement = wrapper.find('.game-board').element as HTMLElement
        const style = boardElement.getAttribute('style')
        // Verify grid template columns is set via inline styles
        expect(style).toContain('grid-template-columns')
        expect(style).toContain('repeat(4')
    })

    /**
     * Test: Empty cells display without symbols
     */
    it('should display empty cells without symbols', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        cells.forEach((cell) => {
            const symbol = cell.find('.cell-symbol')
            expect(symbol.exists()).toBe(false)
        })
    })

    /**
     * Test: Cells display symbols correctly
     */
    it('should display symbols in occupied cells', () => {
        const boardData = createBoardWithMoves(3, [
            { row: 0, col: 0, symbol: '🕷️' },
            { row: 1, col: 1, symbol: '🕸️' },
        ])
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
                player1Symbol: '🕷️',
                player2Symbol: '🕸️',
            },
        })

        const symbols = wrapper.findAll('.cell-symbol')
        expect(symbols).toHaveLength(2)
        expect(symbols[0].text()).toBe('🕷️')
        expect(symbols[1].text()).toBe('🕸️')
    })

    /**
     * Test: Custom symbols are displayed correctly
     */
    it('should display custom symbols', () => {
        const boardData = createBoardWithMoves(3, [
            { row: 0, col: 0, symbol: 'X' },
            { row: 1, col: 1, symbol: 'O' },
        ])
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
                player1Symbol: 'X',
                player2Symbol: 'O',
            },
        })

        const symbols = wrapper.findAll('.cell-symbol')
        expect(symbols[0].text()).toBe('X')
        expect(symbols[1].text()).toBe('O')
    })

    /**
     * Test: Cell click event is emitted with correct coordinates
     */
    it('should emit cell-click event with row and col when cell is clicked', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const firstCell = wrapper.find('.game-cell')
        await firstCell.trigger('click')

        expect(wrapper.emitted('cell-click')).toBeTruthy()
        const emittedEvents = wrapper.emitted('cell-click')
        expect(emittedEvents![0]).toEqual([0, 0])
    })

    /**
     * Test: Correct cell is identified in click event
     */
    it('should emit correct coordinates for middle cell', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        const middleCell = cells[4] // Center cell of 3x3
        await middleCell.trigger('click')

        const emittedEvents = wrapper.emitted('cell-click')
        expect(emittedEvents![0]).toEqual([1, 1])
    })

    /**
     * Test: Occupied cells are disabled
     */
    it('should disable occupied cells', () => {
        const boardData = createBoardWithMoves(3, [{ row: 0, col: 0, symbol: '🕷️' }])
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        const occupiedCell = cells[0]
        expect(occupiedCell.attributes('disabled')).toBeDefined()
    })

    /**
     * Test: Empty cells are not disabled
     */
    it('should not disable empty cells', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        const emptyCell = cells[0]
        expect(emptyCell.attributes('disabled')).toBeUndefined()
    })

    /**
     * Test: Board updates when board data changes
     */
    it('should update when boardData prop changes', async () => {
        let boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        let symbols = wrapper.findAll('.cell-symbol')
        expect(symbols).toHaveLength(0)

        // Update board data
        boardData = createBoardWithMoves(3, [{ row: 0, col: 0, symbol: '🕷️' }])
        await wrapper.setProps({ boardData })

        symbols = wrapper.findAll('.cell-symbol')
        expect(symbols).toHaveLength(1)
        expect(symbols[0].text()).toBe('🕷️')
    })

    /**
     * Test: Player 1 symbol styling is applied
     */
    it('should apply player1 styling to player1 symbols', () => {
        const boardData = createBoardWithMoves(3, [{ row: 0, col: 0, symbol: '🕷️' }])
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
                player1Symbol: '🕷️',
                player2Symbol: '🕸️',
            },
        })

        const symbol = wrapper.find('.cell-symbol-player1')
        expect(symbol.exists()).toBe(true)
    })

    /**
     * Test: Player 2 symbol styling is applied
     */
    it('should apply player2 styling to player2 symbols', () => {
        const boardData = createBoardWithMoves(3, [{ row: 0, col: 0, symbol: '🕸️' }])
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
                player1Symbol: '🕷️',
                player2Symbol: '🕸️',
            },
        })

        const symbol = wrapper.find('.cell-symbol-player2')
        expect(symbol.exists()).toBe(true)
    })

    /**
     * Test: Occupied cell has occupied class
     */
    it('should apply occupied class to filled cells', () => {
        const boardData = createBoardWithMoves(3, [{ row: 0, col: 0, symbol: '🕷️' }])
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const firstCell = wrapper.find('.game-cell')
        expect(firstCell.classes()).toContain('cell-occupied')
    })

    /**
     * Test: Accessibility attributes are present (Task 10.3)
     * aria-label format: "Row X, Column Y[, occupied by <symbol> | , empty]"
     */
    it('should have proper accessibility attributes', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 3) + 1
            const col = (index % 3) + 1
            expect(cell.attributes('aria-label')).toContain(`Row ${row}, Column ${col}`)
        })
    })

    /**
     * Test: Accessibility shows occupied state
     */
    it('should indicate occupied state in accessibility label', () => {
        const boardData = createBoardWithMoves(3, [{ row: 0, col: 0, symbol: '🕷️' }])
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const firstCell = wrapper.find('.game-cell')
        expect(firstCell.attributes('aria-label')).toContain('occupied')
    })

    /**
     * Test: Board renders with moves array
     */
    it('should accept and render with moves array', () => {
        const boardData = createBoardWithMoves(3, [
            { row: 0, col: 0, symbol: '🕷️' },
            { row: 1, col: 1, symbol: '🕸️' },
        ])
        const moves = [
            { row: 0, col: 0, symbol: '🕷️' },
            { row: 1, col: 1, symbol: '🕸️' },
        ]
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
                moves,
            },
        })

        expect(wrapper.exists()).toBe(true)
        const symbols = wrapper.findAll('.cell-symbol')
        expect(symbols).toHaveLength(2)
    })

    /**
     * Test: Component supports all board sizes (3-10)
     */
    it.each([3, 4, 5, 6, 7, 8, 9, 10])('should render %d x %d board correctly', (size) => {
        const boardData = createEmptyBoard(size)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: size,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        expect(cells).toHaveLength(size * size)
    })

    /**
     * Test: CSS custom properties are set for board size
     */
    it('should set CSS custom property for board size', () => {
        const boardData = createEmptyBoard(5)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 5,
            },
        })

        const boardElement = wrapper.find('.game-board').element as HTMLElement
        const style = boardElement.getAttribute('style')
        expect(style).toContain('--board-size')
        expect(style).toContain('--cell-size')
    })

    /**
     * Test: Multiple clicks on different cells emit multiple events
     */
    it('should emit multiple cell-click events for sequential clicks', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: {
                boardData,
                boardSize: 3,
            },
        })

        const cells = wrapper.findAll('.game-cell')
        await cells[0].trigger('click')
        await cells[4].trigger('click')
        await cells[8].trigger('click')

        const emitted = wrapper.emitted('cell-click')
        expect(emitted).toHaveLength(3)
        expect(emitted![0]).toEqual([0, 0])
        expect(emitted![1]).toEqual([1, 1])
        expect(emitted![2]).toEqual([2, 2])
    })
})

/**
 * Keyboard Navigation Tests (Task 10.3)
 * Tests: arrow-key navigation, Enter/Space selection, roving tabindex, focus class
 */
describe('GameBoard Keyboard Navigation (Task 10.3)', () => {
    it('should apply cell-focused and cell-keyboard-focus class to the default focused cell (0,0)', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        const cells = wrapper.findAll('.game-cell')
        expect(cells[0].classes()).toContain('cell-focused')
        expect(cells[0].classes()).toContain('cell-keyboard-focus')
    })

    it('should move focus right on ArrowRight keydown', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        await wrapper.find('.game-board').trigger('keydown', { key: 'ArrowRight' })

        const cells = wrapper.findAll('.game-cell')
        // focus should be at (0,1) — second cell
        expect(cells[1].classes()).toContain('cell-focused')
    })

    it('should move focus down on ArrowDown keydown', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        await wrapper.find('.game-board').trigger('keydown', { key: 'ArrowDown' })

        const cells = wrapper.findAll('.game-cell')
        // focus should be at (1,0) — fourth cell (index 3)
        expect(cells[3].classes()).toContain('cell-focused')
    })

    it('should clamp ArrowLeft at column 0', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        // Press ArrowLeft while already at (0,0) — should stay at (0,0)
        await wrapper.find('.game-board').trigger('keydown', { key: 'ArrowLeft' })

        const cells = wrapper.findAll('.game-cell')
        expect(cells[0].classes()).toContain('cell-focused')
    })

    it('should clamp ArrowUp at row 0', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        await wrapper.find('.game-board').trigger('keydown', { key: 'ArrowUp' })

        const cells = wrapper.findAll('.game-cell')
        expect(cells[0].classes()).toContain('cell-focused')
    })

    it('should emit cell-click on Enter keydown for the focused empty cell', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        // Default focus is (0,0)
        await wrapper.find('.game-board').trigger('keydown', { key: 'Enter' })

        const emitted = wrapper.emitted('cell-click')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([0, 0])
    })

    it('should emit cell-click on Space keydown for the focused empty cell', async () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        await wrapper.find('.game-board').trigger('keydown', { key: ' ' })

        const emitted = wrapper.emitted('cell-click')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([0, 0])
    })

    it('should give only the focused cell tabindex 0 (roving tabindex)', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        const cells = wrapper.findAll('.game-cell')
        // Cell (0,0) should be tabindex=0, all others -1
        expect(cells[0].attributes('tabindex')).toBe('0')
        cells.slice(1).forEach((cell) => {
            expect(cell.attributes('tabindex')).toBe('-1')
        })
    })

    it('should have role=grid on the board and role=row/gridcell on rows/cells', () => {
        const boardData = createEmptyBoard(3)
        const wrapper = mount(GameBoard, {
            props: { boardData, boardSize: 3 },
        })

        expect(wrapper.find('[role="grid"]').exists()).toBe(true)
        expect(wrapper.find('[role="row"]').exists()).toBe(true)
        const cells = wrapper.findAll('[role="gridcell"]')
        expect(cells).toHaveLength(9)
    })
})
