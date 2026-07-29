/**
 * Game Event Bus
 * Task 9.4: Create global game event system
 * Requirements: 15
 *
 * Provides event emission and subscription system for game components:
 * - Emit events: move-made, game-over, ai-turn-start, ai-turn-end, game-initialized, replay-started
 * - Allow component subscription to events
 * - Coordinate between game state, UI components, and persistence
 */

type EventCallback = (data: any) => void;

interface EventSubscription {
    unsubscribe: () => void;
}

class GameEventBus {
    private listeners: Map<string, Set<EventCallback>> = new Map();

    /**
     * Subscribe to an event
     * @param eventName - Name of the event to subscribe to
     * @param callback - Function to call when event is emitted
     * @returns Subscription object with unsubscribe function
     */
    subscribe(eventName: string, callback: EventCallback): EventSubscription {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }

        this.listeners.get(eventName)!.add(callback);

        // Return unsubscribe function
        return {
            unsubscribe: () => {
                this.listeners.get(eventName)?.delete(callback);
            },
        };
    }

    /**
     * Emit an event
     * @param eventName - Name of the event
     * @param data - Data to pass to subscribers
     */
    emit(eventName: string, data?: any): void {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }

    /**
     * Subscribe to an event and automatically unsubscribe after first call
     * @param eventName - Name of the event
     * @param callback - Function to call
     * @returns Subscription object
     */
    once(eventName: string, callback: EventCallback): EventSubscription {
        const subscription = this.subscribe(eventName, (data) => {
            callback(data);
            subscription.unsubscribe();
        });
        return subscription;
    }

    /**
     * Remove all listeners for an event
     * @param eventName - Name of the event (if not provided, clears all events)
     */
    clear(eventName?: string): void {
        if (eventName) {
            this.listeners.delete(eventName);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get number of listeners for an event
     * @param eventName - Name of the event
     * @returns Number of listeners
     */
    getListenerCount(eventName: string): number {
        return this.listeners.get(eventName)?.size || 0;
    }
}

// Create singleton instance
export const gameEventBus = new GameEventBus();

/**
 * Event types emitted by the game system
 */
export interface GameEventMap {
    'move-made': {
        row: number;
        col: number;
        player: string;
        symbol: string;
    };
    'game-over': {
        result: 'player-one-wins' | 'player-two-wins' | 'draw';
        winner: string | null;
        winningLines: Array<Array<[number, number]>>;
    };
    'ai-turn-start': {
        difficulty: string | null;
    };
    'ai-turn-end': Record<string, never>;
    'game-initialized': {
        boardSize: number;
        gameMode: 'two-player' | 'single-player';
        difficulty: string | null;
    };
    'replay-started': Record<string, never>;
    'board-updated': {
        board: (string | null)[][];
        moveCount: number;
    };
    'turn-changed': {
        currentPlayer: string;
        symbol: string;
    };
    'game-paused': Record<string, never>;
    'game-resumed': Record<string, never>;
}

/**
 * Type-safe event subscription
 * Usage: subscribeToEvent('move-made', (data) => { ... })
 */
export function subscribeToEvent<K extends keyof GameEventMap>(
    eventName: K,
    callback: (data: GameEventMap[K]) => void
): EventSubscription {
    return gameEventBus.subscribe(eventName, callback);
}

/**
 * Type-safe event emission
 * Usage: emitEvent('move-made', { row: 0, col: 0, ... })
 */
export function emitEvent<K extends keyof GameEventMap>(
    eventName: K,
    data: GameEventMap[K]
): void {
    gameEventBus.emit(eventName, data);
}

/**
 * Type-safe one-time subscription
 * Usage: onceEvent('game-over', (data) => { ... })
 */
export function onceEvent<K extends keyof GameEventMap>(
    eventName: K,
    callback: (data: GameEventMap[K]) => void
): EventSubscription {
    return gameEventBus.once(eventName, callback);
}
