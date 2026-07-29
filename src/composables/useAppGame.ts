/**
 * Shared app-level game flow singleton.
 * Ensures Setup and Game views share the same orchestrator instance.
 */

import { useGameFlow } from './useGameFlow';
import { useGameConfig } from './useGameConfig';

let gameFlowInstance: ReturnType<typeof useGameFlow> | null = null;
let gameConfigInstance: ReturnType<typeof useGameConfig> | null = null;

export function useAppGame() {
    if (!gameFlowInstance) {
        gameFlowInstance = useGameFlow();
    }
    return gameFlowInstance;
}

export function useAppConfig() {
    if (!gameConfigInstance) {
        gameConfigInstance = useGameConfig();
        gameConfigInstance.restoreConfig();
    }
    return gameConfigInstance;
}

/** Reset singletons — useful in tests */
export function resetAppSingletons(): void {
    gameFlowInstance = null;
    gameConfigInstance = null;
}
